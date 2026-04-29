---
title: Orders + Posts CRUD
status: todo
priority: high
type: feature
tags: [backend, crud]
created_by: agent
created_at: 2026-04-29T16:30:03Z
position: 10
---

## Notes
Migrate orders and posts to Supabase.

## Checklist
- [ ] Create src/services/orderService.ts (list, get, updateStatus, create from checkout)
- [ ] Create src/services/postService.ts (list, create, update, delete, get by id)
- [ ] Update admin/orders.tsx to use orderService
- [ ] Update admin/posts.tsx to use postService
- [ ] Update storefront checkout.tsx to insert real order (anonymous insert allowed)
- [ ] Update storefront post detail page to read from DB
- [ ] Image upload for post images via Supabase Storage

## Acceptance
- Customer checkout creates real order
- Shop owner sees order in admin
- Posts CRUD persists