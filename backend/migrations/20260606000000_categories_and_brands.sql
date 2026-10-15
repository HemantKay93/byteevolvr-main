-- ============================================================
-- Categories & Brands Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent text DEFAULT 'Root',
  description text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT current_timestamp,
  updated_at timestamptz DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  website text,
  logo_url text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT current_timestamp,
  updated_at timestamptz DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policies for public reading and admin management
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read categories') THEN
    CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read brands') THEN
    CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow manage categories') THEN
    CREATE POLICY "Allow manage categories" ON public.categories FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow manage brands') THEN
    CREATE POLICY "Allow manage brands" ON public.brands FOR ALL USING (true);
  END IF;
END $$;

-- Seed Initial Categories
INSERT INTO public.categories (name, slug, parent, description, status)
VALUES
  ('Electronics', 'electronics', 'Root', 'Consumer electronics, gadgets, and computers', 'Active'),
  ('Smartphones & Audio', 'smartphones-audio', 'Electronics', 'Mobile devices, wireless audio, and accessories', 'Active'),
  ('Apparel & Fashion', 'apparel-fashion', 'Root', 'Modern streetwear and technical apparel', 'Active'),
  ('Footwear', 'footwear', 'Apparel & Fashion', 'Sneakers, running shoes, and boots', 'Active'),
  ('Home & Kitchen', 'home-kitchen', 'Root', 'Smart home automation, appliances, and kitchenware', 'Active'),
  ('Health & Wellness', 'health-wellness', 'Root', 'Fitness trackers, personal health, and supplements', 'Active')
ON CONFLICT (slug) DO NOTHING;

-- Seed Initial Brands
INSERT INTO public.brands (name, slug, website, status)
VALUES
  ('Apple Inc.', 'apple', 'https://apple.com', 'Active'),
  ('Sony Electronics', 'sony', 'https://sony.com', 'Active'),
  ('Samsung', 'samsung', 'https://samsung.com', 'Active'),
  ('Nike Sportswear', 'nike', 'https://nike.com', 'Active'),
  ('Logitech', 'logitech', 'https://logitech.com', 'Active'),
  ('ByteEvolvr Gear', 'byteevolvr', 'https://byteevolvr.com', 'Active')
ON CONFLICT (slug) DO NOTHING;
