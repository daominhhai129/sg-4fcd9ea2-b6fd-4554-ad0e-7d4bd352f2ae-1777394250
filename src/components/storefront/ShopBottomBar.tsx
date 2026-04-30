import { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, LayoutGrid } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Shop } from "@/types";

interface ShopBottomBarProps {
  shop: Shop;
}

export function ShopBottomBar({ shop }: ShopBottomBarProps) {
  const [open, setOpen] = useState(false);

  const phoneNumber = shop.contact.phone.replace(/\s+/g, "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.contact.address)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto pointer-events-none">
      <div className="bg-card/95 backdrop-blur-lg border-t md:border border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:rounded-full pointer-events-auto">
        <div className="container md:container-none md:max-w-none md:w-auto md:px-2 grid grid-cols-4 md:flex md:gap-1 h-16 md:h-14">
          <a
            href={`tel:${phoneNumber}`}
            className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 md:px-5 md:rounded-full text-foreground transition-all hover:bg-muted/60"
          >
            <Phone className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[11px] md:text-sm font-medium">Gọi điện</span>
          </a>
          <a
            href={`sms:${phoneNumber}`}
            className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 md:px-5 md:rounded-full text-foreground transition-all hover:bg-muted/60"
          >
            <MessageCircle className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[11px] md:text-sm font-medium">Nhắn tin</span>
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 md:px-5 md:rounded-full text-foreground transition-all hover:bg-muted/60"
          >
            <MapPin className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[11px] md:text-sm font-medium">Bản đồ</span>
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 md:px-5 md:rounded-full text-foreground transition-all hover:bg-muted/60">
                <LayoutGrid className="w-5 h-5 md:w-4 md:h-4" />
                <span className="text-[11px] md:text-sm font-medium">Danh mục</span>
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