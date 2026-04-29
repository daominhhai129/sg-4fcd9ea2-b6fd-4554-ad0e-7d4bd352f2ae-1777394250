import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { shops } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Share2, Sparkles } from "lucide-react";

export default function PostDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { addToCart, totalItems } = useCart();

  const shop = shops.find((s) => s.slug === slug);
  const post = shop?.posts.find((p) => p.slug === id || p.id === id);

  if (!shop || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Không tìm thấy bài viết</h1>
          <p className="text-muted-foreground mt-2">Bài viết này không tồn tại hoặc đã bị xóa.</p>
          {shop && (
            <Link href={`/shop/${shop.slug}`}>
              <Button className="mt-4 rounded-xl gradient-primary text-white">Quay lại cửa hàng</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const relatedProducts = shop.products.filter((p) => post.productIds?.includes(p.id));
  const otherPosts = shop.posts
    .filter((p) => p.id !== post.id && p.status === "published")
    .slice(0, 3);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <>
      <SEO title={`${post.title} — ${shop.name}`} description={post.excerpt} image={post.coverImage} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="pb-24">
        <div className="container max-w-4xl pt-6">
          <Link href={`/shop/${shop.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Quay lại cửa hàng
          </Link>
        </div>

        <article className="container max-w-4xl mt-4">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted mb-6">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>

          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-foreground leading-snug">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ bài viết</span>
            </div>
          </div>

          <p className="mt-6 text-base md:text-lg text-foreground/80 font-medium leading-relaxed border-l-4 border-primary pl-4">
            {post.excerpt}
          </p>

          <div
            className="prose prose-slate max-w-none mt-8 text-foreground/90 leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-base prose-p:leading-[1.8] prose-p:mb-4 prose-ul:my-4 prose-li:my-1 prose-strong:text-foreground prose-img:rounded-xl prose-img:my-6 prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {post.images.map((img, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                  <Image src={img} alt={`${post.title} ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </article>

        {relatedProducts.length > 0 && (
          <div className="container max-w-4xl mt-12">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-heading font-bold text-foreground">Sản phẩm liên quan</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} shopSlug={shop.slug} themeColor={shop.themeColor} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}

        {otherPosts.length > 0 && (
          <div className="container max-w-4xl mt-12">
            <h2 className="text-xl font-heading font-bold text-foreground mb-5">Bài viết khác</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {otherPosts.map((p) => (
                <Link key={p.id} href={`/shop/${shop.slug}/post/${p.slug}`} className="group rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image src={p.coverImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(p.createdAt)}</span>
                    </div>
                    <h3 className="font-heading font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
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