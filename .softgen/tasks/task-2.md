---
title: Storefront pages
status: done
priority: high
type: feature
tags: [storefront, shop]
created_by: agent
created_at: 2026-04-28
position: 2
---

## Notes
Trang storefront cho mỗi shop tại /shop/[slug]. Bao gồm trang chủ shop, danh sách sản phẩm theo danh mục, chi tiết sản phẩm, và giỏ hàng. Mock data, responsive.

## Checklist
- [ ] Tạo StorefrontLayout: header shop (logo, tên, nav), footer shop
- [ ] Tạo /shop/[slug]/index.tsx: banner, danh mục nổi bật, sản phẩm mới, sản phẩm bán chạy
- [ ] Tạo /shop/[slug]/product/[id].tsx: ảnh gallery, thông tin SP, chọn số lượng, thêm giỏ hàng
- [ ] Tạo /shop/[slug]/category/[id].tsx: lọc sản phẩm theo danh mục
- [ ] Tạo /shop/[slug]/cart.tsx: danh sách SP trong giỏ, tổng tiền, form đặt hàng
- [ ] Tạo CartContext cho state giỏ hàng (React Context + localStorage)

## Acceptance
- Truy cập /shop/tech-zone hiển thị storefront đầy đủ
- Thêm sản phẩm vào giỏ và xem giỏ hàng hoạt động