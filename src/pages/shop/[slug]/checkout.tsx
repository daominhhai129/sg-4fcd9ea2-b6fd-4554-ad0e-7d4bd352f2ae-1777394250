import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { shops, formatPrice } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const shop = shops.find((s) => s.slug === slug);

  const [form, setForm] = useState({ name: "", phone: "", address: "", email: "", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-heading font-bold">Không tìm thấy cửa hàng</h1>
      </div>
    );
  }

  const themeStyle = shop.themeColor ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined;

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
              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span className="font-semibold">Tổng cộng:</span><span className="font-bold text-accent">{formatPrice(totalPrice)}</span></div>
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
              </div>
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
                <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{formatPrice(totalPrice)}</span>
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