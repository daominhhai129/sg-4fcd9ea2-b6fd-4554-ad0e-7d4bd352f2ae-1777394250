import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, MapPin, Lock, LogOut, ArrowLeft, User as UserIcon, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { shops } from "@/data/mock-data";

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700 border-red-200" },
};

export default function MemberDashboard() {
  const router = useRouter();
  const { user, isLoading, logout, updateMemberInfo, updateMemberPassword } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "member")) {
      router.replace("/login");
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user, isLoading, router]);

  if (!user || user.role !== "member") return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberInfo({ name, email, phone, address });
    toast({ variant: "success", title: "Đã cập nhật thông tin" });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPassword !== user.password) {
      toast({ variant: "destructive", title: "Mật khẩu cũ không đúng" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Mật khẩu mới phải tối thiểu 6 ký tự" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Mật khẩu xác nhận không khớp" });
      return;
    }
    updateMemberPassword(newPassword);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ variant: "success", title: "Đã đổi mật khẩu thành công" });
  };

  const orders = user.orders || [];
  const totalSpent = orders.filter((o) => o.status === "confirmed").reduce((s, o) => s + o.total, 0);
  const recentShopName = orders[0]?.shopName;
  const recentShop = shops.find((s) => s.name === recentShopName) || shops[0];
  const continueShopHref = "/shop/" + recentShop.slug;

  return (
    <>
      <SEO title="Khu vực thành viên" description="Quản lý đơn hàng, thông tin và mật khẩu của bạn" />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
        <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-40">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Về trang chủ</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button asChild size="sm" className="rounded-xl">
                <Link href={continueShopHref}><ShoppingBag className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">Tiếp tục mua sắm</span></Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="rounded-xl">
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 max-w-5xl">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Xin chào, {user.name}</h1>
                <p className="text-sm text-muted-foreground">Khu vực dành riêng cho thành viên</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Package className="w-4 h-4" />
                Tổng đơn hàng
              </div>
              <p className="text-2xl font-heading font-bold">{orders.length}</p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <ShoppingBag className="w-4 h-4" />
                Đã xác nhận
              </div>
              <p className="text-2xl font-heading font-bold text-emerald-600">{orders.filter((o) => o.status === "confirmed").length}</p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <span className="text-base">💰</span>
                Tổng chi tiêu
              </div>
              <p className="text-2xl font-heading font-bold text-primary">{formatPrice(totalSpent)}</p>
            </div>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="bg-muted/60 rounded-xl p-1 grid grid-cols-3 sm:flex sm:w-auto">
              <TabsTrigger value="orders" className="rounded-lg gap-1.5 text-xs sm:text-sm"><Package className="w-4 h-4" /><span className="hidden sm:inline">Đơn hàng</span><span className="sm:hidden">Đơn</span></TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg gap-1.5 text-xs sm:text-sm"><MapPin className="w-4 h-4" /><span className="hidden sm:inline">Thông tin</span><span className="sm:hidden">Info</span></TabsTrigger>
              <TabsTrigger value="password" className="rounded-lg gap-1.5 text-xs sm:text-sm"><Lock className="w-4 h-4" /><span className="hidden sm:inline">Đổi mật khẩu</span><span className="sm:hidden">Mật khẩu</span></TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">Chưa có đơn hàng nào</div>
                ) : (
                  <div className="divide-y divide-border">
                    {orders.map((o) => {
                      const st = STATUS_LABEL[o.status];
                      return (
                        <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-heading font-bold text-foreground">#{o.id}</span>
                              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", st.cls)}>{st.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {o.shopName} · {formatDate(o.date)}
                            </p>
                            <div className="space-y-0.5">
                              {o.items.map((it, idx) => (
                                <p key={idx} className="text-sm text-foreground/80">
                                  {it.name} <span className="text-muted-foreground">× {it.quantity}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Tổng tiền</p>
                            <p className="text-lg font-heading font-bold text-primary">{formatPrice(o.total)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <form onSubmit={handleSaveInfo} className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 max-w-2xl">
                <h2 className="font-heading font-bold text-lg text-foreground">Thông tin cá nhân</h2>
                <div>
                  <Label className="text-sm font-semibold">Họ và tên</Label>
                  <div className="relative mt-1.5">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Số điện thoại</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 rounded-xl" required />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Địa chỉ nhận hàng</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="pl-10 rounded-xl min-h-[80px]" required />
                  </div>
                </div>
                <Button type="submit" className="rounded-xl">Lưu thay đổi</Button>
              </form>
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <form onSubmit={handleChangePassword} className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 max-w-md">
                <h2 className="font-heading font-bold text-lg text-foreground">Đổi mật khẩu</h2>
                <div>
                  <Label className="text-sm font-semibold">Mật khẩu hiện tại</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPwd ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="pl-10 pr-10 rounded-xl" required />
                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded-md">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mật khẩu mới</Label>
                  <Input type={showPwd ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl mt-1.5" required minLength={6} />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Xác nhận mật khẩu mới</Label>
                  <Input type={showPwd ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl mt-1.5" required minLength={6} />
                </div>
                <Button type="submit" className="rounded-xl">Đổi mật khẩu</Button>
              </form>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}