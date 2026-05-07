import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";

export type UserRole = "user" | "super_admin" | "member" | "sub_admin";
export type UserStatus = "active" | "locked";

export const DEFAULT_PASSWORD = "iLoveProID@";
export const DEFAULT_SUB_ADMIN_MAX_SITES = 5000;

export interface ShopLimits {
  products: number;
  categories: number;
  posts: number;
}

export interface MemberOrder {
  id: string;
  shopName: string;
  shopSlug: string;
  date: string;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  items: { productId: string; name: string; quantity: number; price: number }[];
}

export interface ShippingAddress {
  id: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  isDefault: boolean;
}

export const MAX_ADDRESSES = 5;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  shopId?: string;
  shopName?: string;
  shopSlug?: string;
  avatar?: string;
  status: UserStatus;
  expiresAt: string;
  password: string;
  hasPassword?: boolean;
  customDomain?: string;
  address?: string;
  addresses?: ShippingAddress[];
  orders?: MemberOrder[];
  createdBy?: string;
  createdAt?: string;
  maxSites?: number;
}

export interface ShopConfig {
  shopId: string;
  shopName: string;
  ownerId: string;
  ownerName: string;
  limits: ShopLimits;
  usage: ShopLimits;
}

const DEFAULT_LIMITS: ShopLimits = { products: 200, categories: 200, posts: 200 };

const today = new Date();
const inDays = (d: number) => new Date(today.getTime() + d * 86400000).toISOString();

const INITIAL_USERS: AppUser[] = [
  { id: "user-1", name: "Nguyễn Văn An", email: "an@techzone.vn", phone: "0901234567", role: "user", shopId: "shop-1", shopName: "Tech Zone", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(180), password: DEFAULT_PASSWORD, createdAt: inDays(-180) },
  { id: "user-2", name: "Trần Thị Bình", email: "binh@fashionhub.vn", phone: "0912345678", role: "user", shopId: "shop-2", shopName: "Fashion Hub", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(90), password: DEFAULT_PASSWORD, createdAt: inDays(-275) },
  { id: "user-3", name: "Lê Minh Cường", email: "cuong@greengarden.vn", phone: "0987654321", role: "user", shopId: "shop-3", shopName: "Green Garden", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(45), password: DEFAULT_PASSWORD, createdAt: inDays(-320) },
  { id: "user-sa1-1", name: "Phạm Đức Anh", email: "anh@bookworld.vn", phone: "0938111222", role: "user", shopId: "shop-sa1-1", shopName: "Book World", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(120), password: DEFAULT_PASSWORD, createdBy: "subadmin-1", createdAt: inDays(-245) },
  { id: "user-sa1-2", name: "Vũ Thị Hồng", email: "hong@beautyland.vn", phone: "0938222333", role: "user", shopId: "shop-sa1-2", shopName: "Beauty Land", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(60), password: DEFAULT_PASSWORD, createdBy: "subadmin-1", createdAt: inDays(-305) },
  { id: "user-sa1-3", name: "Hoàng Văn Tùng", email: "tung@sportzone.vn", phone: "0938333444", role: "user", shopId: "shop-sa1-3", shopName: "Sport Zone", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(200), password: DEFAULT_PASSWORD, createdBy: "subadmin-1", createdAt: inDays(-165) },
  { id: "user-sa1-4", name: "Bùi Thị Lan", email: "lan@kidstoy.vn", phone: "0938444555", role: "user", shopId: "shop-sa1-4", shopName: "Kids Toy", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(30), password: DEFAULT_PASSWORD, createdBy: "subadmin-1", createdAt: inDays(-335) },
  { id: "user-sa1-5", name: "Đỗ Quang Minh", email: "minh@petshop.vn", phone: "0938555666", role: "user", shopId: "shop-sa1-5", shopName: "Pet Shop", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop", status: "locked", expiresAt: inDays(15), password: DEFAULT_PASSWORD, createdBy: "subadmin-1", createdAt: inDays(-350) },
  { id: "user-sa1-6", name: "Ngô Thanh Hà", email: "ha@homedecor.vn", phone: "0938666777", role: "user", shopId: "shop-sa1-6", shopName: "Home Decor", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(90), password: DEFAULT_PASSWORD, createdBy: "subadmin-1", createdAt: inDays(-275) },
  { id: "user-sa2-1", name: "Lý Hoàng Nam", email: "nam@coffeeshop.vn", phone: "0939111222", role: "user", shopId: "shop-sa2-1", shopName: "Coffee Shop", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(75), password: DEFAULT_PASSWORD, createdBy: "subadmin-2", createdAt: inDays(-290) },
  { id: "user-sa2-2", name: "Trịnh Mai Linh", email: "linh@bakery.vn", phone: "0939222333", role: "user", shopId: "shop-sa2-2", shopName: "Sweet Bakery", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(150), password: DEFAULT_PASSWORD, createdBy: "subadmin-2", createdAt: inDays(-215) },
  { id: "user-sa2-3", name: "Đinh Văn Hải", email: "hai@electronics.vn", phone: "0939333444", role: "user", shopId: "shop-sa2-3", shopName: "Mega Electronics", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(40), password: DEFAULT_PASSWORD, createdBy: "subadmin-2", createdAt: inDays(-325) },
];

const INITIAL_ADMIN: AppUser = {
  id: "admin-1",
  name: "Super Admin",
  email: "admin@platform.vn",
  phone: "0900000000",
  role: "super_admin",
  avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop",
  status: "active",
  expiresAt: inDays(3650),
  password: DEFAULT_PASSWORD,
};

const INITIAL_MEMBER: AppUser = {
  id: "member-1",
  name: "Phạm Thu Hà",
  email: "ha@gmail.com",
  phone: "0934567890",
  role: "member",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
  status: "active",
  expiresAt: inDays(3650),
  password: DEFAULT_PASSWORD,
  hasPassword: true,
  address: "123 Nguyễn Trãi, Phường 7, Quận 5, TP. Hồ Chí Minh",
  addresses: [
    { id: "addr-1", recipientName: "Phạm Thu Hà", recipientPhone: "0934567890", address: "123 Nguyễn Trãi, Phường 7, Quận 5, TP. Hồ Chí Minh", isDefault: true },
    { id: "addr-2", recipientName: "Phạm Thu Hà", recipientPhone: "0934567890", address: "456 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh", isDefault: false },
  ],
  orders: [
    { id: "M-2412", shopName: "Tech Zone", shopSlug: "tech-zone", date: inDays(-1), total: 2490000, status: "pending", items: [{ productId: "p2", name: "Tai nghe AirPods Pro", quantity: 1, price: 2490000 }] },
    { id: "M-2411", shopName: "Tech Zone", shopSlug: "tech-zone", date: inDays(-3), total: 18990000, status: "confirmed", items: [{ productId: "p1", name: "iPhone 15 Pro Max", quantity: 1, price: 18990000 }] },
    { id: "M-2410", shopName: "Fashion Hub", shopSlug: "fashion-hub", date: inDays(-7), total: 850000, status: "confirmed", items: [{ productId: "p7", name: "Áo khoác bomber", quantity: 1, price: 850000 }] },
    { id: "M-2409", shopName: "Tech Zone", shopSlug: "tech-zone", date: inDays(-10), total: 1290000, status: "confirmed", items: [{ productId: "p3", name: "Sạc nhanh 30W", quantity: 1, price: 1290000 }] },
    { id: "M-2408", shopName: "Green Garden", shopSlug: "green-garden", date: inDays(-12), total: 450000, status: "confirmed", items: [{ productId: "p8", name: "Cây kim tiền", quantity: 1, price: 450000 }] },
    { id: "M-2407", shopName: "Fashion Hub", shopSlug: "fashion-hub", date: inDays(-15), total: 590000, status: "confirmed", items: [{ productId: "p7", name: "Áo thun basic", quantity: 2, price: 295000 }] },
    { id: "M-2406", shopName: "Tech Zone", shopSlug: "tech-zone", date: inDays(-18), total: 4990000, status: "confirmed", items: [{ productId: "p4", name: "Apple Watch Series 9", quantity: 1, price: 4990000 }] },
    { id: "M-2405", shopName: "Green Garden", shopSlug: "green-garden", date: inDays(-20), total: 320000, status: "cancelled", items: [{ productId: "p8", name: "Cây trầu bà mini", quantity: 2, price: 160000 }] },
    { id: "M-2404", shopName: "Fashion Hub", shopSlug: "fashion-hub", date: inDays(-25), total: 1250000, status: "confirmed", items: [{ productId: "p7", name: "Quần jeans slim fit", quantity: 1, price: 1250000 }] },
    { id: "M-2403", shopName: "Tech Zone", shopSlug: "tech-zone", date: inDays(-30), total: 890000, status: "confirmed", items: [{ productId: "p5", name: "Cáp USB-C 2m", quantity: 1, price: 890000 }] },
    { id: "M-2402", shopName: "Green Garden", shopSlug: "green-garden", date: inDays(-40), total: 280000, status: "confirmed", items: [{ productId: "p9", name: "Đất trồng dinh dưỡng", quantity: 4, price: 70000 }] },
    { id: "M-2401", shopName: "Fashion Hub", shopSlug: "fashion-hub", date: inDays(-50), total: 720000, status: "confirmed", items: [{ productId: "p7", name: "Mũ lưỡi trai", quantity: 2, price: 360000 }] },
  ],
};

const INITIAL_SUB_ADMIN: AppUser = {
  id: "subadmin-1",
  name: "Trần Phúc",
  email: "phuc@platform.vn",
  phone: "0911000111",
  role: "sub_admin",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
  status: "active",
  expiresAt: inDays(3650),
  password: DEFAULT_PASSWORD,
  maxSites: DEFAULT_SUB_ADMIN_MAX_SITES,
};

const INITIAL_SUB_ADMIN_2: AppUser = {
  id: "subadmin-2",
  name: "Nguyễn Hữu Thắng",
  email: "thang@platform.vn",
  phone: "0911000222",
  role: "sub_admin",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop",
  status: "active",
  expiresAt: inDays(3650),
  password: DEFAULT_PASSWORD,
  maxSites: 3000,
};

const INITIAL_SUB_ADMIN_3: AppUser = {
  id: "subadmin-3",
  name: "Lê Quỳnh Trang",
  email: "trang@platform.vn",
  phone: "0911000333",
  role: "sub_admin",
  avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
  status: "locked",
  expiresAt: inDays(3650),
  password: DEFAULT_PASSWORD,
  maxSites: 5000,
};

const INITIAL_SHOP_CONFIGS: ShopConfig[] = [
  { shopId: "shop-1", shopName: "Tech Zone", ownerId: "user-1", ownerName: "Nguyễn Văn An", limits: { ...DEFAULT_LIMITS }, usage: { products: 6, categories: 4, posts: 3 } },
  { shopId: "shop-2", shopName: "Fashion Hub", ownerId: "user-2", ownerName: "Trần Thị Bình", limits: { ...DEFAULT_LIMITS }, usage: { products: 2, categories: 2, posts: 0 } },
  { shopId: "shop-3", shopName: "Green Garden", ownerId: "user-3", ownerName: "Lê Minh Cường", limits: { ...DEFAULT_LIMITS }, usage: { products: 2, categories: 2, posts: 0 } },
  { shopId: "shop-sa1-1", shopName: "Book World", ownerId: "user-sa1-1", ownerName: "Phạm Đức Anh", limits: { ...DEFAULT_LIMITS }, usage: { products: 45, categories: 8, posts: 12 } },
  { shopId: "shop-sa1-2", shopName: "Beauty Land", ownerId: "user-sa1-2", ownerName: "Vũ Thị Hồng", limits: { ...DEFAULT_LIMITS }, usage: { products: 78, categories: 12, posts: 5 } },
  { shopId: "shop-sa1-3", shopName: "Sport Zone", ownerId: "user-sa1-3", ownerName: "Hoàng Văn Tùng", limits: { ...DEFAULT_LIMITS }, usage: { products: 120, categories: 15, posts: 20 } },
  { shopId: "shop-sa1-4", shopName: "Kids Toy", ownerId: "user-sa1-4", ownerName: "Bùi Thị Lan", limits: { ...DEFAULT_LIMITS }, usage: { products: 32, categories: 6, posts: 3 } },
  { shopId: "shop-sa1-5", shopName: "Pet Shop", ownerId: "user-sa1-5", ownerName: "Đỗ Quang Minh", limits: { ...DEFAULT_LIMITS }, usage: { products: 18, categories: 4, posts: 1 } },
  { shopId: "shop-sa1-6", shopName: "Home Decor", ownerId: "user-sa1-6", ownerName: "Ngô Thanh Hà", limits: { ...DEFAULT_LIMITS }, usage: { products: 56, categories: 9, posts: 8 } },
  { shopId: "shop-sa2-1", shopName: "Coffee Shop", ownerId: "user-sa2-1", ownerName: "Lý Hoàng Nam", limits: { ...DEFAULT_LIMITS }, usage: { products: 28, categories: 5, posts: 4 } },
  { shopId: "shop-sa2-2", shopName: "Sweet Bakery", ownerId: "user-sa2-2", ownerName: "Trịnh Mai Linh", limits: { ...DEFAULT_LIMITS }, usage: { products: 35, categories: 7, posts: 6 } },
  { shopId: "shop-sa2-3", shopName: "Mega Electronics", ownerId: "user-sa2-3", ownerName: "Đinh Văn Hải", limits: { ...DEFAULT_LIMITS }, usage: { products: 92, categories: 14, posts: 10 } },
];

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  expiryDays: number;
}

export interface CreateSubAdminInput {
  name: string;
  email: string;
  phone: string;
  maxSites: number;
  password?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  allUsers: AppUser[];
  subAdmins: AppUser[];
  shopConfigs: ShopConfig[];
  impersonating: boolean;
  loginAsUser: () => void;
  loginAsSuperAdmin: () => void;
  loginAsMember: (redirectTo?: string) => void;
  loginAsSubAdmin: () => void;
  loginWithCredentials: (email: string, password: string) => boolean;
  logout: () => void;
  enterShopAsAdmin: (userId: string) => void;
  exitImpersonation: () => void;
  setShopLimit: (shopId: string, value: number) => void;
  getShopConfig: (shopId: string) => ShopConfig | undefined;
  lockUser: (userId: string) => void;
  unlockUser: (userId: string) => void;
  extendUserExpiry: (userId: string, days: number) => void;
  resetUserPassword: (userId: string) => void;
  createUser: (input: CreateUserInput) => void;
  updateUser: (userId: string, input: { name: string; email: string; phone: string; shopName: string }) => void;
  updateAdminPassword: (newPassword: string) => void;
  setUserDomain: (userId: string, domain: string) => void;
  updateMemberInfo: (input: { name: string; email: string; phone: string }) => void;
  updateMemberPassword: (newPassword: string) => void;
  addMemberAddress: (input: { recipientName: string; recipientPhone: string; address: string }) => boolean;
  updateMemberAddress: (id: string, input: { recipientName: string; recipientPhone: string; address: string }) => void;
  deleteMemberAddress: (id: string) => void;
  setDefaultMemberAddress: (id: string) => void;
  registerMember: (input: { name: string; email: string; phone: string; address: string }, redirectTo?: string) => void;
  loginMemberByPhone: (phone: string) => { found: boolean; needsPassword: boolean };
  loginMemberWithPassword: (phone: string, password: string) => boolean;
  finalizeMemberLogin: (redirectTo?: string) => void;
  createSubAdmin: (input: CreateSubAdminInput) => void;
  updateSubAdmin: (id: string, input: CreateSubAdminInput) => void;
  deleteSubAdmin: (id: string) => void;
  lockSubAdmin: (id: string) => void;
  unlockSubAdmin: (id: string) => void;
  resetSubAdminPassword: (id: string) => void;
  updateSubAdminSelf: (input: { name: string; email: string; phone: string; password?: string }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [originalUser, setOriginalUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [admin, setAdmin] = useState<AppUser>(INITIAL_ADMIN);
  const [member, setMember] = useState<AppUser>(INITIAL_MEMBER);
  const [subAdmins, setSubAdmins] = useState<AppUser[]>([INITIAL_SUB_ADMIN, INITIAL_SUB_ADMIN_2, INITIAL_SUB_ADMIN_3]);
  const [shopConfigs, setShopConfigs] = useState<ShopConfig[]>(INITIAL_SHOP_CONFIGS);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    const orig = localStorage.getItem("auth_original");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    if (orig) {
      try {
        setOriginalUser(JSON.parse(orig));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const persistUser = (u: AppUser | null) => {
    setUser(u);
    if (u) localStorage.setItem("auth_user", JSON.stringify(u));
    else localStorage.removeItem("auth_user");
  };

  const persistOriginal = (u: AppUser | null) => {
    setOriginalUser(u);
    if (u) localStorage.setItem("auth_original", JSON.stringify(u));
    else localStorage.removeItem("auth_original");
  };

  const loginAsUser = useCallback(() => {
    persistUser(users[0]);
    router.push("/admin");
  }, [router, users]);

  const loginAsSuperAdmin = useCallback(() => {
    persistUser(admin);
    router.push("/super-admin");
  }, [router, admin]);

  const loginAsMember = useCallback((redirectTo?: string) => {
    persistUser(member);
    router.push(redirectTo || "/member");
  }, [router, member]);

  const loginAsSubAdmin = useCallback(() => {
    persistUser(subAdmins[0]);
    router.push("/sub-admin");
  }, [router, subAdmins]);

  const loginWithCredentials = useCallback((email: string, _password: string) => {
    const found = [...users, admin, member, ...subAdmins].find((u) => u.email === email);
    if (found) {
      persistUser(found);
      const dest = found.role === "super_admin" ? "/super-admin"
        : found.role === "sub_admin" ? "/sub-admin"
        : found.role === "member" ? "/member"
        : "/admin";
      router.push(dest);
      return true;
    }
    return false;
  }, [router, users, admin, member, subAdmins]);

  const logout = useCallback(() => {
    persistUser(null);
    persistOriginal(null);
    router.push("/login");
  }, [router]);

  const enterShopAsAdmin = useCallback((userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target || !user || user.role !== "super_admin") return;
    persistOriginal(user);
    persistUser(target);
    router.push("/admin");
  }, [router, user, users]);

  const exitImpersonation = useCallback(() => {
    if (!originalUser) return;
    const orig = originalUser;
    persistOriginal(null);
    persistUser(orig);
    router.push("/super-admin");
  }, [router, originalUser]);

  const setShopLimit = useCallback((shopId: string, value: number) => {
    setShopConfigs((prev) => prev.map((sc) => (sc.shopId === shopId ? { ...sc, limits: { products: value, categories: value, posts: value } } : sc)));
  }, []);

  const getShopConfig = useCallback((shopId: string) => shopConfigs.find((sc) => sc.shopId === shopId), [shopConfigs]);

  const lockUser = useCallback((userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "locked" } : u)));
  }, []);

  const unlockUser = useCallback((userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u)));
  }, []);

  const extendUserExpiry = useCallback((userId: string, days: number) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const base = new Date(u.expiresAt);
      const now = new Date();
      const start = base > now ? base : now;
      return { ...u, expiresAt: new Date(start.getTime() + days * 86400000).toISOString() };
    }));
  }, []);

  const resetUserPassword = useCallback((userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: DEFAULT_PASSWORD } : u)));
  }, []);

  const createUser = useCallback((input: CreateUserInput) => {
    const id = "user-" + Date.now();
    const shopId = "shop-" + Date.now();
    const createdBy = user?.role === "sub_admin" ? user.id : undefined;
    const newUser: AppUser = {
      id, name: input.name, email: input.email, phone: input.phone,
      role: "user", shopId, shopName: input.shopName,
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop",
      status: "active", expiresAt: inDays(input.expiryDays), password: DEFAULT_PASSWORD,
      createdBy, createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setShopConfigs((prev) => [...prev, { shopId, shopName: input.shopName, ownerId: id, ownerName: input.name, limits: { ...DEFAULT_LIMITS }, usage: { products: 0, categories: 0, posts: 0 } }]);
  }, [user]);

  const updateUser = useCallback((userId: string, input: { name: string; email: string; phone: string; shopName: string }) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, name: input.name, email: input.email, phone: input.phone, shopName: input.shopName } : u)));
    setShopConfigs((prev) => prev.map((sc) => (sc.ownerId === userId ? { ...sc, ownerName: input.name, shopName: input.shopName } : sc)));
  }, []);

  const updateAdminPassword = useCallback((newPassword: string) => {
    setAdmin((prev) => ({ ...prev, password: newPassword }));
  }, []);

  const setUserDomain = useCallback((userId: string, domain: string) => {
    const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, customDomain: cleaned || undefined } : u)));
  }, []);

  const updateMemberInfo = useCallback((input: { name: string; email: string; phone: string }) => {
    setMember((prev) => {
      const updated = { ...prev, ...input };
      if (user?.role === "member") persistUser(updated);
      return updated;
    });
  }, [user]);

  const updateMemberPassword = useCallback((newPassword: string) => {
    setMember((prev) => {
      const updated = { ...prev, password: newPassword, hasPassword: true };
      if (user?.role === "member") persistUser(updated);
      return updated;
    });
  }, [user]);

  const syncDefaultAddress = (addrs: ShippingAddress[]): string | undefined => {
    const def = addrs.find((a) => a.isDefault) || addrs[0];
    return def ? def.recipientName + " | " + def.recipientPhone + " | " + def.address : undefined;
  };

  const addMemberAddress = useCallback((input: { recipientName: string; recipientPhone: string; address: string }) => {
    let success = false;
    setMember((prev) => {
      const list = prev.addresses || [];
      if (list.length >= MAX_ADDRESSES) return prev;
      success = true;
      const newAddr: ShippingAddress = { id: "addr-" + Date.now(), recipientName: input.recipientName, recipientPhone: input.recipientPhone, address: input.address, isDefault: list.length === 0 };
      const next = [...list, newAddr];
      const updated = { ...prev, addresses: next, address: syncDefaultAddress(next) };
      if (user?.role === "member") persistUser(updated);
      return updated;
    });
    return success;
  }, [user]);

  const updateMemberAddress = useCallback((id: string, input: { recipientName: string; recipientPhone: string; address: string }) => {
    setMember((prev) => {
      const next = (prev.addresses || []).map((a) => (a.id === id ? { ...a, recipientName: input.recipientName, recipientPhone: input.recipientPhone, address: input.address } : a));
      const updated = { ...prev, addresses: next, address: syncDefaultAddress(next) };
      if (user?.role === "member") persistUser(updated);
      return updated;
    });
  }, [user]);

  const deleteMemberAddress = useCallback((id: string) => {
    setMember((prev) => {
      const list = prev.addresses || [];
      const target = list.find((a) => a.id === id);
      let next = list.filter((a) => a.id !== id);
      if (target?.isDefault && next.length > 0) {
        next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      const updated = { ...prev, addresses: next, address: syncDefaultAddress(next) };
      if (user?.role === "member") persistUser(updated);
      return updated;
    });
  }, [user]);

  const setDefaultMemberAddress = useCallback((id: string) => {
    setMember((prev) => {
      const next = (prev.addresses || []).map((a) => ({ ...a, isDefault: a.id === id }));
      const updated = { ...prev, addresses: next, address: syncDefaultAddress(next) };
      if (user?.role === "member") persistUser(updated);
      return updated;
    });
  }, [user]);

  const registerMember = useCallback((input: { name: string; email: string; phone: string; address: string }, redirectTo?: string) => {
    const newAddr: ShippingAddress = { id: "addr-" + Date.now(), recipientName: input.name, recipientPhone: input.phone, address: input.address, isDefault: true };
    const updated: AppUser = {
      ...member,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      addresses: [newAddr],
      hasPassword: false,
      password: "",
    };
    setMember(updated);
    persistUser(updated);
    router.push(redirectTo || "/member");
  }, [member, router]);

  const loginMemberByPhone = useCallback((phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    if (member.phone === cleaned) {
      return { found: true, needsPassword: !!member.hasPassword };
    }
    return { found: false, needsPassword: false };
  }, [member]);

  const loginMemberWithPassword = useCallback((phone: string, password: string) => {
    const cleaned = phone.replace(/\s/g, "");
    if (member.phone === cleaned && member.password === password) {
      persistUser(member);
      return true;
    }
    return false;
  }, [member]);

  const finalizeMemberLogin = useCallback((redirectTo?: string) => {
    persistUser(member);
    router.push(redirectTo || "/member");
  }, [member, router]);

  const createSubAdmin = useCallback((input: CreateSubAdminInput) => {
    const id = "subadmin-" + Date.now();
    const newSA: AppUser = {
      id, name: input.name, email: input.email, phone: input.phone,
      role: "sub_admin",
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop",
      status: "active", expiresAt: inDays(3650),
      password: input.password && input.password.length > 0 ? input.password : DEFAULT_PASSWORD,
      maxSites: input.maxSites,
    };
    setSubAdmins((prev) => [...prev, newSA]);
  }, []);

  const updateSubAdmin = useCallback((id: string, input: CreateSubAdminInput) => {
    setSubAdmins((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const next: AppUser = { ...s, name: input.name, email: input.email, phone: input.phone, maxSites: input.maxSites };
      if (input.password && input.password.length > 0) next.password = input.password;
      return next;
    }));
  }, []);

  const deleteSubAdmin = useCallback((id: string) => {
    setSubAdmins((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const lockSubAdmin = useCallback((id: string) => {
    setSubAdmins((prev) => prev.map((s) => (s.id === id ? { ...s, status: "locked" } : s)));
  }, []);

  const unlockSubAdmin = useCallback((id: string) => {
    setSubAdmins((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active" } : s)));
  }, []);

  const resetSubAdminPassword = useCallback((id: string) => {
    setSubAdmins((prev) => prev.map((s) => (s.id === id ? { ...s, password: DEFAULT_PASSWORD } : s)));
  }, []);

  const updateSubAdminSelf = useCallback((input: { name: string; email: string; phone: string; password?: string }) => {
    if (!user || user.role !== "sub_admin") return;
    const id = user.id;
    setSubAdmins((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const next: AppUser = { ...s, name: input.name, email: input.email, phone: input.phone };
      if (input.password && input.password.length > 0) next.password = input.password;
      return next;
    }));
    const updated: AppUser = { ...user, name: input.name, email: input.email, phone: input.phone };
    if (input.password && input.password.length > 0) updated.password = input.password;
    persistUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, allUsers: users, subAdmins, shopConfigs, impersonating: !!originalUser, loginAsUser, loginAsSuperAdmin, loginAsMember, loginAsSubAdmin, loginWithCredentials, logout, enterShopAsAdmin, exitImpersonation, setShopLimit, getShopConfig, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateUser, updateAdminPassword, setUserDomain, updateMemberInfo, updateMemberPassword, addMemberAddress, updateMemberAddress, deleteMemberAddress, setDefaultMemberAddress, registerMember, loginMemberByPhone, loginMemberWithPassword, finalizeMemberLogin, createSubAdmin, updateSubAdmin, deleteSubAdmin, lockSubAdmin, unlockSubAdmin, resetSubAdminPassword, updateSubAdminSelf }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}