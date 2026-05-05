import { Phone, MessageCircle, MapPin, Menu, Search, ShoppingCart, Zap } from "lucide-react";
import type { Shop, Product } from "@/types";

interface ShopBottomBarProps {
  shop: Shop;
  product?: Product;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ShopBottomBar({ shop, product, onAddToCart, onBuyNow }: ShopBottomBarProps) {
  const phoneNumber = shop.contact.phone.replace(/\s+/g, "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.contact.address)}`;

  const openMenu = () => window.dispatchEvent(new CustomEvent("shop:open-menu"));
  const openSearch = () => window.dispatchEvent(new CustomEvent("shop:open-search"));

  if (product) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none">
        <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
          <div className="grid grid-cols-4 h-16">
            <a href={`tel:${phoneNumber}`} className="flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted transition-all">
              <Phone className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">Gọi</span>
            </a>
            <a href={`sms:${phoneNumber}`} className="flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted transition-all">
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">Nhắn tin</span>
            </a>
            <button
              onClick={onAddToCart}
              className="flex flex-col items-center justify-center gap-0.5 px-1 text-white bg-orange-500 hover:bg-orange-600 transition-all"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight truncate max-w-full">Thêm vào giỏ</span>
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
        <div className="grid grid-cols-5 md:grid-cols-1 md:flex md:flex-col md:gap-1 md:p-2 h-16 md:h-auto">
          <a href={`tel:${phoneNumber}`} className="flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
            <Phone className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Gọi điện</span>
          </a>
          <a href={`sms:${phoneNumber}`} className="flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Nhắn tin</span>
          </a>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
            <MapPin className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Bản đồ</span>
          </a>
          <button onClick={openSearch} className="flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
            <Search className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Tìm kiếm</span>
          </button>
          <button onClick={openMenu} className="flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
            <Menu className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}