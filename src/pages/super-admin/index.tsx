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
import { Shield, Store, Users, Package, FolderOpen, LogOut, Menu, X, Search, Lock, Unlock, RefreshCw, Phone, MoreVertical, UserPlus, KeyRound, CalendarClock, FileText, SlidersHorizontal, LogIn, Globe, Wrench, Image as ImageIcon, ShoppingBag, Trash2, Copy, Pencil, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SuperAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isLoading, shopConfigs, allUsers, subAdmins, logout, setShopLimit, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateUser, updateAdminPassword, enterShopAsAdmin, setUserDomain, createSubAdmin, updateSubAdmin, deleteSubAdmin, lockSubAdmin, unlockSubAdmin, resetSubAdminPassword } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
              <KeyRound className="w-4 h-4" /> {t("settings.changePwd")}
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
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">Quản lý Sub-admin</h2>
                  <p className="text-sm text-muted-foreground">Sub-admin tạo và quản lý user shop của riêng họ. Mỗi sub-admin có cap số sites tự cấu hình (mặc định 5000).</p>
                </div>
                <Button className="gradient-primary text-white border-0 rounded-xl" onClick={() => setCreateSubAdminOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> Tạo Sub-admin
                </Button>
              </div>
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Sub-admin</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">SĐT</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Sites quản lý</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Trạng thái</th>
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
                              {sa.status === "active" ? "Hoạt động" : "Đã khóa"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setEditingSubAdmin(sa.id)}>
                                  <Pencil className="w-4 h-4 mr-2" /> Sửa thông tin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { resetSubAdminPassword(sa.id); toast({ title: "Đã reset mật khẩu", description: `Mật khẩu của ${sa.name} đã đặt về mặc định.` }); }}>
                                  <RefreshCw className="w-4 h-4 mr-2" /> Reset mật khẩu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {sa.status === "active" ? (
                                  <DropdownMenuItem onClick={() => lockSubAdmin(sa.id)} className="text-destructive focus:text-destructive">
                                    <Lock className="w-4 h-4 mr-2" /> Khóa
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => unlockSubAdmin(sa.id)}>
                                    <Unlock className="w-4 h-4 mr-2" /> Mở khóa
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => setDeletingSubAdmin(sa.id)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {subAdmins.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Chưa có sub-admin nào.</td></tr>
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
        <SubAdminDialog
          open={createSubAdminOpen}
          onOpenChange={setCreateSubAdminOpen}
          title="Tạo Sub-admin mới"
          onSubmit={(input) => { createSubAdmin(input); toast({ title: "Đã tạo sub-admin", description: `${input.name} có thể đăng nhập với mật khẩu mặc định.` }); }}
        />
        <SubAdminDialog
          open={!!editingSubAdmin}
          onOpenChange={(o) => { if (!o) setEditingSubAdmin(null); }}
          title="Sửa Sub-admin"
          isEdit
          initial={editingSubAdminData ? { name: editingSubAdminData.name, email: editingSubAdminData.email, phone: editingSubAdminData.phone || "", maxSites: editingSubAdminData.maxSites || 5000 } : null}
          onSubmit={(input) => { if (editingSubAdmin) { updateSubAdmin(editingSubAdmin, input); toast({ title: "Đã cập nhật sub-admin" }); } }}
        />
        <AlertDialog open={!!deletingSubAdmin} onOpenChange={(o) => { if (!o) setDeletingSubAdmin(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">Xóa sub-admin?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sắp xóa sub-admin <strong>{deletingSubAdminData?.name}</strong>. Các shop user do sub-admin này tạo vẫn được giữ nguyên. Hành động không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (deletingSubAdmin) { deleteSubAdmin(deletingSubAdmin); toast({ title: "Đã xóa sub-admin" }); setDeletingSubAdmin(null); } }} className="rounded-xl bg-destructive hover:bg-destructive/90">Xác nhận xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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