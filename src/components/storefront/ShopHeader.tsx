import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { Menu, X, ShoppingCart, LogIn, UserPlus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Shop } from "@/types";

interface ShopHeaderProps {
  shop: Shop;
  cartCount: number;
}

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export function ShopHeader({ shop, cartCount }: ShopHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem("lastShopSlug", shop.slug); } catch {}
    }
  }, [shop.slug]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return shop.products
      .filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, shop.products]);

  const openSearch = () => {
    setQuery("");
    setSearchOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-14">
        <Link href={"/shop/" + shop.slug} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
            <Image src={shop.logo} alt={shop.name} width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span className="font-heading text-base font-bold text-foreground">{shop.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={"/shop/" + shop.slug} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          {shop.categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={"/shop/" + shop.slug + "/category/" + cat.slug}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={openSearch}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label="Tìm kiếm sản phẩm"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </Link>
          <Link
            href="/register"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký</span>
          </Link>
          <Link
            href={"/shop/" + shop.slug + "/cart"}
            className="relative p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden p-1.5 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
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
              href={"/shop/" + shop.slug + "/category/" + cat.slug}
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
          <Link href="/register" className="flex items-center gap-2 py-2 text-sm font-medium text-white bg-primary px-3 rounded-xl" onClick={() => setMobileOpen(false)}>
            <UserPlus className="w-4 h-4" />
            Đăng ký
          </Link>
        </div>
      )}

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="font-heading flex items-center gap-2 text-base">
              <Search className="w-5 h-5 text-primary" />
              Tìm kiếm sản phẩm
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="pl-10 rounded-xl h-11"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto border-t border-border">
            {!query.trim() ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Bắt đầu nhập để tìm sản phẩm trong {shop.name}
              </div>
            ) : results.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Không tìm thấy sản phẩm phù hợp với <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={"/shop/" + shop.slug + "/product/" + p.id}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/60 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                        <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {p.salePrice ? (
                          <>
                            <p className="text-sm font-heading font-bold text-accent">{formatPrice(p.salePrice)}</p>
                            <p className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</p>
                          </>
                        ) : (
                          <p className="text-sm font-heading font-bold text-accent">{formatPrice(p.price)}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {query.trim() && results.length > 0 && (
            <div className="px-5 py-2.5 border-t border-border text-xs text-muted-foreground bg-muted/30">
              Hiển thị {results.length} kết quả{results.length === 10 ? " (top 10)" : ""}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}