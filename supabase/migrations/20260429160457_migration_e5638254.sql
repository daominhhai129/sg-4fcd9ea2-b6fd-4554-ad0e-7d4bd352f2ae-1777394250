-- 1. Extend profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'shop_owner' CHECK (role IN ('super_admin', 'shop_owner')),
  ADD COLUMN IF NOT EXISTS shop_id uuid,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked'));

-- 2. shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  logo text,
  banner text,
  theme_color text DEFAULT '263 84% 58%',
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add FK from profiles.shop_id to shops
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON public.categories(shop_id);

-- 4. products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text,
  sku text,
  price numeric NOT NULL DEFAULT 0,
  description text,
  images text[] DEFAULT ARRAY[]::text[],
  video_links text[] DEFAULT ARRAY[]::text[],
  affiliate_link text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- 5. orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  address text NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  note text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);

-- 6. posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text,
  excerpt text,
  content text,
  cover_image text,
  images text[] DEFAULT ARRAY[]::text[],
  linked_product_ids uuid[] DEFAULT ARRAY[]::uuid[],
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_shop_id ON public.posts(shop_id);

-- 7. shop_configs
CREATE TABLE IF NOT EXISTS public.shop_configs (
  shop_id uuid PRIMARY KEY REFERENCES public.shops(id) ON DELETE CASCADE,
  limits jsonb NOT NULL DEFAULT '{"products": 100, "categories": 20, "posts": 50, "storage_mb": 500}'::jsonb,
  usage jsonb NOT NULL DEFAULT '{"products": 0, "categories": 0, "posts": 0, "storage_mb": 0}'::jsonb,
  custom_domain text,
  created_at timestamptz DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.current_user_shop_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT shop_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies: shops (public read, owner+super_admin write)
CREATE POLICY "shops_public_read" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_owner_update" ON public.shops FOR UPDATE USING (owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "shops_super_insert" ON public.shops FOR INSERT WITH CHECK (public.is_super_admin());
CREATE POLICY "shops_super_delete" ON public.shops FOR DELETE USING (public.is_super_admin());

-- categories: public read, shop owner write
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_owner_write" ON public.categories FOR ALL
  USING (shop_id = public.current_user_shop_id() OR public.is_super_admin())
  WITH CHECK (shop_id = public.current_user_shop_id() OR public.is_super_admin());

-- products: public read, shop owner write
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_owner_write" ON public.products FOR ALL
  USING (shop_id = public.current_user_shop_id() OR public.is_super_admin())
  WITH CHECK (shop_id = public.current_user_shop_id() OR public.is_super_admin());

-- orders: anonymous can INSERT (checkout); shop owner reads/updates own; super_admin all
CREATE POLICY "orders_anon_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_owner_read" ON public.orders FOR SELECT USING (shop_id = public.current_user_shop_id() OR public.is_super_admin());
CREATE POLICY "orders_owner_update" ON public.orders FOR UPDATE USING (shop_id = public.current_user_shop_id() OR public.is_super_admin());
CREATE POLICY "orders_owner_delete" ON public.orders FOR DELETE USING (shop_id = public.current_user_shop_id() OR public.is_super_admin());

-- posts: public read of published, shop owner sees all own + write
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (status = 'published' OR shop_id = public.current_user_shop_id() OR public.is_super_admin());
CREATE POLICY "posts_owner_write" ON public.posts FOR ALL
  USING (shop_id = public.current_user_shop_id() OR public.is_super_admin())
  WITH CHECK (shop_id = public.current_user_shop_id() OR public.is_super_admin());

-- shop_configs: only owner + super_admin
CREATE POLICY "shop_configs_owner_read" ON public.shop_configs FOR SELECT USING (shop_id = public.current_user_shop_id() OR public.is_super_admin());
CREATE POLICY "shop_configs_super_write" ON public.shop_configs FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- profiles: extend existing policies for super-admin access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "profiles_self_or_super_read" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin() OR true);
CREATE POLICY "profiles_super_admin_update" ON public.profiles FOR UPDATE USING (public.is_super_admin());
CREATE POLICY "profiles_super_admin_insert" ON public.profiles FOR INSERT WITH CHECK (public.is_super_admin() OR auth.uid() = id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-assets', 'shop-assets', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
CREATE POLICY "storage_public_read_shop" ON storage.objects FOR SELECT USING (bucket_id IN ('shop-assets', 'product-images', 'post-images'));
CREATE POLICY "storage_auth_insert_shop" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('shop-assets', 'product-images', 'post-images'));
CREATE POLICY "storage_auth_update_shop" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('shop-assets', 'product-images', 'post-images'));
CREATE POLICY "storage_auth_delete_shop" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('shop-assets', 'product-images', 'post-images'));