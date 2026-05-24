import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, ImagePlus, X, Star, Video, Link2, LayoutGrid, List, ExternalLink, ShoppingCart, Sparkles, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types";
import type { ProductVariant, ProductVariantGroup } from "@/types";
import NextDynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";
import { VariantGroupsEditor } from "@/components/admin/VariantGroupsEditor";

const ReactQuill = NextDynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const shop = shops[0];
const MAX_IMAGES = 8;
const MAX_VIDEOS = 2;
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

export default function ProductsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [products, setProducts] = useState<Product[]>(shop.products);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formImages, setFormImages] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [videoLinks, setVideoLinks] = useState<string[]>([""]);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [featured, setFeatured] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [variantGroups, setVariantGroups] = useState<ProductVariantGroup[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [htmlMode, setHtmlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      const childIds = shop.categories.filter((c) => c.parentId === categoryFilter).map((c) => c.id);
      const allowedIds = new Set<string>([categoryFilter, ...childIds]);
      result = result.filter((p) => allowedIds.has(p.categoryId));
    }
    if (visibilityFilter === "visible") result = result.filter((p) => !p.isHidden);
    if (visibilityFilter === "hidden") result = result.filter((p) => p.isHidden);
    const sorted = [...result];
    if (sortBy === "priceAsc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      sorted.sort((a, b) => {
        const dateA = (a as unknown as { updatedAt?: string }).updatedAt || a.createdAt;
        const dateB = (b as unknown as { updatedAt?: string }).updatedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    }
    return sorted;
  }, [products, search, categoryFilter, visibilityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, visibilityFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleHidden = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isHidden: !p.isHidden } : p));
  };

  const resetForm = () => {
    setFormImages([]);
    setThumbnailIndex(0);
    setShortDesc("");
    setDescription("");
    setVideoLinks([""]);
    setAffiliateLink("");
    setFeatured(false);
    setPriceInput("");
    setVariantGroups([]);
    setVariants([]);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormImages(product.images || []);
    setThumbnailIndex(0);
    const longDesc = (product as unknown as { longDescription?: string }).longDescription;
    setShortDesc(longDesc ? (product.description || "") : "");
    setDescription(longDesc || product.description || "");
    setVideoLinks(
      (product as unknown as { videoLinks?: string[] }).videoLinks?.length
        ? (product as unknown as { videoLinks?: string[] }).videoLinks!
        : [""]
    );
    setAffiliateLink((product as unknown as { affiliateLink?: string }).affiliateLink || "");
    setFeatured(product.featured || false);
    setPriceInput(product.price ? product.price.toLocaleString("vi-VN") : "");
    setVariantGroups(product.variantGroups || []);
    setVariants(product.variants || []);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_IMAGES - formImages.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoLinkChange = (index: number, value: string) => {
    setVideoLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const addVideoLink = () => {
    if (videoLinks.length < MAX_VIDEOS) {
      setVideoLinks((prev) => [...prev, ""]);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      sku: form.get("sku") as string,
      description: shortDesc.trim() || description.replace(/<[^>]*>/g, "").slice(0, 200),
      longDescription: description,
      price: Number(priceInput.replace(/\D/g, "")) || 0,
      categoryId: form.get("categoryId") as string,
      images: formImages.length > 0 ? formImages : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
      videoLinks: videoLinks.filter((v) => v.trim() !== ""),
      affiliateLink: affiliateLink.trim() || undefined,
      featured: featured,
      variantGroups: variantGroups,
      variants: variants,
    };

    const orderedImages = [...data.images];
    if (thumbnailIndex > 0 && thumbnailIndex < orderedImages.length) {
      const [thumb] = orderedImages.splice(thumbnailIndex, 1);
      orderedImages.unshift(thumb);
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...data, images: orderedImages, categoryName: shop.categories.find((c) => c.id === data.categoryId)?.name || "", updatedAt: new Date().toISOString() } as Product
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: "p-new-" + Date.now(),
        shopId: shop.id,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        rating: 0,
        reviewCount: 0,
        stock: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        categoryName: shop.categories.find((c) => c.id === data.categoryId)?.name || "",
        ...data,
        images: orderedImages,
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setDialogOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  return (
    <>
      <SEO title={t("nav.products") + " — Admin"} />
      <AdminLayout title={t("nav.products")}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
            <div className="relative col-span-2 sm:col-span-4 lg:col-span-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t("prod.searchPh")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-40 rounded-xl">
                <SelectValue placeholder={t("nav.categories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {shop.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as "all" | "visible" | "hidden")}>
              <SelectTrigger className="w-full lg:w-36 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("prod.filterAllStatus")}</SelectItem>
                <SelectItem value="visible">{t("prod.filterVisible")}</SelectItem>
                <SelectItem value="hidden">{t("prod.filterHidden")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "priceAsc" | "priceDesc")}>
              <SelectTrigger className="w-full lg:w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("prod.sortNewest")}</SelectItem>
                <SelectItem value="priceAsc">{t("prod.sortPriceAsc")}</SelectItem>
                <SelectItem value="priceDesc">{t("prod.sortPriceDesc")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden lg:flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("table")} className={`p-2 transition-colors ${viewMode === "table" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0 w-full lg:w-auto" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                {t("prod.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="font-heading">{editingProduct ? t("prod.editTitle") : t("prod.addNewTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">{t("prod.name")} <span className="text-destructive">*</span></Label>
                  <Input name="name" defaultValue={editingProduct?.name || ""} required className="rounded-xl mt-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("prod.sku")}</Label>
                    <Input name="sku" defaultValue={(editingProduct as unknown as { sku?: string })?.sku || ""} placeholder={t("prod.skuPh")} className="rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("prod.price")} <span className="text-destructive">*</span></Label>
                    <Input name="price" type="text" inputMode="numeric" value={priceInput} onChange={handlePriceChange} required placeholder="0" className="rounded-xl mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">{t("nav.categories")}</Label>
                  <Select name="categoryId" defaultValue={editingProduct?.categoryId || shop.categories[0]?.id}>
                    <SelectTrigger className="rounded-xl mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shop.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-semibold">{t("prod.images").replace("{n}", String(MAX_IMAGES))}</Label>
                    <span className="text-xs text-muted-foreground">{formImages.length}/{MAX_IMAGES}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {formImages.map((img, idx) => (
                      <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${idx === thumbnailIndex ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`} onClick={() => setThumbnailIndex(idx)}>
                        <Image src={img} alt={`#${idx + 1}`} fill className="object-cover" />
                        {idx === thumbnailIndex && (
                          <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {t("prod.thumb")}
                          </div>
                        )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/80 transition-colors">
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
                  {formImages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">{t("prod.thumbHint")}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold">{t("prod.shortDesc")}</Label>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("prod.shortDescTip")}</p>
                  <textarea
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value.slice(0, 250))}
                    placeholder={t("prod.shortDescPh")}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{shortDesc.length}/250</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-semibold">{t("prod.desc")}</Label>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-border overflow-hidden text-xs">
                        <button type="button" onClick={() => setHtmlMode(false)} className={"px-2.5 py-1 font-medium transition-colors " + (!htmlMode ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground")}>
                          Visual
                        </button>
                        <button type="button" onClick={() => setHtmlMode(true)} className={"px-2.5 py-1 font-medium transition-colors " + (htmlMode ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground")}>
                          HTML
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">{getPlainTextLength(description)}/{MAX_DESCRIPTION_LENGTH}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("prod.descTip")}</p>
                  {htmlMode ? (
                    <textarea
                      value={description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder="<h3>Tiêu đề</h3><p>Nội dung...</p>"
                      rows={10}
                      spellCheck={false}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-[200px]"
                    />
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-border [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:max-h-[240px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:font-body [&_.ql-editor_img]:rounded-lg [&_.ql-editor_img]:my-2">
                      <ReactQuill theme="snow" value={description} onChange={handleDescriptionChange} modules={quillModules} placeholder={t("prod.descPh")} />
                    </div>
                  )}
                </div>

                <div>
                  <VariantGroupsEditor
                    groups={variantGroups}
                    variants={variants}
                    onGroupsChange={setVariantGroups}
                    onVariantsChange={setVariants}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Video className="w-4 h-4" />
                      {t("prod.video").replace("{n}", String(MAX_VIDEOS))}
                    </Label>
                  </div>
                  <div className="space-y-2">
                    {videoLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input value={link} onChange={(e) => handleVideoLinkChange(idx, e.target.value)} placeholder={t("prod.videoPh")} className="pl-10 rounded-xl" />
                        </div>
                        {videoLinks.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => removeVideoLink(idx)}>
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
                </div>

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

                <div className="flex gap-3 pt-2 border-t">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">{t("prod.save")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {paginated.map((product) => (
              <div key={product.id} onClick={() => openEdit(product)} className={`rounded-2xl bg-card border-2 overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${product.isHidden ? "border-muted-foreground/20 opacity-60" : "border-foreground/15 hover:border-primary/50"}`}>
                <div className="relative aspect-square overflow-hidden">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  {product.isHidden && (
                    <div className="absolute top-2 left-2 bg-foreground/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Đã ẩn
                    </div>
                  )}
                  <Link href={`/shop/${shop.slug}/product/${product.id}`} target="_blank" onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md" title={t("prod.previewTitle")}>
                    <ExternalLink className="w-4 h-4 text-foreground" />
                  </Link>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-sm font-bold text-accent">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="flex-1 min-w-0 rounded-xl px-2 border-2 text-foreground border-border hover:bg-muted hover:text-foreground" onClick={() => openEdit(product)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      {t("common.edit")}
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl shrink-0 border-2" onClick={() => toggleHidden(product.id)} title={product.isHidden ? "Hiện sản phẩm" : "Ẩn sản phẩm"}>
                      {product.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-xl shrink-0" onClick={() => handleDelete(product.id)} title={t("common.delete")}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("prod.colProduct")}</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">{t("prod.colCategory")}</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">{t("prod.colPrice")}</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 w-[180px]">{t("prod.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product) => (
                    <tr key={product.id} onClick={() => openEdit(product)} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${product.isHidden ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/50">
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                              {product.name}
                              {product.isHidden && <EyeOff className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                            </p>
                            <p className="text-xs text-muted-foreground sm:hidden">{product.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{product.categoryName}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-accent">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/shop/${shop.slug}/product/${product.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0" title={t("prod.previewTitle")}>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="rounded-xl h-8 px-2.5" onClick={() => openEdit(product)}>
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            {t("common.edit")}
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl h-8 w-8 p-0" onClick={() => toggleHidden(product.id)} title={product.isHidden ? "Hiện sản phẩm" : "Ẩn sản phẩm"}>
                            {product.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="destructive" size="sm" className="rounded-xl h-8 px-2.5" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">{t("prod.empty")}</div>
        )}

        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 px-1">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              {t("prod.pagination").replace("{a}", String((currentPage - 1) * ITEMS_PER_PAGE + 1)).replace("{b}", String(Math.min(currentPage * ITEMS_PER_PAGE, filtered.length))).replace("{c}", String(filtered.length))}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-xl" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("prod.prev")}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-card border border-border hover:bg-muted"}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                {t("prod.next")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}