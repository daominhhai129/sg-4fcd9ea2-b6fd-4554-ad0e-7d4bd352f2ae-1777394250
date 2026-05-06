import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { shops } from "@/data/mock-data";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Youtube, Globe, Music2, Copy, Building2, Landmark, Clock } from "lucide-react";

const socialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return Facebook;
  if (p.includes("instagram")) return Instagram;
  if (p.includes("youtube")) return Youtube;
  if (p.includes("tiktok")) return Music2;
  return Globe;
};

export default function ShopContactPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { totalItems } = useCart();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const shop = shops.find((s) => s.slug === slug);
  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  const phoneNumber = shop.contact.phone.replace(/\s+/g, "");
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(shop.contact.address);
  const mapEmbed = "https://www.google.com/maps?q=" + encodeURIComponent(shop.contact.address) + "&output=embed";

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast({ title: "Đã sao chép", description: text });
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast({ title: "Không thể sao chép", variant: "destructive" });
    }
  };

  return (
    <>
      <SEO title={"Liên hệ — " + shop.name} description={"Thông tin liên hệ và địa chỉ của " + shop.name} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="min-h-screen bg-muted/20 pb-24 md:pb-12">
        <section
          className="py-10 md:py-14 border-b border-border"
          style={{ background: "linear-gradient(135deg, hsl(" + shop.themeColor + " / 0.12), hsl(" + shop.themeColor + " / 0.02))" }}
        >
          <div className="container">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "hsl(" + shop.themeColor + ")" }}>
              Liên hệ
            </p>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mb-2">
              Kết nối với {shop.name}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">{shop.description}</p>
          </div>
        </section>

        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-card border border-border p-6">
                <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                  Thông tin liên hệ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={"tel:" + phoneNumber}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "hsl(" + shop.themeColor + " / 0.12)" }}>
                      <Phone className="w-4 h-4" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">Hotline</p>
                      <p className="text-sm font-semibold text-foreground truncate">{shop.contact.phone}</p>
                    </div>
                  </a>
                  <a
                    href={"mailto:" + shop.contact.email}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "hsl(" + shop.themeColor + " / 0.12)" }}>
                      <Mail className="w-4 h-4" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold text-foreground truncate">{shop.contact.email}</p>
                    </div>
                  </a>
                  {shop.contact.messengerLink && (
                    <a
                      href={shop.contact.messengerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/60 transition-colors sm:col-span-2"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "hsl(" + shop.themeColor + " / 0.12)" }}>
                        <MessageCircle className="w-4 h-4" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-muted-foreground">Nhắn tin trực tiếp</p>
                        <p className="text-sm font-semibold text-foreground truncate">Messenger / Zalo</p>
                      </div>
                    </a>
                  )}
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-border sm:col-span-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "hsl(" + shop.themeColor + " / 0.12)" }}>
                      <MapPin className="w-4 h-4" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground">Địa chỉ</p>
                      <p className="text-sm font-semibold text-foreground">{shop.contact.address}</p>
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs font-medium" style={{ color: "hsl(" + shop.themeColor + ")" }}>
                        Xem chỉ đường →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="p-6 pb-4">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                    Bản đồ
                  </h2>
                </div>
                <div className="aspect-[16/9] w-full bg-muted">
                  <iframe
                    src={mapEmbed}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={"Bản đồ " + shop.name}
                  />
                </div>
              </div>

              {shop.businessInfo && (
                <div className="rounded-2xl bg-card border border-border p-6">
                  <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                    Thông tin doanh nghiệp
                  </h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Tên đăng ký</dt>
                      <dd className="font-semibold text-foreground">{shop.businessInfo.businessName}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Mã ĐKKD</dt>
                      <dd className="font-semibold text-foreground font-mono">{shop.businessInfo.registrationNumber}</dd>
                    </div>
                    {shop.businessInfo.taxCode && (
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Mã số thuế</dt>
                        <dd className="font-semibold text-foreground font-mono">{shop.businessInfo.taxCode}</dd>
                      </div>
                    )}
                    {shop.businessInfo.registrationDate && (
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Ngày cấp</dt>
                        <dd className="font-semibold text-foreground">{shop.businessInfo.registrationDate}</dd>
                      </div>
                    )}
                    {shop.businessInfo.registrationPlace && (
                      <div className="sm:col-span-2">
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Nơi cấp</dt>
                        <dd className="font-semibold text-foreground">{shop.businessInfo.registrationPlace}</dd>
                      </div>
                    )}
                    {shop.businessInfo.ownerName && (
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Người đại diện</dt>
                        <dd className="font-semibold text-foreground">{shop.businessInfo.ownerName}</dd>
                      </div>
                    )}
                  </dl>
                  {shop.businessInfo.note && (
                    <p className="mt-4 pt-4 border-t border-border/60 text-sm text-muted-foreground italic">{shop.businessInfo.note}</p>
                  )}
                </div>
              )}

              {shop.businessInfo?.bankAccounts && shop.businessInfo.bankAccounts.length > 0 && (
                <div className="rounded-2xl bg-card border border-border p-6">
                  <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <Landmark className="w-5 h-5" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                    Thông tin chuyển khoản
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shop.businessInfo.bankAccounts.map((b) => (
                      <div key={b.id} className="rounded-xl border border-border p-4 bg-muted/30">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{b.bankName}</p>
                        <button
                          onClick={() => copy(b.accountNumber, b.id)}
                          className="flex items-center gap-2 text-base font-mono font-bold text-foreground hover:opacity-80 transition-opacity"
                        >
                          {b.accountNumber}
                          <Copy className={"w-3.5 h-3.5 " + (copied === b.id ? "text-green-600" : "text-muted-foreground")} />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">{b.accountHolder}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-card border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border flex-shrink-0">
                    <Image src={shop.logo} alt={shop.name} width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-foreground truncate">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">@{shop.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border/60 pt-3">
                  <Clock className="w-4 h-4" />
                  <span>Mở cửa: 8:00 — 22:00 hằng ngày</span>
                </div>
              </div>

              {shop.contact.socialLinks.length > 0 && (
                <div className="rounded-2xl bg-card border border-border p-6">
                  <h2 className="font-heading font-bold mb-3">Mạng xã hội</h2>
                  <div className="space-y-2">
                    {shop.contact.socialLinks.map((s, i) => {
                      const Icon = socialIcon(s.platform);
                      return (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "hsl(" + shop.themeColor + " / 0.12)" }}>
                            <Icon className="w-4 h-4" style={{ color: "hsl(" + shop.themeColor + ")" }} />
                          </div>
                          <span className="text-sm font-medium text-foreground capitalize">{s.platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <ShopFooter shop={shop} />
      <ShopBottomBar shop={shop} />
    </>
  );
}