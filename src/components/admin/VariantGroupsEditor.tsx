import { useRef, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, X, ImagePlus, Layers, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductVariant, ProductVariantGroup, ProductVariantOption } from "@/types";

interface Props {
  groups: ProductVariantGroup[];
  variants: ProductVariant[];
  onGroupsChange: (groups: ProductVariantGroup[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const newId = (prefix: string) => prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);

const formatNumber = (n: number) => n ? n.toLocaleString("vi-VN") : "";
const parseNumber = (s: string) => Number(s.replace(/\D/g, "")) || 0;

export function VariantGroupsEditor({ groups, variants, onGroupsChange, onVariantsChange }: Props) {
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkSku, setBulkSku] = useState("");
  const primary = groups[0];
  const secondary = groups[1];

  const updateGroup = (groupId: string, patch: Partial<ProductVariantGroup>) => {
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, ...patch } : g));
  };

  const addPrimary = () => {
    if (primary) return;
    const g: ProductVariantGroup = { id: newId("g"), name: "Phân loại chính", hasImage: true, options: [{ id: newId("o"), name: "" }] };
    onGroupsChange([g, ...(secondary ? [secondary] : [])]);
  };

  const addSecondary = () => {
    if (secondary || !primary) return;
    const g: ProductVariantGroup = { id: newId("g"), name: "Phân loại phụ", hasImage: false, options: [{ id: newId("o"), name: "" }] };
    onGroupsChange([primary, g]);
  };

  const removeGroup = (groupId: string) => {
    const next = groups.filter((g) => g.id !== groupId);
    onGroupsChange(next);
    if (next.length === 0) onVariantsChange([]);
  };

  const addOption = (groupId: string) => {
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, options: [...g.options, { id: newId("o"), name: "" }] } : g));
  };

  const updateOption = (groupId: string, optionId: string, patch: Partial<ProductVariantOption>) => {
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, options: g.options.map((o) => o.id === optionId ? { ...o, ...patch } : o) } : g));
  };

  const removeOption = (groupId: string, optionId: string) => {
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g));
  };

  const handleOptionImageUpload = (groupId: string, optionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateOption(groupId, optionId, { image: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const matrix = useMemo(() => {
    if (!primary || primary.options.length === 0) return [] as { key: string; optionIds: string[]; labels: string[]; image?: string }[];
    const primaryOpts = primary.options.filter((o) => o.name.trim() !== "");
    const secondaryOpts = secondary?.options.filter((o) => o.name.trim() !== "") || [];
    const rows: { key: string; optionIds: string[]; labels: string[]; image?: string }[] = [];
    primaryOpts.forEach((p) => {
      if (secondaryOpts.length === 0) {
        rows.push({ key: p.id, optionIds: [p.id], labels: [p.name], image: p.image });
      } else {
        secondaryOpts.forEach((s) => {
          rows.push({ key: p.id + "_" + s.id, optionIds: [p.id, s.id], labels: [p.name, s.name], image: p.image });
        });
      }
    });
    return rows;
  }, [primary, secondary]);

  const variantByKey = useMemo(() => {
    const map: Record<string, ProductVariant> = {};
    variants.forEach((v) => {
      if (v.optionIds && v.optionIds.length > 0) {
        map[v.optionIds.join("_")] = v;
      }
    });
    return map;
  }, [variants]);

  const updateMatrixCell = (key: string, optionIds: string[], labels: string[], image: string | undefined, field: "price" | "sku", value: string) => {
    const existing = variantByKey[key];
    const next: ProductVariant = existing ? { ...existing } : {
      id: newId("v"),
      name: labels.join(" - "),
      price: 0,
      optionIds,
      image,
    };
    if (field === "price") next.price = parseNumber(value);
    if (field === "sku") next.sku = value.trim() || undefined;
    next.name = labels.join(" - ");
    next.image = image;
    next.optionIds = optionIds;
    const filtered = variants.filter((v) => (v.optionIds || []).join("_") !== key);
    onVariantsChange([...filtered, next]);
  };

  const applyBulk = () => {
    const priceVal = parseNumber(bulkPrice);
    const skuVal = bulkSku.trim();
    if (priceVal === 0 && skuVal === "") return;
    const next: ProductVariant[] = matrix.map((row, idx) => {
      const existing = variantByKey[row.key];
      const v: ProductVariant = existing ? { ...existing } : {
        id: newId("v"),
        name: row.labels.join(" - "),
        price: 0,
        optionIds: row.optionIds,
        image: row.image,
      };
      if (priceVal > 0) v.price = priceVal;
      if (skuVal !== "") v.sku = skuVal + "-" + (idx + 1).toString().padStart(2, "0");
      v.name = row.labels.join(" - ");
      v.image = row.image;
      v.optionIds = row.optionIds;
      return v;
    });
    onVariantsChange(next);
  };

  if (!primary) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Phân loại sản phẩm
          </Label>
        </div>
        <p className="text-xs text-muted-foreground mb-2">Thêm phân loại chính (có ảnh) và phân loại phụ (không ảnh) — giống Shopee.</p>
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addPrimary}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Thêm phân loại chính
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold flex items-center gap-1.5">
        <Layers className="w-4 h-4" />
        Phân loại sản phẩm
      </Label>

      {[primary, secondary].filter(Boolean).map((group, gIdx) => {
        const g = group as ProductVariantGroup;
        return (
          <div key={g.id} className="rounded-xl border border-border p-3 space-y-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary shrink-0">{gIdx === 0 ? "Chính" : "Phụ"}</span>
              <Input
                value={g.name}
                onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                placeholder={gIdx === 0 ? "VD: Màu sắc" : "VD: Kích thước"}
                className="rounded-lg h-9 text-sm font-semibold"
              />
              <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive h-9 w-9" onClick={() => removeGroup(g.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {g.options.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  {g.hasImage && (
                    <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 border-border bg-muted/40">
                      {o.image ? (
                        <>
                          <Image src={o.image} alt={o.name || "option"} fill className="object-cover" />
                          <button type="button" onClick={() => updateOption(g.id, o.id, { image: undefined })} className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => fileInputs.current[o.id]?.click()} className="w-full h-full flex items-center justify-center hover:bg-muted">
                          <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      <input ref={(el) => { fileInputs.current[o.id] = el; }} type="file" accept="image/*" onChange={(e) => handleOptionImageUpload(g.id, o.id, e)} className="hidden" />
                    </div>
                  )}
                  <Input
                    value={o.name}
                    onChange={(e) => updateOption(g.id, o.id, { name: e.target.value })}
                    placeholder={gIdx === 0 ? "VD: Đỏ" : "VD: M"}
                    className="rounded-lg flex-1 h-9 text-sm"
                  />
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive h-9 w-9" onClick={() => removeOption(g.id, o.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-8" onClick={() => addOption(g.id)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm tùy chọn
              </Button>
            </div>
          </div>
        );
      })}

      {!secondary && (
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addSecondary}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Thêm phân loại phụ
        </Button>
      )}

      {matrix.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Bảng giá theo tổ hợp ({matrix.length})
          </div>
          <div className="bg-primary/5 border-b border-border p-2.5 space-y-2">
            <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-primary" />
              Áp dụng cho tất cả phân loại
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={bulkPrice}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setBulkPrice(raw ? Number(raw).toLocaleString("vi-VN") : "");
                }}
                placeholder="Giá đồng loạt"
                inputMode="numeric"
                className="rounded-lg h-9 text-sm sm:flex-1"
              />
              <Input
                value={bulkSku}
                onChange={(e) => setBulkSku(e.target.value)}
                placeholder="SKU prefix (tự đánh số)"
                className="rounded-lg h-9 text-sm sm:flex-1"
              />
              <Button
                type="button"
                size="sm"
                className="rounded-lg h-9 bg-primary hover:bg-primary/90 shrink-0"
                onClick={applyBulk}
                disabled={!bulkPrice && !bulkSku.trim()}
              >
                Áp dụng
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Điền và bấm Áp dụng để fill toàn bộ. SKU sẽ tự đánh số -01, -02… Sau đó bạn có thể chỉnh từng dòng nếu cần.</p>
          </div>
          <div className="divide-y divide-border">
            {matrix.map((row) => {
              const v = variantByKey[row.key];
              return (
                <div key={row.key} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5">
                  {row.image && (
                    <div className="relative shrink-0 w-10 h-10 rounded-md overflow-hidden border border-border bg-muted/40">
                      <Image src={row.image} alt={row.labels[0]} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-sm font-medium truncate">{row.labels.join(" / ")}</div>
                  <Input
                    value={formatNumber(v?.price || 0)}
                    onChange={(e) => updateMatrixCell(row.key, row.optionIds, row.labels, row.image, "price", e.target.value)}
                    placeholder="Giá"
                    inputMode="numeric"
                    className="rounded-lg sm:w-32 h-9 text-sm"
                  />
                  <Input
                    value={v?.sku || ""}
                    onChange={(e) => updateMatrixCell(row.key, row.optionIds, row.labels, row.image, "sku", e.target.value)}
                    placeholder="SKU"
                    className="rounded-lg sm:w-32 h-9 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}