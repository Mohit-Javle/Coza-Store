-- ============================================================
-- COZA STORE — Supabase Storage Row Level Security (RLS) Policies
-- Run this script in the Supabase SQL Editor:
-- https://app.supabase.com/project/vysfftmiwqytwwqzdpvz/sql/new
-- ============================================================


-- ── 1. AVATARS BUCKET POLICIES (Public) ──────────────────────

-- Clean up existing policies if they exist
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow authenticated users to update/replace their own avatar (required for upsert: true)
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow public read access to all avatars
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');


-- ── 2. PRODUCT IMAGES BUCKET POLICIES (Public) ───────────────

-- Clean up existing policies if they exist
DROP POLICY IF EXISTS "Sellers upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers update product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

-- Allow sellers to upload product images
CREATE POLICY "Sellers upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow sellers to update product images
CREATE POLICY "Sellers update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow public read access to all product images
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');


-- ── 3. BILL IMAGES BUCKET POLICIES (Private) ─────────────────

-- Clean up existing policies if they exist
DROP POLICY IF EXISTS "Sellers upload bill images" ON storage.objects;
DROP POLICY IF EXISTS "Seller reads own bills" ON storage.objects;

-- Allow sellers to upload bill images
CREATE POLICY "Sellers upload bill images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bill-images'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow sellers to read their own bill images
CREATE POLICY "Seller reads own bills" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'bill-images'
    AND name LIKE auth.uid()::text || '/%'
  );


-- ── 4. UPI QR BUCKET POLICIES (Private) ──────────────────────

-- Clean up existing policies if they exist
DROP POLICY IF EXISTS "Users upload own QR" ON storage.objects;
DROP POLICY IF EXISTS "Users read own QR" ON storage.objects;

-- Allow users to upload their own UPI QR code
CREATE POLICY "Users upload own QR" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'upi-qr'
    AND name LIKE auth.uid()::text || '/%'
  );

-- Allow users to read their own UPI QR code
CREATE POLICY "Users read own QR" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'upi-qr'
    AND name LIKE auth.uid()::text || '/%'
  );
