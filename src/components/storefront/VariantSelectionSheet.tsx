import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/mock-data";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product, ProductVariant } from "@/types";

interface VariantSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  mode: "cart" | "buy";
  onConfirm: (variant: ProductVariant | undefined, quantity: number) => void;
}

export function VariantSelectionSheet({ open, onOpenChange, product, mode, onConfirm }: VariantSelectionSheetProps) {
  const { t } = useLanguage();
  const variants = product.variants || [];
  const variantGroups = product.variantGroups || [];
  const hasGroups = variantGroups.length > 0;
  const primaryGroup = variantGroups[0];
  const secondaryGroup = variantGroups[1];

  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const [flatVariantId, setFlatVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) return;
    setQuantity(1);
    if (hasGroups && variants.length > 0) {
      const first = variants[0];
      setPrimaryId(first.optionIds?.[0] || null);
      setSecondaryId(first.optionIds?.[1] || null);
    } else if (variants.length > 0) {
      setFlatVariantId(variants[0].id);
    }
  }, [open, hasGroups, variants]);

  const selectedVariant = useMemo(() => {
    if (hasGroups) {
      return variants.find((v) => {
        const ids = v.optionIds || [];
        if (primaryId && ids[0] !== primaryId) return false;
        if (secondaryGroup && secondaryId && ids[1] !== secondaryId) return false;
        if (!secondaryGroup) return ids[0] === primaryId;
        return true;
      });
    }
    return variants.find((v) => v.id === flatVariantId);
  }, [hasGroups, variants, primaryId, secondaryId, flatVariantId, secondaryGroup]);

  const previewImage = selectedVariant?.image
    || (primaryId && primaryGroup?.options.find((o) => o.id === primaryId)?.image)
    || product.images[0];
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const sku = selectedVariant?.sku;
  const stockText = selectedVariant?.stock != null ? t("vsheet.stock") + " " + selectedVariant.stock : null;

  const canConfirm = variants.length === 0 || !!selectedVariant;
  const confirmLabel = mode === "buy" ? t("vsheet.buyNow") : t("vsheet.addToCart");

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(selectedVariant, quantity);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/60 pointer-events-auto"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-200 max-h-[88vh] flex flex-col">
        <div className="flex items-start gap-3 p-4 border-b border-border">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
            <Image src={previewImage} alt={product.name} fill className="object-cover" sizes="96px" />
          </div>
          <div className="flex-1 min-w-0 self-end">
            <div className="text-xl font-heading font-extrabold text-accent">{formatPrice(displayPrice)}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              {sku && <span className="font-mono">{sku}</span>}
              {sku && stockText && <span>•</span>}
              {stockText && <span>{stockText}</span>}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t("vsheet.selected")} <span className="font-semibold text-foreground">{selectedVariant?.name || "—"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
            aria-label={t("vsheet.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
          {hasGroups && primaryGroup && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">{primaryGroup.name}</div>
              <div className="flex flex-wrap gap-2">
                {primaryGroup.options.map((opt) => {
                  const active = opt.id === primaryId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrimaryId(opt.id)}
                      className={"flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all " + (active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40")}
                    >
                      {opt.image && (
                        <span className="relative w-9 h-9 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image src={opt.image} alt={opt.name} fill className="object-cover" sizes="36px" />
                        </span>
                      )}
                      <span className={"text-sm font-semibold " + (active ? "text-primary" : "text-foreground")}>{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasGroups && secondaryGroup && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">{secondaryGroup.name}</div>
              <div className="flex flex-wrap gap-2">
                {secondaryGroup.options.map((opt) => {
                  const active = opt.id === secondaryId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSecondaryId(opt.id)}
                      className={"px-3.5 py-1.5 rounded-xl border text-sm font-semibold transition-all " + (active ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/30" : "border-border bg-card text-foreground hover:border-primary/40")}
                    >
                      {opt.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!hasGroups && variants.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">{t("vsheet.pickVariant")}</div>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const active = v.id === flatVariantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFlatVariantId(v.id)}
                      className={"flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all " + (active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40")}
                    >
                      {v.image && (
                        <span className="relative w-9 h-9 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image src={v.image} alt={v.name} fill className="object-cover" sizes="36px" />
                        </span>
                      )}
                      <span className={"text-sm font-semibold " + (active ? "text-primary" : "text-foreground")}>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">{t("vsheet.quantity")}</div>
            <div className="inline-flex items-center border border-border rounded-xl">
              <button
                type="button"
                className="p-2 hover:bg-muted rounded-l-xl transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label={t("vsheet.dec")}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button
                type="button"
                className="p-2 hover:bg-muted rounded-r-xl transition-colors"
                onClick={() => setQuantity(quantity + 1)}
                aria-label={t("vsheet.inc")}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card">
          <Button
            type="button"
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={"w-full h-12 font-semibold " + (mode === "buy" ? "bg-red-600 hover:bg-red-700 text-white border-0" : "bg-accent hover:bg-accent/90 text-accent-foreground border-0")}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}