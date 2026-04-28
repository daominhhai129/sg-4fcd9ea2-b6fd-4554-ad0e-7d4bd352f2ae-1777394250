import { useState } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { slug, category } = router.query;

  const phoneNumber = shop.contact.phone.replace(/\s+/g, "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.contact.address)}`;

  const handleCategoryClick = (categorySlug?: string) => {
    setOpen(false);
    if (categorySlug) {
      router.push(`/shop/${slug}?category=${categorySlug}`, undefined, { shallow: true });
    } else {
      router.push(`/shop/${slug}`, undefined, { shallow: true });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="container grid grid-cols-4 h-16">
        <a
          href={`tel:${phoneNumber}`}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[11px] font-medium">Gọi điện</span>
        </a>
        <a
          href={`sms:${phoneNumber}`}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[11px] font-medium">Nhắn tin</span>
        </a>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[11px] font-medium">Bản đồ</span>
        </a>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[11px] font-medium">Danh mục</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <SheetHeader>
              <SheetTitle className="font-heading text-left">Danh mục sản phẩm</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-4 pb-4">
              <button
                onClick={() => handleCategoryClick()}
                className={`p-4 rounded-xl border-2 text-left transition-all ${!category ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              >
                <p className="font-semibold text-foreground text-sm">Tất cả sản phẩm</p>
                <p className="text-xs text-muted-foreground mt-0.5">{shop.products.length} sản phẩm</p>
              </button>
              {shop.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${category === cat.slug ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.productCount} sản phẩm</p>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}