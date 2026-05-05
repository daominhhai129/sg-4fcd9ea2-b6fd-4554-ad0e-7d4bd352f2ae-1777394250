import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";

export function CartPreview() {
  const router = useRouter();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, previewOpen, closePreview } = useCart();

  const slug = typeof router.query.slug === "string" ? router.query.slug : null;
  const shop = useMemo(() => (slug ? shops.find((s) => s.slug === slug) : null), [slug]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = previewOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [previewOpen]);

  useEffect(() => {
    const onRoute = () => closePreview();
    router.events.on("routeChangeStart", onRoute);
    return () => { router.events.off("routeChangeStart", onRoute); };
  }, [router.events, closePreview]);

  if (!shop) return null;

  const themeBg = shop.themeColor ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined;

  return (
    <>
      <div
        className={`fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${previewOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closePreview}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[130] w-[80%] sm:w-[420px] max-w-full bg-card shadow-2xl transition-transform duration-300 ease-out flex flex-col ${previewOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-foreground">Giỏ hàng ({totalItems})</h2>
          </div>
          <button onClick={closePreview} className="p-1.5 -mr-1.5 text-foreground hover:bg-muted rounded-lg transition-colors" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">Giỏ hàng đang trống</p>
              <p className="text-sm text-muted-foreground">Hãy thêm sản phẩm để bắt đầu mua sắm</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <li key={item.product.id} className="flex gap-3 p-4">
                    <Link href={`/shop/${shop.slug}/product/${item.product.id}`} onClick={closePreview} className="w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                      <Image src={item.product.images[0]} alt={item.product.name} width={80} height={80} className="object-cover w-full h-full" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${shop.slug}/product/${item.product.id}`} onClick={closePreview} className="block">
                        <p className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">{item.product.name}</p>
                      </Link>
                      <p className="text-sm font-bold text-accent mt-1">{formatPrice(price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors rounded-l-lg" aria-label="Giảm">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors rounded-r-lg" aria-label="Tăng">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" aria-label="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 flex-shrink-0 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tạm tính</span>
              <span className="text-lg font-heading font-extrabold text-foreground">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex gap-2">
              <Link href={`/shop/${shop.slug}/cart`} onClick={closePreview} className="flex-1">
                <Button variant="outline" className="w-full h-11 rounded-xl">Xem giỏ hàng</Button>
              </Link>
              <Link href={`/shop/${shop.slug}/checkout`} onClick={closePreview} className="flex-1">
                <Button className="w-full h-11 rounded-xl text-white border-0 hover:opacity-90 font-semibold" style={themeBg}>
                  Thanh toán
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}