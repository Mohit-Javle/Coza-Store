# COZA STORE — Backend Setup Guide

## Tech Stack
- **Supabase** — PostgreSQL + Auth + Storage + Realtime
- No separate server needed — Supabase handles everything

## Supabase Project
- **Project URL**: https://vysfftmiwqytwwqzdpvz.supabase.co
- **Dashboard**: https://app.supabase.com/project/vysfftmiwqytwwqzdpvz

---

## Step 1: Run the SQL Schema

1. Go to: https://app.supabase.com/project/vysfftmiwqytwwqzdpvz/sql/new
2. Copy the entire contents of `schema.sql`
3. Paste into the SQL Editor
4. Click **Run**

This creates:
- 7 tables: `profiles`, `products`, `bids`, `qna`, `orders`, `notifications`, `admin_logs`
- Row Level Security on all tables
- Auth trigger to auto-create profile on signup

---

## Step 2: Set Up Storage Buckets

Follow the instructions in `storage-setup.md`.

Create 4 buckets:
- `product-images` (public)
- `bill-images` (private)
- `avatars` (public)
- `upi-qr` (private)

---

## Step 3: Configure Frontend

The `.env` file is already created at `frontend/.env`:
```
VITE_SUPABASE_URL=https://vysfftmiwqytwwqzdpvz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Hy6i2yL2is6metCzr_eOyw_epnHmig9
```

> ⚠️ Never commit `.env` to git. It's already in `.gitignore`.

---

## Step 4: Enable Email Auth

1. Go to: https://app.supabase.com/project/vysfftmiwqytwwqzdpvz/auth/providers
2. Ensure **Email** provider is enabled
3. For development: disable "Confirm email" (optional, makes testing easier)

---

## Step 5: Create First SuperAdmin

After signing up normally, run this in SQL Editor to give yourself superadmin:
```sql
UPDATE profiles
SET role = 'superadmin'
WHERE username = 'your_username_here';
```

---

## Database Tables Overview

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `products` | All listings with bid info |
| `bids` | Individual bid records |
| `qna` | Product Q&A threads |
| `orders` | Completed sales + payment flow |
| `notifications` | In-app notification system |
| `admin_logs` | Immutable audit trail |

---

## Architecture

```
Frontend (React + Vite)
    ↓
src/lib/supabase.js  ← Supabase client
src/lib/auth.js      ← Auth functions
src/lib/products.js  ← Product CRUD + queries
src/lib/bids.js      ← Bid placement + validation
src/lib/qna.js       ← Q&A thread management
src/lib/orders.js    ← Order + payment flow
src/lib/admin.js     ← Admin operations
    ↓
Supabase (PostgreSQL + Auth + Storage + Realtime)
```
