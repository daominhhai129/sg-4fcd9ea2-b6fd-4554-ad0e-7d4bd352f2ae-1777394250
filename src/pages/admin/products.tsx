import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, formatPrice, products as allProducts } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, LayoutGrid, List, ExternalLink, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/types";

const shop = shops[0];

export default function ProductsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [sortBy, setSortBy] = useState<"newest" | "priceAsc" | "priceDesc">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [products, setProducts] = useState<Product[]>(shop.products);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setProducts([...shop.products]);
  }, [router.asPath]);

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
    if (sortBy === "priceAsc") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "priceDesc") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => {
      const dateA = (a as unknown as { updatedAt?: string }).updatedAt || a.createdAt;
      const dateB = (b as unknown as { updatedAt?: string }).updatedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    return sorted;
  }, [products, search, categoryFilter, visibilityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search, categoryFilter, visibilityFilter, sortBy]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  const handleDelete = (id: string) => {
    const idx = allProducts.findIndex((p) => p.id === id);
    if (idx !== -1) allProducts.splice(idx, 1);
    shop.products = allProducts.filter((p) => p.shopId === shop.id);
    setProducts([...shop.products]);
  };

  const toggleHidden = (id: string) => {
    const target = allProducts.find((p) => p.id === id);
    if (target) target.isHidden = !target.isHidden;
    setProducts([...shop.products]);
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
              <SelectTrigger className="w-full lg:w-40 rounded-xl"><SelectValue placeholder={t("nav.categories")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {shop.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as "all" | "visible" | "hidden")}>
              <SelectTrigger className="w-full lg:w-36 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("prod.filterAllStatus")}</SelectItem>
                <SelectItem value="visible">{t("prod.filterVisible")}</SelectItem>
                <SelectItem value="hidden">{t("prod.filterHidden")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "priceAsc" | "priceDesc")}>
              <SelectTrigger className="w-full lg:w-40 rounded-xl"><SelectValue /></SelectTrigger>
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
          <Link href="/admin/products/new" className="w-full lg:w-auto">
            <Button className="gradient-primary text-white border-0 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              {t("prod.add")}
            </Button>
          </Link>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {paginated.map((product) => (
              <div key={product.id} onClick={() => router.push(`/admin/products/${product.id}`)} className={`rounded-2xl bg-card border-2 overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${product.isHidden ? "border-muted-foreground/20 opacity-60" : "border-foreground/15 hover:border-primary/50"}`}>
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
                    <Link href={`/admin/products/${product.id}`} className="flex-1 min-w-0">
                      <Button variant="outline" size="sm" className="w-full rounded-xl px-2 border-2 text-foreground border-border hover:bg-muted hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        {t("common.edit")}
                      </Button>
                    </Link>
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
                    <tr key={product.id} onClick={() => router.push(`/admin/products/${product.id}`)} className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${product.isHidden ? "opacity-60" : ""}`}>
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
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl h-8 px-2.5">
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              {t("common.edit")}
                            </Button>
                          </Link>
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
                  <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-card border border-border hover:bg-muted"}`}>
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