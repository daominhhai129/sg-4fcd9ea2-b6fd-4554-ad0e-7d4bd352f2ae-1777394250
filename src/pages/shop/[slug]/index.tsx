import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";
import { shops } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBanner } from "@/components/storefront/ShopBanner";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Search, Sparkles, ChevronLeft, ChevronRight, FileText, Calendar, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRODUCTS_PER_PAGE = 24;
const POSTS_PER_PAGE = 8;

export default function ShopPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">("newest");
  const [productPage, setProductPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const productsTopRef = useRef<HTMLDivElement>(null);
  const postsTopRef = useRef<HTMLDivElement>(null);

  const changeProductPage = (newPage: number) => {
    setProductPage(newPage);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const el = productsTopRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      });
    }
  };
  const changePostPage = (newPage: number) => {
    setPostPage(newPage);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const el = postsTopRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      });
    }
  };

  const shop = shops.find((s) => s.slug === slug);

  const parentCategories = useMemo(() => {
    if (!shop) return [];
    return shop.categories.filter((c) => !c.parentId);
  }, [shop]);

  const childrenByParent = useMemo(() => {
    const map: Record<string, typeof shop.categories> = {};
    if (!shop) return map;
    shop.categories.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    });
    return map;
  }, [shop]);

  const activeParentId = useMemo(() => {
    if (!shop || categoryFilter === "all") return null;
    const cat = shop.categories.find((c) => c.id === categoryFilter);
    if (!cat) return null;
    return cat.parentId || cat.id;
  }, [shop, categoryFilter]);

  const featuredProducts = useMemo(() => {
    if (!shop) return [];
    return shop.products.filter((p) => p.featured && !p.isHidden);
  }, [shop]);

  const filteredProducts = useMemo(() => {
    if (!shop) return [];
    let products = shop.products.filter((p) => !p.isHidden);
    if (categoryFilter !== "all") {
      const children = childrenByParent[categoryFilter] || [];
      const ids = new Set<string>([categoryFilter, ...children.map((c) => c.id)]);
      products = products.filter((p) => ids.has(p.categoryId));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    const sorted = [...products];
    if (sortBy === "priceAsc") {
      sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === "priceDesc") {
      sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    }
    return sorted;
  }, [shop, categoryFilter, searchQuery, sortBy, childrenByParent]);

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() =>
    filteredProducts.slice((productPage - 1) * PRODUCTS_PER_PAGE, productPage * PRODUCTS_PER_PAGE),
    [filteredProducts, productPage]
  );

  const publishedPosts = useMemo(() => {
    if (!shop) return [];
    return shop.posts.filter((p) => p.status === "published")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [shop]);

  const postTotalPages = Math.max(1, Math.ceil(publishedPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = useMemo(() =>
    publishedPosts.slice((postPage - 1) * POSTS_PER_PAGE, postPage * POSTS_PER_PAGE),
    [publishedPosts, postPage]
  );

  useEffect(() => {
    setProductPage(1);
  }, [categoryFilter, searchQuery, sortBy]);

  useEffect(() => {
    if (typeof window === "undefined" || !shop) return;
    const key = "shop-scroll:" + shop.slug;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => window.scrollTo(0, y));
      sessionStorage.removeItem(key);
    }
    const handleRouteChange = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [shop, router.events]);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Không tìm thấy cửa hàng</h1>
          <p className="text-muted-foreground mt-2">Cửa hàng này không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <>
      <SEO title={shop.name + " — VietShop"} description={shop.description} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="pb-24">
        <ShopBanner shop={shop} />

        {featuredProducts.length > 0 && (
          <div className="container mt-10">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-heading font-bold text-foreground">Sản phẩm nổi bật</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  shopSlug={shop.slug}
                  themeColor={shop.themeColor}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        )}

        <div id="products" ref={productsTopRef} className="container mt-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">Sản phẩm</h2>
              <p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} sản phẩm</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "priceAsc" | "priceDesc")}>
                <SelectTrigger className="w-full sm:w-44 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="priceAsc">Giá thấp → cao</SelectItem>
                  <SelectItem value="priceDesc">Giá cao → thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 select-none">
            <button
              onClick={() => { setCategoryFilter("all"); setProductPage(1); }}
              style={categoryFilter === "all" ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all select-none ${
                categoryFilter === "all"
                  ? "text-white shadow-md border-0"
                  : "bg-card text-foreground border border-border hover:border-primary"
              }`}
            >
              Tất cả
            </button>
            {parentCategories.map((cat) => {
              const isActive = categoryFilter === cat.id || activeParentId === cat.id;
              const hasChildren = (childrenByParent[cat.id] || []).length > 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryFilter(cat.id); setProductPage(1); }}
                  style={isActive ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all select-none inline-flex items-center gap-1.5 ${
                    isActive
                      ? "text-white shadow-md border-0"
                      : "bg-card text-foreground border border-border hover:border-primary"
                  }`}
                >
                  {cat.name}
                  {hasChildren && <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeParentId === cat.id ? "rotate-90" : ""}`} />}
                </button>
              );
            })}
          </div>

          {activeParentId && (childrenByParent[activeParentId] || []).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 select-none border-l-2 ml-2 pl-3" style={{ borderColor: `hsl(${shop.themeColor} / 0.3)` }}>
              <button
                onClick={() => { setCategoryFilter(activeParentId); setProductPage(1); }}
                style={categoryFilter === activeParentId ? { backgroundColor: `hsl(${shop.themeColor} / 0.15)`, color: `hsl(${shop.themeColor})` } : undefined}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  categoryFilter === activeParentId
                    ? "border border-transparent"
                    : "bg-muted text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                Tất cả
              </button>
              {(childrenByParent[activeParentId] || []).map((child) => {
                const isActive = categoryFilter === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => { setCategoryFilter(child.id); setProductPage(1); }}
                    style={isActive ? { backgroundColor: `hsl(${shop.themeColor} / 0.15)`, color: `hsl(${shop.themeColor})` } : undefined}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none ${
                      isActive
                        ? "border border-transparent"
                        : "bg-muted text-muted-foreground border border-transparent hover:text-foreground"
                    }`}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          )}
          {!activeParentId && <div className="mb-3" />}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                shopSlug={shop.slug}
                themeColor={shop.themeColor}
                onAddToCart={addToCart}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
            </div>
          )}

          {filteredProducts.length > 0 && productTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
              <p className="text-sm text-muted-foreground">
                Hiển thị {(productPage - 1) * PRODUCTS_PER_PAGE + 1}-{Math.min(productPage * PRODUCTS_PER_PAGE, filteredProducts.length)} / {filteredProducts.length} sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" disabled={productPage === 1} onClick={() => changeProductPage(productPage - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: productTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => changeProductPage(page)}
                      style={productPage === page ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${productPage === page ? "text-white" : "bg-card border border-border hover:bg-muted"}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" disabled={productPage === productTotalPages} onClick={() => changeProductPage(productPage + 1)}>
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {publishedPosts.length > 0 && (
          <div id="blog" ref={postsTopRef} className="container mt-16">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-heading font-bold text-foreground">Bài viết & Tin tức</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/shop/${shop.slug}/post/${post.slug}`} className="group rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <h3 className="font-heading font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                      Đọc tiếp
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {postTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {(postPage - 1) * POSTS_PER_PAGE + 1}-{Math.min(postPage * POSTS_PER_PAGE, publishedPosts.length)} / {publishedPosts.length} bài viết
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" disabled={postPage === 1} onClick={() => changePostPage(postPage - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: postTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => changePostPage(page)}
                        style={postPage === page ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined}
                        className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${postPage === page ? "text-white" : "bg-card border border-border hover:bg-muted"}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" disabled={postPage === postTotalPages} onClick={() => changePostPage(postPage + 1)}>
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <ShopFooter shop={shop} />
      <ShopBottomBar shop={shop} />
    </>
  );
}