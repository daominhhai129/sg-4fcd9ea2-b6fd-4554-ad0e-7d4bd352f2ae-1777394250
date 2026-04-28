import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { shops } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBanner } from "@/components/storefront/ShopBanner";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ShopPage() {
  const router = useRouter();
  const { slug, category } = router.query;
  const { addToCart, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const shop = shops.find((s) => s.slug === slug);

  const filteredProducts = useMemo(() => {
    if (!shop) return [];
    let products = shop.products;
    if (category) {
      const cat = shop.categories.find((c) => c.slug === category);
      if (cat) products = products.filter((p) => p.categoryId === cat.id);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    return products;
  }, [shop, category, searchQuery]);

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

  return (
    <>
      <SEO title={shop.name + " — VietShop"} description={shop.description} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="pb-16">
        <ShopBanner shop={shop} />

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

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant={!category ? "default" : "outline"}
              className={"cursor-pointer " + (!category ? "gradient-primary text-white border-0" : "")}
              onClick={() => router.push("/shop/" + shop.slug, undefined, { shallow: true })}
            >
              Tất cả
            </Badge>
            {shop.categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={category === cat.slug ? "default" : "outline"}
                className={"cursor-pointer " + (category === cat.slug ? "gradient-primary text-white border-0" : "")}
                onClick={() => router.push("/shop/" + shop.slug + "?category=" + cat.slug, undefined, { shallow: true })}
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                shopSlug={shop.slug}
                onAddToCart={addToCart}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}