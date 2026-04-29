import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileText, Calendar, ImagePlus, X, Star, Search, Package, Eye, ChevronLeft, ChevronRight, Store, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NextDynamic from "next/dynamic";
import type { Post } from "@/types";

const ReactQuill = NextDynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const shop = shops[0];
const MIN_IMAGES = 3;
const MAX_IMAGES = 5;
const MIN_PRODUCTS = 1;
const MAX_PRODUCTS = 5;

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

export default function PostsPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>(shop.posts);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Post | null>(null);
  const [detailImageIdx, setDetailImageIdx] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewing, setPreviewing] = useState<Post | null>(null);
  const [previewImageIdx, setPreviewImageIdx] = useState(0);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Post["status"]>("draft");
  const [images, setImages] = useState<string[]>([]);
  const [thumbIdx, setThumbIdx] = useState(0);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / ITEMS_PER_PAGE));
  const paginatedPosts = useMemo(() => posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [posts, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return shop.products;
    const q = productSearch.toLowerCase();
    return shop.products.filter((p) => p.name.toLowerCase().includes(q));
  }, [productSearch]);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setStatus("draft");
    setImages([]);
    setThumbIdx(0);
    setProductIds([]);
    setProductSearch("");
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setStatus(post.status);
    const imgs = post.images?.length ? post.images : [post.coverImage];
    setImages(imgs);
    setThumbIdx(0);
    setProductIds(post.productIds || []);
    setProductSearch("");
    setDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setThumbIdx((prev) => {
      if (index === prev) return 0;
      if (index < prev) return prev - 1;
      return prev;
    });
  };

  const toggleProduct = (id: string) => {
    setProductIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= MAX_PRODUCTS) return prev;
      return [...prev, id];
    });
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length < MIN_IMAGES) {
      alert(t("post.alertImages").replace("{n}", String(MIN_IMAGES)));
      return;
    }
    if (productIds.length < MIN_PRODUCTS) {
      alert(t("post.alertProducts").replace("{n}", String(MIN_PRODUCTS)));
      return;
    }

    const orderedImages = [...images];
    if (thumbIdx > 0 && thumbIdx < orderedImages.length) {
      const [thumb] = orderedImages.splice(thumbIdx, 1);
      orderedImages.unshift(thumb);
    }

    const data = {
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      excerpt,
      content,
      coverImage: orderedImages[0],
      images: orderedImages,
      productIds,
      status,
    };

    if (editing) {
      setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
    } else {
      const newPost: Post = {
        id: "post-new-" + Date.now(),
        shopId: shop.id,
        createdAt: new Date().toISOString().split("T")[0],
        ...data,
      };
      setPosts((prev) => [newPost, ...prev]);
    }
    setDialogOpen(false);
    setEditing(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const openDetail = (post: Post) => {
    setViewing(post);
    setDetailImageIdx(0);
    setDetailOpen(true);
  };

  const handleEditFromDetail = () => {
    if (viewing) {
      setDetailOpen(false);
      openEdit(viewing);
    }
  };

  const openPreview = (post: Post) => {
    setPreviewing(post);
    setPreviewImageIdx(0);
    setPreviewOpen(true);
  };

  return (
    <>
      <SEO title={t("nav.posts") + " — Admin"} />
      <AdminLayout title={t("nav.posts")}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{t("post.count").replace("{n}", String(posts.length))}</p>
          <Button className="gradient-primary text-white border-0" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t("post.writeNew")}
          </Button>
        </div>

        <div className="space-y-4">
          {paginatedPosts.map((post) => {
            const productCount = post.productIds?.length || 0;
            const imageCount = post.images?.length || 1;
            return (
              <div key={post.id} onClick={() => openDetail(post)} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border-2 border-foreground/15 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={post.coverImage} alt={post.title} width={192} height={128} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                      {post.status === "published" ? t("post.published") : t("post.draft")}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {post.createdAt}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImagePlus className="w-3 h-3" />
                      {t("post.imagesCount").replace("{n}", String(imageCount))}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="w-3 h-3" />
                      {t("post.productsCount").replace("{n}", String(productCount))}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => openPreview(post)}>
                      <Eye className="w-3 h-3 mr-1" />
                      {t("post.preview")}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => openEdit(post)}>
                      <Pencil className="w-3 h-3 mr-1" />
                      {t("common.edit")}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t("post.empty")}</p>
            </div>
          )}
        </div>

        {posts.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-sm text-muted-foreground">
              {t("post.pagination").replace("{a}", String((currentPage - 1) * ITEMS_PER_PAGE + 1)).replace("{b}", String(Math.min(currentPage * ITEMS_PER_PAGE, posts.length))).replace("{c}", String(posts.length))}
            </p>
            <div className="flex items-center gap-2">
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

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t("post.detailTitle")}
              </DialogTitle>
            </DialogHeader>
            {viewing && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={viewing.status === "published" ? "default" : "secondary"}>
                    {viewing.status === "published" ? t("post.published") : t("post.draft")}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {viewing.createdAt}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{viewing.title}</h2>
                  {viewing.excerpt && <p className="text-muted-foreground italic">{viewing.excerpt}</p>}
                </div>

                {(viewing.images?.length || 0) > 0 && (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                      <Image src={(viewing.images || [viewing.coverImage])[detailImageIdx] || viewing.coverImage} alt={viewing.title} fill className="object-cover" />
                    </div>
                    {(viewing.images?.length || 0) > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {viewing.images!.map((img, idx) => (
                          <button key={idx} onClick={() => setDetailImageIdx(idx)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === detailImageIdx ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`}>
                            <Image src={img} alt={`#${idx + 1}`} fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {viewing.content && (
                  <div>
                    <p className="text-sm font-semibold mb-2">{t("post.content")}</p>
                    <div className="prose prose-sm max-w-none text-foreground rounded-xl bg-muted/50 p-4 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_img]:rounded-lg [&_img]:my-3" dangerouslySetInnerHTML={{ __html: viewing.content }} />
                  </div>
                )}

                {(viewing.productIds?.length || 0) > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      {t("post.linkedProducts").replace("{n}", String(viewing.productIds!.length))}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewing.productIds!.map((pid) => {
                        const product = shop.products.find((p) => p.id === pid);
                        if (!product) return null;
                        return (
                          <div key={pid} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/30">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                            </div>
                            <p className="text-sm font-bold text-accent shrink-0">{formatPrice(product.price)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDetailOpen(false)}>
                    {t("common.close")}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => { setDetailOpen(false); openPreview(viewing); }}>
                    <Eye className="w-4 h-4 mr-1.5" />
                    {t("post.preview")}
                  </Button>
                  <Button type="button" className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={handleEditFromDetail}>
                    <Pencil className="w-4 h-4 mr-1.5" />
                    {t("common.edit")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{t("post.preview")}</DialogTitle>
            </DialogHeader>
            {previewing && (
              <div className="bg-background">
                <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">{shop.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{t("post.previewMode")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setPreviewOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <article className="px-5 sm:px-10 py-8 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{previewing.createdAt}</span>
                    <span>·</span>
                    <span>{shop.name}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground leading-tight mb-4">{previewing.title}</h1>
                  {previewing.excerpt && (
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">{previewing.excerpt}</p>
                  )}

                  {(previewing.images?.length || 0) > 0 && (
                    <div className="space-y-3 mb-8">
                      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border bg-muted">
                        <Image src={(previewing.images || [previewing.coverImage])[previewImageIdx] || previewing.coverImage} alt={previewing.title} fill className="object-cover" />
                      </div>
                      {(previewing.images?.length || 0) > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                          {previewing.images!.map((img, idx) => (
                            <button key={idx} onClick={() => setPreviewImageIdx(idx)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === previewImageIdx ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`}>
                              <Image src={img} alt={`#${idx + 1}`} fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {previewing.content && (
                    <div className="prose prose-lg max-w-none text-foreground [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:my-3 [&_p]:leading-relaxed [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1 [&_img]:rounded-xl [&_img]:my-5 [&_img]:w-full [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: previewing.content }} />
                  )}

                  {(previewing.productIds?.length || 0) > 0 && (
                    <div className="mt-10 pt-8 border-t border-border">
                      <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        {t("post.productsInPost")}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previewing.productIds!.map((pid) => {
                          const product = shop.products.find((p) => p.id === pid);
                          if (!product) return null;
                          const hasSale = product.salePrice && product.salePrice < product.price;
                          return (
                            <div key={pid} className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition-all group">
                              <div className="relative aspect-square overflow-hidden bg-muted">
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                {hasSale && (
                                  <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{t("post.sale")}</span>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                                <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
                                <div className="flex items-baseline gap-1.5 mb-2">
                                  <span className="text-base font-bold text-accent">{formatPrice(product.salePrice || product.price)}</span>
                                  {hasSale && (
                                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                                  )}
                                </div>
                                <Button size="sm" className="w-full rounded-lg gradient-primary text-white border-0 text-xs h-8">
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  {t("post.viewProduct")}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? t("post.editTitle") : t("post.writeNew")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <Label className="text-sm font-semibold">{t("post.title")} <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl mt-1.5" />
              </div>

              <div>
                <Label className="text-sm font-semibold">{t("post.excerpt")}</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="rounded-xl mt-1.5" rows={2} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-semibold">
                    {t("post.postImages")} <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground font-normal ml-1">{t("post.minMax").replace("{min}", String(MIN_IMAGES)).replace("{max}", String(MAX_IMAGES))}</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${idx === thumbIdx ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`} onClick={() => setThumbIdx(idx)}>
                      <Image src={img} alt={`#${idx + 1}`} fill className="object-cover" />
                      {idx === thumbIdx && (
                        <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {t("post.coverBadge")}
                        </div>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-destructive/80">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{t("prod.addImage")}</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                {images.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">{t("post.coverPickHint")}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold">{t("post.content")}</Label>
                <p className="text-xs text-muted-foreground mb-1.5">{t("post.contentEditorTip")}</p>
                <div className="rounded-xl overflow-hidden border border-border [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:font-body">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} placeholder={t("post.contentPh")} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-semibold">
                    {t("post.linkedLabel")} <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground font-normal ml-1">{t("post.minMax").replace("{min}", String(MIN_PRODUCTS)).replace("{max}", String(MAX_PRODUCTS))}</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{productIds.length}/{MAX_PRODUCTS}</span>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={t("prod.searchPh")} value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-10 rounded-xl" />
                </div>
                <div className="rounded-xl border border-border max-h-64 overflow-y-auto divide-y divide-border">
                  {filteredProducts.map((p) => {
                    const selected = productIds.includes(p.id);
                    const disabled = !selected && productIds.length >= MAX_PRODUCTS;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        disabled={disabled}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${selected ? "bg-primary/10" : "hover:bg-muted/50"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                          {selected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                        </div>
                        <p className="text-sm font-bold text-accent shrink-0">{formatPrice(p.price)}</p>
                      </button>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("post.noProducts")}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">{t("post.status")}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Post["status"])}>
                  <SelectTrigger className="rounded-xl mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">{t("post.publish")}</SelectItem>
                    <SelectItem value="draft">{t("post.draft")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">{t("post.save")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}