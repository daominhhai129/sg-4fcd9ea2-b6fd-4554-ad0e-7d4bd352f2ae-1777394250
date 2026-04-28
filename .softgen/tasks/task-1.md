---
title: Design system + Landing page
status: done
priority: urgent
type: feature
tags: [design, landing]
created_by: agent
created_at: 2026-04-28
position: 1
---

## Notes
Thiết lập design system (fonts, colors, tokens) và trang landing giới thiệu nền tảng. Mọi text UI bằng tiếng Việt.

## Checklist
- [ ] Cập nhật globals.css: Google Fonts imports (Be Vietnam Pro, Montserrat), CSS variables cho colors
- [ ] Cập nhật tailwind.config.ts: font families, custom colors từ CSS vars
- [ ] Tạo Navbar component với logo, navigation links, CTA button
- [ ] Tạo HeroSection: headline, mô tả, CTA buttons, illustration/gradient
- [ ] Tạo FeaturedShops: grid 3-4 shop cards với mock data
- [ ] Tạo Features section: 3-4 feature cards (quản lý sản phẩm, đơn hàng, analytics, v.v.)
- [ ] Tạo Footer với links và copyright
- [ ] Compose tất cả trong index.tsx

## Acceptance
- Landing page hiển thị đầy đủ từ hero đến footer, responsive trên mobile và desktop
- Fonts và colors đúng theo design system