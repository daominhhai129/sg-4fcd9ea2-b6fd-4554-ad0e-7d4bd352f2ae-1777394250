import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, ImagePlus, X, Star, Video, Link2, LayoutGrid, List, ExternalLink, ShoppingCart } from "lucide-react";
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
import NextDynamic from "next/dynamic";

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
    ["link"],
    ["clean"],
  ],
};

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  thumbnailIndex: number;
  videoLinks: string[];
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [products, setProducts] = useState<Product[]>(shop.products);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [detailImageIdx, setDetailImageIdx] = useState(0);

  const [formImages, setFormImages] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [description, setDescription] = useState("");
  const [videoLinks, setVideoLinks] = useState<string[]>([""]);
  const [affiliateLink, setAffiliateLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.categoryId === categoryFilter);
    }
    return [...result].sort((a, b) => {
      const dateA = (a as unknown as { updatedAt?: string }).updatedAt || a.createdAt;
      const dateB = (b as unknown as { updatedAt?: string }).updatedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [products, search, categoryFilter]);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetForm = () => {
    setFormImages([]);
    setThumbnailIndex(0);
    setDescription("");
    setVideoLinks([""]);
    setAffiliateLink("");
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormImages(product.images || []);
    setThumbnailIndex(0);
    setDescription(product.description || "");
    setVideoLinks(
      (product as unknown as { videoLinks?: string[] }).videoLinks?.length
        ? (product as unknown as { videoLinks?: string[] }).videoLinks!
        : [""]
    );
    setAffiliateLink((product as unknown as { affiliateLink?: string }).affiliateLink || "");
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setDialogOpen(true);
  };

  const openDetail = (product: Product) => {
    setViewingProduct(product);
    setDetailImageIdx(0);
    setDetailOpen(true);
  };

  const handleEditFromDetail = () => {
    if (viewingProduct) {
      setDetailOpen(false);
      openEdit(viewingProduct);
    }
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

  const removeImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    setThumbnailIndex((prev) => {
      if (index === prev) return 0;
      if (index < prev) return prev - 1;
      return prev;
    });
  };

  const handleVideoLinkChange = (index: number, value: string) => {
    setVideoLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const addVideoLink = () => {
    if (videoLinks.length < MAX_VIDEOS) {
      setVideoLinks((prev) => [...prev, ""]);
    }
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const getPlainTextLength = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent?.length || 0;
  };

  const handleDescriptionChange = (value: string) => {
    if (getPlainTextLength(value) <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      sku: form.get("sku") as string,
      description: description,
      price: Number(form.get("price")),
      categoryId: form.get("categoryId") as string,
      images: formImages.length > 0 ? formImages : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
      videoLinks: videoLinks.filter((v) => v.trim() !== ""),
      affiliateLink: affiliateLink.trim() || undefined,
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
      <SEO title="Sản phẩm — Admin" />
      <AdminLayout title="Sản phẩm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {shop.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
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
              <Button className="gradient-primary text-white border-0" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">Tên sản phẩm <span className="text-destructive">*</span></Label>
                  <Input name="name" defaultValue={editingProduct?.name || ""} required className="rounded-xl mt-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Mã SKU</Label>
                    <Input name="sku" defaultValue={(editingProduct as unknown as { sku?: string })?.sku || ""} placeholder="VD: SP-001" className="rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Giá (VNĐ) <span className="text-destructive">*</span></Label>
                    <Input name="price" type="number" defaultValue={editingProduct?.price || ""} required className="rounded-xl mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Danh mục</Label>
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
                    <Label className="text-sm font-semibold">Ảnh sản phẩm (tối đa {MAX_IMAGES})</Label>
                    <span className="text-xs text-muted-foreground">{formImages.length}/{MAX_IMAGES}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {formImages.map((img, idx) => (
                      <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${idx === thumbnailIndex ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`} onClick={() => setThumbnailIndex(idx)}>
                        <Image src={img} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
                        {idx === thumbnailIndex && (
                          <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Thumb
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
                        <span className="text-[10px] text-muted-foreground">Thêm ảnh</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  {formImages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">Nhấn vào ảnh để chọn làm thumbnail</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-semibold">Mô tả sản phẩm</Label>
                    <span className="text-xs text-muted-foreground">{getPlainTextLength(description)}/{MAX_DESCRIPTION_LENGTH}</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:max-h-[200px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:font-body">
                    <ReactQuill theme="snow" value={description} onChange={handleDescriptionChange} modules={quillModules} placeholder="Nhập mô tả sản phẩm..." />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Video className="w-4 h-4" />
                      Video sản phẩm (tối đa {MAX_VIDEOS})
                    </Label>
                  </div>
                  <div className="space-y-2">
                    {videoLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input value={link} onChange={(e) => handleVideoLinkChange(idx, e.target.value)} placeholder="Dán link YouTube hoặc TikTok" className="pl-10 rounded-xl" />
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
                        Thêm video
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    Link mua hàng (Affiliate)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-1.5">Shopee, TikTok Shop, hoặc link sản phẩm bất kỳ</p>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder="https://shopee.vn/product/... hoặc link bất kỳ" className="pl-10 rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">Lưu sản phẩm</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <div key={product.id} onClick={() => openDetail(product)} className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <Link href={`/shop/${shop.slug}/product/${product.id}`} target="_blank" onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md" title="Xem trên storefront">
                    <ExternalLink className="w-4 h-4 text-foreground" />
                  </Link>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-base font-bold text-accent">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => openEdit(product)}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Sửa
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1 rounded-xl" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Xóa
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
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Sản phẩm</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Danh mục</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Giá</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 w-[180px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} onClick={() => openDetail(product)} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/50">
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
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
                            <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0" title="Preview">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="rounded-xl h-8 px-2.5" onClick={() => openEdit(product)}>
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Sửa
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
          <div className="text-center py-16 text-muted-foreground">Không tìm thấy sản phẩm nào.</div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Chi tiết sản phẩm</DialogTitle>
            </DialogHeader>
            {viewingProduct && (
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                      <Image src={viewingProduct.images[detailImageIdx] || viewingProduct.images[0]} alt={viewingProduct.name} fill className="object-cover" />
                    </div>
                    {viewingProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {viewingProduct.images.map((img, idx) => (
                          <button key={idx} onClick={() => setDetailImageIdx(idx)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === detailImageIdx ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`}>
                            <Image src={img} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{viewingProduct.categoryName}</p>
                      <h3 className="text-xl font-heading font-bold text-foreground">{viewingProduct.name}</h3>
                      {(viewingProduct as unknown as { sku?: string }).sku && (
                        <p className="text-xs text-muted-foreground mt-1">SKU: {(viewingProduct as unknown as { sku?: string }).sku}</p>
                      )}
                    </div>

                    <div className="text-2xl font-bold text-accent">{formatPrice(viewingProduct.price)}</div>

                    {(viewingProduct as unknown as { videoLinks?: string[] }).videoLinks?.length ? (
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Video className="w-4 h-4" />Video</p>
                        <div className="space-y-1.5">
                          {(viewingProduct as unknown as { videoLinks?: string[] }).videoLinks!.map((link, idx) => (
                            <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline truncate">
                              <Link2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{link}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {(viewingProduct as unknown as { affiliateLink?: string }).affiliateLink && (
                      <div>
                        <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" />Link mua hàng</p>
                        <a href={(viewingProduct as unknown as { affiliateLink?: string }).affiliateLink!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline truncate">
                          <Link2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{(viewingProduct as unknown as { affiliateLink?: string }).affiliateLink}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {viewingProduct.description && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Mô tả sản phẩm</p>
                    <div className="prose prose-sm max-w-none text-foreground rounded-xl bg-muted/50 p-4 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1" dangerouslySetInnerHTML={{ __html: viewingProduct.description }} />
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDetailOpen(false)}>
                    Đóng
                  </Button>
                  <Button type="button" className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={handleEditFromDetail}>
                    <Pencil className="w-4 h-4 mr-1.5" />
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}