import { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, Download, QrCode, X } from "lucide-react";
import type { Shop } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ShopBannerProps {
  shop: Shop;
}

export function ShopBanner({ shop }: ShopBannerProps) {
  const [qrOpen, setQrOpen] = useState(false);

  const shopUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/shop/${shop.slug}` 
    : `/shop/${shop.slug}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shopUrl)}`;

  const handleSaveContact = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${shop.name}`,
      `ORG:${shop.name}`,
      `TEL;TYPE=WORK,VOICE:${shop.contact.phone}`,
      `EMAIL;TYPE=WORK:${shop.contact.email}`,
      `ADR;TYPE=WORK:;;${shop.contact.address};;;;`,
      `NOTE:${shop.description}`,
      "END:VCARD",
    ].join("\r\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${shop.slug}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <p className="text-muted-foreground mt-1 text-sm">{shop.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" />{shop.contact.address}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary" />{shop.contact.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" />{shop.contact.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                onClick={handleSaveContact}
                size="sm"
                className="text-white border-0 rounded-xl hover:opacity-90 transition-opacity"
                style={{ backgroundColor: `hsl(${shop.themeColor})` }}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Lưu danh bạ
              </Button>
              <Button
                onClick={() => setQrOpen(true)}
                size="sm"
                variant="outline"
                className="rounded-xl"
              >
                <QrCode className="w-4 h-4 mr-1.5" />
                QR Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-center">Mã QR cửa hàng</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="rounded-lg"
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[240px]">
              Quét mã QR để truy cập cửa hàng <span className="font-semibold text-foreground">{shop.name}</span>
            </p>
            <p className="text-xs text-muted-foreground/70 break-all text-center px-4">{shopUrl}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}