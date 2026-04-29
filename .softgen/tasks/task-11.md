---
title: Super-admin + shop config migration
status: todo
priority: medium
type: feature
tags: [backend, super-admin]
created_by: agent
created_at: 2026-04-29T16:30:04Z
position: 11
---

## Notes
Migrate super-admin operations to Supabase.

## Checklist
- [ ] Create src/services/userService.ts (listAll, lock, unlock, extendExpiry, resetPassword, createUser, updateUser, setDomain)
- [ ] Create src/services/shopConfigService.ts (get, setLimits, recomputeUsage)
- [ ] Update super-admin/index.tsx to use both services
- [ ] Update admin/index.tsx dashboard to compute stats from real DB
- [ ] Update admin/profile.tsx to save shop info to DB
- [ ] Update admin/settings.tsx password change to use supabase.auth.updateUser

## Acceptance
- Super-admin can manage all users and shops via real DB
- Shop owner can edit shop profile and password