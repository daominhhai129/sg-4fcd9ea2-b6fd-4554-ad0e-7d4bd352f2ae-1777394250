import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LimitDialog, ExtendDialog, CreateUserDialog, AdminPasswordDialog } from "@/components/admin/SuperAdminDialogs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Shield, Store, Users, Package, FolderOpen, LogOut, Menu, X, Pencil, Search, Lock, Unlock, RefreshCw, Phone, MoreVertical, UserPlus, KeyRound, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuperAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading, shopConfigs, allUsers, logout, setShopLimit, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateAdminPassword } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingShop, setEditingShop] = useState<string | null>(null);
  const [extendingUser, setExtendingUser] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) router.replace("/login");
  }, [user, isLoading, router]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || "").includes(q));
  }, [allUsers, search]);

  if (isLoading || !user || user.role !== "super_admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const editingShopConfig = shopConfigs.find((sc) => sc.shopId === editingShop);
  const extendingUserData = allUsers.find((u) => u.id === extendingUser);
  const totalProducts = shopConfigs.reduce((sum, sc) => sum + sc.usage.products, 0);

  const handleResetPassword = (userId: string, name: string) => {
    resetUserPassword(userId);
    toast({ title: "Đã reset mật khẩu", description: `Mật khẩu của ${name} đã được đặt về mặc định.` });
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
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
              <Image src={user.avatar || ""} alt={user.name} width={32} height={32} className="rounded-full" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
            <button onClick={() => setPwdOpen(true)} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
              <KeyRound className="w-4 h-4" /> Đổi mật khẩu
            </button>
            <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-lg border-b border-border/50 flex items-center px-4 lg:px-8">
            <button className="lg:hidden p-2 -ml-2 text-foreground" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="ml-2 lg:ml-0 text-lg font-heading font-bold text-foreground">Quản trị hệ thống</h1>
          </header>

          <main className="p-4 lg:p-8 space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Cửa hàng", value: shopConfigs.length, icon: Store, color: "text-primary bg-primary/10" },
                { label: "Người dùng", value: allUsers.length, icon: Users, color: "text-accent bg-accent/10" },
                { label: "Tổng sản phẩm", value: totalProducts, icon: Package, color: "text-emerald-600 bg-emerald-50" },
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
                <h2 className="text-lg font-heading font-bold text-foreground">Người dùng</h2>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Tìm theo tên, email, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
                  </div>
                  <Button className="gradient-primary text-white border-0 rounded-xl" onClick={() => setCreateOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-1.5" /> Tạo mới
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Người dùng</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">SĐT</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Cửa hàng</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Hết hạn</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const expiry = new Date(u.expiresAt);
                      const expired = expiry < new Date();
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
                            {u.phone ? (
                              <a href={"tel:" + u.phone} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {u.phone}
                              </a>
                            ) : <span className="text-sm text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{u.shopName || "—"}</span></td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={cn("text-sm", expired ? "text-destructive font-semibold" : "text-muted-foreground")}>
                              {expiry.toLocaleDateString("vi-VN")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              {u.status === "active" ? "Hoạt động" : "Đã khóa"}
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
                                      <a href={"tel:" + u.phone}><Phone className="w-4 h-4 mr-2" /> Gọi điện</a>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => setExtendingUser(u.id)}>
                                    <CalendarClock className="w-4 h-4 mr-2" /> Gia hạn
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResetPassword(u.id, u.name)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Reset mật khẩu
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {u.status === "active" ? (
                                    <DropdownMenuItem onClick={() => lockUser(u.id)} className="text-destructive focus:text-destructive">
                                      <Lock className="w-4 h-4 mr-2" /> Khóa người dùng
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => unlockUser(u.id)}>
                                      <Unlock className="w-4 h-4 mr-2" /> Mở khóa
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
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Không tìm thấy người dùng nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-heading font-bold text-foreground mb-4">Cửa hàng & Giới hạn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopConfigs.map((sc) => (
                  <div key={sc.shopId} className="rounded-2xl bg-card border border-border/50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-foreground">{sc.shopName}</h3>
                        <p className="text-xs text-muted-foreground">{sc.ownerName}</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditingShop(sc.shopId)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Sửa limit
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Sản phẩm", usage: sc.usage.products, limit: sc.limits.products, icon: Package },
                        { label: "Danh mục", usage: sc.usage.categories, limit: sc.limits.categories, icon: FolderOpen },
                        { label: "Bài viết", usage: sc.usage.posts, limit: sc.limits.posts, icon: Package },
                      ].map((item) => {
                        const pct = Math.min((item.usage / item.limit) * 100, 100);
                        return (
                          <div key={item.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><item.icon className="w-3.5 h-3.5" />{item.label}</span>
                              <span className="font-semibold text-foreground">{item.usage}<span className="text-muted-foreground font-normal">/{item.limit}</span></span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-destructive" : pct > 50 ? "bg-accent" : "bg-primary")} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
          onConfirm={(days) => { if (extendingUser) extendUserExpiry(extendingUser, days); }}
        />
        <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createUser} />
        <AdminPasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} onSave={(pwd) => { updateAdminPassword(pwd); toast({ title: "Đã đổi mật khẩu", description: "Mật khẩu mới đã được lưu." }); }} />
      </div>
    </>
  );
}