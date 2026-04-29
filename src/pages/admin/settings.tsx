import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Lock, Eye, EyeOff, Check, AlertCircle, Bell } from "lucide-react";

export default function SettingsPage() {
  const { t } = useLanguage();
  const shop = shops[0];
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifySaved, setNotifySaved] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("notify-new-order") : null;
    if (saved !== null) setNotifyNewOrder(saved === "true");
  }, []);

  const handleNotifyToggle = (val: boolean) => {
    setNotifyNewOrder(val);
    if (typeof window !== "undefined") localStorage.setItem("notify-new-order", String(val));
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2000);
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