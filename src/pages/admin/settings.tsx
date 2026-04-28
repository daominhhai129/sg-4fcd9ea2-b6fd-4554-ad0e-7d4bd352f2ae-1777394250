import { useState } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Store, Globe, Phone, Mail, MapPin } from "lucide-react";
import type { Shop } from "@/types";

export default function SettingsPage() {
  const [shop, setShop] = useState<Shop>(shops[0]);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setShop((prev) => ({
      ...prev,
      name: form.get("name") as string,
      description: form.get("description") as string,
      contact: {
        ...prev.contact,
        phone: form.get("phone") as string,
        email: form.get("email") as string,
        address: form.get("address") as string,
      },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SEO title="Cài đặt — Admin" />
      <AdminLayout title="Cài đặt cửa hàng" shopName={shop.name}>
        <form onSubmit={handleSave} className="max-w-2xl space-y-8">
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Thông tin cửa hàng
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                  <Image src={shop.logo} alt={shop.name} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{shop.name}</p>
                  <p className="text-xs text-muted-foreground">{shop.slug}.vietshop.vn</p>
                </div>
              </div>
              <div>
                <Label>Tên cửa hàng</Label>
                <Input name="name" defaultValue={shop.name} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea name="description" defaultValue={shop.description} className="rounded-xl mt-1" rows={3} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Thông tin liên hệ
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Số điện thoại</Label>
                <Input name="phone" defaultValue={shop.contact.phone} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</Label>
                <Input name="email" type="email" defaultValue={shop.contact.email} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Địa chỉ</Label>
                <Input name="address" defaultValue={shop.contact.address} className="rounded-xl mt-1" />
              </div>
            </div>
          </div>

          <Button type="submit" className="gradient-primary text-white border-0 h-11 px-8">
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Đã lưu ✓" : "Lưu thay đổi"}
          </Button>
        </form>
      </AdminLayout>
    </>
  );
}