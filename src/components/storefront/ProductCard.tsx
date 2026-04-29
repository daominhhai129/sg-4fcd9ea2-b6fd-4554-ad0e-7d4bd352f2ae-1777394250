import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="group rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <Link href={"/shop/" + shopSlug + "/product/" + product.id} className="block relative aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.status === "outOfStock" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-white/90 text-foreground text-sm font-semibold">Hết hàng</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={"/shop/" + shopSlug + "/product/" + product.id}>
          <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2">
          <span className="text-base font-bold text-accent">
            {formatPrice(displayPrice)}
          </span>
        </div>

        <Button
          size="sm"
          className="w-full mt-3 text-white border-0 text-xs h-9 hover:opacity-90 transition-opacity"
          style={themeColor ? { backgroundColor: `hsl(${themeColor})` } : undefined}
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