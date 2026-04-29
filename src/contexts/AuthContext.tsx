import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export interface ShopConfig {
  shopId: string;
  ownerId: string;
  ownerName: string;
  shopName: string;
  limits: { products: number; categories: number; posts: number; storage: number };
  usage: { products: number; categories: number; posts: number; storage: number };
  customDomain?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "super_admin" | "shop_owner";
  shopId?: string;
  shopName?: string;
  shopSlug?: string;
  shopThemeColor?: string;
  avatar: string;
  status: "active" | "locked";
  expiresAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  password: string;
  expiresAt: string;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  allUsers: AppUser[];
  shopConfigs: ShopConfig[];
  impersonating: boolean;
  loginAsUser: () => Promise<void>;
  loginAsSuperAdmin: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterShopAsAdmin: (userId: string) => void;
  exitImpersonation: () => void;
  setShopLimit: (shopId: string, limits: ShopConfig["limits"]) => void;
  getShopConfig: (shopId: string) => ShopConfig | undefined;
  lockUser: (userId: string) => void;
  unlockUser: (userId: string) => void;
  extendUserExpiry: (userId: string, days: number) => void;
  resetUserPassword: (userId: string) => string;
  createUser: (input: CreateUserInput) => void;
  updateUser: (userId: string, input: { name: string; email: string; phone: string; shopName: string }) => void;
  updateAdminPassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  setUserDomain: (userId: string, domain: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [originalUser, setOriginalUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [shopConfigs, setShopConfigs] = useState<ShopConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRef = useRef<Session | null>(null);

  const loadUserFromSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, shop_id, expires_at, status")
      .eq("id", session.user.id)
      .maybeSingle();
    if (!profile) {
      setUser(null);
      return;
    }
    let shopName: string | undefined;
    let shopSlug: string | undefined;
    let shopThemeColor: string | undefined;
    if (profile.shop_id) {
      const { data: shop } = await supabase
        .from("shops")
        .select("name, slug, theme_color")
        .eq("id", profile.shop_id)
        .maybeSingle();
      if (shop) {
        shopName = shop.name;
        shopSlug = shop.slug;
        shopThemeColor = shop.theme_color || undefined;
      }
    }
    setUser({
      id: profile.id,
      name: profile.full_name || session.user.email || "User",
      email: session.user.email || "",
      phone: profile.phone || "",
      role: profile.role === "super_admin" ? "super_admin" : "shop_owner",
      shopId: profile.shop_id || undefined,
      shopName,
      shopSlug,
      shopThemeColor,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile.id,
      status: profile.status === "locked" ? "locked" : "active",
      expiresAt: profile.expires_at || new Date(Date.now() + 365 * 86400000).toISOString(),
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      sessionRef.current = session;
      await loadUserFromSession(session);
      setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      sessionRef.current = session;
      await loadUserFromSession(session);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserFromSession]);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { ok: false, error: error?.message || "Đăng nhập thất bại" };
    }
    await loadUserFromSession(data.session);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.role === "super_admin") {
      router.push("/super-admin");
    } else {
      router.push("/admin");
    }
    return { ok: true };
  }, [loadUserFromSession, router]);

  const loginAsUser = useCallback(async () => {
    await loginWithCredentials("tech@shop.vn", "ShopOwner@123");
  }, [loginWithCredentials]);

  const loginAsSuperAdmin = useCallback(async () => {
    await loginWithCredentials("superadmin@platform.vn", "SuperAdmin@123");
  }, [loginWithCredentials]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOriginalUser(null);
    router.push("/login");
  }, [router]);

  const enterShopAsAdmin = useCallback((userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target || !user) return;
    setOriginalUser(user);
    setUser({ ...target });
    router.push("/admin");
  }, [users, user, router]);

  const exitImpersonation = useCallback(() => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
      router.push("/super-admin");
    }
  }, [originalUser, router]);

  const setShopLimit = useCallback((shopId: string, limits: ShopConfig["limits"]) => {
    setShopConfigs((prev) => prev.map((sc) => (sc.shopId === shopId ? { ...sc, limits } : sc)));
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
      const base = u.expiresAt ? new Date(u.expiresAt) : new Date();
      const next = new Date(Math.max(base.getTime(), Date.now()));
      next.setDate(next.getDate() + days);
      return { ...u, expiresAt: next.toISOString() };
    }));
  }, []);
  const resetUserPassword = useCallback((_userId: string) => {
    return Math.random().toString(36).slice(-10);
  }, []);
  const createUser = useCallback((input: CreateUserInput) => {
    const newId = "u-" + Date.now();
    const newShopId = "shop-" + Date.now();
    setUsers((prev) => [...prev, {
      id: newId, name: input.name, email: input.email, phone: input.phone,
      role: "shop_owner", shopId: newShopId, shopName: input.shopName,
      shopSlug: input.shopName.toLowerCase().replace(/\s+/g, "-"),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + newId,
      status: "active", expiresAt: input.expiresAt,
    }]);
    setShopConfigs((prev) => [...prev, {
      shopId: newShopId, ownerId: newId, ownerName: input.name, shopName: input.shopName,
      limits: { products: 100, categories: 20, posts: 50, storage: 500 },
      usage: { products: 0, categories: 0, posts: 0, storage: 0 },
    }]);
  }, []);
  const updateUser = useCallback((userId: string, input: { name: string; email: string; phone: string; shopName: string }) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, name: input.name, email: input.email, phone: input.phone, shopName: input.shopName } : u)));
    setShopConfigs((prev) => prev.map((sc) => (sc.ownerId === userId ? { ...sc, ownerName: input.name, shopName: input.shopName } : sc)));
  }, []);
  const updateAdminPassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);
  const setUserDomain = useCallback((userId: string, domain: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target?.shopId) return;
    setShopConfigs((prev) => prev.map((sc) => (sc.shopId === target.shopId ? { ...sc, customDomain: domain } : sc)));
  }, [users]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, allUsers: users, shopConfigs, impersonating: !!originalUser,
      loginAsUser, loginAsSuperAdmin, loginWithCredentials, logout,
      enterShopAsAdmin, exitImpersonation,
      setShopLimit, getShopConfig,
      lockUser, unlockUser, extendUserExpiry, resetUserPassword,
      createUser, updateUser, updateAdminPassword, setUserDomain,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}