import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import type { Shop } from "@/types";

interface ShopBannerProps {
  shop: Shop;
}

export function ShopBanner({ shop }: ShopBannerProps) {
  return (
    <div className="relative">
      <div className="relative h-48 md:h-56 overflow-hidden">
        <Image src={shop.banner} alt={shop.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="container">
        <div className="relative -mt-12 md:-mt-14 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 bg-card rounded-2xl border border-border/50 shadow-lg p-4 md:p-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-card overflow-hidden shadow-md bg-card shrink-0 -mt-10 md:mt-0">
            <Image src={shop.logo} alt={shop.name} width={96} height={96} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{shop.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">{shop.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" />{shop.contact.address}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary" />{shop.contact.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" />{shop.contact.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}