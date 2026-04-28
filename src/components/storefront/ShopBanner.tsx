import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import type { Shop } from "@/types";

interface ShopBannerProps {
  shop: Shop;
}

export function ShopBanner({ shop }: ShopBannerProps) {
  return (
    <div className="relative">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image src={shop.banner} alt={shop.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      <div className="container relative -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-card overflow-hidden shadow-xl bg-card">
            <Image src={shop.logo} alt={shop.name} width={112} height={112} className="object-cover w-full h-full" />
          </div>
          <div className="pb-2">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{shop.name}</h1>
            <p className="text-muted-foreground mt-1 max-w-lg">{shop.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{shop.contact.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{shop.contact.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{shop.contact.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}