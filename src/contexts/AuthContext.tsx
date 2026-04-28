import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";

export type UserRole = "user" | "super_admin";

export interface ShopLimits {
  products: number;
  categories: number;
  posts: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shopId?: string;
  shopName?: string;
  avatar?: string;
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

const MOCK_USERS: AppUser[] = [
  { id: "user-1", name: "Nguyễn Văn An", email: "an@techzone.vn", role: "user", shopId: "shop-1", shopName: "Tech Zone", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" },
  { id: "user-2", name: "Trần Thị Bình", email: "binh@fashionhub.vn", role: "user", shopId: "shop-2", shopName: "Fashion Hub", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
  { id: "user-3", name: "Lê Minh Cường", email: "cuong@greengarden.vn", role: "user", shopId: "shop-3", shopName: "Green Garden", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
];

const MOCK_ADMIN: AppUser = {
  id: "admin-1",
  name: "Super Admin",
  email: "admin@platform.vn",
  role: "super_admin",
  avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop",
};

const INITIAL_SHOP_CONFIGS: ShopConfig[] = [
  { shopId: "shop-1", shopName: "Tech Zone", ownerId: "user-1", ownerName: "Nguyễn Văn An", limits: { ...DEFAULT_LIMITS }, usage: { products: 6, categories: 4, posts: 3 } },
  { shopId: "shop-2", shopName: "Fashion Hub", ownerId: "user-2", ownerName: "Trần Thị Bình", limits: { ...DEFAULT_LIMITS }, usage: { products: 2, categories: 2, posts: 0 } },
  { shopId: "shop-3", shopName: "Green Garden", ownerId: "user-3", ownerName: "Lê Minh Cường", limits: { ...DEFAULT_LIMITS }, usage: { products: 2, categories: 2, posts: 0 } },
];

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  allUsers: AppUser[];
  shopConfigs: ShopConfig[];
  loginAsUser: () => void;
  loginAsSuperAdmin: () => void;
  loginWithCredentials: (email: string, password: string) => boolean;
  logout: () => void;
  updateShopLimits: (shopId: string, limits: ShopLimits) => void;
  getShopConfig: (shopId: string) => ShopConfig | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shopConfigs, setShopConfigs] = useState<ShopConfig[]>(INITIAL_SHOP_CONFIGS);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const persistUser = (u: AppUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("auth_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("auth_user");
    }
  };

  const loginAsUser = useCallback(() => {
    persistUser(MOCK_USERS[0]);
    router.push("/admin");
  }, [router]);

  const loginAsSuperAdmin = useCallback(() => {
    persistUser(MOCK_ADMIN);
    router.push("/super-admin");
  }, [router]);

  const loginWithCredentials = useCallback((email: string, _password: string) => {
    const found = [...MOCK_USERS, MOCK_ADMIN].find((u) => u.email === email);
    if (found) {
      persistUser(found);
      router.push(found.role === "super_admin" ? "/super-admin" : "/admin");
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    persistUser(null);
    router.push("/login");
  }, [router]);

  const updateShopLimits = useCallback((shopId: string, limits: ShopLimits) => {
    setShopConfigs((prev) => prev.map((sc) => (sc.shopId === shopId ? { ...sc, limits } : sc)));
  }, []);

  const getShopConfig = useCallback((shopId: string) => {
    return shopConfigs.find((sc) => sc.shopId === shopId);
  }, [shopConfigs]);

  return (
    <AuthContext.Provider value={{ user, isLoading, allUsers: MOCK_USERS, shopConfigs, loginAsUser, loginAsSuperAdmin, loginWithCredentials, logout, updateShopLimits, getShopConfig }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}