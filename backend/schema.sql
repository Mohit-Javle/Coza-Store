-- ============================================================
-- COZA STORE — Complete Supabase Database Schema
-- Run this ENTIRE script in Supabase SQL Editor
-- Project: vysfftmiwqytwwqzdpvz
-- ============================================================

-- ==================== TABLES ====================

-- PROFILES TABLE (auto-populated via auth trigger)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  cover_url text,
  bio text,
  location text,
  upi_id text,
  upi_qr_url text,
  role text DEFAULT 'user'
    CHECK (role IN ('user','admin','superadmin')),
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  brand text,
  category text CHECK (category IN ('tops','bottoms','shoes','accessories')),
  size text,
  gender text CHECK (gender IN ('men','women','unisex')),
  description text,
  condition integer CHECK (condition BETWEEN 1 AND 5),
  images text[],
  bill_image text,
  has_bill boolean DEFAULT false,
  starting_bid numeric NOT NULL,
  current_bid numeric,
  buy_now_price numeric,
  status text DEFAULT 'pending' CHECK (status IN
    ('pending','active','sold','rejected','expired')),
  is_staff_pick boolean DEFAULT false,
  discount_percent integer DEFAULT 0,
  discount_tag text,
  bid_ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- BIDS TABLE
CREATE TABLE IF NOT EXISTS bids (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) NOT NULL,
  bidder_id uuid REFERENCES profiles(id) NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- QNA TABLE
CREATE TABLE IF NOT EXISTS qna (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) NOT NULL,
  asker_id uuid REFERENCES profiles(id) NOT NULL,
  question text NOT NULL,
  answer text,
  answered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) NOT NULL,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  final_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN
    ('pending','paid','failed')),
  order_status text DEFAULT 'awaiting_payment' CHECK (order_status IN
    ('awaiting_payment','payment_confirmed','shipped','delivered','disputed')),
  upi_id_shared text,
  upi_qr_shared text,
  tracking_info text,
  buyer_confirmed_payment boolean DEFAULT false,
  seller_confirmed_shipment boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  related_product_id uuid,
  related_order_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES profiles(id) NOT NULL,
  action text NOT NULL,
  target_type text CHECK (target_type IN ('product','user','order')),
  target_id uuid NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ==================== AUTH TRIGGER ====================

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username',
             split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ==================== ROW LEVEL SECURITY ====================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (
    status = 'active'
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin','superadmin')
    )
  );

CREATE POLICY "Auth users can create products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers update own products" ON products
  FOR UPDATE USING (
    auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin','superadmin')
    )
  );

-- BIDS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT USING (true);

CREATE POLICY "Auth users can place bids" ON bids
  FOR INSERT WITH CHECK (
    auth.uid() = bidder_id
    AND auth.uid() != (
      SELECT seller_id FROM products WHERE id = product_id
    )
  );

-- QNA
ALTER TABLE qna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view qna" ON qna
  FOR SELECT USING (true);

CREATE POLICY "Auth users can ask" ON qna
  FOR INSERT WITH CHECK (auth.uid() = asker_id);

CREATE POLICY "Seller can answer" ON qna
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_id
      AND seller_id = auth.uid()
    )
  );

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer and seller view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin','superadmin')
    )
  );

CREATE POLICY "System creates orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyer and seller update orders" ON orders
  FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System inserts notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ADMIN LOGS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin','superadmin')
    )
  );

CREATE POLICY "Admins insert logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin','superadmin')
    )
  );
