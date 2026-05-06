import { useRouter } from "next/router";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { shops } from "@/data/mock-data";
import { Home, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AllCategoriesPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const shop = shops.find((s) => s.slug === slug);

  const parentCategories = useMemo(() => {
    if (!shop) return [];
    return shop.categories.filter((c) => !c.parentId);
  }, [shop]);

  const filteredProducts = useMemo(() => {
    if (!shop) return [];
    let products = shop.products.filter((p) => !p.isHidden);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    const sorted = [...products];
    if (sortBy === "priceAsc") sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    else if (sortBy === "priceDesc") sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    return sorted;
  }, [shop, searchQuery, sortBy]);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title={"Tất cả danh mục — " + shop.name} description={"Khám phá toàn bộ danh mục và sản phẩm tại " + shop.name} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="min-h-screen bg-muted/20 pb-24 md:pb-12">
        <section
          className="py-8 md:py-12 border-b border-border"
          style={{ background: "linear-gradient(135deg, hsl(" + shop.themeColor + " / 0.12), hsl(" + shop.themeColor + " / 0.02))" }}
        >
          <div className="container">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <Link href={"/shop/" + shop.slug} className="hover:text-primary inline-flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Tất cả danh mục</span>
            </nav>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mb-1">Tất cả danh mục</h1>
            <p className="text-sm text-muted-foreground">{parentCategories.length} danh mục chính · {filteredProducts.length} sản phẩm</p>

            <div className="flex gap-2 overflow-x-auto pb-2 mt-6 -mx-1 px-1 select-none">
              <span
                style={{ backgroundColor: "hsl(" + shop.themeColor + ")" }}
                className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap text-white shadow-md border-0"
              >
                Tất cả
              </span>
              {parentCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={"/shop/" + shop.slug + "/category/" + cat.slug}
                  className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap bg-card text-foreground border border-border hover:border-primary transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="container py-6 md:py-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="pl-9 rounded-xl bg-card"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="priceAsc">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="priceDesc">Giá: Cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Không có sản phẩm phù hợp</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} shopSlug={shop.slug} themeColor={shop.themeColor} />
              ))}
            </div>
          )}
        </div>
      </main>
      <ShopFooter shop={shop} />
      <ShopBottomBar shop={shop} />
    </>
  );
}