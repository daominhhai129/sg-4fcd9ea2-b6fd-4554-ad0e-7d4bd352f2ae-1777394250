import Link from "next/link";
import { useState } from "react";
import { Menu, X, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            Viet<span className="text-primary">Shop</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Tính năng
          </Link>
          <Link href="/#shops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cửa hàng
          </Link>
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Quản trị
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Đăng nhập</Link>
          </Button>
          <Button size="sm" className="gradient-primary text-white border-0 shadow-lg shadow-primary/25" asChild>
            <Link href="/admin">Tạo cửa hàng</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 space-y-3">
          <Link href="/#features" className="block py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Tính năng
          </Link>
          <Link href="/#shops" className="block py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Cửa hàng
          </Link>
          <Link href="/admin" className="block py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Quản trị
          </Link>
          <Button className="w-full gradient-primary text-white border-0" asChild>
            <Link href="/admin">Tạo cửa hàng</Link>
          </Button>
        </div>
      )}
    </header>
  );
}