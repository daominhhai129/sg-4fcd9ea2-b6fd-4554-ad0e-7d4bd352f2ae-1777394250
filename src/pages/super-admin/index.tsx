import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LimitDialog, ExtendDialog, CreateUserDialog, AdminPasswordDialog, DomainDialog, EditUserDialog } from "@/components/admin/SuperAdminDialogs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { orders as mockOrders } from "@/data/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Shield, Store, Users, Package, FolderOpen, LogOut, Menu, X, Search, Lock, Unlock, RefreshCw, Phone, MoreVertical, UserPlus, KeyRound, CalendarClock, FileText, SlidersHorizontal, LogIn, Globe, Wrench, Image as ImageIcon, ShoppingBag, Trash2, Copy, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SuperAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isLoading, shopConfigs, allUsers, logout, setShopLimit, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateUser, updateAdminPassword, enterShopAsAdmin, setUserDomain } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingShop, setEditingShop] = useState<string | null>(null);
  const [extendingUser, setExtendingUser] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [domainUser, setDomainUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [orphanedImages, setOrphanedImages] = useState(23);
  const [maintenanceAction, setMaintenanceAction] = useState<"images" | "orders" | null>(null);
  const [oldOrdersDeleted, setOldOrdersDeleted] = useState(false);

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

  if (isLoading || !user || user.role !== "super_admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const editingShopConfig = shopConfigs.find((sc) => sc.shopId === editingShop);
  const extendingUserData = allUsers.find((u) => u.id === extendingUser);
  const domainUserData = allUsers.find((u) => u.id === domainUser);
  const editingUserData = allUsers.find((u) => u.id === editingUser);
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
        <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
              <span className="font-heading font-bold text-foreground">Super Admin</span>
            </div>
            <button className="lg:hidden p-1 text-muted-foreground" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="absolute bottom-4 left-3 right-3 space-y-1">
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
            <button onClick={() => setPwdOpen(true)} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
              <KeyRound className="w-4 h-4" /> {t("nav.profile")}
            </button>
            <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" /> {t("nav.logout")}
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-lg border-b border-border/50 flex items-center px-4 lg:px-8">
            <button className="lg:hidden p-2 -ml-2 text-foreground" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="ml-2 lg:ml-0 text-lg font-heading font-bold text-foreground">{t("super.title")}</h1>
          </header>

          <main className="p-4 lg:p-8 space-y-8">
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

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-heading font-bold text-foreground">{t("super.usersTitle")}</h2>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder={t("super.searchPh")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
                  </div>
                  <Button className="gradient-primary text-white border-0 rounded-xl" onClick={() => setCreateOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-1.5" /> {t("super.create")}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("super.colUser")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">{t("super.colPhone")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("super.colShop")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">{t("super.colDomain")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">{t("super.colExpiry")}</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("super.colStatus")}</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const expiry = new Date(u.expiresAt);
                      const expired = expiry < new Date();
                      const sc = u.shopId ? shopConfigs.find((s) => s.shopId === u.shopId) : null;
                      return (
                        <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors align-top">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Image src={u.avatar || ""} alt={u.name} width={36} height={36} className="rounded-full flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                {sc && (
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-muted-foreground">
                                    <span className="inline-flex items-center gap-1"><Package className="w-3 h-3" />{sc.usage.products}/{sc.limits.products}</span>
                                    <span className="inline-flex items-center gap-1"><FolderOpen className="w-3 h-3" />{sc.usage.categories}/{sc.limits.categories}</span>
                                    <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" />{sc.usage.posts}/{sc.limits.posts}</span>
                                  </div>
                                )}
                                {u.customDomain && (
                                  <a href={"https://" + u.customDomain} target="_blank" rel="noopener noreferrer" className="xl:hidden inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary hover:underline">
                                    <Globe className="w-3 h-3" />{u.customDomain}
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {u.phone ? (
                              <a href={"tel:" + u.phone} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {u.phone}
                              </a>
                            ) : <span className="text-sm text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{u.shopName || "—"}</span></td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            {u.customDomain ? (
                              <a href={"https://" + u.customDomain} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" />{u.customDomain}
                              </a>
                            ) : <span className="text-sm text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={cn("text-sm", expired ? "text-destructive font-semibold" : "text-muted-foreground")}>
                              {expiry.toLocaleDateString("vi-VN")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              {u.status === "active" ? t("super.statusActive") : t("super.statusLocked")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.role !== "super_admin" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {u.phone && (
                                    <DropdownMenuItem asChild>
                                      <a href={"tel:" + u.phone}><Phone className="w-4 h-4 mr-2" /> {t("super.menuCall")}</a>
                                    </DropdownMenuItem>
                                  )}
                                  {sc && (
                                    <DropdownMenuItem onClick={() => enterShopAsAdmin(u.id)}>
                                      <LogIn className="w-4 h-4 mr-2" /> {t("super.menuDashboard")}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleCopyShopInfo(u.id)}>
                                    <Copy className="w-4 h-4 mr-2" /> {t("super.menuCopy")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEditingUser(u.id)}>
                                    <Pencil className="w-4 h-4 mr-2" /> {t("super.menuEdit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setExtendingUser(u.id)}>
                                    <CalendarClock className="w-4 h-4 mr-2" /> {t("super.menuExtend")}
                                  </DropdownMenuItem>
                                  {sc && (
                                    <DropdownMenuItem onClick={() => setEditingShop(sc.shopId)}>
                                      <SlidersHorizontal className="w-4 h-4 mr-2" /> {t("super.menuLimit")}
                                    </DropdownMenuItem>
                                  )}
                                  {sc && (
                                    <DropdownMenuItem onClick={() => setDomainUser(u.id)}>
                                      <Globe className="w-4 h-4 mr-2" /> {t("super.menuDomain")}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleResetPassword(u.id, u.name)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> {t("super.menuReset")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {u.status === "active" ? (
                                    <DropdownMenuItem onClick={() => lockUser(u.id)} className="text-destructive focus:text-destructive">
                                      <Lock className="w-4 h-4 mr-2" /> {t("super.menuLock")}
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => unlockUser(u.id)}>
                                      <Unlock className="w-4 h-4 mr-2" /> {t("super.menuUnlock")}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("super.empty")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
        <AlertDialog open={!!maintenanceAction} onOpenChange={(o) => { if (!o) setMaintenanceAction(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">Xác nhận dọn dẹp</AlertDialogTitle>
              <AlertDialogDescription>
                {maintenanceAction === "images" && `Bạn sắp xóa ${orphanedImages} ảnh dư thừa khỏi server. Hành động này không thể hoàn tác.`}
                {maintenanceAction === "orders" && `Bạn sắp xóa ${oldOrdersCount} đơn hàng cũ trên 6 tháng. Hành động này không thể hoàn tác.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMaintenance} className="rounded-xl bg-destructive hover:bg-destructive/90">Xác nhận xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}