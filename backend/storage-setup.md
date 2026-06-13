# COZA STORE — Storage Bucket Setup

Go to: https://app.supabase.com/project/vysfftmiwqytwwqzdpvz/storage/buckets

Create the following 4 buckets manually:

---

## 1. `product-images` — Public Bucket

- **Name**: `product-images`
- **Public**: ✅ YES
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`
- **Max file size**: 5 MB (5242880 bytes)
- **Path format used in code**: `{seller_id}/{product_id}/{filename}`

### Storage Policy (add in Policies tab):
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Sellers upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
```

---

## 2. `bill-images` — Private Bucket

- **Name**: `bill-images`
- **Public**: ❌ NO
- **Max file size**: 10 MB (10485760 bytes)
- **Path format**: `{seller_id}/{product_id}/bill`

### Storage Policy:
```sql
CREATE POLICY "Sellers upload bill images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bill-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Seller reads own bills" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'bill-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 3. `avatars` — Public Bucket

- **Name**: `avatars`
- **Public**: ✅ YES
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`
- **Max file size**: 2 MB (2097152 bytes)
- **Path format**: `{user_id}/{filename}`

### Storage Policy:
```sql
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

---

## 4. `upi-qr` — Private Bucket

- **Name**: `upi-qr`
- **Public**: ❌ NO
- **Max file size**: 2 MB (2097152 bytes)
- **Path format**: `{user_id}/qr`
- **Visible to**: Only order buyer + seller (enforced at app layer via signed URLs)

### Storage Policy:
```sql
CREATE POLICY "Users upload own QR" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'upi-qr'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own QR" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'upi-qr'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Summary Table

| Bucket | Public | Max Size | Purpose |
|--------|--------|----------|---------|
| `product-images` | ✅ | 5 MB | Product listing photos |
| `bill-images` | ❌ | 10 MB | Original purchase bill proof |
| `avatars` | ✅ | 2 MB | User profile photos |
| `upi-qr` | ❌ | 2 MB | UPI QR codes for payment |
