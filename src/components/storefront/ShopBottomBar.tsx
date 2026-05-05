import { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, LayoutGrid, ShoppingCart, Zap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Shop, Product } from "@/types";

interface ShopBottomBarProps {
  shop: Shop;
  product?: Product;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ShopBottomBar({ shop, product, onAddToCart, onBuyNow }: ShopBottomBarProps) {
  const [open, setOpen] = useState(false);

  const phoneNumber = shop.contact.phone.replace(/\s+/g, "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.contact.address)}`;
  const themeBg = shop.themeColor ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined;

  if (product) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none">
        <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
          <div className="grid grid-cols-4 h-16">
            <a
              href={`tel:${phoneNumber}`}
              className="flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted/60 transition-all"
            >
              <Phone className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">Gọi</span>
            </a>
            <a
              href={`sms:${phoneNumber}`}
              className="flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted/60 transition-all"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">Nhắn tin</span>
            </a>
            <button
              onClick={onAddToCart}
              className="flex flex-col items-center justify-center gap-0.5 px-1 text-primary hover:bg-primary/5 transition-all border-l border-border"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight truncate max-w-full">Vào giỏ</span>
            </button>
            <button
              onClick={onBuyNow}
              className="flex flex-col items-center justify-center gap-0.5 px-1 text-white bg-red-600 hover:bg-red-700 transition-all"
            >
              <Zap className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight truncate max-w-full">Mua ngay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:bottom-auto md:left-auto md:right-4 md:top-1/2 md:-translate-y-1/2 md:w-auto pointer-events-none">
      <div className="bg-card/95 backdrop-blur-lg border-t md:border border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:rounded-2xl pointer-events-auto">
        <div className="grid grid-cols-4 md:grid-cols-1 md:flex md:flex-col md:gap-1 md:p-2 h-16 md:h-auto">
          <a
            href={`tel:${phoneNumber}`}
            className="flex flex-col items-center justify-center gap-1 md:gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Gọi điện</span>
          </a>
          <a
            href={`sms:${phoneNumber}`}
            className="flex flex-col items-center justify-center gap-1 md:gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Nhắn tin</span>
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 md:gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Bản đồ</span>
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 md:gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[11px] md:text-[10px] font-medium">Danh mục</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
              <SheetHeader>
                <SheetTitle className="font-heading text-left">Danh mục sản phẩm</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pb-4">
                {shop.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/${shop.slug}/category/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
                  >
                    <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.productCount} sản phẩm</p>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}