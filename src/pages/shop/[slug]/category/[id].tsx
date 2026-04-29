import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { shops } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Search, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRODUCTS_PER_PAGE = 24;

export default function CategoryPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { addToCart, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const shop = shops.find((s) => s.slug === slug);
  const category = shop?.categories.find((c) => c.slug === id || c.id === id);

  const filteredProducts = useMemo(() => {
    if (!shop || !category) return [];
    let products = shop.products.filter((p) => p.categoryId === category.id);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    return products;
  }, [shop, category, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE),
    [filteredProducts, page]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, id]);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold">Không tìm thấy cửa hàng</h1>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <>
        <ShopHeader shop={shop} cartCount={totalItems} />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-heading font-bold">Không tìm thấy danh mục</h1>
          <p className="text-muted-foreground mt-2">Danh mục này không tồn tại.</p>
          <Link href={`/shop/${shop.slug}`} className="inline-block mt-4 text-primary font-semibold hover:underline">
            ← Quay lại cửa hàng
          </Link>
        </main>
        <ShopBottomBar shop={shop} />
      </>
    );
  }

  return (
    <>
      <SEO title={`${category.name} — ${shop.name}`} description={category.description || `Sản phẩm ${category.name} tại ${shop.name}`} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="pb-24">
        <div className="container pt-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={`/shop/${shop.slug}`} className="hover:text-primary inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Trang chủ
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{category.name}</h1>
              {category.description && <p className="text-sm text-muted-foreground mt-1">{category.description}</p>}
              <p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} sản phẩm</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm trong danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mt-6 -mx-1 px-1 select-none">
            <Link
              href={`/shop/${shop.slug}`}
              className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap bg-card text-foreground border border-border hover:border-primary transition-all"
            >
              Tất cả
            </Link>
            {shop.categories.map((cat) => {
              const active = cat.id === category.id;
              return (
                <Link
                  key={cat.id}
                  href={`/shop/${shop.slug}/category/${cat.slug}`}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "gradient-primary text-white shadow-md"
                      : "bg-card text-foreground border border-border hover:border-primary"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} shopSlug={shop.slug} onAddToCart={addToCart} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Không có sản phẩm nào trong danh mục này.</p>
            </div>
          )}

          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
              <p className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * PRODUCTS_PER_PAGE + 1}-{Math.min(page * PRODUCTS_PER_PAGE, filteredProducts.length)} / {filteredProducts.length} sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" disabled={page === 1} onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 200, behavior: "smooth" }); }}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 200, behavior: "smooth" }); }}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${page === p ? "gradient-primary text-white" : "bg-card border border-border hover:bg-muted"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" disabled={page === totalPages} onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 200, behavior: "smooth" }); }}>
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <ShopBottomBar shop={shop} />
    </>
  );
}