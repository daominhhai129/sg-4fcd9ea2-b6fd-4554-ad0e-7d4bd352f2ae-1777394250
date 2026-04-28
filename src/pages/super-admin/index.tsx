import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Store,
  Users,
  Package,
  FolderOpen,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Pencil,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopLimits } from "@/contexts/AuthContext";

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, isLoading, shopConfigs, allUsers, logout, updateShopLimits } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<string | null>(null);
  const [limitsForm, setLimitsForm] = useState<ShopLimits>({ products: 200, categories: 200, posts: 200 });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "super_admin") {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const openEditLimits = (shopId: string) => {
    const config = shopConfigs.find((sc) => sc.shopId === shopId);
    if (config) {
      setLimitsForm({ ...config.limits });
      setEditingShop(shopId);
    }
  };

  const saveLimits = () => {
    if (editingShop) {
      updateShopLimits(editingShop, limitsForm);
      setEditingShop(null);
    }
  };

  const totalProducts = shopConfigs.reduce((sum, sc) => sum + sc.usage.products, 0);
  const totalOrders = 5;

  return (
    <>
      <SEO title="Super Admin" />
      <div className="min-h-screen bg-background">
        <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-foreground">Super Admin</span>
            </div>
            <button className="lg:hidden p-1 text-muted-foreground" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <nav className="p-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-accent text-white">
              <Settings className="w-4.5 h-4.5" />
              Quản trị hệ thống
            </div>
          </nav>
          <div className="absolute bottom-4 left-3 right-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
              <Image src={user.avatar || ""} alt={user.name} width={32} height={32} className="rounded-full" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Đăng xuất
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Cửa hàng", value: shopConfigs.length, icon: Store, color: "text-primary bg-primary/10" },
                { label: "Người dùng", value: allUsers.length, icon: Users, color: "text-accent bg-accent/10" },
                { label: "Tổng sản phẩm", value: totalProducts, icon: Package, color: "text-emerald-600 bg-emerald-50" },
                { label: "Tổng đơn hàng", value: totalOrders, icon: FolderOpen, color: "text-blue-600 bg-blue-50" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-card border border-border/50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-heading font-bold text-foreground mb-4">Người dùng</h2>
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Người dùng</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Email</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Cửa hàng</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Vai trò</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Image src={u.avatar || ""} alt={u.name} width={36} height={36} className="rounded-full" />
                            <span className="text-sm font-semibold text-foreground">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-muted-foreground">{u.email}</span></td>
                        <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-muted-foreground">{u.shopName || "—"}</span></td>
                        <td className="px-4 py-3"><span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">Shop Owner</span></td>
                      </tr>
                    ))}
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
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openEditLimits(sc.shopId)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Sửa limit
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Sản phẩm", usage: sc.usage.products, limit: sc.limits.products, icon: Package },
                        { label: "Danh mục", usage: sc.usage.categories, limit: sc.limits.categories, icon: FolderOpen },
                        { label: "Bài viết", usage: sc.usage.posts, limit: sc.limits.posts, icon: FileText },
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

        <Dialog open={!!editingShop} onOpenChange={(open) => { if (!open) setEditingShop(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-heading">Chỉnh sửa giới hạn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Sản phẩm tối đa</Label>
                <Input type="number" value={limitsForm.products} onChange={(e) => setLimitsForm((p) => ({ ...p, products: Number(e.target.value) }))} className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Danh mục tối đa</Label>
                <Input type="number" value={limitsForm.categories} onChange={(e) => setLimitsForm((p) => ({ ...p, categories: Number(e.target.value) }))} className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Bài viết tối đa</Label>
                <Input type="number" value={limitsForm.posts} onChange={(e) => setLimitsForm((p) => ({ ...p, posts: Number(e.target.value) }))} className="rounded-xl mt-1.5" />
              </div>
              <div className="flex gap-3 pt-2 border-t">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingShop(null)}>Hủy</Button>
                <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={saveLimits}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Lưu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}