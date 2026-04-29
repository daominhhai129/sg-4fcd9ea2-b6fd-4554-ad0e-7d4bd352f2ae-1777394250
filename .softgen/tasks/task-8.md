---
title: Auth migration (Supabase Auth)
status: todo
priority: urgent
type: feature
tags: [backend, auth]
created_by: agent
created_at: 2026-04-29T16:30:01Z
position: 8
---

## Notes
Replace localStorage-based AuthContext with real Supabase Auth.

## Checklist
- [ ] Refactor AuthContext to use supabase.auth.getSession + onAuthStateChange
- [ ] Update login.tsx to call signInWithPassword
- [ ] Fetch profile + shop on session change, populate user state
- [ ] Implement logout via supabase.auth.signOut
- [ ] Implement super-admin loginAsUser via temporary impersonation flag in profile metadata
- [ ] Implement password reset via supabase.auth.updateUser
- [ ] Seed initial super-admin account (admin@platform.vn) and 3 demo shop owners

## Acceptance
- Login with email/password works for super-admin and shop owners
- Session persists across reloads
- Logout clears session