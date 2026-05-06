import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Lock, Eye, EyeOff, Check, AlertCircle, Bell, Building2, Landmark, Plus, Trash2 } from "lucide-react";
import type { ShopBusinessInfo, BankAccount } from "@/types";

export default function SettingsPage() {
  const { t } = useLanguage();
  const shop = shops[0];
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifySaved, setNotifySaved] = useState(false);

  const [footer, setFooter] = useState<ShopBusinessInfo>({
    businessName: "", registrationNumber: "", registrationDate: "", registrationPlace: "", taxCode: "", ownerName: "", note: "", bankAccounts: [],
  });
  const [footerSaved, setFooterSaved] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("notify-new-order") : null;
    if (saved !== null) setNotifyNewOrder(saved === "true");
    const fSaved = typeof window !== "undefined" ? localStorage.getItem("shop-footer-" + shop.slug) : null;
    if (fSaved) {
      try {
        const parsed = JSON.parse(fSaved);
        setFooter({ ...(shop.businessInfo || {} as ShopBusinessInfo), ...parsed, bankAccounts: parsed.bankAccounts || shop.businessInfo?.bankAccounts || [] });
      } catch {
        if (shop.businessInfo) setFooter({ ...shop.businessInfo, bankAccounts: shop.businessInfo.bankAccounts || [] });
      }
    } else if (shop.businessInfo) {
      setFooter({
        businessName: shop.businessInfo.businessName,
        registrationNumber: shop.businessInfo.registrationNumber,
        registrationDate: shop.businessInfo.registrationDate || "",
        registrationPlace: shop.businessInfo.registrationPlace || "",
        taxCode: shop.businessInfo.taxCode || "",
        ownerName: shop.businessInfo.ownerName || "",
        note: shop.businessInfo.note || "",
        bankAccounts: shop.businessInfo.bankAccounts || [],
      });
    }
  }, [shop.slug, shop.businessInfo]);

  const handleNotifyToggle = (val: boolean) => {
    setNotifyNewOrder(val);
    if (typeof window !== "undefined") localStorage.setItem("notify-new-order", String(val));
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2000);
  };

  const handleFooterSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") localStorage.setItem("shop-footer-" + shop.slug, JSON.stringify(footer));
    setFooterSaved(true);
    setTimeout(() => setFooterSaved(false), 2500);
  };

  const addBankAccount = () => {
    const newBank: BankAccount = { id: "ba-" + Date.now(), bankName: "", accountNumber: "", accountHolder: "" };
    setFooter({ ...footer, bankAccounts: [...(footer.bankAccounts || []), newBank] });
  };

  const updateBankAccount = (id: string, field: keyof BankAccount, value: string) => {
    setFooter({
      ...footer,
      bankAccounts: (footer.bankAccounts || []).map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    });
  };

  const removeBankAccount = (id: string) => {
    setFooter({ ...footer, bankAccounts: (footer.bankAccounts || []).filter((b) => b.id !== id) });
  };

  const handlePasswordSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const current = form.get("current") as string;
    const next = form.get("next") as string;
    const confirm = form.get("confirm") as string;

    setPwdError("");
    if (!current || !next || !confirm) {
      setPwdError(t("settings.errFill"));
      return;
    }
    if (next.length < 8) {
      setPwdError(t("settings.errLen"));
      return;
    }
    if (next !== confirm) {
      setPwdError(t("settings.errMatch"));
      return;
    }
    setPwdSaved(true);
    e.currentTarget.reset();
    setTimeout(() => setPwdSaved(false), 2500);
  };

  return (
    <>
      <SEO title={t("nav.settings") + " — Admin"} />
      <AdminLayout title={t("nav.settings")} shopName={shop.name}>
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Thông tin pháp lý / Footer
            </h2>
            <p className="text-xs text-muted-foreground mb-5">Thông tin sẽ hiển thị ở footer của trang shop. Bao gồm tên đăng ký kinh doanh, mã ĐKKD và thông tin pháp lý.</p>

            <form onSubmit={handleFooterSave} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Tên đăng ký kinh doanh</Label>
                <Input value={footer.businessName} onChange={(e) => setFooter({ ...footer, businessName: e.target.value })} className="rounded-xl mt-1.5" placeholder="Công ty TNHH ABC" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Mã ĐKKD</Label>
                  <Input value={footer.registrationNumber} onChange={(e) => setFooter({ ...footer, registrationNumber: e.target.value })} className="rounded-xl mt-1.5" placeholder="0312345678" required />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mã số thuế</Label>
                  <Input value={footer.taxCode || ""} onChange={(e) => setFooter({ ...footer, taxCode: e.target.value })} className="rounded-xl mt-1.5" placeholder="0312345678" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Ngày cấp</Label>
                  <Input value={footer.registrationDate || ""} onChange={(e) => setFooter({ ...footer, registrationDate: e.target.value })} className="rounded-xl mt-1.5" placeholder="12/03/2020" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Nơi cấp</Label>
                  <Input value={footer.registrationPlace || ""} onChange={(e) => setFooter({ ...footer, registrationPlace: e.target.value })} className="rounded-xl mt-1.5" placeholder="Sở KH-ĐT TP.HCM" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Người đại diện</Label>
                <Input value={footer.ownerName || ""} onChange={(e) => setFooter({ ...footer, ownerName: e.target.value })} className="rounded-xl mt-1.5" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Ghi chú thêm</Label>
                <Textarea value={footer.note || ""} onChange={(e) => setFooter({ ...footer, note: e.target.value })} className="rounded-xl mt-1.5 min-h-[70px]" placeholder="Cam kết chất lượng, đổi trả 7 ngày..." />
              </div>

              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-semibold">Tài khoản ngân hàng</Label>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addBankAccount} className="rounded-xl h-8">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Thêm
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Khách hàng có thể bấm vào số tài khoản để sao chép nhanh khi thanh toán.</p>

                {(footer.bankAccounts || []).length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground">
                    Chưa có tài khoản nào. Bấm <strong>Thêm</strong> để thêm tài khoản đầu tiên.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(footer.bankAccounts || []).map((b, idx) => (
                      <div key={b.id} className="rounded-xl border border-border p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-muted-foreground">Tài khoản #{idx + 1}</span>
                          <button type="button" onClick={() => removeBankAccount(b.id)} className="text-destructive hover:text-destructive/80 p-1" aria-label="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <Input value={b.bankName} onChange={(e) => updateBankAccount(b.id, "bankName", e.target.value)} placeholder="Tên ngân hàng (Vietcombank...)" className="rounded-lg" />
                          <Input value={b.accountNumber} onChange={(e) => updateBankAccount(b.id, "accountNumber", e.target.value)} placeholder="Số tài khoản" className="rounded-lg font-mono" />
                        </div>
                        <Input value={b.accountHolder} onChange={(e) => updateBankAccount(b.id, "accountHolder", e.target.value)} placeholder="Chủ tài khoản (CONG TY TNHH...)" className="rounded-lg mt-2.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {footerSaved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                  <Check className="w-4 h-4" />
                  Đã lưu thông tin footer
                </div>
              )}

              <Button type="submit" className="gradient-primary text-white border-0 h-11 px-6 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                Lưu footer
              </Button>
            </form>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {t("settings.notifications")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">{t("settings.notifDesc")}</p>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex-1 pr-4">
                <div className="text-sm font-semibold text-foreground">{t("settings.newOrderNotif")}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t("settings.newOrderDesc")}</div>
              </div>
              <Switch checked={notifyNewOrder} onCheckedChange={handleNotifyToggle} />
            </div>

            {notifySaved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl mt-3">
                <Check className="w-4 h-4" />
                {t("settings.savedSetting")}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              {t("settings.changePwd")}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">{t("settings.pwdHint")}</p>

            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">{t("settings.currentPwd")}</Label>
                <div className="relative mt-1.5">
                  <Input name="current" type={showCurrentPwd ? "text" : "password"} className="rounded-xl pr-10" placeholder={t("settings.currentPwdPh")} />
                  <button type="button" onClick={() => setShowCurrentPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("settings.newPwd")}</Label>
                <div className="relative mt-1.5">
                  <Input name="next" type={showNewPwd ? "text" : "password"} className="rounded-xl pr-10" placeholder={t("settings.newPwdPh")} />
                  <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("settings.confirmPwd")}</Label>
                <Input name="confirm" type="password" className="rounded-xl mt-1.5" placeholder={t("settings.confirmPwdPh")} />
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
                  {t("settings.pwdSuccess")}
                </div>
              )}

              <Button type="submit" className="gradient-primary text-white border-0 h-11 px-6 rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                {t("settings.pwdUpdate")}
              </Button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}