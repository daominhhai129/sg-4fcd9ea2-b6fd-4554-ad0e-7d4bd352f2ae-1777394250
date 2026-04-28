---
title: Auth system + Super Admin
status: done
priority: high
type: feature
tags: [auth, admin, superadmin]
created_by: agent
created_at: 2026-04-28
position: 6
---

## Notes
Tạo hệ thống đăng nhập/đăng xuất mock (không cần backend). 2 role: user (shop owner) và super_admin. Trang login có 2 nút demo login. Super admin quản trị tất cả user, shop, và giới hạn (200 sản phẩm/danh mục/bài viết mỗi shop).

## Checklist
- [ ] Tạo AuthContext: state user, role, login/logout functions, limits config
- [ ] Tạo trang /login: form truyền thống + 2 nút demo (Demo User Login, Demo Super Admin Login)
- [ ] Thêm nút đăng xuất vào AdminLayout sidebar
- [ ] Tạo trang /super-admin: dashboard quản lý users + shops, chỉnh limits
- [ ] Protect routes: redirect về /login nếu chưa đăng nhập
- [ ] Hiển thị limits usage trong admin (VD: 5/200 sản phẩm)

## Acceptance
- Bấm Demo User Login → vào /admin, bấm Demo Super Admin → vào /super-admin
- Nút đăng xuất hoạt động, redirect về /login
- Super admin xem được danh sách users/shops và chỉnh limits