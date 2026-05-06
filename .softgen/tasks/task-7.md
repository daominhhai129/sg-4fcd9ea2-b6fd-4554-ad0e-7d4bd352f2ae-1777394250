---
title: Sub-admin role & management
status: in_progress
priority: high
type: feature
tags: [auth, super-admin, sub-admin]
created_by: agent
created_at: 2026-05-06
position: 7
---

## Notes
Super admin tạo và quản lý sub-admin. Mỗi sub-admin có dashboard riêng, chỉ thấy/tạo user (shop owner) do mình tạo. Mỗi sub-admin có cap 5000 sites.

Data model: AppUser thêm `createdBy` (id của sub_admin), `maxSites` (chỉ cho sub_admin, default 5000). Role mới: "sub_admin".

## Checklist
- [ ] AuthContext: thêm role "sub_admin", trường createdBy + maxSites, state subAdmins, methods createSubAdmin/updateSubAdmin/deleteSubAdmin/loginAsSubAdmin, modify createUser để set createdBy khi current user là sub_admin
- [ ] Login routing: sub_admin → /sub-admin; thêm Demo Sub-admin button trên login page
- [ ] Super-admin page: thêm section "Quản lý Sub-admin" với table CRUD (tên, email, SĐT, số site đang quản lý, max sites, trạng thái)
- [ ] SuperAdminDialogs.tsx: thêm CreateSubAdminDialog + EditSubAdminDialog
- [ ] Tạo /sub-admin/index.tsx: dashboard riêng — stats sites đang quản lý / cap 5000, table user shop của mình, tạo user (auto set createdBy=currentUser.id), block create khi đạt cap
- [ ] Header sub-admin page có logout, đổi mật khẩu

## Acceptance
- Login as Super Admin → có section Sub-admin → tạo được sub-admin mới
- Login as sub-admin demo → thấy dashboard /sub-admin với chỉ users do mình tạo, có thể tạo user mới
- Sub-admin không truy cập được /super-admin