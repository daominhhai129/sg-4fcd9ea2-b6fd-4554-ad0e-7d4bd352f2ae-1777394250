import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Lock, Globe, Eye, EyeOff, Check, AlertCircle, Copy, ExternalLink, Trash2, Plus } from "lucide-react";

interface Domain {
  id: string;
  name: string;
  status: "verified" | "pending" | "failed";
  primary: boolean;
}

export default function SettingsPage() {
  const shop = shops[0];
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [domains, setDomains] = useState<Domain[]>([
    { id: "d-1", name: `${shop.slug}.vietshop.vn`, status: "verified", primary: true },
    { id: "d-2", name: "techzone.vn", status: "verified", primary: false },
  ]);
  const [copied, setCopied] = useState("");

  const handlePasswordSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const current = form.get("current") as string;
    const next = form.get("next") as string;
    const confirm = form.get("confirm") as string;

    setPwdError("");
    if (!current || !next || !confirm) {
      setPwdError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (next.length < 8) {
      setPwdError("Mật khẩu mới phải ít nhất 8 ký tự");
      return;
    }
    if (next !== confirm) {
      setPwdError("Mật khẩu xác nhận không khớp");
      return;
    }
    setPwdSaved(true);
    e.currentTarget.reset();
    setTimeout(() => setPwdSaved(false), 2500);
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const domain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    setDomains((prev) => [...prev, { id: `d-${Date.now()}`, name: domain, status: "pending", primary: false }]);
    setNewDomain("");
  };

  const removeDomain = (id: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== id));
  };

  const setPrimary = (id: string) => {
    setDomains((prev) => prev.map((d) => ({ ...d, primary: d.id === id })));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <>
      <SEO title="Cài đặt — Admin" />
      <AdminLayout title="Cài đặt" shopName={shop.name}>
        <div className="max-w-3xl space-y-6">
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Đổi mật khẩu
            </h2>
            <p className="text-xs text-muted-foreground mb-5">Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số</p>

            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Mật khẩu hiện tại</Label>
                <div className="relative mt-1.5">
                  <Input name="current" type={showCurrentPwd ? "text" : "password"} className="rounded-xl pr-10" placeholder="Nhập mật khẩu hiện tại" />
                  <button type="button" onClick={() => setShowCurrentPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Mật khẩu mới</Label>
                <div className="relative mt-1.5">
                  <Input name="next" type={showNewPwd ? "text" : "password"} className="rounded-xl pr-10" placeholder="Ít nhất 8 ký tự" />
                  <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Xác nhận mật khẩu mới</Label>
                <Input name="confirm" type="password" className="rounded-xl mt-1.5" placeholder="Nhập lại mật khẩu mới" />
              </div>

              {pwdError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  {pwdError}
                </div>
              )}
              {pwdSaved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                  <Check className="w-4 h-4" />
                  Đổi mật khẩu thành công
                </div>
              )}

              <Button type="submit" className="gradient-primary text-white border-0 h-11 px-6 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                Cập nhật mật khẩu
              </Button>
            </form>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Tên miền riêng
            </h2>
            <p className="text-xs text-muted-foreground mb-5">Kết nối tên miền của bạn (ví dụ: shop-cua-ban.com) để khách hàng truy cập trực tiếp</p>

            <div className="space-y-3 mb-5">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                      {d.primary && <Badge className="text-[10px] gradient-primary text-white border-0">Mặc định</Badge>}
                      {d.status === "verified" && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100"><Check className="w-3 h-3 mr-0.5" />Đã xác minh</Badge>}
                      {d.status === "pending" && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100">Đang chờ xác minh</Badge>}
                      {d.status === "failed" && <Badge variant="destructive" className="text-[10px]">Thất bại</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">https://{d.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!d.primary && d.status === "verified" && (
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg text-xs h-8" onClick={() => setPrimary(d.id)}>
                        Đặt mặc định
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="icon" className="rounded-lg h-8 w-8" asChild>
                      <a href={`https://${d.name}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                    </Button>
                    {!d.primary && (
                      <Button type="button" variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeDomain(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border/60">
              <Label className="text-sm font-semibold">Thêm tên miền mới</Label>
              <div className="flex gap-2">
                <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="vd: shop-cua-ban.com" className="rounded-xl" />
                <Button type="button" onClick={addDomain} className="gradient-primary text-white border-0 rounded-xl px-5">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Thêm
                </Button>
              </div>

              <div className="pt-3 border-t border-border/60">
                <p className="text-xs font-semibold text-foreground mb-2">Hướng dẫn cấu hình DNS</p>
                <p className="text-[11px] text-muted-foreground mb-2.5">Thêm các bản ghi sau vào nhà cung cấp tên miền của bạn:</p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground shrink-0 w-12">Loại</span>
                    <span className="text-muted-foreground shrink-0 w-16">Tên</span>
                    <span className="text-muted-foreground shrink-0 flex-1">Giá trị</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                    <span className="font-semibold shrink-0 w-12">A</span>
                    <span className="shrink-0 w-16">@</span>
                    <span className="flex-1 text-foreground/80 truncate">76.76.21.21</span>
                    <button type="button" onClick={() => copyToClipboard("76.76.21.21", "a")} className="text-muted-foreground hover:text-foreground shrink-0">
                      {copied === "a" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                    <span className="font-semibold shrink-0 w-12">CNAME</span>
                    <span className="shrink-0 w-16">www</span>
                    <span className="flex-1 text-foreground/80 truncate">cname.vietshop.vn</span>
                    <button type="button" onClick={() => copyToClipboard("cname.vietshop.vn", "cn")} className="text-muted-foreground hover:text-foreground shrink-0">
                      {copied === "cn" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2.5">Sau khi thêm, hệ thống sẽ tự động xác minh trong vòng 5-30 phút.</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}