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

-- ==================== LEADERBOARD VIEWS ====================

-- Top Sellers View (aggregated by database)
CREATE OR REPLACE VIEW v_leaderboard_sellers AS
SELECT 
  o.seller_id AS id,
  p.username,
  p.full_name,
  p.avatar_url,
  SUM(o.final_amount) AS total_amount,
  COUNT(o.id) AS sales_count
FROM public.orders o
JOIN public.profiles p ON o.seller_id = p.id
GROUP BY o.seller_id, p.username, p.full_name, p.avatar_url;

-- Top Buyers View (aggregated by database)
CREATE OR REPLACE VIEW v_leaderboard_buyers AS
SELECT 
  o.buyer_id AS id,
  p.username,
  p.full_name,
  p.avatar_url,
  SUM(o.final_amount) AS total_amount,
  COUNT(o.id) AS items_copped
FROM public.orders o
JOIN public.profiles p ON o.buyer_id = p.id
GROUP BY o.buyer_id, p.username, p.full_name, p.avatar_url;

-- Top Bidders View (aggregated by database)
CREATE OR REPLACE VIEW v_leaderboard_bidders AS
SELECT 
  b.bidder_id AS id,
  p.username,
  p.full_name,
  p.avatar_url,
  MAX(b.amount) AS highest_bid,
  COUNT(b.id) AS bids_count
FROM public.bids b
JOIN public.profiles p ON b.bidder_id = p.id
GROUP BY b.bidder_id, p.username, p.full_name, p.avatar_url;

-- ==================== BUY NOW FUNCTION ====================

CREATE OR REPLACE FUNCTION buy_product_now(p_id uuid, b_id uuid, amount numeric)
RETURNS uuid AS $$
DECLARE
  v_seller_id uuid;
  v_upi_id text;
  v_upi_qr text;
  v_order_id uuid;
  v_title text;
BEGIN
  -- Get seller info and title, check if product is active
  SELECT seller_id, title INTO v_seller_id, v_title FROM public.products WHERE id = p_id AND status = 'active';
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Product not available for purchase';
  END IF;

  IF v_seller_id = b_id THEN
    RAISE EXCEPTION 'You cannot buy your own product';
  END IF;

  -- Get seller UPI details
  SELECT upi_id, upi_qr_url INTO v_upi_id, v_upi_qr FROM public.profiles WHERE id = v_seller_id;

  -- Insert order
  INSERT INTO public.orders (product_id, buyer_id, seller_id, final_amount, upi_id_shared, upi_qr_shared, order_status, payment_status)
  VALUES (p_id, b_id, v_seller_id, amount, v_upi_id, v_upi_qr, 'awaiting_payment', 'pending')
  RETURNING id INTO v_order_id;

  -- Update product status to sold
  UPDATE public.products SET status = 'sold', current_bid = amount WHERE id = p_id;

  -- Place the final winning bid record in bids table
  INSERT INTO public.bids (product_id, bidder_id, amount)
  VALUES (p_id, b_id, amount);

  -- Create notification for seller
  INSERT INTO public.notifications (user_id, type, message, related_product_id, related_order_id)
  VALUES (v_seller_id, 'item_sold', 'Congratulations! Your item "' || v_title || '" was bought instantly via Buy Now!', p_id, v_order_id);

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== RESOLVE EXPIRED BIDS FUNCTION ====================

CREATE OR REPLACE FUNCTION resolve_expired_bids()
RETURNS void AS $$
DECLARE
  r RECORD;
  v_bidder_id uuid;
  v_amount numeric;
  v_order_id uuid;
  v_upi_id text;
  v_upi_qr text;
  v_winner_username text;
BEGIN
  -- Loop through all active products that have expired
  FOR r IN 
    SELECT id, seller_id, title FROM public.products 
    WHERE status = 'active' AND bid_ends_at < now()
  LOOP
    -- Find the highest bid for this product
    SELECT bidder_id, amount INTO v_bidder_id, v_amount 
    FROM public.bids 
    WHERE product_id = r.id 
    ORDER BY amount DESC 
    LIMIT 1;

    IF v_bidder_id IS NOT NULL THEN
      -- Get seller UPI details
      SELECT upi_id, upi_qr_url INTO v_upi_id, v_upi_qr FROM public.profiles WHERE id = r.seller_id;

      -- Get winner username for seller notification
      SELECT username INTO v_winner_username FROM public.profiles WHERE id = v_bidder_id;

      -- Create the order
      INSERT INTO public.orders (product_id, buyer_id, seller_id, final_amount, upi_id_shared, upi_qr_shared, order_status, payment_status)
      VALUES (r.id, v_bidder_id, r.seller_id, v_amount, v_upi_id, v_upi_qr, 'awaiting_payment', 'pending')
      RETURNING id INTO v_order_id;

      -- Update product to sold
      UPDATE public.products SET status = 'sold' WHERE id = r.id;

      -- Notify buyer
      INSERT INTO public.notifications (user_id, type, message, related_product_id, related_order_id)
      VALUES (v_bidder_id, 'bid_won', 'Your bid of ₹' || v_amount || ' won the auction for "' || r.title || '"! Complete payment to proceed.', r.id, v_order_id);

      -- Notify seller
      INSERT INTO public.notifications (user_id, type, message, related_product_id, related_order_id)
      VALUES (r.seller_id, 'bid_won_seller', 'Your auction for "' || r.title || '" has ended. Winner is @' || COALESCE(v_winner_username, 'someone') || ' for ₹' || v_amount || '.', r.id, v_order_id);
    ELSE
      -- No bids were placed; mark product as expired
      UPDATE public.products SET status = 'expired' WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
