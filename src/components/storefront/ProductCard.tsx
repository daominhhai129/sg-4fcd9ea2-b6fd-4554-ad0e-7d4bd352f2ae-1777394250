import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/data/mock-data";

interface ProductCardProps {
  product: Product;
  shopSlug: string;
  themeColor?: string;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, shopSlug, themeColor, onAddToCart }: ProductCardProps) {
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const isOutOfStock = product.status === "outOfStock";

  return (
    <div className="group rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <Link href={"/shop/" + shopSlug + "/product/" + product.id} className="block relative aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-white/90 text-foreground text-sm font-semibold">Hết hàng</span>
          </div>
        )}
      </Link>

      <div className="p-3">
        <Link href={"/shop/" + shopSlug + "/product/" + product.id}>
          <h3 className="font-medium text-foreground line-clamp-2 text-xs leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-accent">
            {formatPrice(displayPrice)}
          </span>
          <button
            type="button"
            aria-label="Thêm vào giỏ"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColor ? `hsl(${themeColor})` : "hsl(var(--accent))" }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}