export interface Shop {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  themeColor?: string;
  intro?: string;
  contact: ShopContact;
  businessInfo?: ShopBusinessInfo;
  categories: ProductCategory[];
  products: Product[];
  orders: Order[];
  posts: Post[];
  discountCodes?: DiscountCode[];
}

export interface ShopBusinessInfo {
  businessName: string;
  registrationNumber: string;
  registrationDate?: string;
  registrationPlace?: string;
  taxCode?: string;
  ownerName?: string;
  note?: string;
  bankAccounts?: BankAccount[];
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface ShopContact {
  phone: string;
  email: string;
  address: string;
  messengerLink?: string;
  zaloLink?: string;
  socialLinks: { platform: string; url: string }[];
}

export interface ProductCategory {
  id: string;
  shopId: string;
  parentId?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount: number;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  videoUrl?: string;
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
  isHidden?: boolean;
  variants?: ProductVariant[];
  variantGroups?: ProductVariantGroup[];
  properties?: ProductProperty[];
}

export interface ProductProperty {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariantOption {
  id: string;
  name: string;
  image?: string;
}

export interface ProductVariantGroup {
  id: string;
  name: string;
  hasImage: boolean;
  options: ProductVariantOption[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stock?: number;
  sku?: string;
  image?: string;
  attributes?: Record<string, string>;
  optionIds?: string[];
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
  status: "pending" | "confirmed" | "cancelled";
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
  images?: string[];
  productIds?: string[];
  createdAt: string;
  status: "published" | "draft";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DiscountCode {
  id: string;
  shopId: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  productId?: string;
  productName?: string;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  status: "active" | "inactive";
  createdAt: string;
}