import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/data/mock-data";

interface ProductCardProps {
  product: Product;
  shopSlug: string;
  themeColor?: string;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, shopSlug, themeColor, onAddToCart }: ProductCardProps) {
  void themeColor;
  void onAddToCart;
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

  return (
    <div className="group rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <Link href={"/shop/" + shopSlug + "/product/" + product.id} className="block relative aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-3">
        <Link href={"/shop/" + shopSlug + "/product/" + product.id}>
          <h3 className="font-medium text-foreground line-clamp-2 text-xs leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-0.5">
          <span className="text-xs font-bold text-accent">
            {formatPrice(displayPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}