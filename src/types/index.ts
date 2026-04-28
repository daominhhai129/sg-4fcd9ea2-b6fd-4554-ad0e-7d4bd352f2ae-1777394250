export interface Shop {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  contact: ShopContact;
  categories: ProductCategory[];
  products: Product[];
  orders: Order[];
  posts: Post[];
}

export interface ShopContact {
  phone: string;
  email: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
}

export interface ProductCategory {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  status: "active" | "draft" | "outOfStock";
  featured?: boolean;
}

export interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  createdAt: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Post {
  id: string;
  shopId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  status: "published" | "draft";
}

export interface CartItem {
  product: Product;
  quantity: number;
}