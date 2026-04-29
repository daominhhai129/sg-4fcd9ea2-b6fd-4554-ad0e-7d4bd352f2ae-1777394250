import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { shops } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBanner } from "@/components/storefront/ShopBanner";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Search, Sparkles, ChevronLeft, ChevronRight, FileText, Calendar, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PRODUCTS_PER_PAGE = 24;
const POSTS_PER_PAGE = 8;

export default function ShopPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [productPage, setProductPage] = useState(1);
  const [postPage, setPostPage] = useState(1);

  const shop = shops.find((s) => s.slug === slug);

  const featuredProducts = useMemo(() => {
    if (!shop) return [];
    return shop.products.filter((p) => p.featured);
  }, [shop]);

  const filteredProducts = useMemo(() => {
    if (!shop) return [];
    let products = shop.products;
    if (categoryFilter !== "all") {
      products = products.filter((p) => p.categoryId === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    return products;
  }, [shop, categoryFilter, searchQuery]);

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
  }, [categoryFilter, searchQuery]);

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

        <div className="container mt-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">Sản phẩm</h2>
              <p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} sản phẩm</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 select-none">
            <button
              onClick={() => { setCategoryFilter("all"); setProductPage(1); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all select-none ${
                categoryFilter === "all"
                  ? "gradient-primary text-white shadow-md"
                  : "bg-card text-foreground border border-border hover:border-primary"
              }`}
            >
              Tất cả
            </button>
            {shop.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategoryFilter(cat.id); setProductPage(1); }}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all select-none ${
                  categoryFilter === cat.id
                    ? "gradient-primary text-white shadow-md"
                    : "bg-card text-foreground border border-border hover:border-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                <Button variant="outline" size="sm" className="rounded-xl" disabled={productPage === 1} onClick={() => { setProductPage((p) => p - 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: productTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => { setProductPage(page); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${productPage === page ? "gradient-primary text-white" : "bg-card border border-border hover:bg-muted"}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" disabled={productPage === productTotalPages} onClick={() => { setProductPage((p) => p + 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}>
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {publishedPosts.length > 0 && (
          <div className="container mt-16">
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
                  <Button variant="outline" size="sm" className="rounded-xl" disabled={postPage === 1} onClick={() => setPostPage((p) => p - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: postTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPostPage(page)}
                        className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${postPage === page ? "gradient-primary text-white" : "bg-card border border-border hover:bg-muted"}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" disabled={postPage === postTotalPages} onClick={() => setPostPage((p) => p + 1)}>
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <ShopBottomBar shop={shop} />
    </>
  );
}