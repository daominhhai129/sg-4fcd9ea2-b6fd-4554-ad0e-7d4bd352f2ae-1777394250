import type { Shop, ProductCategory, Product, Order, Post } from "@/types";

export const shops: Shop[] = [
  {
    id: "shop-1",
    slug: "tech-zone",
    name: "Tech Zone",
    description: "Cửa hàng công nghệ hàng đầu với các sản phẩm chính hãng, giá tốt nhất thị trường.",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
    contact: {
      phone: "0901 234 567",
      email: "contact@techzone.vn",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      socialLinks: [
        { platform: "Facebook", url: "https://facebook.com/techzone" },
        { platform: "Instagram", url: "https://instagram.com/techzone" },
      ],
    },
    categories: [],
    products: [],
    orders: [],
    posts: [],
  },
  {
    id: "shop-2",
    slug: "fashion-hub",
    name: "Fashion Hub",
    description: "Thời trang cao cấp, phong cách hiện đại dành cho giới trẻ năng động.",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop",
    contact: {
      phone: "0912 345 678",
      email: "hello@fashionhub.vn",
      address: "456 Lê Lợi, Quận 1, TP.HCM",
      socialLinks: [
        { platform: "Facebook", url: "https://facebook.com/fashionhub" },
        { platform: "TikTok", url: "https://tiktok.com/@fashionhub" },
      ],
    },
    categories: [],
    products: [],
    orders: [],
    posts: [],
  },
  {
    id: "shop-3",
    slug: "green-garden",
    name: "Green Garden",
    description: "Thực phẩm sạch, hữu cơ từ nông trại đến bàn ăn. Sức khỏe là trên hết!",
    logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop",
    banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop",
    contact: {
      phone: "0923 456 789",
      email: "info@greengarden.vn",
      address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
      socialLinks: [
        { platform: "Facebook", url: "https://facebook.com/greengarden" },
      ],
    },
    categories: [],
    products: [],
    orders: [],
    posts: [],
  },
];

export const categories: ProductCategory[] = [
  { id: "cat-1", shopId: "shop-1", name: "Điện thoại", slug: "dien-thoai", description: "Smartphone chính hãng", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop", productCount: 12 },
  { id: "cat-2", shopId: "shop-1", name: "Laptop", slug: "laptop", description: "Laptop văn phòng & gaming", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop", productCount: 8 },
  { id: "cat-3", shopId: "shop-1", name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện công nghệ", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", productCount: 15 },
  { id: "cat-4", shopId: "shop-1", name: "Âm thanh", slug: "am-thanh", description: "Tai nghe & loa", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop", productCount: 6 },
  { id: "cat-5", shopId: "shop-2", name: "Áo", slug: "ao", description: "Áo thời trang nam nữ", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop", productCount: 20 },
  { id: "cat-6", shopId: "shop-2", name: "Quần", slug: "quan", description: "Quần jeans & kaki", image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=300&fit=crop", productCount: 14 },
  { id: "cat-7", shopId: "shop-3", name: "Rau củ", slug: "rau-cu", description: "Rau củ hữu cơ", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", productCount: 18 },
  { id: "cat-8", shopId: "shop-3", name: "Trái cây", slug: "trai-cay", description: "Trái cây tươi ngon", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop", productCount: 10 },
];

export const products: Product[] = [
  { id: "p-1", shopId: "shop-1", name: "iPhone 15 Pro Max 256GB", slug: "iphone-15-pro-max", description: "iPhone 15 Pro Max với chip A17 Pro, camera 48MP, titanium design. Hiệu năng đỉnh cao cho mọi tác vụ.", price: 34990000, salePrice: 32490000, images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop"], categoryId: "cat-1", categoryName: "Điện thoại", stock: 25, rating: 4.8, reviewCount: 156, createdAt: "2026-04-15", status: "active" },
  { id: "p-2", shopId: "shop-1", name: "MacBook Air M3 15 inch", slug: "macbook-air-m3", description: "MacBook Air M3 mỏng nhẹ, hiệu năng mạnh mẽ với chip M3, màn hình 15.3 inch Liquid Retina.", price: 37990000, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"], categoryId: "cat-2", categoryName: "Laptop", stock: 10, rating: 4.9, reviewCount: 89, createdAt: "2026-04-10", status: "active" },
  { id: "p-3", shopId: "shop-1", name: "AirPods Pro 2 USB-C", slug: "airpods-pro-2", description: "AirPods Pro thế hệ 2 với cổng USB-C, chống ồn chủ động, âm thanh không gian.", price: 6790000, salePrice: 5990000, images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop"], categoryId: "cat-4", categoryName: "Âm thanh", stock: 50, rating: 4.7, reviewCount: 234, createdAt: "2026-04-12", status: "active" },
  { id: "p-4", shopId: "shop-1", name: "Samsung Galaxy S24 Ultra", slug: "samsung-s24-ultra", description: "Galaxy S24 Ultra với Galaxy AI, S Pen tích hợp, camera 200MP zoom quang 5x.", price: 31990000, salePrice: 28990000, images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop"], categoryId: "cat-1", categoryName: "Điện thoại", stock: 18, rating: 4.6, reviewCount: 98, createdAt: "2026-04-08", status: "active" },
  { id: "p-5", shopId: "shop-1", name: "Sạc nhanh Anker 65W GaN", slug: "sac-anker-65w", description: "Bộ sạc nhanh Anker 65W công nghệ GaN III, nhỏ gọn, 3 cổng sạc.", price: 890000, salePrice: 690000, images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop"], categoryId: "cat-3", categoryName: "Phụ kiện", stock: 100, rating: 4.5, reviewCount: 312, createdAt: "2026-04-20", status: "active" },
  { id: "p-6", shopId: "shop-1", name: "Bàn phím cơ Keychron K8", slug: "keychron-k8", description: "Bàn phím cơ không dây Keychron K8, hot-swap, Gateron switch, đèn RGB.", price: 2490000, images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop"], categoryId: "cat-3", categoryName: "Phụ kiện", stock: 30, rating: 4.4, reviewCount: 67, createdAt: "2026-04-18", status: "active" },
  { id: "p-7", shopId: "shop-2", name: "Áo thun Oversized Premium", slug: "ao-thun-oversized", description: "Áo thun oversized chất cotton 100%, form rộng thoải mái, nhiều màu sắc.", price: 350000, salePrice: 259000, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"], categoryId: "cat-5", categoryName: "Áo", stock: 200, rating: 4.3, reviewCount: 445, createdAt: "2026-04-22", status: "active" },
  { id: "p-8", shopId: "shop-2", name: "Quần Jeans Slim Fit", slug: "quan-jeans-slim", description: "Quần jeans slim fit co giãn tốt, wash nhẹ, phù hợp mọi phong cách.", price: 590000, images: ["https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=600&fit=crop"], categoryId: "cat-6", categoryName: "Quần", stock: 80, rating: 4.2, reviewCount: 178, createdAt: "2026-04-21", status: "active" },
  { id: "p-9", shopId: "shop-3", name: "Combo rau củ tuần 5kg", slug: "combo-rau-cu-tuan", description: "Combo rau củ hữu cơ đủ loại cho cả tuần, thu hoạch trong ngày, giao tận nhà.", price: 250000, salePrice: 199000, images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop"], categoryId: "cat-7", categoryName: "Rau củ", stock: 50, rating: 4.8, reviewCount: 523, createdAt: "2026-04-25", status: "active" },
  { id: "p-10", shopId: "shop-3", name: "Xoài cát Hòa Lộc 1kg", slug: "xoai-cat-hoa-loc", description: "Xoài cát Hòa Lộc chín cây, thơm ngọt tự nhiên, đóng hộp cẩn thận.", price: 120000, images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=600&fit=crop"], categoryId: "cat-8", categoryName: "Trái cây", stock: 40, rating: 4.7, reviewCount: 89, createdAt: "2026-04-26", status: "active" },
];

export const orders: Order[] = [
  { id: "ord-1", shopId: "shop-1", customerName: "Nguyễn Văn An", customerEmail: "an.nguyen@gmail.com", customerPhone: "0901111222", address: "45 Lý Tự Trọng, Quận 1, TP.HCM", items: [{ productId: "p-1", productName: "iPhone 15 Pro Max 256GB", productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop", quantity: 1, price: 32490000 }, { productId: "p-3", productName: "AirPods Pro 2 USB-C", productImage: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100&h=100&fit=crop", quantity: 1, price: 5990000 }], total: 38480000, status: "delivered", createdAt: "2026-04-20", note: "Giao giờ hành chính" },
  { id: "ord-2", shopId: "shop-1", customerName: "Trần Thị Bình", customerEmail: "binh.tran@gmail.com", customerPhone: "0912222333", address: "78 Hai Bà Trưng, Quận 3, TP.HCM", items: [{ productId: "p-2", productName: "MacBook Air M3 15 inch", productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop", quantity: 1, price: 37990000 }], total: 37990000, status: "shipping", createdAt: "2026-04-25" },
  { id: "ord-3", shopId: "shop-1", customerName: "Lê Minh Cường", customerEmail: "cuong.le@gmail.com", customerPhone: "0923333444", address: "12 Nguyễn Trãi, Quận 5, TP.HCM", items: [{ productId: "p-4", productName: "Samsung Galaxy S24 Ultra", productImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&h=100&fit=crop", quantity: 1, price: 28990000 }, { productId: "p-5", productName: "Sạc nhanh Anker 65W GaN", productImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&h=100&fit=crop", quantity: 2, price: 690000 }], total: 30370000, status: "confirmed", createdAt: "2026-04-27" },
  { id: "ord-4", shopId: "shop-1", customerName: "Phạm Hoàng Dũng", customerEmail: "dung.pham@gmail.com", customerPhone: "0934444555", address: "99 Điện Biên Phủ, Bình Thạnh, TP.HCM", items: [{ productId: "p-6", productName: "Bàn phím cơ Keychron K8", productImage: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=100&h=100&fit=crop", quantity: 1, price: 2490000 }], total: 2490000, status: "pending", createdAt: "2026-04-28" },
  { id: "ord-5", shopId: "shop-2", customerName: "Võ Thị Em", customerEmail: "em.vo@gmail.com", customerPhone: "0945555666", address: "234 Cách Mạng Tháng 8, Quận 10, TP.HCM", items: [{ productId: "p-7", productName: "Áo thun Oversized Premium", productImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop", quantity: 3, price: 259000 }, { productId: "p-8", productName: "Quần Jeans Slim Fit", productImage: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=100&h=100&fit=crop", quantity: 1, price: 590000 }], total: 1367000, status: "pending", createdAt: "2026-04-28" },
];

export const posts: Post[] = [
  { id: "post-1", shopId: "shop-1", title: "Top 5 điện thoại đáng mua nhất 2026", slug: "top-5-dien-thoai-2026", content: "Năm 2026 chứng kiến nhiều bước tiến lớn trong công nghệ smartphone...", excerpt: "Khám phá 5 mẫu điện thoại đáng mua nhất năm 2026 với những cải tiến vượt bậc.", coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop", createdAt: "2026-04-20", status: "published" },
  { id: "post-2", shopId: "shop-1", title: "Hướng dẫn chọn laptop phù hợp", slug: "huong-dan-chon-laptop", content: "Chọn laptop phù hợp không chỉ dựa vào cấu hình mà còn phụ thuộc vào nhu cầu sử dụng...", excerpt: "Bí quyết chọn laptop phù hợp với nhu cầu và ngân sách của bạn.", coverImage: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=400&fit=crop", createdAt: "2026-04-18", status: "published" },
  { id: "post-3", shopId: "shop-1", title: "Mẹo bảo quản pin laptop bền lâu", slug: "meo-bao-quan-pin", content: "Pin laptop là một trong những bộ phận quan trọng nhất...", excerpt: "Những mẹo đơn giản giúp pin laptop của bạn luôn bền bỉ theo thời gian.", coverImage: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=400&fit=crop", createdAt: "2026-04-15", status: "draft" },
];

shops.forEach((shop) => {
  shop.categories = categories.filter((c) => c.shopId === shop.id);
  shop.products = products.filter((p) => p.shopId === shop.id);
  shop.orders = orders.filter((o) => o.shopId === shop.id);
  shop.posts = posts.filter((p) => p.shopId === shop.id);
});

export function getShopBySlug(slug: string): Shop | undefined {
  return shops.find((s) => s.slug === slug);
}

export function getProductsByShop(shopId: string): Product[] {
  return products.filter((p) => p.shopId === shopId);
}

export function getCategoriesByShop(shopId: string): ProductCategory[] {
  return categories.filter((c) => c.shopId === shopId);
}

export function getOrdersByShop(shopId: string): Order[] {
  return orders.filter((o) => o.shopId === shopId);
}

export function getPostsByShop(shopId: string): Post[] {
  return posts.filter((p) => p.shopId === shopId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}