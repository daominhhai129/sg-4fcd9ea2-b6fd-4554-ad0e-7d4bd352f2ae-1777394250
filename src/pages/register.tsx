import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, User, Mail, Phone, MapPin, ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { registerMember } = useAuth();
  const returnTo = typeof router.query.return === "string" ? router.query.return : undefined;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address) return;
    setIsSubmitting(true);
    setTimeout(() => {
      let dest = returnTo || "/member";
      if (!returnTo && typeof window !== "undefined") {
        try {
          const slug = localStorage.getItem("lastShopSlug");
          if (slug) dest = "/shop/" + slug;
        } catch {}
      }
      toast({ variant: "success", title: "Đăng ký thành công", description: "Chào mừng " + fullName + "! Đã tự động đăng nhập." });
      registerMember({ name: fullName, email, phone, address }, dest);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <>
      <SEO title="Đăng ký thành viên" description="Tạo tài khoản thành viên để mua sắm dễ dàng hơn" />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </button>

          <div className="bg-card border border-border/50 rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Đăng ký thành viên</h1>
                <p className="text-sm text-muted-foreground">Mua sắm nhanh hơn, theo dõi đơn hàng dễ dàng</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Họ và tên</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className="pl-10 rounded-xl" required />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="pl-10 rounded-xl" required />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Số điện thoại</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 345 678" className="pl-10 rounded-xl" required />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Địa chỉ nhận hàng</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" className="pl-10 rounded-xl min-h-[80px]" required />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-11 text-sm font-semibold">
                {isSubmitting ? "Đang xử lý..." : "Đăng ký & tự đăng nhập"}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Đã có tài khoản?{" "}
              <Link href={"/member/login" + (returnTo ? "?return=" + encodeURIComponent(returnTo) : "")} className="text-primary font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}