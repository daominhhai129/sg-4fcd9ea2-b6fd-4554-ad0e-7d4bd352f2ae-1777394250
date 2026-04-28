import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { formatPrice } from "@/data/mock-data";

interface ProductCardProps {
  product: Product;
  shopSlug: string;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, shopSlug, onAddToCart }: ProductCardProps) {
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="group rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <Link href={"/shop/" + shopSlug + "/product/" + product.id} className="block relative aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold">
            -{discountPercent}%
          </span>
        )}
        {product.status === "outOfStock" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-white/90 text-foreground text-sm font-semibold">Hết hàng</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={"/shop/" + shopSlug + "/product/" + product.id}>
          <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount})</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-accent">
            {formatPrice(hasDiscount ? product.salePrice! : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full mt-3 gradient-primary text-white border-0 text-xs h-9"
          disabled={product.status === "outOfStock"}
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(product);
          }}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
}