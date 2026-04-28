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
  { id: "ord-2", shopId: "shop-1", customerName: "Trần Thị Bình", customerEmail: "binh.tran@gmail.com", customerPhone: "0912222333", address: "78 Hai Bà Trưng, Quận 3, TP.HCM", items: [{ productId: "p-2", productName: "MacBook Air M3 15 inch", productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop", quantity: 1, price: 37990000 }], total: 37990000, status: "confirmed", createdAt: "2026-04-25" },
  { id: "ord-3", shopId: "shop-1", customerName: "Lê Minh Cường", customerEmail: "cuong.le@gmail.com", customerPhone: "0923333444", address: "12 Nguyễn Trãi, Quận 5, TP.HCM", items: [{ productId: "p-4", productName: "Samsung Galaxy S24 Ultra", productImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&h=100&fit=crop", quantity: 1, price: 28990000 }, { productId: "p-5", productName: "Sạc nhanh Anker 65W GaN", productImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&h=100&fit=crop", quantity: 2, price: 690000 }], total: 30370000, status: "confirmed", createdAt: "2026-04-27" },
  { id: "ord-4", shopId: "shop-1", customerName: "Phạm Hoàng Dũng", customerEmail: "dung.pham@gmail.com", customerPhone: "0934444555", address: "99 Điện Biên Phủ, Bình Thạnh, TP.HCM", items: [{ productId: "p-6", productName: "Bàn phím cơ Keychron K8", productImage: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=100&h=100&fit=crop", quantity: 1, price: 2490000 }], total: 2490000, status: "pending", createdAt: "2026-04-28" },
  { id: "ord-5", shopId: "shop-2", customerName: "Võ Thị Em", customerEmail: "em.vo@gmail.com", customerPhone: "0945555666", address: "234 Cách Mạng Tháng 8, Quận 10, TP.HCM", items: [{ productId: "p-7", productName: "Áo thun Oversized Premium", productImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop", quantity: 3, price: 259000 }, { productId: "p-8", productName: "Quần Jeans Slim Fit", productImage: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=100&h=100&fit=crop", quantity: 1, price: 590000 }], total: 1367000, status: "pending", createdAt: "2026-04-28" },
];

export const posts: Post[] = [
  {
    id: "post-1",
    shopId: "shop-1",
    title: "Top 5 điện thoại đáng mua nhất 2026",
    slug: "top-5-dien-thoai-2026",
    excerpt: "Khám phá 5 mẫu điện thoại đáng mua nhất năm 2026 với những cải tiến vượt bậc về camera, hiệu năng và pin.",
    content: "<p>Năm 2026 chứng kiến nhiều bước tiến lớn trong công nghệ smartphone. Từ camera AI thông minh đến chip xử lý mạnh mẽ, các flagship năm nay đều mang đến trải nghiệm vượt trội.</p><h3>1. iPhone 15 Pro Max</h3><p>Với chip A17 Pro, camera 48MP và thiết kế titanium siêu nhẹ, iPhone 15 Pro Max là lựa chọn hàng đầu cho những ai yêu thích hệ sinh thái Apple.</p><img src=\"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=500&fit=crop\" alt=\"iPhone 15 Pro Max\" /><h3>2. Samsung Galaxy S24 Ultra</h3><p>Galaxy AI mang lại trải nghiệm hoàn toàn mới — dịch trực tiếp, chỉnh sửa ảnh bằng AI, S Pen tích hợp và camera 200MP zoom 5x quang học.</p><p><strong>Lời khuyên:</strong> Hãy cân nhắc nhu cầu thực tế và ngân sách trước khi quyết định mua.</p>",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=500&fit=crop",
    ],
    productIds: ["p-1", "p-4"],
    createdAt: "2026-04-20",
    status: "published",
  },
  {
    id: "post-2",
    shopId: "shop-1",
    title: "Hướng dẫn chọn laptop phù hợp với nhu cầu",
    slug: "huong-dan-chon-laptop",
    excerpt: "Bí quyết chọn laptop phù hợp với nhu cầu công việc, học tập và ngân sách của bạn.",
    content: "<p>Chọn laptop phù hợp không chỉ dựa vào cấu hình mà còn phụ thuộc vào nhu cầu sử dụng thực tế. Bài viết này sẽ giúp bạn tìm ra chiếc laptop lý tưởng.</p><h3>Xác định nhu cầu</h3><ul><li><strong>Văn phòng cơ bản:</strong> Cần laptop nhẹ, pin lâu, RAM 8GB là đủ.</li><li><strong>Đồ họa & Video:</strong> Cần CPU mạnh, RAM 16GB+, card đồ họa rời.</li><li><strong>Lập trình:</strong> Ưu tiên RAM lớn, SSD nhanh, màn hình rõ nét.</li></ul><img src=\"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop\" alt=\"MacBook Air\" /><h3>Gợi ý từ Tech Zone</h3><p>MacBook Air M3 15 inch là lựa chọn hoàn hảo cho cả công việc văn phòng lẫn sáng tạo nội dung — mỏng nhẹ, pin 18 giờ, hiệu năng vượt trội.</p>",
    coverImage: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=500&fit=crop",
    ],
    productIds: ["p-2"],
    createdAt: "2026-04-18",
    status: "published",
  },
  {
    id: "post-3",
    shopId: "shop-1",
    title: "Mẹo bảo quản pin laptop bền lâu",
    slug: "meo-bao-quan-pin",
    excerpt: "Những mẹo đơn giản giúp pin laptop của bạn luôn bền bỉ theo thời gian.",
    content: "<p>Pin laptop là một trong những bộ phận quan trọng nhất, ảnh hưởng trực tiếp đến trải nghiệm sử dụng. Dưới đây là những mẹo giúp pin bền lâu hơn.</p><h3>5 nguyên tắc vàng</h3><ol><li>Không để pin xuống dưới 20% rồi mới sạc.</li><li>Tránh sạc quá 100% trong thời gian dài.</li><li>Sử dụng sạc chính hãng, đủ công suất.</li><li>Tránh để laptop quá nóng khi sạc.</li><li>Mỗi 1-2 tháng nên xả pin xuống 10% rồi sạc đầy.</li></ol><img src=\"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=500&fit=crop\" alt=\"Sạc nhanh\" /><p>Đầu tư một bộ sạc nhanh GaN chính hãng như Anker 65W cũng là cách bảo vệ pin hiệu quả.</p>",
    coverImage: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=500&fit=crop",
    ],
    productIds: ["p-5"],
    createdAt: "2026-04-15",
    status: "draft",
  },
  {
    id: "post-4",
    shopId: "shop-1",
    title: "AirPods Pro 2: Đáng mua nhất phân khúc tai nghe true wireless",
    slug: "airpods-pro-2-review",
    excerpt: "Đánh giá chi tiết AirPods Pro 2 USB-C — chống ồn xuất sắc, âm thanh không gian, tương thích hoàn hảo với iPhone.",
    content: "<p>Sau hơn 1 tháng trải nghiệm, AirPods Pro 2 USB-C thực sự là chiếc tai nghe đáng đầu tư nhất ở phân khúc cao cấp.</p><h3>Điểm nổi bật</h3><ul><li><strong>Chống ồn chủ động:</strong> Cải thiện gấp 2 lần so với thế hệ trước.</li><li><strong>Âm thanh không gian:</strong> Trải nghiệm rạp phim ngay trong tai.</li><li><strong>Cổng USB-C:</strong> Tiện lợi, sạc chung với iPhone 15.</li><li><strong>Pin:</strong> 6 tiếng nghe nhạc, 30 tiếng với hộp sạc.</li></ul><img src=\"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=500&fit=crop\" alt=\"AirPods Pro 2\" /><h3>Nhược điểm</h3><p>Chỉ phát huy tối đa khi dùng với iPhone. Trên Android sẽ mất nhiều tính năng như âm thanh không gian, chuyển đổi tự động giữa các thiết bị Apple.</p><p><em>Đánh giá: 9/10</em></p>",
    coverImage: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=500&fit=crop",
    ],
    productIds: ["p-3", "p-1"],
    createdAt: "2026-04-22",
    status: "published",
  },
  {
    id: "post-5",
    shopId: "shop-1",
    title: "So sánh iPhone 15 Pro Max và Samsung Galaxy S24 Ultra",
    slug: "iphone-vs-samsung-2026",
    excerpt: "Cuộc đối đầu giữa hai flagship hàng đầu — đâu là lựa chọn dành cho bạn?",
    content: "<p>Hai chiếc smartphone đáng mua nhất 2026 đến từ hai hệ sinh thái khác nhau. Hãy cùng so sánh chi tiết để chọn ra chiếc phù hợp với bạn.</p><h3>Camera</h3><p>iPhone 15 Pro Max nổi bật ở khả năng quay video — màu sắc tự nhiên, ổn định hình ảnh tuyệt vời. Samsung S24 Ultra thắng thế ở zoom xa với 5x quang học và 100x kỹ thuật số.</p><img src=\"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=500&fit=crop\" alt=\"S24 Ultra\" /><h3>Hiệu năng</h3><p>Chip A17 Pro của iPhone vẫn dẫn đầu về hiệu năng đơn nhân. Snapdragon 8 Gen 3 trên S24 Ultra mạnh ở đa nhân, phù hợp game thủ.</p><img src=\"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=500&fit=crop\" alt=\"iPhone Pro Max\" /><h3>Pin & sạc</h3><ul><li>iPhone 15 Pro Max: ~25W có dây, 15W không dây MagSafe</li><li>Samsung S24 Ultra: 45W có dây, 15W không dây</li></ul><h3>Kết luận</h3><p>Nếu bạn đã trong hệ sinh thái Apple, iPhone là lựa chọn không thể tốt hơn. Nếu thích sự linh hoạt, S Pen và camera zoom xa, S24 Ultra là vua.</p>",
    coverImage: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=500&fit=crop",
    ],
    productIds: ["p-1", "p-4"],
    createdAt: "2026-04-25",
    status: "published",
  },
  {
    id: "post-6",
    shopId: "shop-1",
    title: "Bàn phím cơ Keychron K8: Lựa chọn hoàn hảo cho dân văn phòng",
    slug: "keychron-k8-review",
    excerpt: "Vì sao Keychron K8 trở thành bàn phím cơ được ưa chuộng nhất hiện nay?",
    content: "<p>Keychron K8 là sự kết hợp hoàn hảo giữa thiết kế tinh tế và trải nghiệm gõ tuyệt vời. Đây là chiếc bàn phím mà mọi dân văn phòng đều xứng đáng sở hữu.</p><h3>Thiết kế</h3><p>Layout TKL gọn gàng, vỏ nhôm cao cấp, các phím keycap PBT bền bỉ. Kết nối Bluetooth tới 3 thiết bị, dùng được trên cả Mac và Windows.</p><img src=\"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=500&fit=crop\" alt=\"Keychron K8\" /><h3>Trải nghiệm gõ</h3><ul><li>Switch hot-swap — đổi switch không cần hàn.</li><li>Gateron Brown — êm, tactile vừa phải, phù hợp gõ văn bản.</li><li>Đèn RGB 18 chế độ.</li><li>Pin trâu, dùng 3-4 tuần một lần sạc.</li></ul><p><strong>Mua ngay tại Tech Zone</strong> với giá ưu đãi và bảo hành 12 tháng chính hãng.</p>",
    coverImage: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=500&fit=crop",
    ],
    productIds: ["p-6"],
    createdAt: "2026-04-26",
    status: "published",
  },
  {
    id: "post-7",
    shopId: "shop-1",
    title: "Combo công nghệ cho dân văn phòng hiện đại",
    slug: "combo-cong-nghe-van-phong",
    excerpt: "Trọn bộ thiết bị tăng năng suất cho dân văn phòng — laptop, tai nghe, bàn phím và sạc nhanh.",
    content: "<p>Để có một ngày làm việc hiệu quả, bạn cần những thiết bị đồng hành đáng tin cậy. Tech Zone gợi ý combo công nghệ \"must-have\" cho dân văn phòng 2026.</p><h3>1. Laptop chủ lực — MacBook Air M3</h3><p>Mỏng nhẹ chỉ 1.5kg, pin 18 giờ, hiệu năng đỉnh — mọi tác vụ văn phòng đều mượt mà.</p><img src=\"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop\" alt=\"MacBook\" /><h3>2. Tai nghe chống ồn — AirPods Pro 2</h3><p>Tập trung làm việc dù ở quán cafe ồn ào hay open space đông đúc.</p><h3>3. Bàn phím cơ — Keychron K8</h3><p>Trải nghiệm gõ êm tay, kết nối nhanh giữa Mac và iPad.</p><img src=\"https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=500&fit=crop\" alt=\"Keychron\" /><h3>4. Sạc nhanh GaN — Anker 65W</h3><p>Một củ sạc cho cả laptop, điện thoại, tai nghe — tiện lợi tối đa khi đi công tác.</p><p><strong>Tổng giá trị combo:</strong> ~48.000.000đ. Liên hệ Tech Zone để được tư vấn ưu đãi đặc biệt khi mua trọn bộ!</p>",
    coverImage: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=500&fit=crop",
    ],
    productIds: ["p-2", "p-3", "p-6", "p-5"],
    createdAt: "2026-04-27",
    status: "published",
  },
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