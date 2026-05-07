import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { shops, formatPrice } from "@/data/mock-data";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopBottomBar } from "@/components/storefront/ShopBottomBar";
import { useCart } from "@/contexts/CartContext";
import { SEO } from "@/components/SEO";
import { Minus, Plus, ShoppingCart, ArrowLeft, Calendar, ArrowRight, Play, Share2, Check, Ticket, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { discountCodes } from "@/data/discount-codes";

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { addToCart, totalItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);
  const [shared, setShared] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantPreviewId, setVariantPreviewId] = useState<string | null>(null);

  const shop = shops.find((s) => s.slug === slug);
  const product = shop?.products.find((p) => p.id === id);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product?.id, product?.variants]);

  const mediaItems = product
    ? [
        ...product.images.map((src) => ({ type: "image" as const, src })),
        ...(product.videoUrl ? [{ type: "video" as const, src: product.videoUrl }] : []),
      ]
    : [];

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveImage(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  const goToSlide = (i: number) => {
    setActiveImage(i);
    api?.scrollTo(i);
  };

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

  const relatedProducts = shop.products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  const relatedPosts = shop.posts.filter((post) => post.status === "published" && post.productIds?.includes(product.id)).slice(0, 3);

  const applicableCodes = discountCodes.filter((dc) => dc.shopId === shop.id && dc.status === "active" && (!dc.productId || dc.productId === product.id));

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  const formatDiscountValue = (dc: typeof applicableCodes[number]) => dc.type === "percentage" ? "Giảm " + dc.value + "%" : "Giảm " + formatPrice(dc.value);

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const previewVariant = product.variants?.find((v) => v.id === variantPreviewId);
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const productForCart = selectedVariant ? { ...product, id: product.id + ":" + selectedVariant.id, name: product.name + " - " + selectedVariant.name, price: selectedVariant.price, salePrice: undefined, images: selectedVariant.image ? [selectedVariant.image, ...product.images] : product.images } : product;

  const handleVariantClick = (variantId: string) => {
    setSelectedVariantId(variantId);
    const v = product.variants?.find((x) => x.id === variantId);
    if (v?.image) setVariantPreviewId(variantId);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(productForCart);
    }
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(productForCart);
    }
    router.push("/shop/" + shop.slug + "/checkout");
  };

  const handleShare = async () => {
    if (!product || !shop) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: product.name, text: product.description, url };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  };

  return (
    <>
      <SEO title={product.name + " — " + shop.name} description={product.description} />
      <ShopHeader shop={shop} cartCount={totalItems} />
      <main className="container py-4 md:py-8 pb-24 md:pb-8">
        <div className="lg:max-w-[70%] lg:mx-auto">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <button
            type="button"
            onClick={() => router.push("/shop/" + shop.slug)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-foreground bg-muted hover:bg-muted/70 transition-colors"
            aria-label="Chia sẻ"
          >
            {shared ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            <span className="font-medium">{shared ? "Đã sao chép" : "Chia sẻ"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
          <div className="space-y-2 md:space-y-4">
            <div className="relative">
              <Carousel setApi={setApi} className="w-full" opts={{ loop: false }}>
                <CarouselContent className="-ml-0">
                  {mediaItems.map((item, i) => (
                    <CarouselItem key={i} className="pl-0">
                      <div className="relative aspect-square overflow-hidden bg-muted rounded-none md:rounded-2xl">
                        {item.type === "image" ? (
                          <Image src={item.src} alt={product.name} fill className="object-cover" />
                        ) : (
                          <iframe
                            src={item.src}
                            title={product.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {product.videoUrl && activeImage < product.images.length && (
                <button
                  onClick={() => goToSlide(product.images.length)}
                  className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-semibold hover:bg-black/85 transition-colors shadow-lg"
                  aria-label="Xem video sản phẩm"
                >
                  <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                  </span>
                  Xem video
                </button>
              )}
            </div>
            {mediaItems.length > 1 && (
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 px-3 md:px-0">
                {mediaItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={"relative shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 transition-colors rounded-none md:rounded-xl " + (i === activeImage ? "border-primary" : "border-border")}
                  >
                    {item.type === "image" ? (
                      <Image src={item.src} alt="" width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 md:space-y-6 px-3 md:px-0">
            <h1 className="text-xl md:text-2xl font-heading font-extrabold text-foreground">{product.name}</h1>

            <div className="flex items-baseline gap-3">
              <span className="text-xl md:text-2xl font-heading font-extrabold text-accent">
                {formatPrice(displayPrice)}
              </span>
              {selectedVariant && (
                <span className="text-xs text-muted-foreground">{selectedVariant.name}</span>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Chọn biến thể</div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const active = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantClick(v.id)}
                        className={"flex items-center gap-2 text-left pl-1.5 pr-3 py-1.5 rounded-xl border transition-all " + (active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40")}
                      >
                        {v.image ? (
                          <span className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                            <Image src={v.image} alt={v.name} fill className="object-cover" />
                          </span>
                        ) : (
                          <span className="w-10 h-10 rounded-lg bg-muted shrink-0" />
                        )}
                        <span className="flex flex-col min-w-0">
                          <span className={"text-sm font-semibold truncate " + (active ? "text-primary" : "text-foreground")}>{v.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-bold text-accent">{formatPrice(v.price)}</span>
                            {v.sku && <span className="text-[10px] text-muted-foreground font-mono">{v.sku}</span>}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {applicableCodes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Ticket className="w-4 h-4 text-accent" />
                  Mã giảm giá
                </div>
                <div className="flex flex-wrap gap-2">
                  {applicableCodes.map((dc) => (
                    <button
                      key={dc.id}
                      type="button"
                      onClick={() => handleCopyCode(dc.code)}
                      className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-bold text-accent">{dc.code}</span>
                        <span className="text-[11px] text-muted-foreground">{formatDiscountValue(dc)}{dc.minOrderValue ? " • Đơn từ " + formatPrice(dc.minOrderValue) : ""}</span>
                      </div>
                      <span className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                        {copiedCode === dc.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            <div className="hidden md:flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground border-0 h-12 transition-colors font-semibold"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                size="lg"
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white border-0 font-semibold"
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {product.longDescription && (
          <div className="mt-12">
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">Mô tả chi tiết</h2>
            <div
              className="prose prose-sm md:prose-base max-w-none text-foreground/90 [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ul>li]:my-1 [&_img]:rounded-2xl [&_img]:my-5 [&_img]:w-full [&_img]:shadow-md [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-heading font-bold text-foreground mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
        </div>
      </main>
      <ShopFooter shop={shop} />
      <ShopBottomBar shop={shop} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />

      <Dialog open={!!previewVariant?.image} onOpenChange={(open) => { if (!open) setVariantPreviewId(null); }}>
        <DialogContent className="max-w-xs sm:max-w-sm p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">{previewVariant?.name}</DialogTitle>
          {previewVariant?.image && (
            <button
              type="button"
              onClick={() => setVariantPreviewId(null)}
              className="relative aspect-square w-full bg-muted rounded-2xl overflow-hidden"
            >
              <Image src={previewVariant.image} alt={previewVariant.name} fill className="object-cover" sizes="(max-width: 640px) 80vw, 384px" />
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}