import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateUserDialog, ExtendDialog, EditUserDialog, DomainDialog, LimitDialog } from "@/components/admin/SuperAdminDialogs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Store, Users, LogOut, Search, Lock, Unlock, RefreshCw, Phone, MoreVertical, UserPlus, CalendarClock, Pencil, AlertCircle, Globe, Sliders, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading, allUsers, shopConfigs, logout, lockUser, unlockUser, extendUserExpiry, resetUserPassword, createUser, updateUser, setUserDomain, setShopLimit, getShopConfig, updateSubAdminSelf } = useAuth();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [extendingUser, setExtendingUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [domainUser, setDomainUser] = useState<string | null>(null);
  const [limitsUser, setLimitsUser] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "sub_admin")) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (profileOpen && user) {
      setProfileForm({ name: user.name, email: user.email, phone: user.phone || "", password: "" });
    }
  }, [profileOpen]);

  if (isLoading || !user || user.role !== "sub_admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const myUsers = allUsers.filter((u) => u.createdBy === user.id);
  const cap = user.maxSites || 5000;
  const filtered = myUsers
    .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.shopName || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));

  const atCap = myUsers.length >= cap;
  const extendingUserData = allUsers.find((u) => u.id === extendingUser);
  const editingUserData = allUsers.find((u) => u.id === editingUser);
  const domainUserData = allUsers.find((u) => u.id === domainUser);
  const limitsUserData = allUsers.find((u) => u.id === limitsUser);
  const limitsConfig = limitsUserData?.shopId ? getShopConfig(limitsUserData.shopId) : undefined;

  const handleCreateClick = () => {
    if (atCap) {
      toast({ title: "Đã đạt giới hạn", description: `Bạn đã tạo đủ ${cap.toLocaleString("vi-VN")} sites. Liên hệ super admin để mở rộng.`, variant: "destructive" });
      return;
    }
    setCreateOpen(true);
  };

  const handleResetPassword = (userId: string, name: string) => {
    resetUserPassword(userId);
    toast({ title: "Đã reset mật khẩu", description: `Mật khẩu của ${name} đã được đặt về mặc định.` });
  };

  return (
    <>
      <SEO title="Sub Admin Dashboard" />
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-lg border-b border-border/50 flex items-center px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <span className="font-heading font-bold text-foreground">Sub-admin Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => setProfileOpen(true)} className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/70 transition-colors">
              <Image src={user.avatar || ""} alt={user.name} width={28} height={28} className="rounded-full" />
              <span className="text-sm font-semibold text-foreground">{user.name}</span>
              <UserCog className="w-4 h-4 text-muted-foreground" />
            </button>
            <Button variant="outline" size="sm" className="rounded-xl sm:hidden" onClick={() => setProfileOpen(true)}>
              <UserCog className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1.5" /> Đăng xuất
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Sites đang quản lý</span>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Store className="w-5 h-5" /></div>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{myUsers.length}<span className="text-sm font-medium text-muted-foreground"> / {cap.toLocaleString("vi-VN")}</span></p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: Math.min(100, (myUsers.length / cap) * 100) + "%" }} />
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Đang hoạt động</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{myUsers.filter((u) => u.status === "active").length}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Còn lại có thể tạo</span>
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><UserPlus className="w-5 h-5" /></div>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{Math.max(0, cap - myUsers.length).toLocaleString("vi-VN")}</p>
            </div>
          </div>

          {atCap && (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Đã đạt giới hạn {cap.toLocaleString("vi-VN")} sites</p>
                <p className="text-sm text-muted-foreground mt-0.5">Bạn không thể tạo thêm shop. Liên hệ super admin để được mở rộng giới hạn.</p>
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-heading font-bold text-foreground">Shop owner của tôi</h2>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Tìm theo tên, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
                </div>
                <Button className="gradient-primary text-white border-0 rounded-xl" onClick={handleCreateClick} disabled={atCap}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> Tạo shop owner
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Shop owner</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">SĐT</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Cửa hàng</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">Tên miền</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">Giới hạn SP</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Hết hạn</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const expiry = new Date(u.expiresAt);
                    const expired = expiry < new Date();
                    const cfg = u.shopId ? getShopConfig(u.shopId) : undefined;
                    const productLimit = cfg?.limits.products || 0;
                    const productUsage = cfg?.usage.products || 0;
                    const usagePct = productLimit ? Math.min(100, (productUsage / productLimit) * 100) : 0;
                    const defaultUrl = u.shopSlug ? "/shop/" + u.shopSlug : "—";
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setEditingUser(u.id)}>
                                <Pencil className="w-4 h-4 mr-2" /> Sửa thông tin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDomainUser(u.id)}>
                                <Globe className="w-4 h-4 mr-2" /> Tên miền & URL
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLimitsUser(u.id)}>
                                <Sliders className="w-4 h-4 mr-2" /> Giới hạn sản phẩm/bài viết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setExtendingUser(u.id)}>
                                <CalendarClock className="w-4 h-4 mr-2" /> Gia hạn
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(u.id, u.name)}>
                                <RefreshCw className="w-4 h-4 mr-2" /> Reset mật khẩu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {u.status === "active" ? (
                                <DropdownMenuItem onClick={() => lockUser(u.id)} className="text-destructive focus:text-destructive">
                                  <Lock className="w-4 h-4 mr-2" /> Khóa
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => unlockUser(u.id)}>
                                  <Unlock className="w-4 h-4 mr-2" /> Mở khóa
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Chưa có shop owner nào. Bấm &quot;Tạo shop owner&quot; để bắt đầu.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createUser} />
        <ExtendDialog
          open={!!extendingUser}
          onOpenChange={(o) => { if (!o) setExtendingUser(null); }}
          userName={extendingUserData?.name || ""}
          currentExpiry={extendingUserData?.expiresAt}
          onConfirm={(days) => { if (extendingUser) extendUserExpiry(extendingUser, days); }}
        />
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(o) => { if (!o) setEditingUser(null); }}
          user={editingUserData || null}
          onSave={(input) => { if (editingUser) { updateUser(editingUser, input); toast({ title: "Đã cập nhật" }); } }}
        />
        <DomainDialog
          open={!!domainUser}
          onOpenChange={(o) => { if (!o) setDomainUser(null); }}
          userName={domainUserData?.name || ""}
          currentDomain={domainUserData?.customDomain}
          onSave={(domain) => { if (domainUser) { setUserDomain(domainUser, domain); toast({ title: "Đã cập nhật tên miền" }); } }}
        />
        <LimitDialog
          open={!!limitsUser}
          onOpenChange={(o) => { if (!o) setLimitsUser(null); }}
          shopName={limitsUserData?.shopName || ""}
          initialValue={limitsConfig?.limits.products || 200}
          onSave={(value) => { if (limitsUserData?.shopId) { setShopLimit(limitsUserData.shopId, value); toast({ title: "Đã cập nhật giới hạn" }); } }}
        />

        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-heading">Tài khoản của tôi</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-sm font-semibold">Họ và tên</Label><Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="rounded-xl mt-1.5" /></div>
              <div><Label className="text-sm font-semibold">Email đăng nhập</Label><Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="rounded-xl mt-1.5" /></div>
              <div><Label className="text-sm font-semibold">Số điện thoại</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="rounded-xl mt-1.5" /></div>
              <div>
                <Label className="text-sm font-semibold">Mật khẩu mới</Label>
                <Input type="text" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} className="rounded-xl mt-1.5 font-mono" placeholder="Để trống = giữ nguyên" />
                <p className="text-xs text-muted-foreground mt-1.5">Chỉ điền nếu muốn đổi mật khẩu.</p>
              </div>
              <div className="flex gap-3 pt-2 border-t">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setProfileOpen(false)}>Hủy</Button>
                <Button
                  className="flex-1 gradient-primary text-white border-0 rounded-xl"
                  onClick={() => {
                    if (!profileForm.name || !profileForm.email) return;
                    updateSubAdminSelf({ name: profileForm.name, email: profileForm.email, phone: profileForm.phone, password: profileForm.password.trim() || undefined });
                    toast({ title: "Đã cập nhật tài khoản" });
                    setProfileOpen(false);
                  }}
                >Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}