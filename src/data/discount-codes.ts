import type { DiscountCode } from "@/types";

export const discountCodes: DiscountCode[] = [
  { id: "dc-1", shopId: "shop-1", code: "TECH10", type: "percentage", value: 10, minOrderValue: 1000000, maxUses: 100, usedCount: 23, expiresAt: "2026-12-31", status: "active", createdAt: "2026-04-01" },
  { id: "dc-2", shopId: "shop-1", code: "IPHONE500K", type: "fixed", value: 500000, productId: "p-1", productName: "iPhone 15 Pro Max 256GB", maxUses: 50, usedCount: 8, expiresAt: "2026-08-31", status: "active", createdAt: "2026-04-15" },
  { id: "dc-3", shopId: "shop-1", code: "FREESHIP", type: "fixed", value: 50000, minOrderValue: 500000, maxUses: 200, usedCount: 67, expiresAt: "2026-06-30", status: "active", createdAt: "2026-04-20" },
  { id: "dc-4", shopId: "shop-1", code: "MACBOOK1M", type: "fixed", value: 1000000, productId: "p-3", productName: "MacBook Air M3 13 inch", maxUses: 30, usedCount: 4, expiresAt: "2026-09-30", status: "active", createdAt: "2026-04-10" },
  { id: "dc-5", shopId: "shop-2", code: "FASHION15", type: "percentage", value: 15, minOrderValue: 500000, maxUses: 150, usedCount: 42, expiresAt: "2026-12-31", status: "active", createdAt: "2026-04-05" },
  { id: "dc-6", shopId: "shop-2", code: "SUMMER50", type: "percentage", value: 50, productId: "p-7", productName: "Áo thun nam basic Cotton 100%", maxUses: 80, usedCount: 31, expiresAt: "2026-07-31", status: "active", createdAt: "2026-05-01" },
  { id: "dc-7", shopId: "shop-2", code: "WELCOME100K", type: "fixed", value: 100000, minOrderValue: 800000, maxUses: 100, usedCount: 12, expiresAt: "2026-12-31", status: "active", createdAt: "2026-04-25" },
  { id: "dc-8", shopId: "shop-3", code: "FRESH20", type: "percentage", value: 20, minOrderValue: 300000, maxUses: 200, usedCount: 56, expiresAt: "2026-12-31", status: "active", createdAt: "2026-04-01" },
  { id: "dc-9", shopId: "shop-3", code: "RAUSACH", type: "percentage", value: 25, productId: "p-31", productName: "Rau cải bó xôi hữu cơ 500g", maxUses: 100, usedCount: 19, expiresAt: "2026-08-15", status: "active", createdAt: "2026-04-12" },
  { id: "dc-10", shopId: "shop-3", code: "EXPIRED10", type: "percentage", value: 10, maxUses: 50, usedCount: 50, expiresAt: "2026-01-31", status: "inactive", createdAt: "2025-12-01" },
];