import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Package, MapPin, User as UserIcon, Lock, LogOut, ShoppingBag, Calendar,
  CheckCircle2, Clock, XCircle, ArrowLeft, Save, Eye, EyeOff, Check, AlertCircle,
  Plus, Trash2, Star, Pencil,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth, MAX_ADDRESSES } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
};

const statusConfig = {
  pending: { label: "Đang xử lý", icon: Clock, className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed: { label: "Hoàn thành", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Đã hủy", icon: XCircle, className: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function MemberDashboard() {
  const router = useRouter();
  const { user, logout, updateMemberInfo, updateMemberPassword, addMemberAddress, updateMemberAddress, deleteMemberAddress, setDefaultMemberAddress } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [newAddress, setNewAddress] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newRecipientPhone, setNewRecipientPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);

  const [continueHref, setContinueHref] = useState("/");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "member") {
      router.push("/admin");
      return;
    }
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const slug = localStorage.getItem("lastShopSlug");
        if (slug) setContinueHref("/shop/" + slug);
      } catch {}
    }
  }, []);

  if (!user || user.role !== "member") return null;

  const orders = (user.orders || []).slice(0, 10);
  const addresses = user.addresses || [];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberInfo({ name, email, phone });
    setProfileSaved(true);
    toast({ variant: "success", title: "Đã cập nhật thông tin" });
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAddAddress = () => {
    if (!newRecipient.trim() || !newRecipientPhone.trim() || !newAddress.trim()) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng nhập đủ họ tên, SĐT và địa chỉ." });
      return;
    }
    if (editingId) {
      updateMemberAddress(editingId, { recipientName: newRecipient.trim(), recipientPhone: newRecipientPhone.trim(), address: newAddress.trim() });
      setEditingId(null);
      setNewRecipient(""); setNewRecipientPhone(""); setNewAddress("");
      setShowAddForm(false);
      toast({ variant: "success", title: "Đã cập nhật địa chỉ" });
      return;
    }
    if (addresses.length >= MAX_ADDRESSES) {
      toast({ variant: "destructive", title: "Đã đạt giới hạn", description: "Tối đa " + MAX_ADDRESSES + " địa chỉ." });
      return;
    }
    const ok = addMemberAddress({ recipientName: newRecipient.trim(), recipientPhone: newRecipientPhone.trim(), address: newAddress.trim() });
    if (ok) {
      setNewRecipient(""); setNewRecipientPhone(""); setNewAddress("");
      setShowAddForm(false);
      toast({ variant: "success", title: "Đã thêm địa chỉ" });
    }
  };

  const handleStartEdit = (id: string) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setNewRecipient(a.recipientName || "");
    setNewRecipientPhone(a.recipientPhone || "");
    setNewAddress(a.address || "");
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setNewRecipient(""); setNewRecipientPhone(""); setNewAddress("");
  };

  const handlePwdSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (currentPwd !== user.password) {
      setPwdError("Mật khẩu hiện tại không đúng");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Mật khẩu xác nhận không khớp");
      return;
    }
    updateMemberPassword(newPwd);
    setPwdSaved(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast({ variant: "success", title: "Đã đổi mật khẩu" });
    setTimeout(() => setPwdSaved(false), 2500);
  };

  return (
    <>
      <SEO title="Bảng điều khiển thành viên" />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href={continueHref} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span>Tiếp tục mua sắm</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="rounded-xl">
                <LogOut className="w-4 h-4 mr-1.5" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">Xin chào, {user.name.split(" ").pop()}</h1>
            <p className="text-muted-foreground mt-1">Quản lý tài khoản và đơn hàng của bạn</p>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="bg-card border border-border/50 rounded-2xl p-1 h-auto">
              <TabsTrigger value="orders" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingBag className="w-4 h-4 mr-1.5" /> Đơn hàng
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <UserIcon className="w-4 h-4 mr-1.5" /> Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="w-4 h-4 mr-1.5" /> Bảo mật
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Lịch sử đơn hàng</h2>
                <p className="text-xs text-muted-foreground mb-5">Hiển thị 10 đơn hàng gần nhất ({orders.length}/{(user.orders || []).length})</p>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p>Chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => {
                      const cfg = statusConfig[o.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={o.id} className="border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-semibold text-foreground">#{o.id}</span>
                                <Badge variant="outline" className={"rounded-full text-xs " + cfg.className}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {cfg.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(o.date)}</span>
                                <Link href={"/shop/" + o.shopSlug} className="hover:text-primary hover:underline">{o.shopName}</Link>
                              </div>
                            </div>
                            <p className="font-heading font-bold text-primary whitespace-nowrap">{formatPrice(o.total)}</p>
                          </div>
                          <div className="space-y-0.5">
                            {o.items.map((it, idx) => (
                              <p key={idx} className="text-sm text-foreground/80">
                                <Link href={"/shop/" + o.shopSlug + "/product/" + it.productId} className="hover:text-primary hover:underline transition-colors">
                                  {it.name}
                                </Link>
                                <span className="text-muted-foreground"> × {it.quantity}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-6 space-y-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">Thông tin cá nhân</h2>
                <p className="text-xs text-muted-foreground mb-5">Cập nhật thông tin liên hệ của bạn</p>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Họ và tên</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl mt-1.5" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Email</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl mt-1.5" required />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Số điện thoại</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl mt-1.5" />
                    </div>
                  </div>

                  {profileSaved && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                      <Check className="w-4 h-4" /> Đã lưu
                    </div>
                  )}

                  <Button type="submit" className="rounded-xl">
                    <Save className="w-4 h-4 mr-1.5" /> Lưu thay đổi
                  </Button>
                </form>

                {(() => {
                  const def = addresses.find((a) => a.isDefault) || addresses[0];
                  return (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold text-foreground">Địa chỉ nhận hàng mặc định</p>
                      </div>
                      {def ? (
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                          {(def.recipientName || def.recipientPhone) && (
                            <p className="text-sm font-semibold text-foreground">
                              {def.recipientName}
                              {def.recipientName && def.recipientPhone && <span className="text-muted-foreground font-normal"> · </span>}
                              {def.recipientPhone && <span className="text-muted-foreground font-normal">{def.recipientPhone}</span>}
                            </p>
                          )}
                          <p className="text-sm text-foreground/80 mt-0.5">{def.address}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Chưa có địa chỉ. Thêm bên dưới.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Địa chỉ nhận hàng
                  </h2>
                  <Badge variant="outline" className="rounded-full">{addresses.length}/{MAX_ADDRESSES}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-5">Chọn địa chỉ mặc định để dùng cho đơn hàng. Tối đa {MAX_ADDRESSES} địa chỉ.</p>

                <div className="space-y-2">
                  {addresses.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Chưa có địa chỉ nào.</p>
                  )}
                  {addresses.map((addr) => (
                    <div key={addr.id} className={"flex items-start gap-3 p-3 rounded-xl border transition-colors " + (addr.isDefault ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-primary/30")}>
                      <button
                        type="button"
                        onClick={() => setDefaultMemberAddress(addr.id)}
                        className={"mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors " + (addr.isDefault ? "border-primary bg-primary" : "border-muted-foreground/40 hover:border-primary")}
                        title={addr.isDefault ? "Mặc định" : "Đặt làm mặc định"}
                      >
                        {addr.isDefault && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {(addr.recipientName || addr.recipientPhone) && (
                          <p className="text-sm font-semibold text-foreground">
                            {addr.recipientName}
                            {addr.recipientName && addr.recipientPhone && <span className="text-muted-foreground font-normal"> · </span>}
                            {addr.recipientPhone && <span className="text-muted-foreground font-normal">{addr.recipientPhone}</span>}
                          </p>
                        )}
                        <p className="text-sm text-foreground/80 mt-0.5">{addr.address}</p>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-1">
                            <Star className="w-3 h-3 fill-current" /> Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(addr.id)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMemberAddress(addr.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddForm ? (
                  <div className="mt-4 p-4 rounded-xl border border-dashed border-primary/40 space-y-3">
                    <p className="text-sm font-semibold text-foreground">{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold">Họ và tên người nhận</Label>
                        <Input value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} placeholder="Nguyễn Văn A" className="rounded-xl mt-1" autoFocus />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold">Số điện thoại</Label>
                        <Input value={newRecipientPhone} onChange={(e) => setNewRecipientPhone(e.target.value)} placeholder="0912 345 678" className="rounded-xl mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Địa chỉ</Label>
                      <Textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                        className="rounded-xl min-h-[70px] mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddAddress} size="sm" className="rounded-xl">
                        <Save className="w-4 h-4 mr-1.5" /> {editingId ? "Lưu thay đổi" : "Lưu địa chỉ"}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleCancelForm} className="rounded-xl">
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(true)}
                    disabled={addresses.length >= MAX_ADDRESSES}
                    className="rounded-xl mt-4 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Thêm địa chỉ
                    {addresses.length >= MAX_ADDRESSES && <span className="ml-2 text-xs text-muted-foreground">(đã đạt giới hạn)</span>}
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-xl">
                <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Đổi mật khẩu
                </h2>
                <p className="text-xs text-muted-foreground mb-5">Mật khẩu phải có ít nhất 6 ký tự</p>

                <form onSubmit={handlePwdSave} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Mật khẩu hiện tại</Label>
                    <div className="relative mt-1.5">
                      <Input type={showPwd ? "text" : "password"} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="rounded-xl pr-10" />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Mật khẩu mới</Label>
                    <Input type={showPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Xác nhận mật khẩu mới</Label>
                    <Input type={showPwd ? "text" : "password"} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="rounded-xl mt-1.5" />
                  </div>

                  {pwdError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                      <AlertCircle className="w-4 h-4" /> {pwdError}
                    </div>
                  )}
                  {pwdSaved && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                      <Check className="w-4 h-4" /> Đã đổi mật khẩu
                    </div>
                  )}

                  <Button type="submit" className="rounded-xl">
                    <Save className="w-4 h-4 mr-1.5" /> Đổi mật khẩu
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}