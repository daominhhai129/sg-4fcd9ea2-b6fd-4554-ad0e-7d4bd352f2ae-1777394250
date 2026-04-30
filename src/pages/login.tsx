import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, User, Shield, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { loginAsUser, loginAsSuperAdmin, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setTimeout(() => {
      const success = loginWithCredentials(email, password);
      if (!success) {
        setError("Email hoặc mật khẩu không đúng");
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <>
      <SEO title="Đăng nhập" />
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:flex flex-1 gradient-primary relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
          </div>
          <div className="relative text-white max-w-md space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-heading font-bold leading-tight">Nền tảng quản lý cửa hàng thông minh</h1>
            <p className="text-lg text-white/80">Quản lý sản phẩm, đơn hàng, danh mục và bài viết — tất cả trong một nơi.</p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Store className="w-4 h-4" /></div>
                <span>Đa cửa hàng, mỗi shop một storefront riêng</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"><Shield className="w-4 h-4" /></div>
                <span>Phân quyền rõ ràng: Shop Owner &amp; Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">ShopPlatform</span>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Đăng nhập</h2>
              <p className="text-muted-foreground mt-1">Nhập thông tin để truy cập dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl" required />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Mật khẩu</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-20 rounded-xl" required />
                  <button
                    type="button"
                    onClick={() => setPassword("iLoveProID@")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    Tự điền
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full gradient-primary text-white border-0 rounded-xl h-11" disabled={isSubmitting}>
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">Demo nhanh</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={loginAsUser} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Demo User</p>
                  <p className="text-xs text-muted-foreground">Shop Owner</p>
                </div>
              </button>
              <button onClick={loginAsSuperAdmin} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Demo Admin</p>
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}