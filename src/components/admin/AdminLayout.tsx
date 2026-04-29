import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  FileText,
  Settings,
  Menu,
  X,
  Store,
  ChevronLeft,
  LogOut,
  UserCircle,
  Shield,
  ArrowLeft,
  HeadphonesIcon,
  Phone,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/LanguageToggle";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderOpen },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/posts", label: "Bài viết", icon: FileText },
  { href: "/admin/profile", label: "Hồ sơ shop", icon: UserCircle },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  shopName?: string;
}

export function AdminLayout({ children, title, shopName = "Tech Zone" }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, logout, impersonating, exitImpersonation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-foreground">{user.shopName || shopName}</span>
          </Link>
          <button className="lg:hidden p-1 text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "gradient-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => { setSupportOpen(true); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <HeadphonesIcon className="w-4.5 h-4.5" />
            Hỗ trợ
          </button>
        </nav>

        <div className="p-3 border-t border-border space-y-1 flex-shrink-0">
          <div className="px-3 pb-2">
            <LanguageToggle />
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            {user.avatar && <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.shopName}</p>
            </div>
          </div>
          <Link
            href="/shop/tech-zone"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Xem cửa hàng
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="lg:pl-64">
        {impersonating && (
          <div className="bg-accent text-white px-4 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4" />
              Đang xem dưới quyền Super Admin
            </span>
            <button onClick={exitImpersonation} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Super Admin
            </button>
          </div>
        )}
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-lg border-b border-border/50 flex items-center px-4 lg:px-8">
          <button className="lg:hidden p-2 -ml-2 text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="ml-2 lg:ml-0 text-lg font-heading font-bold text-foreground">{title}</h1>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5 text-primary" />
              Liên hệ hỗ trợ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cần trợ giúp? Đội ngũ Pro ID luôn sẵn sàng hỗ trợ bạn 24/7.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hotline</p>
              <a href="tel:0965784668" className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">096 578 4668</p>
                  <p className="text-xs text-muted-foreground">Bấm để gọi</p>
                </div>
              </a>
              <a href="tel:0986851829" className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">098 685 1829</p>
                  <p className="text-xs text-muted-foreground">Bấm để gọi</p>
                </div>
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Zalo Official</p>
              <a
                href="https://zalo.me/proidvn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#0068FF]/10 hover:bg-[#0068FF]/15 transition-colors border border-[#0068FF]/20"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0068FF] text-white flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Zalo OA - Pro ID</p>
                  <p className="text-xs text-muted-foreground">zalo.me/proidvn</p>
                </div>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}