import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { shops, formatPrice, discountCodes } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEO } from "@/components/SEO";
import { ArrowLeft, CheckCircle2, ShoppingBag, UserCheck, Tag, X, Sparkles, LogIn, UserPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DiscountCode } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const shop = shops.find((s) => s.slug === slug);

  const isMember = user?.role === "member";
  const [form, setForm] = useState({
    name: isMember ? user!.name : "",
    phone: isMember ? user!.phone || "" : "",
    address: isMember ? user!.address || "" : "",
    email: isMember ? user!.email : "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveInfo, setSaveInfo] = useState(true);

  useEffect(() => {
    if (isMember || typeof window === "undefined") return;
    const saved = localStorage.getItem("guest-checkout-info");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setForm((prev) => ({
          name: data.name || prev.name,
          phone: data.phone || prev.phone,
          address: data.address || prev.address,
          email: data.email || prev.email,
          note: prev.note,
        }));
      } catch {}
    }
  }, [isMember]);

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState("");

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-heading font-bold">Không tìm thấy cửa hàng</h1>
      </div>
    );
  }

  const themeStyle = shop.themeColor ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined;

  const calculateDiscount = (code: DiscountCode): number => {
    if (code.productId) {
      const item = items.find((i) => i.product.id === code.productId);
      if (!item) return 0;
      const itemPrice = (item.product.salePrice || item.product.price) * item.quantity;
      return code.type === "percentage" ? Math.round(itemPrice * code.value / 100) : Math.min(code.value, itemPrice);
    }
    return code.type === "percentage" ? Math.round(totalPrice * code.value / 100) : Math.min(code.value, totalPrice);
  };

  const discountAmount = appliedDiscount ? calculateDiscount(appliedDiscount) : 0;
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const applyDiscount = (codeOverride?: string) => {
    setDiscountError("");
    const code = (codeOverride ?? discountInput).trim().toUpperCase();
    if (!code) { setDiscountError(t("checkout.errEmpty")); return; }
    const found = discountCodes.find((d) => d.code.toUpperCase() === code && d.shopId === shop.id);
    if (!found) { setDiscountError(t("checkout.errNotFound")); return; }
    if (found.status !== "active") { setDiscountError(t("checkout.errPaused")); return; }
    if (found.expiresAt && new Date(found.expiresAt) < new Date()) { setDiscountError(t("checkout.errExpired")); return; }
    if (found.maxUses && found.usedCount >= found.maxUses) { setDiscountError(t("checkout.errExhausted")); return; }
    if (found.minOrderValue && totalPrice < found.minOrderValue) {
      setDiscountError(t("checkout.errMinOrder", { amount: formatPrice(found.minOrderValue) }));
      return;
    }
    if (found.productId && !items.some((i) => i.product.id === found.productId)) {
      setDiscountError(t("checkout.errProductOnly", { name: found.productName || "" }));
      return;
    }
    setAppliedDiscount(found);
    setDiscountInput("");
  };

  const availableCodes = shop ? discountCodes.filter((d) => {
    if (d.shopId !== shop.id) return false;
    if (d.status !== "active") return false;
    if (d.expiresAt && new Date(d.expiresAt) < new Date()) return false;
    if (d.maxUses && d.usedCount >= d.maxUses) return false;
    if (d.productId && !items.some((i) => i.product.id === d.productId)) return false;
    return true;
  }) : [];

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9,10}$/.test(form.phone.replace(/\s/g, ""))) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!form.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!isMember && typeof window !== "undefined") {
      if (saveInfo) {
        localStorage.setItem("guest-checkout-info", JSON.stringify({ name: form.name, phone: form.phone, address: form.address, email: form.email }));
      } else {
        localStorage.removeItem("guest-checkout-info");
      }
    }
    const id = "DH" + Date.now().toString().slice(-8);
    setOrderId(id);
    setSubmitted(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (items.length === 0 && !submitted) {
    return (
      <>
        <SEO title={"Thanh toán — " + shop.name} />
        <ShopHeader shop={shop} cartCount={0} />
        <main className="container py-20 min-h-[60vh] text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-xl font-heading font-bold text-foreground mb-2">Giỏ hàng trống</h1>
          <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm trước khi thanh toán.</p>
          <Button asChild className="text-white border-0" style={themeStyle}>
            <Link href={"/shop/" + shop.slug}>Tiếp tục mua sắm</Link>
          </Button>
        </main>
        <ShopBottomBar shop={shop} />
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <SEO title={"Đặt hàng thành công — " + shop.name} />
        <ShopHeader shop={shop} cartCount={0} />
        <main className="container py-12 pb-24 md:pb-12 min-h-[60vh]">
          <div className="max-w-md mx-auto text-center rounded-2xl bg-card border border-border/50 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Đặt hàng thành công!</h1>
            <p className="text-sm text-muted-foreground mb-1">Cảm ơn {form.name} đã mua sắm tại {shop.name}.</p>
            <p className="text-sm text-muted-foreground mb-6">Mã đơn hàng: <span className="font-bold text-foreground">{orderId}</span></p>
            <div className="rounded-xl bg-muted/50 p-4 mb-6 text-left text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Số điện thoại:</span><span className="font-medium">{form.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Địa chỉ:</span><span className="font-medium text-right max-w-[60%] truncate">{form.address}</span></div>
              {appliedDiscount && (
                <div className="flex justify-between"><span className="text-muted-foreground">Mã giảm giá:</span><span className="font-medium font-mono text-primary">{appliedDiscount.code}</span></div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span className="font-semibold">Tổng cộng:</span><span className="font-bold text-accent">{formatPrice(finalTotal)}</span></div>
            </div>
            <Button asChild className="w-full text-white border-0 h-11" style={themeStyle}>
              <Link href={"/shop/" + shop.slug}>Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </main>
        <ShopBottomBar shop={shop} />
      </>
    );
  }

  return (
    <>
      <SEO title={"Thanh toán — " + shop.name} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="container py-8 pb-24 md:pb-8 min-h-[60vh]">
        <Link href={"/shop/" + shop.slug + "/cart"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-8">Thanh toán</h1>

        {isMember && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Đã đăng nhập với {user!.name}</p>
              <p className="text-emerald-700/80 text-xs">Thông tin nhận hàng đã được tự điền — bạn có thể chỉnh sửa nếu cần.</p>
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Mua sắm tiện hơn cùng tài khoản thành viên</p>
                <p className="text-muted-foreground text-xs">Đăng nhập để tự điền thông tin & theo dõi đơn hàng dễ dàng.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button asChild variant="outline" size="sm" className="rounded-xl border-primary/40 text-primary hover:bg-primary hover:text-white">
                <Link href={"/member/login?return=" + encodeURIComponent("/shop/" + shop.slug + "/checkout")}>
                  <LogIn className="w-4 h-4 mr-1" />
                  Đăng nhập
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-xl gradient-primary text-white border-0">
                <Link href={"/register?return=" + encodeURIComponent("/shop/" + shop.slug + "/checkout")}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Đăng ký
                </Link>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-card border border-border/50 p-5 md:p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Họ và tên *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 rounded-xl" placeholder="Nguyễn Văn A" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold">Số điện thoại *</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 rounded-xl" placeholder="0901234567" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 rounded-xl" placeholder="email@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-sm font-semibold">Địa chỉ giao hàng *</Label>
                  <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 rounded-xl min-h-[72px]" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                  {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="note" className="text-sm font-semibold">Ghi chú</Label>
                  <Textarea id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1.5 rounded-xl min-h-[72px]" placeholder="Lưu ý cho người giao hàng (không bắt buộc)" />
                </div>
                {!isMember && (
                  <div className="sm:col-span-2 flex items-start gap-3 rounded-xl bg-primary/5 border-2 border-primary/30 p-4">
                    <input
                      id="saveInfo"
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer accent-primary"
                    />
                    <label htmlFor="saveInfo" className="text-sm cursor-pointer flex-1">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Save className="w-4 h-4 text-primary" />
                        Lưu thông tin cho lần mua tiếp theo
                      </span>
                      <span className="text-xs text-muted-foreground block mt-0.5">Họ tên, SĐT, email và địa chỉ sẽ được tự điền ở lần checkout sau (lưu trên trình duyệt này).</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border/50 p-5 md:p-6">
              <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                {t("checkout.discountTitle")}
              </h2>
              <p className="text-xs text-muted-foreground mb-3">{t("checkout.discountDesc")}</p>
              {appliedDiscount ? (
                <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-foreground text-sm">{appliedDiscount.code}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {appliedDiscount.type === "percentage" ? t("discount.percentOff", { n: appliedDiscount.value }) : t("discount.amountOff", { amount: formatPrice(appliedDiscount.value) })}
                        {" "}
                        {appliedDiscount.productName ? t("checkout.discountForProduct", { name: appliedDiscount.productName }) : t("checkout.discountForAll")}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={removeDiscount} className="p-2 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input value={discountInput} onChange={(e) => { setDiscountInput(e.target.value.toUpperCase()); setDiscountError(""); }} className="rounded-xl font-mono uppercase" placeholder={t("checkout.discountPh")} />
                    <Button type="button" onClick={() => applyDiscount()} variant="outline" className="rounded-xl px-5 border-primary text-primary hover:bg-primary hover:text-white">
                      {t("checkout.applyBtn")}
                    </Button>
                  </div>
                  {discountError && <p className="text-xs text-destructive mt-2">{discountError}</p>}

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("checkout.availableCodes")}</p>
                    {availableCodes.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">{t("checkout.noAvailable")}</p>
                    ) : (
                      <div className="space-y-2">
                        {availableCodes.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => applyDiscount(c.code)}
                            className="w-full text-left rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors p-3 flex items-center gap-3 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                              <Tag className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono font-bold text-foreground text-sm">{c.code}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {c.type === "percentage" ? t("discount.percentOff", { n: c.value }) : t("discount.amountOff", { amount: formatPrice(c.value) })}
                                {" "}
                                {c.productName ? t("checkout.discountForProduct", { name: c.productName }) : t("checkout.discountForAll")}
                                {c.minOrderValue ? ` · ${t("discount.minOrder")} ${formatPrice(c.minOrderValue)}` : ""}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {t("checkout.clickToApply")} →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-card border border-border/50 p-5 md:p-6 sticky top-24">
              <h2 className="font-heading font-bold text-foreground mb-4">Đơn hàng ({totalItems})</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-white text-[10px] font-bold flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-accent font-bold mt-1">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-primary">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />Giảm giá ({appliedDiscount.code})</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full mt-5 text-white border-0 h-12 text-base hover:opacity-90 transition-opacity" style={themeStyle}>
                Xác nhận đặt hàng
              </Button>
            </div>
          </div>
        </form>
      </main>
      <ShopBottomBar shop={shop} />
    </>
  );
}