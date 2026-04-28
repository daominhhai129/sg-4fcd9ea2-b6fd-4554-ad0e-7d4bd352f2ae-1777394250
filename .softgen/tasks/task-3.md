---
title: Admin dashboard + Quản lý sản phẩm
status: todo
priority: high
type: feature
tags: [admin, products]
created_by: agent
created_at: 2026-04-28
position: 3
---

## Notes
Admin dashboard tại /admin với sidebar layout. Trang tổng quan và quản lý sản phẩm CRUD. Mock data.

## Checklist
- [ ] Tạo AdminLayout: sidebar (logo, nav items, user info), topbar (search, notifications), main content area
- [ ] Tạo /admin/index.tsx: dashboard overview — 4 stat cards (doanh thu, đơn hàng, sản phẩm, khách hàng), biểu đồ đơn hàng gần đây, đơn hàng mới nhất
- [ ] Tạo /admin/products/index.tsx: bảng sản phẩm với search, filter theo trạng thái, pagination
- [ ] Tạo /admin/products/new.tsx: form thêm sản phẩm (tên, giá, mô tả, danh mục, ảnh, tồn kho)
- [ ] Tạo /admin/products/[id].tsx: form chỉnh sửa sản phẩm (reuse form component)

## Acceptance
- /admin hiển thị dashboard với stats và đơn hàng mới
- /admin/products liệt kê sản phẩm, có thể search và filter