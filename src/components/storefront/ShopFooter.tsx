import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Building2, FileCheck2, Calendar, User as UserIcon } from "lucide-react";
import type { Shop, ShopBusinessInfo } from "@/types";

interface ShopFooterProps {
  shop: Shop;
}

export function ShopFooter({ shop }: ShopFooterProps) {
  const [info, setInfo] = useState<ShopBusinessInfo | undefined>(shop.businessInfo);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("shop-footer-" + shop.slug);
    if (saved) {
      try { setInfo(JSON.parse(saved)); } catch {}
    }
  }, [shop.slug]);

  const themeBg = shop.themeColor
    ? { backgroundColor: `hsl(${shop.themeColor} / 0.10)` }
    : undefined;

  return (
    <footer className="mt-16 border-t border-border text-black" style={themeBg}>
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <Link href={"/shop/" + shop.slug} className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-card">
                <Image src={shop.logo} alt={shop.name} width={40} height={40} className="object-cover w-full h-full" />
              </div>
              <span className="font-heading text-base font-bold text-black">{shop.name}</span>
            </Link>
            <p className="text-sm text-black leading-relaxed">{shop.description}</p>
            {shop.contact.socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {shop.contact.socialLinks.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2.5 py-1 rounded-full bg-card border border-border text-black hover:border-primary/50 hover:text-primary transition-colors">
                    {s.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-heading font-bold text-sm text-black mb-3 uppercase tracking-wide">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-black">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                <a href={"tel:" + shop.contact.phone.replace(/\s+/g, "")} className="hover:underline">{shop.contact.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                <a href={"mailto:" + shop.contact.email} className="hover:underline">{shop.contact.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                <span>{shop.contact.address}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-sm text-black mb-3 uppercase tracking-wide">Thông tin pháp lý</h3>
            {info ? (
              <ul className="space-y-2 text-sm text-black">
                <li className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                  <span className="font-medium">{info.businessName}</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                  <span>Mã ĐKKD: <span className="font-medium">{info.registrationNumber}</span></span>
                </li>
                {info.registrationDate && (
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                    <span>Cấp ngày {info.registrationDate}{info.registrationPlace ? " — " + info.registrationPlace : ""}</span>
                  </li>
                )}
                {info.ownerName && (
                  <li className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                    <span>Đại diện: <span className="font-medium">{info.ownerName}</span></span>
                  </li>
                )}
                {info.note && (
                  <li className="text-xs text-black/80 pt-1 italic">{info.note}</li>
                )}
              </ul>
            ) : (
              <p className="text-xs text-black/70 italic">Chưa cập nhật thông tin pháp lý.</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border/60 text-xs text-black text-center">
          © {new Date().getFullYear()} {shop.name}. Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}