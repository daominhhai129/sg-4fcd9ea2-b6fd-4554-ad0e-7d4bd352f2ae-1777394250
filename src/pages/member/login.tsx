import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Phone, Lock, ArrowRight, ArrowLeft } from "lucide-react";

export default function MemberLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { loginMemberByPhone, loginMemberWithPassword, finalizeMemberLogin } = useAuth();
  const returnTo = typeof router.query.return === "string" ? router.query.return : undefined;

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const result = loginMemberByPhone(phone.trim());
      if (!result.found) {
        setError("Không tìm thấy tài khoản với số điện thoại này");
        setIsSubmitting(false);
        return;
      }
      if (result.needsPassword) {
        setNeedsPassword(true);
        setIsSubmitting(false);
      } else {
        toast({ variant: "success", title: "Đăng nhập thành công" });
        finalizeMemberLogin(returnTo);
      }
    }, 400);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const ok = loginMemberWithPassword(phone.trim(), password);
      if (!ok) {
        setError("Mật khẩu không đúng");
        setIsSubmitting(false);
        return;
      }
      toast({ variant: "success", title: "Đăng nhập thành công" });
      if (returnTo) router.push(returnTo);
      else router.push("/member");
    }, 400);
  };

  return (
    <>
      <SEO title="Đăng nhập thành viên" />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          <button
            onClick={() => (returnTo ? router.push(returnTo) : router.push("/"))}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {returnTo ? "Quay lại" : "Về trang chủ"}
          </button>

          <div className="bg-card border border-border/50 rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Đăng nhập thành viên</h1>
                <p className="text-sm text-muted-foreground">{needsPassword ? "Nhập mật khẩu để tiếp tục" : "Đăng nhập nhanh bằng số điện thoại"}</p>
              </div>
            </div>

            {!needsPassword ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Số điện thoại</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 345 678" className="pl-10 rounded-xl" autoFocus />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-11 text-sm font-semibold">
                  {isSubmitting ? "Đang kiểm tra..." : "Tiếp tục"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="text-sm text-muted-foreground bg-muted rounded-xl p-3">
                  Số điện thoại: <span className="font-semibold text-foreground">{phone}</span>
                  <button type="button" onClick={() => { setNeedsPassword(false); setPassword(""); setError(""); }} className="ml-2 text-primary hover:underline text-xs">Đổi</button>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mật khẩu</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 rounded-xl" autoFocus />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-11 text-sm font-semibold">
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </form>
            )}

            <p className="text-sm text-muted-foreground text-center mt-6">
              Chưa có tài khoản?{" "}
              <Link href={"/register" + (returnTo ? "?return=" + encodeURIComponent(returnTo) : "")} className="text-primary font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}