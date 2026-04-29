---
title: Categories + Products CRUD
status: todo
priority: high
type: feature
tags: [backend, crud]
created_by: agent
created_at: 2026-04-29T16:30:02Z
position: 9
---

## Notes
Replace mock-data calls in admin/categories and admin/products with Supabase queries via service modules.

## Checklist
- [ ] Create src/services/categoryService.ts (list, create, update, delete, reorder)
- [ ] Create src/services/productService.ts (list with pagination, create, update, delete, get by id)
- [ ] Update admin/categories.tsx to use categoryService
- [ ] Update admin/products.tsx to use productService
- [ ] Image upload via Supabase Storage (product-images bucket)
- [ ] Update storefront pages to read from DB

## Acceptance
- Add/edit/delete categories persists across reload
- Add/edit/delete products persists across reload
- Images upload to Supabase storage and display correctly