import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Lock, Eye, EyeOff, Check, AlertCircle, Bell } from "lucide-react";

export default function SettingsPage() {
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

  return (
    <>
      <SEO title="Cài đặt — Admin" />
      <AdminLayout title="Cài đặt" shopName={shop.name}>
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h2 className="font-heading font-bold text-foreground mb-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Thông báo
            </h2>
            <p className="text-xs text-muted-foreground mb-5">Quản lý cách bạn nhận thông báo từ cửa hàng</p>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="flex-1 pr-4">
                <div className="text-sm font-semibold text-foreground">Thông báo đơn hàng mới</div>
                <div className="text-xs text-muted-foreground mt-0.5">Nhận thông báo ngay khi có khách đặt đơn hàng mới</div>
              </div>
              <Switch checked={notifyNewOrder} onCheckedChange={handleNotifyToggle} />
            </div>

            {notifySaved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl mt-3">
                <Check className="w-4 h-4" />
                Đã lưu cài đặt
              </div>
            )}
          </div>

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
        </div>
      </AdminLayout>
    </>
  );
}