import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { shops, formatPrice } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Minus, Plus, ShoppingCart, ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { addToCart, totalItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const shop = shops.find((s) => s.slug === slug);
  const product = shop?.products.find((p) => p.id === id);

  if (!shop || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Không tìm thấy sản phẩm</h1>
          <p className="text-muted-foreground mt-2">Sản phẩm này không tồn tại.</p>
        </div>
      </div>
    );
  }

  const category = shop.categories.find((c) => c.id === product.categoryId);
  const relatedProducts = shop.products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  const relatedPosts = shop.posts.filter((post) => post.status === "published" && post.productIds?.includes(product.id)).slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <>
      <SEO title={product.name + " — " + shop.name} description={product.description} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="container py-8 pb-24 md:pb-8">
        <Link href={"/shop/" + shop.slug} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={"w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors " + (i === activeImage ? "border-primary" : "border-border")}
                  >
                    <Image src={img} alt="" width={80} height={80} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {category && <Badge variant="outline">{category.name}</Badge>}
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-heading font-extrabold text-accent">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Số lượng:</span>
              <div className="flex items-center border border-border rounded-xl">
                <button className="p-2 hover:bg-muted transition-colors rounded-l-xl" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                <button className="p-2 hover:bg-muted transition-colors rounded-r-xl" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 text-white border-0 h-12 hover:opacity-90 transition-opacity"
                style={shop.themeColor ? { backgroundColor: `hsl(${shop.themeColor})` } : undefined}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-heading font-bold text-foreground mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} shopSlug={shop.slug} themeColor={shop.themeColor} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-heading font-bold text-foreground mb-6">Bài viết liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={"/shop/" + shop.slug + "/post/" + post.slug}
                  className="group rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                    <h3 className="font-heading font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary">
                      Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <ShopBottomBar shop={shop} />
    </>
  );
}