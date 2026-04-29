import { useState } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Store, Phone, Mail, MapPin, Image as ImageIcon, Palette, Facebook, Instagram, Youtube, Check, Globe, Music2 } from "lucide-react";
import type { Shop } from "@/types";

const themePresets = [
  { name: "Tím điện", value: "263 84% 58%", color: "#8b5cf6" },
  { name: "Cam năng động", value: "25 95% 53%", color: "#f97316" },
  { name: "Xanh dương", value: "217 91% 60%", color: "#3b82f6" },
  { name: "Xanh lá", value: "142 71% 45%", color: "#22c55e" },
  { name: "Hồng pastel", value: "330 81% 60%", color: "#ec4899" },
  { name: "Đỏ rực", value: "0 84% 60%", color: "#ef4444" },
  { name: "Vàng ánh kim", value: "45 93% 47%", color: "#eab308" },
  { name: "Đen sang trọng", value: "240 6% 10%", color: "#18181b" },
];

export default function ProfilePage() {
  const { t } = useLanguage();
  const [shop, setShop] = useState<Shop>(shops[0]);
  const [logoUrl, setLogoUrl] = useState(shop.logo);
  const [bannerUrl, setBannerUrl] = useState(shop.banner);
  const [themeColor, setThemeColor] = useState(shop.themeColor || "263 84% 58%");
  const [saved, setSaved] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setter(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setShop((prev) => ({
      ...prev,
      name: form.get("name") as string,
      description: form.get("description") as string,
      logo: logoUrl,
      banner: bannerUrl,
      themeColor,
      contact: {
        ...prev.contact,
        phone: form.get("phone") as string,
        email: form.get("email") as string,
        address: form.get("address") as string,
        socialLinks: [
          { platform: "facebook", url: form.get("facebook") as string },
          { platform: "instagram", url: form.get("instagram") as string },
          { platform: "youtube", url: form.get("youtube") as string },
          { platform: "tiktok", url: form.get("tiktok") as string },
          { platform: "website", url: form.get("website") as string },
        ],
      },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const facebookUrl = shop.contact.socialLinks.find((s) => s.platform === "facebook")?.url || "";
  const instagramUrl = shop.contact.socialLinks.find((s) => s.platform === "instagram")?.url || "";
  const youtubeUrl = shop.contact.socialLinks.find((s) => s.platform === "youtube")?.url || "";
  const tiktokUrl = shop.contact.socialLinks.find((s) => s.platform === "tiktok")?.url || "";
  const websiteUrl = shop.contact.socialLinks.find((s) => s.platform === "website")?.url || "";

  return (
    <>
      <SEO title={t("nav.profile") + " — Admin"} />
      <AdminLayout title={t("nav.profile")} shopName={shop.name}>
        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              {t("profile.brand")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">{t("profile.brandDesc")}</p>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-semibold mb-2 block">{t("profile.banner")}</Label>
                <div className="relative aspect-[3/1] rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted group">
                  <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="bg-white text-foreground px-4 py-2 rounded-xl text-sm font-medium">{t("profile.changeBanner")}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setBannerUrl)} />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">{t("profile.logo")}</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border flex-shrink-0">
                    <Image src={logoUrl} alt="Logo" width={80} height={80} className="object-cover w-full h-full" />
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-colors">
                      {t("profile.pickImage")}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoUrl)} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              {t("profile.shopInfo")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">{t("profile.shopInfoDesc")}</p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">{t("profile.shopName")}</Label>
                <Input name="name" defaultValue={shop.name} className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("profile.shortDesc")}</Label>
                <Textarea name="description" defaultValue={shop.description} className="rounded-xl mt-1.5" rows={3} placeholder={t("profile.shortDescPh")} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              {t("profile.themeColor")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">{t("profile.themeDesc")}</p>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {themePresets.map((preset) => {
                const isSelected = themeColor === preset.value;
                return (
                  <button key={preset.value} type="button" onClick={() => setThemeColor(preset.value)} className="group flex flex-col items-center gap-1.5">
                    <div className={`relative w-full aspect-square rounded-xl transition-all ${isSelected ? "ring-2 ring-foreground ring-offset-2 scale-105" : "ring-1 ring-border hover:scale-105"}`} style={{ backgroundColor: preset.color }}>
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              {t("profile.contactInfo")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">{t("profile.contactDesc")}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-semibold"><Phone className="w-3.5 h-3.5" />{t("profile.phone")}</Label>
                  <Input name="phone" defaultValue={shop.contact.phone} className="rounded-xl mt-1.5" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-semibold"><Mail className="w-3.5 h-3.5" />{t("profile.email")}</Label>
                  <Input name="email" type="email" defaultValue={shop.contact.email} className="rounded-xl mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><MapPin className="w-3.5 h-3.5" />{t("profile.address")}</Label>
                <Input name="address" defaultValue={shop.contact.address} className="rounded-xl mt-1.5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1">{t("profile.social")}</h2>
            <p className="text-xs text-muted-foreground mb-5">{t("profile.socialDesc")}</p>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><Globe className="w-3.5 h-3.5" />{t("profile.website")}</Label>
                <Input name="website" defaultValue={websiteUrl} placeholder="https://shop.com" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><Facebook className="w-3.5 h-3.5" />Facebook</Label>
                <Input name="facebook" defaultValue={facebookUrl} placeholder="https://facebook.com/shop" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><Instagram className="w-3.5 h-3.5" />Instagram</Label>
                <Input name="instagram" defaultValue={instagramUrl} placeholder="https://instagram.com/shop" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><Music2 className="w-3.5 h-3.5" />TikTok</Label>
                <Input name="tiktok" defaultValue={tiktokUrl} placeholder="https://tiktok.com/@shop" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-semibold"><Youtube className="w-3.5 h-3.5" />YouTube</Label>
                <Input name="youtube" defaultValue={youtubeUrl} placeholder="https://youtube.com/@shop" className="rounded-xl mt-1.5" />
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 z-10">
            <div className="rounded-2xl bg-card border border-border shadow-lg p-3 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground pl-2">{saved ? t("profile.saved") : t("profile.saveHint")}</p>
              <Button type="submit" className="gradient-primary text-white border-0 h-11 px-6 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {saved ? t("profile.saved") : t("profile.saveChanges")}
              </Button>
            </div>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}