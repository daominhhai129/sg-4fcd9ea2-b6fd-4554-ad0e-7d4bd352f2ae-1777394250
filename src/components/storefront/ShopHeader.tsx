import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, LogIn, UserPlus, Search, User, ChevronDown, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import type { Shop } from "@/types";

interface ShopHeaderProps {
  shop: Shop;
  cartCount: number;
}

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export function ShopHeader({ shop, cartCount }: ShopHeaderProps) {
  const { totalPrice, openPreview } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem("lastShopSlug", shop.slug); } catch {}
    }
  }, [shop.slug]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const openMenu = () => setMobileOpen(true);
    const openSearchEvt = () => { setQuery(""); setSearchOpen(true); };
    window.addEventListener("shop:open-menu", openMenu);
    window.addEventListener("shop:open-search", openSearchEvt);
    return () => {
      window.removeEventListener("shop:open-menu", openMenu);
      window.removeEventListener("shop:open-search", openSearchEvt);
    };
  }, []);

  const parents = useMemo(() => shop.categories.filter((c) => !c.parentId), [shop.categories]);
  const childrenByParent = useMemo(() => {
    const map: Record<string, typeof shop.categories> = {};
    shop.categories.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    });
    return map;
  }, [shop.categories]);

  const featuredForMega = useMemo(() => shop.products.filter((p) => p.featured).slice(0, 3), [shop.products]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return shop.products
      .filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, shop.products]);

  const openSearch = () => { setQuery(""); setSearchOpen(true); };

  const closeMobile = () => {
    setMobileOpen(false);
    setExpandedParent(null);
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <button className="md:hidden p-1.5 -ml-1.5 text-foreground" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>
          <Link href={"/shop/" + shop.slug} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
              <Image src={shop.logo} alt={shop.name} width={36} height={36} className="object-cover w-full h-full" />
            </div>
            <span className="font-heading text-base font-bold text-foreground">{shop.name}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={"/shop/" + shop.slug} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <div
            className="relative"
            onMouseEnter={openMega}
            onMouseLeave={scheduleClose}
          >
            <button
              className={`text-sm font-medium transition-colors inline-flex items-center gap-1 ${megaOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              Danh mục
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          <Link href={"/shop/" + shop.slug + "#products"} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sản phẩm
          </Link>
          <Link href={"/shop/" + shop.slug + "#blog"} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Bài viết
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <button onClick={openSearch} className="hidden sm:block p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground" aria-label="Tìm kiếm">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/member" className="hidden sm:block p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground" aria-label="Tài khoản">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </Link>
          <Link href="/register" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký</span>
          </Link>
          <button onClick={openPreview} className="relative p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Giỏ hàng">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {megaOpen && (
        <div
          className="hidden md:block absolute left-0 right-0 top-full bg-card border-b border-border shadow-xl"
          onMouseEnter={openMega}
          onMouseLeave={scheduleClose}
        >
          <div className="container py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-9 grid grid-cols-3 gap-x-6 gap-y-5">
                {parents.map((parent) => {
                  const kids = childrenByParent[parent.id] || [];
                  return (
                    <div key={parent.id} className="space-y-2">
                      <Link
                        href={"/shop/" + shop.slug + "/category/" + parent.slug}
                        onClick={() => setMegaOpen(false)}
                        className="block font-heading font-bold hover:opacity-80 transition-opacity"
                        style={{ color: `hsl(${shop.themeColor})` }}
                      >
                        {parent.name}
                      </Link>
                      {kids.length > 0 ? (
                        <ul className="space-y-1.5">
                          {kids.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={"/shop/" + shop.slug + "/category/" + child.slug}
                                onClick={() => setMegaOpen(false)}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">{parent.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="col-span-3 border-l border-border pl-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Nổi bật</p>
                <div className="space-y-3">
                  {featuredForMega.map((p) => (
                    <Link
                      key={p.id}
                      href={"/shop/" + shop.slug + "/product/" + p.id}
                      onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                        <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-xs font-bold" style={{ color: `hsl(${shop.themeColor})` }}>
                          {formatPrice(p.salePrice || p.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>

    {mobileOpen && (
      <div
        className="md:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeMobile}
      />
    )}

    <aside
      className={`md:hidden fixed top-0 right-0 bottom-0 z-[110] w-[85%] max-w-sm bg-card shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b border-border bg-card z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
            <Image src={shop.logo} alt={shop.name} width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span className="font-heading text-base font-bold text-foreground">{shop.name}</span>
        </div>
        <button className="p-1.5 text-foreground" onClick={closeMobile} aria-label="Đóng">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-14 left-0 right-0 bottom-0 overflow-y-auto bg-card">
        <Link
          href={"/shop/" + shop.slug}
          onClick={closeMobile}
          className="flex items-center px-4 py-3 text-sm font-semibold text-foreground border-b border-border/60 hover:bg-muted transition-colors"
        >
          Trang chủ
        </Link>
        <div className="px-4 pt-3 pb-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Danh mục</p>
        </div>
        {parents.map((parent) => {
          const kids = childrenByParent[parent.id] || [];
          const isExpanded = expandedParent === parent.id;
          const hasKids = kids.length > 0;
          return (
            <div key={parent.id} className="border-b border-border/40">
              {hasKids ? (
                <button
                  onClick={() => setExpandedParent(isExpanded ? null : parent.id)}
                  className="w-full flex items-center px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="flex-1 text-left">{parent.name}</span>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                </button>
              ) : (
                <Link
                  href={"/shop/" + shop.slug + "/category/" + parent.slug}
                  onClick={closeMobile}
                  className="flex items-center px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {parent.name}
                </Link>
              )}
              {hasKids && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "max-h-96" : "max-h-0"}`}
                  style={{ backgroundColor: `hsl(${shop.themeColor} / 0.04)` }}
                >
                  <Link
                    href={"/shop/" + shop.slug + "/category/" + parent.slug}
                    onClick={closeMobile}
                    className="block px-8 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                    style={{ color: `hsl(${shop.themeColor})` }}
                  >
                    Tất cả {parent.name}
                  </Link>
                  {kids.map((child) => (
                    <Link
                      key={child.id}
                      href={"/shop/" + shop.slug + "/category/" + child.slug}
                      onClick={closeMobile}
                      className="block px-8 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="px-4 pt-4 pb-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Khám phá</p>
        </div>
        <Link href={"/shop/" + shop.slug + "#products"} onClick={closeMobile} className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors border-b border-border/40">
          Sản phẩm
        </Link>
        <Link href={"/shop/" + shop.slug + "#blog"} onClick={closeMobile} className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors border-b border-border/40">
          Bài viết
        </Link>

        <div className="p-4 space-y-2">
          <Link
            href="/login"
            onClick={closeMobile}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </Link>
          <Link
            href="/register"
            onClick={closeMobile}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký
          </Link>
        </div>
      </div>
    </aside>

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
  </>
);
}