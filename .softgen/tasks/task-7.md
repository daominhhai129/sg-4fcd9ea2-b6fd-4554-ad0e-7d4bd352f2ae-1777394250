---
title: Database schema + RLS
status: in_progress
priority: urgent
type: feature
tags: [backend, supabase]
created_by: agent
created_at: 2026-04-29T16:30:00Z
position: 7
---

## Notes
Foundation for full-stack migration. Create all tables, RLS policies, helper functions, and triggers.

## Checklist
- [ ] Create profiles table (id refs auth.users, name, phone, role, shop_id, expires_at, status)
- [ ] Create shops table (slug, name, owner_id, branding, contact jsonb)
- [ ] Create categories table (shop_id, name, slug, position)
- [ ] Create products table (shop_id, category_id, sku, price, images, video_links, affiliate_link, featured)
- [ ] Create orders table (shop_id, customer info, total, status, items jsonb)
- [ ] Create posts table (shop_id, title, content, cover, images, linked_product_ids, status)
- [ ] Create shop_configs table (limits, usage, custom_domain)
- [ ] Create is_super_admin() and current_user_shop_id() helper functions
- [ ] Add handle_new_user trigger for auto profile creation
- [ ] Enable RLS on all tables with appropriate policies
- [ ] Create storage buckets (shop-assets, product-images, post-images)
- [ ] Generate TypeScript types

## Acceptance
- All tables visible in get_database_schema with RLS enabled
- Storage buckets accessible