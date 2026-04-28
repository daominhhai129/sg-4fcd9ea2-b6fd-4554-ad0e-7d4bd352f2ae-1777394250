---
title: Admin danh mục + Đơn hàng
status: todo
priority: medium
type: feature
tags: [admin, categories, orders]
created_by: agent
created_at: 2026-04-28
position: 4
---

## Notes
Quản lý danh mục sản phẩm và đơn hàng trong admin panel.

## Checklist
- [ ] Tạo /admin/categories/index.tsx: danh sách danh mục dạng grid cards, nút thêm/sửa/xóa
- [ ] Tạo dialog/modal thêm + sửa danh mục (tên, mô tả, ảnh)
- [ ] Tạo /admin/orders/index.tsx: bảng đơn hàng với filter theo trạng thái (chờ xử lý, đã xác nhận, đang giao, hoàn thành, đã hủy)
- [ ] Tạo /admin/orders/[id].tsx: chi tiết đơn hàng — thông tin khách, danh sách SP, timeline trạng thái, nút cập nhật trạng thái

## Acceptance
- Quản lý danh mục: thêm, sửa, xóa danh mục hiển thị đúng
- Đơn hàng filter theo trạng thái và xem chi tiết