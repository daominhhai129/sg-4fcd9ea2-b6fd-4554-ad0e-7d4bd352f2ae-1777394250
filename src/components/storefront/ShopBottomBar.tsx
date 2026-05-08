import { useState, useRef, useEffect } from "react";
import { Phone, MessageCircle, MapPin, Menu, Search, ShoppingCart, Zap, ArrowUp } from "lucide-react";
import type { Shop, Product } from "@/types";

interface ShopBottomBarProps {
  shop: Shop;
  product?: Product;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ShopBottomBar({ shop, product, onAddToCart, onBuyNow }: ShopBottomBarProps) {
  const phoneNumber = shop.contact.phone.replace(/\s+/g, "");
  const messengerLink = shop.contact.messengerLink;
  const zaloLink = `https://zalo.me/${phoneNumber}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.contact.address)}`;

  const [msgOpen, setMsgOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!msgOpen) return;
    const onClick = (e: MouseEvent) => {
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) setMsgOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [msgOpen]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const openMenu = () => window.dispatchEvent(new CustomEvent("shop:open-menu"));
  const openSearch = () => window.dispatchEvent(new CustomEvent("shop:open-search"));

  if (product) {
    return (
      <>
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none">
        <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
          <div className="grid grid-cols-8 h-12">
            <a href={`tel:${phoneNumber}`} className="col-span-1 flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted transition-all">
              <Phone className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight">Gọi</span>
            </a>
            <div ref={msgRef} className="col-span-2 relative">
              <button
                onClick={() => setMsgOpen((v) => !v)}
                className="w-full h-full flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted transition-all"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-medium leading-tight">Nhắn tin</span>
              </button>
              {msgOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-xl shadow-xl py-1.5 min-w-[160px] overflow-hidden">
                  <a
                    href={zaloLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMsgOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">Z</span>
                    <span className="text-sm font-medium">Zalo</span>
                  </a>
                  {messengerLink && (
                    <a
                      href={messengerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMsgOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-medium">Messenger</span>
                    </a>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onAddToCart}
              className="col-span-2 flex flex-col items-center justify-center gap-0.5 px-1 text-white bg-orange-500 hover:bg-orange-600 transition-all"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <span className="text-[11px] font-bold leading-tight">Giỏ hàng</span>
            </button>
            <button
              onClick={onBuyNow}
              className="col-span-2 flex flex-col items-center justify-center gap-0.5 px-1 text-white bg-red-600 hover:bg-red-700 transition-all"
            >
              <Zap className="w-5 h-5 shrink-0" />
              <span className="text-[11px] font-bold leading-tight">Mua ngay</span>
            </button>
            <button
              onClick={openMenu}
              className="col-span-1 flex flex-col items-center justify-center gap-0.5 px-1 text-foreground hover:bg-muted transition-all"
            >
              <Menu className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight">Menu</span>
            </button>
          </div>
        </div>
      </div>
      <div className="hidden md:block fixed right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <div className="bg-card/95 backdrop-blur-lg border border-border shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl pointer-events-auto">
          <div className="flex flex-col gap-1 p-2">
            <a href={"tel:" + phoneNumber} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-foreground transition-all hover:bg-muted/60">
              <Phone className="w-5 h-5" />
              <span className="text-[10px] font-medium">Gọi điện</span>
            </a>
            <a href={zaloLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-foreground transition-all hover:bg-muted/60">
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] font-medium">Zalo</span>
            </a>
            {messengerLink && (
              <a href={messengerLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-foreground transition-all hover:bg-muted/60">
                <MessageCircle className="w-5 h-5" />
                <span className="text-[10px] font-medium">Messenger</span>
              </a>
            )}
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-foreground transition-all hover:bg-muted/60">
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] font-medium">Bản đồ</span>
            </a>
            <button onClick={openSearch} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-foreground transition-all hover:bg-muted/60">
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-medium">Tìm kiếm</span>
            </button>
            <button onClick={openMenu} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-foreground transition-all hover:bg-muted/60">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </div>
        </div>
      </div>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="md:hidden fixed bottom-[68px] right-3 z-40 w-10 h-10 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
      </>
    );
  }

  const messageHref = messengerLink || `sms:${phoneNumber}`;
  const messageProps = messengerLink ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:bottom-auto md:left-auto md:right-4 md:top-1/2 md:-translate-y-1/2 md:w-auto pointer-events-none">
      <div className="bg-card/95 backdrop-blur-lg border-t md:border border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:rounded-2xl pointer-events-auto">
        <div className="grid grid-cols-5 md:grid-cols-1 md:flex md:flex-col md:gap-1 md:p-2 h-16 md:h-auto">
          <a href={`tel:${phoneNumber}`} className="flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60">
            <Phone className="w-5 h-5" />
            <span className="text-[11px] md:text-[10px] font-medium">Gọi điện</span>
          </a>
          <div ref={msgRef} className="relative">
            <button
              type="button"
              onClick={() => setMsgOpen((v) => !v)}
              className="w-full h-full flex flex-col items-center justify-center gap-1 md:p-3 md:rounded-xl text-foreground transition-all hover:bg-muted/60"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[11px] md:text-[10px] font-medium">Nhắn tin</span>
            </button>
            {msgOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:bottom-auto md:left-auto md:right-full md:top-1/2 md:-translate-x-0 md:-translate-y-1/2 md:mb-0 md:mr-2 bg-card border border-border rounded-xl shadow-xl py-1.5 min-w-[170px] overflow-hidden z-50">
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMsgOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">Z</span>
                  <span className="text-sm font-medium">Zalo</span>
                </a>
                {messengerLink && (
                  <a
                    href={messengerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMsgOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm font-medium">Messenger</span>
                  </a>
                )}
              </div>
            )}
          </div>
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
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="md:hidden fixed bottom-[72px] right-3 z-40 w-10 h-10 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-all pointer-events-auto"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}