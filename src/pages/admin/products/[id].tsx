import { useRouter } from "next/router";
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, products as allProducts } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, X, ImagePlus, Layers, Plus, Video, Link2, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import NextDynamic from "next/dynamic";

const ReactQuill = NextDynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const shop = shops[0];
const MAX_IMAGES = 8;
const MAX_VIDEOS = 2;
const MAX_VARIANTS = 20;
const MAX_DESCRIPTION_LENGTH = 3000;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

export default function ProductEditPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const idParam = typeof router.query.id === "string" ? router.query.id : "";
  const isNew = idParam === "new";

  const editingProduct = useMemo<Product | null>(() => {
    if (!router.isReady || isNew || !idParam) return null;
    return allProducts.find((p) => p.id === idParam) || null;
  }, [router.isReady, idParam, isNew]);

  const [formImages, setFormImages] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [videoLinks, setVideoLinks] = useState<string[]>([""]);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [featured, setFeatured] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [stockInput, setStockInput] = useState("");
  const [categoryId, setCategoryId] = useState(shop.categories[0]?.id || "");
  const [variants, setVariants] = useState<{ id: string; name: string; price: string; sku: string; image: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string; values: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!router.isReady || hydrated) return;
    if (isNew) {
      setHydrated(true);
      return;
    }
    if (editingProduct) {
      setName(editingProduct.name);
      setSku((editingProduct as unknown as { sku?: string }).sku || "");
      setFormImages(editingProduct.images || []);
      const longDesc = (editingProduct as unknown as { longDescription?: string }).longDescription;
      setShortDesc(longDesc ? (editingProduct.description || "") : "");
      setDescription(longDesc || editingProduct.description || "");
      setVideoLinks(
        (editingProduct as unknown as { videoLinks?: string[] }).videoLinks?.length
          ? (editingProduct as unknown as { videoLinks?: string[] }).videoLinks!
          : [""]
      );
      setAffiliateLink((editingProduct as unknown as { affiliateLink?: string }).affiliateLink || "");
      setFeatured(editingProduct.featured || false);
      setPriceInput(editingProduct.price ? editingProduct.price.toLocaleString("vi-VN") : "");
      setStockInput(editingProduct.stock ? String(editingProduct.stock) : "0");
      setCategoryId(editingProduct.categoryId);
      setVariants((editingProduct.variants || []).map((v) => ({
        id: v.id, name: v.name, price: v.price ? v.price.toLocaleString("vi-VN") : "", sku: v.sku || "", image: v.image || ""
      })));
      setProperties((editingProduct.properties || []).map((p) => ({ id: p.id, name: p.name, values: p.values.join(", ") })));
      setHydrated(true);
    }
  }, [router.isReady, isNew, editingProduct, hydrated]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_IMAGES - formImages.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImages((prev) => prev.length >= MAX_IMAGES ? prev : [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    setThumbnailIndex((prev) => index === prev ? 0 : index < prev ? prev - 1 : prev);
  };

  const addVideoLink = () => {
    if (videoLinks.length < MAX_VIDEOS) setVideoLinks((prev) => [...prev, ""]);
  };

  const addVariant = () => {
    setVariants((prev) => prev.length >= MAX_VARIANTS ? prev : [...prev, { id: "v-" + Date.now() + "-" + prev.length, name: "", price: "", sku: "", image: "" }]);
  };

  const updateVariant = (id: string, field: "name" | "price" | "sku" | "image", value: string) => {
    setVariants((prev) => prev.map((v) => {
      if (v.id !== id) return v;
      if (field === "price") {
        const raw = value.replace(/\D/g, "");
        return { ...v, price: raw ? Number(raw).toLocaleString("vi-VN") : "" };
      }
      return { ...v, [field]: value };
    }));
  };

  const handleVariantImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateVariant(id, "image", reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getPlainTextLength = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").length;

  const handleDescriptionChange = (value: string) => {
    if (getPlainTextLength(value) <= MAX_DESCRIPTION_LENGTH) setDescription(value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPriceInput(raw ? Number(raw).toLocaleString("vi-VN") : "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanedVariants: ProductVariant[] = variants
      .filter((v) => v.name.trim() !== "")
      .map((v) => ({ id: v.id, name: v.name.trim(), price: Number(v.price.replace(/\D/g, "")) || 0, sku: v.sku.trim() || undefined, image: v.image || undefined }));
    const cleanedProps = properties
      .filter((p) => p.name.trim() && p.values.trim())
      .map((p) => ({ id: p.id, name: p.name.trim(), values: p.values.split(",").map((v) => v.trim()).filter(Boolean) }));
    const orderedImages = formImages.length > 0 ? [...formImages] : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"];
    if (thumbnailIndex > 0 && thumbnailIndex < orderedImages.length) {
      const [thumb] = orderedImages.splice(thumbnailIndex, 1);
      orderedImages.unshift(thumb);
    }
    const data = {
      name,
      description: shortDesc.trim() || description.replace(/<[^>]*>/g, "").slice(0, 200),
      longDescription: description,
      price: Number(priceInput.replace(/\D/g, "")) || 0,
      stock: Number(stockInput) || 0,
      categoryId,
      properties: cleanedProps,
      images: orderedImages,
      videoLinks: videoLinks.filter((v) => v.trim() !== ""),
      affiliateLink: affiliateLink.trim() || undefined,
      featured,
      variants: cleanedVariants,
      categoryName: shop.categories.find((c) => c.id === categoryId)?.name || "",
    };

    if (isNew) {
      const newProduct: Product = {
        id: "p-new-" + Date.now(),
        shopId: shop.id,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        rating: 0,
        reviewCount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        ...data,
      } as Product;
      allProducts.unshift(newProduct);
      shop.products = allProducts.filter((p) => p.shopId === shop.id);
    } else if (editingProduct) {
      Object.assign(editingProduct, data, { updatedAt: new Date().toISOString(), sku });
    }
    router.push("/admin/products");
  };

  const handleDelete = () => {
    if (!editingProduct) return;
    if (!confirm("Xóa sản phẩm này?")) return;
    const idx = allProducts.findIndex((p) => p.id === editingProduct.id);
    if (idx !== -1) allProducts.splice(idx, 1);
    shop.products = allProducts.filter((p) => p.shopId === shop.id);
    router.push("/admin/products");
  };

  if (!router.isReady) return null;
  if (!isNew && !editingProduct) {
    return (
      <AdminLayout title="Không tìm thấy">
        <SEO title="Không tìm thấy sản phẩm" />
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Sản phẩm không tồn tại.</p>
          <Link href="/admin/products"><Button variant="outline" className="rounded-xl">Quay lại danh sách</Button></Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEO title={(isNew ? t("prod.addNewTitle") : t("prod.editTitle")) + " — Admin"} />
      <AdminLayout title={isNew ? t("prod.addNewTitle") : t("prod.editTitle")}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          {!isNew && (
            <Button type="button" variant="outline" size="sm" className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Xóa
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
            <div>
              <Label className="text-sm font-semibold">{t("prod.name")} <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl mt-1.5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold">{t("prod.sku")}</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t("prod.skuPh")} className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("prod.price")} <span className="text-destructive">*</span></Label>
                <Input type="text" inputMode="numeric" value={priceInput} onChange={handlePriceChange} required placeholder="0" className="rounded-xl mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Tồn kho</Label>
                <Input type="number" min="0" value={stockInput} onChange={(e) => setStockInput(e.target.value.replace(/\D/g, ""))} placeholder="0" className="rounded-xl mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">{t("nav.categories")}</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {shop.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-sm font-semibold">{t("prod.images").replace("{n}", String(MAX_IMAGES))}</Label>
              <span className="text-xs text-muted-foreground">{formImages.length}/{MAX_IMAGES}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {formImages.map((img, idx) => (
                <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${idx === thumbnailIndex ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`} onClick={() => setThumbnailIndex(idx)}>
                  <Image src={img} alt={`#${idx + 1}`} fill className="object-cover" />
                  {idx === thumbnailIndex && (
                    <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {t("prod.thumb")}
                    </div>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formImages.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{t("prod.addImage")}</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            {formImages.length > 0 && <p className="text-xs text-muted-foreground mt-2">{t("prod.thumbHint")}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
            <div>
              <Label className="text-sm font-semibold">{t("prod.shortDesc")}</Label>
              <p className="text-xs text-muted-foreground mb-1.5">{t("prod.shortDescTip")}</p>
              <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value.slice(0, 250))} placeholder={t("prod.shortDescPh")} rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{shortDesc.length}/250</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-semibold">{t("prod.desc")}</Label>
                <span className="text-xs text-muted-foreground">{getPlainTextLength(description)}/{MAX_DESCRIPTION_LENGTH}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">{t("prod.descTip")}</p>
              <div className="rounded-xl overflow-hidden border border-border [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:font-body [&_.ql-editor_img]:rounded-lg [&_.ql-editor_img]:my-2">
                <ReactQuill theme="snow" value={description} onChange={handleDescriptionChange} modules={quillModules} placeholder={t("prod.descPh")} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Biến thể sản phẩm
              </Label>
              <span className="text-xs text-muted-foreground">{variants.length}/{MAX_VARIANTS}</span>
            </div>
            <p className="text-xs text-muted-foreground">VD: Size S/M/L, 13 inch / 14 inch / 15 inch, màu sắc...</p>
            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v) => (
                  <div key={v.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-xl border border-border">
                    <div className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-border bg-muted/40">
                      {v.image ? (
                        <>
                          <Image src={v.image} alt={v.name || "Variant"} fill className="object-cover" />
                          <button type="button" onClick={() => updateVariant(v.id, "image", "")} className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-destructive/80">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => variantImageInputRefs.current[v.id]?.click()} className="w-full h-full flex items-center justify-center hover:bg-muted transition-colors" aria-label="Tải ảnh biến thể">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                        </button>
                      )}
                      <input ref={(el) => { variantImageInputRefs.current[v.id] = el; }} type="file" accept="image/*" onChange={(e) => handleVariantImageUpload(v.id, e)} className="hidden" />
                    </div>
                    <Input value={v.name} onChange={(e) => updateVariant(v.id, "name", e.target.value)} placeholder="Tên biến thể (VD: Size M)" className="rounded-xl flex-1" />
                    <Input value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} placeholder="SKU" className="rounded-xl sm:w-32" />
                    <div className="flex items-center gap-2">
                      <Input value={v.price} onChange={(e) => updateVariant(v.id, "price", e.target.value)} placeholder="Giá" inputMode="numeric" className="rounded-xl flex-1 sm:w-36" />
                      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => setVariants((prev) => prev.filter((x) => x.id !== v.id))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addVariant} disabled={variants.length >= MAX_VARIANTS}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Thêm biến thể
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Thuộc tính sản phẩm
              </Label>
              <span className="text-xs text-muted-foreground">{properties.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">VD: Thương hiệu: Apple | Màu sắc: Đen, Trắng, Xanh | Chất liệu: Nhôm</p>
            {properties.length > 0 && (
              <div className="space-y-2">
                {properties.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-xl border border-border">
                    <Input value={p.name} onChange={(e) => setProperties((prev) => prev.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x))} placeholder="Tên thuộc tính" className="rounded-xl sm:w-48" />
                    <div className="flex items-center gap-2 flex-1">
                      <Input value={p.values} onChange={(e) => setProperties((prev) => prev.map((x) => x.id === p.id ? { ...x, values: e.target.value } : x))} placeholder="Giá trị, phân cách dấu phẩy" className="rounded-xl flex-1" />
                      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => setProperties((prev) => prev.filter((x) => x.id !== p.id))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setProperties((prev) => [...prev, { id: "prop-" + Date.now() + "-" + prev.length, name: "", values: "" }])}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Thêm thuộc tính
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Video className="w-4 h-4" />
              {t("prod.video").replace("{n}", String(MAX_VIDEOS))}
            </Label>
            {videoLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={link} onChange={(e) => setVideoLinks((prev) => prev.map((v, i) => i === idx ? e.target.value : v))} placeholder={t("prod.videoPh")} className="pl-10 rounded-xl" />
                </div>
                {videoLinks.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => setVideoLinks((prev) => prev.filter((_, i) => i !== idx))}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {videoLinks.length < MAX_VIDEOS && (
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addVideoLink}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {t("prod.addVideo")}
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div>
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" />
                {t("prod.affiliate")}
              </Label>
              <p className="text-xs text-muted-foreground mb-1.5">{t("prod.affiliateTip")}</p>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder={t("prod.affiliatePh")} className="pl-10 rounded-xl" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <Label className="text-sm font-semibold cursor-pointer">{t("prod.featured")}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("prod.featuredTip")}</p>
                </div>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
          </div>

          <div className="sticky bottom-0 -mx-3 sm:mx-0 px-3 sm:px-0 py-4 bg-background/95 backdrop-blur-sm border-t border-border flex gap-3">
            <Link href="/admin/products" className="flex-1">
              <Button type="button" variant="outline" className="w-full rounded-xl">{t("common.cancel")}</Button>
            </Link>
            <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">{t("prod.save")}</Button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}