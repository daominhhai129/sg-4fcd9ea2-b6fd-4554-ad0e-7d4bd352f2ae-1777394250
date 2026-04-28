import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingCart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shop } from "@/types";

interface ShopHeaderProps {
  shop: Shop;
  cartCount: number;
}

export function ShopHeader({ shop, cartCount }: ShopHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link href={"/shop/" + shop.slug} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-border">
            <Image src={shop.logo} alt={shop.name} width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">{shop.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={"/shop/" + shop.slug} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          {shop.categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={"/shop/" + shop.slug + "?category=" + cat.slug}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </Link>
          <Link
            href={"/shop/" + shop.slug + "/cart"}
            className="relative p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 space-y-2">
          <Link href={"/shop/" + shop.slug} className="block py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Trang chủ
          </Link>
          {shop.categories.map((cat) => (
            <Link
              key={cat.id}
              href={"/shop/" + shop.slug + "?category=" + cat.slug}
              className="block py-2 text-sm font-medium text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/login" className="flex items-center gap-2 py-2 text-sm font-medium text-primary border-t border-border pt-3 mt-2" onClick={() => setMobileOpen(false)}>
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </Link>
        </div>
      )}
    </header>
  );
}