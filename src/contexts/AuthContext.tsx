import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";

export type UserRole = "user" | "super_admin";
export type UserStatus = "active" | "locked";

export const DEFAULT_PASSWORD = "iLoveProID@";

export interface ShopLimits {
  products: number;
  categories: number;
  posts: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  shopId?: string;
  shopName?: string;
  avatar?: string;
  status: UserStatus;
  expiresAt: string;
  password: string;
  customDomain?: string;
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
  { id: "user-1", name: "Nguyễn Văn An", email: "an@techzone.vn", phone: "0901234567", role: "user", shopId: "shop-1", shopName: "Tech Zone", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(180), password: DEFAULT_PASSWORD },
  { id: "user-2", name: "Trần Thị Bình", email: "binh@fashionhub.vn", phone: "0912345678", role: "user", shopId: "shop-2", shopName: "Fashion Hub", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(90), password: DEFAULT_PASSWORD },
  { id: "user-3", name: "Lê Minh Cường", email: "cuong@greengarden.vn", phone: "0987654321", role: "user", shopId: "shop-3", shopName: "Green Garden", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", status: "active", expiresAt: inDays(45), password: DEFAULT_PASSWORD },
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

const INITIAL_SHOP_CONFIGS: ShopConfig[] = [
  { shopId: "shop-1", shopName: "Tech Zone", ownerId: "user-1", ownerName: "Nguyễn Văn An", limits: { ...DEFAULT_LIMITS }, usage: { products: 6, categories: 4, posts: 3 } },
  { shopId: "shop-2", shopName: "Fashion Hub", ownerId: "user-2", ownerName: "Trần Thị Bình", limits: { ...DEFAULT_LIMITS }, usage: { products: 2, categories: 2, posts: 0 } },
  { shopId: "shop-3", shopName: "Green Garden", ownerId: "user-3", ownerName: "Lê Minh Cường", limits: { ...DEFAULT_LIMITS }, usage: { products: 2, categories: 2, posts: 0 } },
];

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  expiryDays: number;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  allUsers: AppUser[];
  shopConfigs: ShopConfig[];
  impersonating: boolean;
  loginAsUser: () => void;
  loginAsSuperAdmin: () => void;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [originalUser, setOriginalUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [admin, setAdmin] = useState<AppUser>(INITIAL_ADMIN);
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

  const loginWithCredentials = useCallback((email: string, _password: string) => {
    const found = [...users, admin].find((u) => u.email === email);
    if (found) {
      persistUser(found);
      router.push(found.role === "super_admin" ? "/super-admin" : "/admin");
      return true;
    }
    return false;
  }, [router, users, admin]);

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
    const newUser: AppUser = {
      id, name: input.name, email: input.email, phone: input.phone,
      role: "user", shopId, shopName: input.shopName,
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop",
      status: "active", expiresAt: inDays(input.expiryDays), password: DEFAULT_PASSWORD,
    };
    setUsers((prev) => [...prev, newUser]);
    setShopConfigs((prev) => [...prev, { shopId, shopName: input.shopName, ownerId: id, ownerName: input.name, limits: { ...DEFAULT_LIMITS }, usage: { products: 0, categories: 0, posts: 0 } }]);
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, isLoading, allUsers: users, shopConfigs, impersonating: !!originalUser, loginAsUser, loginAsSuperAdmin, loginWithCredentials, logout, enterShopAsAdmin, exitImpersonation, setShopLimit, getShopConfig, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateUser, updateAdminPassword, setUserDomain }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}