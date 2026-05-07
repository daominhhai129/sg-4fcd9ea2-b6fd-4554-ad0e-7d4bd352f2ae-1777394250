import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LimitDialog, ExtendDialog, CreateUserDialog, AdminPasswordDialog, DomainDialog, EditUserDialog, SubAdminDialog } from "@/components/admin/SuperAdminDialogs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { orders as mockOrders } from "@/data/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Shield, Store, Users, Package, FolderOpen, LogOut, Menu, X, Search, Lock, Unlock, RefreshCw, Phone, MoreVertical, UserPlus, KeyRound, CalendarClock, FileText, SlidersHorizontal, LogIn, Globe, Wrench, Image as ImageIcon, ShoppingBag, Trash2, Copy, Pencil, FileSpreadsheet, ChevronLeft, ChevronRight, LayoutDashboard, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SuperAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isLoading, shopConfigs, allUsers, subAdmins, logout, setShopLimit, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateUser, updateAdminPassword, enterShopAsAdmin, setUserDomain, createSubAdmin, updateSubAdmin, deleteSubAdmin, lockSubAdmin, unlockSubAdmin, resetSubAdminPassword } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [editingShop, setEditingShop] = useState<string | null>(null);
  const [extendingUser, setExtendingUser] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [domainUser, setDomainUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [createSubAdminOpen, setCreateSubAdminOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<string | null>(null);
  const [deletingSubAdmin, setDeletingSubAdmin] = useState<string | null>(null);
  const [orphanedImages, setOrphanedImages] = useState(23);
  const [maintenanceAction, setMaintenanceAction] = useState<"images" | "orders" | null>(null);
  const [oldOrdersDeleted, setOldOrdersDeleted] = useState(false);
  const [activeView, setActiveView] = useState<"shops" | "sub-admins" | "maintenance" | "support">("shops");
  const [shopPage, setShopPage] = useState(1);
  const SHOPS_PER_PAGE = 20;

  const oldOrdersCount = useMemo(() => {
    if (oldOrdersDeleted) return 0;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return mockOrders.filter((o) => new Date(o.createdAt) < sixMonthsAgo).length;
  }, [oldOrdersDeleted]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) router.replace("/login");
  }, [user, isLoading, router]);

  const filteredUsers = allUsers
    .filter((u) => u.role === "user")
    .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.shopName || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));

  const shopTotalPages = Math.max(1, Math.ceil(filteredUsers.length / SHOPS_PER_PAGE));
  const pagedUsers = filteredUsers.slice((shopPage - 1) * SHOPS_PER_PAGE, shopPage * SHOPS_PER_PAGE);

  useEffect(() => {
    setShopPage(1);
  }, [search]);

  useEffect(() => {
    if (shopPage > shopTotalPages) setShopPage(shopTotalPages);
  }, [shopPage, shopTotalPages]);

  if (isLoading || !user || user.role !== "super_admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const editingShopConfig = shopConfigs.find((sc) => sc.shopId === editingShop);
  const extendingUserData = allUsers.find((u) => u.id === extendingUser);
  const domainUserData = allUsers.find((u) => u.id === domainUser);
  const editingUserData = allUsers.find((u) => u.id === editingUser);
  const editingSubAdminData = subAdmins.find((s) => s.id === editingSubAdmin);
  const deletingSubAdminData = subAdmins.find((s) => s.id === deletingSubAdmin);
  const totalProducts = shopConfigs.reduce((sum, sc) => sum + sc.usage.products, 0);

  const handleResetPassword = (userId: string, name: string) => {
    resetUserPassword(userId);
    toast({ title: "Đã reset mật khẩu", description: `Mật khẩu của ${name} đã được đặt về mặc định.` });
  };

  const handleCopyShopInfo = (userId: string) => {
    const u = allUsers.find((x) => x.id === userId);
    if (!u) return;
    const sc = u.shopId ? shopConfigs.find((s) => s.shopId === u.shopId) : null;
    const lines = [
      `Cửa hàng: ${u.shopName || "—"}`,
      `Chủ shop: ${u.name}`,
      `Email đăng nhập: ${u.email}`,
      `Mật khẩu mặc định: iLoveProID@`,
      u.phone ? `SĐT: ${u.phone}` : null,
      u.customDomain ? `Tên miền riêng: ${u.customDomain}` : null,
      `Hết hạn: ${new Date(u.expiresAt).toLocaleDateString("vi-VN")}`,
      sc ? `Giới hạn: ${sc.limits.products} sản phẩm · ${sc.limits.categories} danh mục · ${sc.limits.posts} bài viết` : null,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines).then(
      () => toast({ title: "Đã sao chép", description: "Thông tin shop đã được copy vào clipboard." }),
      () => toast({ title: "Không thể sao chép", description: "Trình duyệt từ chối truy cập clipboard.", variant: "destructive" })
    );
  };

  const handleExportCSV = () => {
    const shopUsers = allUsers.filter((u) => u.role === "user");
    const headers = ["Tên", "Email", "SĐT", "Cửa hàng", "Tên miền", "Hết hạn", "Trạng thái", "Sản phẩm", "Danh mục", "Bài viết"];
    const rows = shopUsers.map((u) => {
      const sc = u.shopId ? shopConfigs.find((s) => s.shopId === u.shopId) : null;
      return [
        u.name,
        u.email,
        u.phone || "",
        u.shopName || "",
        u.customDomain || "",
        new Date(u.expiresAt).toLocaleDateString("vi-VN"),
        u.status === "active" ? "Hoạt động" : "Đã khóa",
        sc ? `${sc.usage.products}/${sc.limits.products}` : "",
        sc ? `${sc.usage.categories}/${sc.limits.categories}` : "",
        sc ? `${sc.usage.posts}/${sc.limits.posts}` : "",
      ];
    });
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shop-users-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: t("super.exportSuccess"), description: t("super.exportDesc") });
  };

  const confirmMaintenance = () => {
    if (maintenanceAction === "images") {
      const count = orphanedImages;
      setOrphanedImages(0);
      toast({ title: "Đã dọn dẹp", description: `Xóa ${count} ảnh dư thừa khỏi server.` });
    } else if (maintenanceAction === "orders") {
      const count = oldOrdersCount;
      setOldOrdersDeleted(true);
      toast({ title: "Đã dọn dẹp", description: `Xóa ${count} đơn hàng cũ trên 6 tháng.` });
    }
    setMaintenanceAction(null);
  };

  return (
    <>
      <SEO title="Super Admin" />
      <div className="min-h-screen bg-background">
        <aside className={cn("fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-200 lg:translate-x-0", sidebarCollapsed ? "w-20" : "w-64", sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full")}>
          <div className={cn("flex items-center h-16 px-4 border-b border-border", sidebarCollapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4 text-white" /></div>
              {!sidebarCollapsed && <span className="font-heading font-bold text-foreground truncate">{t("super.title")}</span>}
            </div>
            {!sidebarCollapsed && (
              <>
                <button className="lg:hidden p-1 text-muted-foreground" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
                <button className="hidden lg:flex p-1 text-muted-foreground hover:text-foreground" onClick={() => setSidebarCollapsed(true)} title={t("super.collapse")}><ChevronLeft className="w-5 h-5" /></button>
              </>
            )}
          </div>
          {sidebarCollapsed && (
            <button className="hidden lg:flex w-full justify-center py-2 text-muted-foreground hover:text-foreground border-b border-border" onClick={() => setSidebarCollapsed(false)} title={t("super.expand")}><ChevronRight className="w-5 h-5" /></button>
          )}
          <nav className="p-3 space-y-1">
            {[
              { id: "shops" as const, label: t("super.navShops"), icon: Store, count: filteredUsers.length },
              { id: "sub-admins" as const, label: t("super.navSubAdmins"), icon: Shield, count: subAdmins.length },
              { id: "maintenance" as const, label: t("super.navMaintenance"), icon: Wrench },
              { id: "support" as const, label: "Hỗ trợ kỹ thuật", icon: HeadphonesIcon },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-colors",
                  sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  activeView === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                {!sidebarCollapsed && typeof item.count === "number" && (
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", activeView === item.id ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground")}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-4 left-3 right-3 space-y-1">
            {!sidebarCollapsed && (
              <>
                <div className="px-3 pb-1">
                  <LanguageToggle />
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
                  <Image src={user.avatar || ""} alt={user.name} width={32} height={32} className="rounded-full" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Super Admin</p>
                  </div>
                </div>
              </>
            )}
            {sidebarCollapsed && (
              <div className="flex justify-center py-2">
                <Image src={user.avatar || ""} alt={user.name} width={32} height={32} className="rounded-full" />
              </div>
            )}
            <button onClick={() => setPwdOpen(true)} title={sidebarCollapsed ? t("settings.changePwd") : undefined} className={cn("flex items-center gap-2 w-full rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors", sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5")}>
              <KeyRound className="w-4 h-4 flex-shrink-0" /> {!sidebarCollapsed && t("settings.changePwd")}
            </button>
            <button onClick={logout} title={sidebarCollapsed ? t("nav.logout") : undefined} className={cn("flex items-center gap-2 w-full rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors", sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5")}>
              <LogOut className="w-4 h-4 flex-shrink-0" /> {!sidebarCollapsed && t("nav.logout")}
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className={cn("transition-all duration-200", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
          <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-lg border-b border-border/50 flex items-center px-4 lg:px-8">
            <button className="lg:hidden p-2 -ml-2 text-foreground" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="ml-2 lg:ml-0 text-lg font-heading font-bold text-foreground">
              {activeView === "shops" ? t("super.headerShops") : activeView === "sub-admins" ? t("super.headerSubAdmins") : activeView === "maintenance" ? t("super.headerMaintenance") : "Hỗ trợ kỹ thuật"}
            </h1>
          </header>

          <main className="p-4 lg:p-8 space-y-8">
            {activeView !== "sub-admins" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: t("super.statShops"), value: shopConfigs.length, icon: Store, color: "text-primary bg-primary/10" },
                { label: t("super.statUsers"), value: allUsers.length, icon: Users, color: "text-accent bg-accent/10" },
                { label: t("super.statProducts"), value: totalProducts, icon: Package, color: "text-emerald-600 bg-emerald-50" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-card border border-border/50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}><stat.icon className="w-5 h-5" /></div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
            )}

            {activeView === "shops" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">{t("super.shopsTitle")}</h2>
                  <p className="text-sm text-muted-foreground">{t("super.shopsDesc")}</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("super.searchShopsPh")} className="pl-9 rounded-xl w-full sm:w-64" />
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={handleExportCSV}><FileSpreadsheet className="w-4 h-4 mr-1.5" /> {t("super.csvBtn")}</Button>
                  <Button className="gradient-primary text-white border-0 rounded-xl" onClick={() => setCreateOpen(true)}><UserPlus className="w-4 h-4 mr-1.5" /> {t("super.createBtn")}</Button>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("super.colShopOwner")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">{t("col.phone")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("super.colShopShort")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">{t("super.colDomainShort")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">{t("super.colLimitShort")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("super.colCreatedBy")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">{t("col.expiry")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("col.status")}</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((u) => {
                      const expiry = new Date(u.expiresAt);
                      const expired = expiry < new Date();
                      const cfg = u.shopId ? shopConfigs.find((sc) => sc.shopId === u.shopId) : undefined;
                      const productLimit = cfg?.limits.products || 0;
                      const productUsage = cfg?.usage.products || 0;
                      const usagePct = productLimit ? Math.min(100, (productUsage / productLimit) * 100) : 0;
                      const defaultUrl = u.shopSlug ? "/shop/" + u.shopSlug : "—";
                      const creator = u.createdBy ? subAdmins.find((s) => s.id === u.createdBy) : null;
                      const createdLabel = u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—";
                      return (
                        <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Image src={u.avatar || ""} alt={u.name} width={36} height={36} className="rounded-full flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {u.phone ? <a href={"tel:" + u.phone} className="text-sm text-primary hover:underline inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{u.phone}</a> : <span className="text-sm text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{u.shopName || "—"}</span></td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            {u.customDomain ? (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary"><Globe className="w-3.5 h-3.5" />{u.customDomain}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">{defaultUrl}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <div className="text-xs">
                              <span className="font-semibold text-foreground">{productUsage.toLocaleString("vi-VN")}</span>
                              <span className="text-muted-foreground"> / {productLimit.toLocaleString("vi-VN")}</span>
                            </div>
                            <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                              <div className={cn("h-full", usagePct >= 90 ? "bg-destructive" : usagePct >= 70 ? "bg-amber-500" : "bg-primary")} style={{ width: usagePct + "%" }} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {creator ? (
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                                <p className="text-xs text-muted-foreground">{t("super.creatorSub")} · {createdLabel}</p>
                              </div>
                            ) : (
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-accent">{t("super.creatorSuper")}</p>
                                <p className="text-xs text-muted-foreground">{createdLabel}</p>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={cn("text-sm", expired ? "text-destructive font-semibold" : "text-muted-foreground")}>
                              {expiry.toLocaleDateString("vi-VN")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              {u.status === "active" ? t("status.active") : t("status.locked")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem onClick={() => enterShopAsAdmin(u.id)}>
                                  <LogIn className="w-4 h-4 mr-2" /> {t("super.menuEnterShop")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingUser(u.id)}>
                                  <Pencil className="w-4 h-4 mr-2" /> {t("super.menuEditInfo")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDomainUser(u.id)}>
                                  <Globe className="w-4 h-4 mr-2" /> {t("super.menuDomainUrl")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingShop(u.shopId || null)}>
                                  <SlidersHorizontal className="w-4 h-4 mr-2" /> {t("super.menuLimits")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExtendingUser(u.id)}>
                                  <CalendarClock className="w-4 h-4 mr-2" /> {t("super.menuExtendShort")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(u.id, u.name)}>
                                  <RefreshCw className="w-4 h-4 mr-2" /> {t("super.menuResetPwd")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyShopInfo(u.id)}>
                                  <Copy className="w-4 h-4 mr-2" /> {t("super.menuCopyInfo")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {u.status === "active" ? (
                                  <DropdownMenuItem onClick={() => lockUser(u.id)} className="text-destructive focus:text-destructive">
                                    <Lock className="w-4 h-4 mr-2" /> {t("super.menuLockShort")}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => unlockUser(u.id)}>
                                    <Unlock className="w-4 h-4 mr-2" /> {t("super.menuUnlockShort")}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">{t("super.emptyShops")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {shopTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t("super.pageShowing")} <span className="font-semibold text-foreground">{(shopPage - 1) * SHOPS_PER_PAGE + 1}</span>–<span className="font-semibold text-foreground">{Math.min(shopPage * SHOPS_PER_PAGE, filteredUsers.length)}</span> {t("super.pageIn")} <span className="font-semibold text-foreground">{filteredUsers.length}</span> {t("super.pageShopOwners")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" disabled={shopPage === 1} onClick={() => setShopPage((p) => p - 1)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> {t("super.pagePrev")}
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: shopTotalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === shopTotalPages || Math.abs(p - shopPage) <= 1)
                        .map((p, idx, arr) => (
                          <span key={p} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                            <button
                              onClick={() => setShopPage(p)}
                              className={cn(
                                "min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors",
                                shopPage === p ? "bg-primary text-white" : "bg-card border border-border hover:bg-muted"
                              )}
                            >
                              {p}
                            </button>
                          </span>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl" disabled={shopPage === shopTotalPages} onClick={() => setShopPage((p) => p + 1)}>
                      {t("super.pageNext")} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            )}

            {activeView === "sub-admins" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">{t("super.subAdminsTitle")}</h2>
                  <p className="text-sm text-muted-foreground">{t("super.subAdminsDesc")}</p>
                </div>
                <Button className="gradient-primary text-white border-0 rounded-xl" onClick={() => setCreateSubAdminOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> {t("super.createSubBtn")}
                </Button>
              </div>
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("super.colSubAdmin")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">{t("col.phone")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("super.colSitesManaged")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("col.status")}</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {subAdmins.map((sa) => {
                      const sitesCount = allUsers.filter((u) => u.createdBy === sa.id).length;
                      const cap = sa.maxSites || 5000;
                      return (
                        <tr key={sa.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Image src={sa.avatar || ""} alt={sa.name} width={36} height={36} className="rounded-full flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{sa.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{sa.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {sa.phone ? <a href={"tel:" + sa.phone} className="text-sm text-primary hover:underline inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{sa.phone}</a> : <span className="text-sm text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <span className="font-bold text-foreground">{sitesCount}</span>
                              <span className="text-muted-foreground"> / {cap.toLocaleString("vi-VN")}</span>
                            </div>
                            <div className="w-32 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: Math.min(100, (sitesCount / cap) * 100) + "%" }} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", sa.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              {sa.status === "active" ? t("status.active") : t("status.locked")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setEditingSubAdmin(sa.id)}>
                                  <Pencil className="w-4 h-4 mr-2" /> {t("super.menuEditInfo")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { resetSubAdminPassword(sa.id); toast({ title: t("super.toastSubResetPwd"), description: t("super.toastSubResetPwdDesc").replace("{name}", sa.name) }); }}>
                                  <RefreshCw className="w-4 h-4 mr-2" /> {t("super.menuResetPwd")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {sa.status === "active" ? (
                                  <DropdownMenuItem onClick={() => lockSubAdmin(sa.id)} className="text-destructive focus:text-destructive">
                                    <Lock className="w-4 h-4 mr-2" /> {t("super.menuLockShort")}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => unlockSubAdmin(sa.id)}>
                                    <Unlock className="w-4 h-4 mr-2" /> {t("super.menuUnlockShort")}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => setDeletingSubAdmin(sa.id)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" /> {t("super.menuDelete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {subAdmins.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("super.emptySubAdmins")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {activeView === "maintenance" && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-heading font-bold text-foreground">{t("super.maintenance")}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card border border-border/50 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Asset cleanup</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">{t("super.orphanedImages")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("super.orphanedImagesDesc")}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-heading font-bold text-foreground">{orphanedImages}<span className="text-sm font-medium text-muted-foreground ml-1">{t("super.images")}</span></span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      disabled={orphanedImages === 0}
                      onClick={() => setMaintenanceAction("images")}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" /> {t("super.cleanup")}
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border/50 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Order cleanup</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">{t("super.oldOrders")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("super.oldOrdersDesc")}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-heading font-bold text-foreground">{oldOrdersCount}<span className="text-sm font-medium text-muted-foreground ml-1">{t("super.orderUnit")}</span></span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      disabled={oldOrdersCount === 0}
                      onClick={() => setMaintenanceAction("orders")}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" /> {t("super.cleanup")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </main>
        </div>

        <LimitDialog
          open={!!editingShop}
          onOpenChange={(o) => { if (!o) setEditingShop(null); }}
          initialValue={editingShopConfig?.limits.products || 200}
          shopName={editingShopConfig?.shopName || ""}
          onSave={(value) => { if (editingShop) setShopLimit(editingShop, value); }}
        />
        <ExtendDialog
          open={!!extendingUser}
          onOpenChange={(o) => { if (!o) setExtendingUser(null); }}
          userName={extendingUserData?.name || ""}
          currentExpiry={extendingUserData?.expiresAt}
          onConfirm={(days) => { if (extendingUser) extendUserExpiry(extendingUser, days); }}
        />
        <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createUser} />
        <AdminPasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} onSave={(pwd) => { updateAdminPassword(pwd); toast({ title: "Đã đổi mật khẩu", description: "Mật khẩu mới đã được lưu." }); }} />
        <DomainDialog
          open={!!domainUser}
          onOpenChange={(o) => { if (!o) setDomainUser(null); }}
          userName={domainUserData?.name || ""}
          currentDomain={domainUserData?.customDomain}
          onSave={(domain) => { if (domainUser) { setUserDomain(domainUser, domain); toast({ title: domain ? "Đã cập nhật tên miền" : "Đã hủy liên kết", description: domain || "Tên miền riêng đã bị xóa." }); } }}
        />
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(o) => { if (!o) setEditingUser(null); }}
          user={editingUserData || null}
          onSave={(input) => { if (editingUser) { updateUser(editingUser, input); toast({ title: "Đã cập nhật", description: "Thông tin chủ shop đã được lưu." }); } }}
        />
        <SubAdminDialog
          open={createSubAdminOpen}
          onOpenChange={setCreateSubAdminOpen}
          title={t("super.createSubTitle")}
          onSubmit={(input) => { createSubAdmin(input); toast({ title: t("super.toastSubCreated"), description: t("super.toastSubCreatedDesc").replace("{name}", input.name) }); }}
        />
        <SubAdminDialog
          open={!!editingSubAdmin}
          onOpenChange={(o) => { if (!o) setEditingSubAdmin(null); }}
          title={t("super.editSubTitle")}
          isEdit
          initial={editingSubAdminData ? { name: editingSubAdminData.name, email: editingSubAdminData.email, phone: editingSubAdminData.phone || "", maxSites: editingSubAdminData.maxSites || 5000 } : null}
          onSubmit={(input) => { if (editingSubAdmin) { updateSubAdmin(editingSubAdmin, input); toast({ title: t("super.toastSubUpdated") }); } }}
        />
        <AlertDialog open={!!deletingSubAdmin} onOpenChange={(o) => { if (!o) setDeletingSubAdmin(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">{t("super.deleteSubTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("super.deleteSubDesc").replace("{name}", deletingSubAdminData?.name || "")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (deletingSubAdmin) { deleteSubAdmin(deletingSubAdmin); toast({ title: t("super.toastSubDeleted") }); setDeletingSubAdmin(null); } }} className="rounded-xl bg-destructive hover:bg-destructive/90">{t("super.confirmDelete")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={!!maintenanceAction} onOpenChange={(o) => { if (!o) setMaintenanceAction(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">{t("super.maintenanceConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {maintenanceAction === "images" && t("super.maintenanceConfirmImages").replace("{n}", String(orphanedImages))}
                {maintenanceAction === "orders" && t("super.maintenanceConfirmOrders").replace("{n}", String(oldOrdersCount))}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMaintenance} className="rounded-xl bg-destructive hover:bg-destructive/90">{t("super.confirmDelete")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}