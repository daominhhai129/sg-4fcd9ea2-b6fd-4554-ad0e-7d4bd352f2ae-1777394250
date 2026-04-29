import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { shops, formatPrice } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

  const shop = shops.find((s) => s.slug === slug);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-heading font-bold">Không tìm thấy cửa hàng</h1>
      </div>
    );
  }

  return (
    <>
      <SEO title={"Giỏ hàng — " + shop.name} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="container py-8 min-h-[60vh]">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Tiếp tục mua sắm
        </button>

        <h1 className="text-2xl font-heading font-extrabold text-foreground mb-8">Giỏ hàng ({totalItems})</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục.</p>
            <Button asChild className="gradient-primary text-white border-0">
              <Link href={"/shop/" + shop.slug}>Khám phá sản phẩm</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} width={96} height={96} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={"/shop/" + shop.slug + "/product/" + item.product.id} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 text-sm">
                        {item.product.name}
                      </Link>
                      <div className="text-accent font-bold mt-1">{formatPrice(price)}</div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg">
                          <button className="p-1.5 hover:bg-muted transition-colors rounded-l-lg" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button className="p-1.5 hover:bg-muted transition-colors rounded-r-lg" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-card border border-border/50 p-6 sticky top-24">
                <h3 className="font-heading font-bold text-foreground mb-4">Tóm tắt đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                    <span>Tổng cộng</span>
                    <span className="text-accent">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <Button asChild className="w-full mt-6 gradient-primary text-white border-0 h-12 text-base">
                  <Link href={"/shop/" + shop.slug + "/checkout"}>Đặt hàng</Link>
                </Button>
                <button onClick={clearCart} className="w-full mt-3 text-sm text-muted-foreground hover:text-destructive transition-colors text-center">
                  Xóa giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}