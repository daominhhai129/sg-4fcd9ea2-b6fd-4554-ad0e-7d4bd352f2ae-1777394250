import { useState, useMemo } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types";

const shop = shops[0];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>(shop.products);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.categoryId === categoryFilter);
    }
    return result;
  }, [products, search, categoryFilter]);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      price: Number(form.get("price")),
      salePrice: form.get("salePrice") ? Number(form.get("salePrice")) : undefined,
      categoryId: form.get("categoryId") as string,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...data, categoryName: shop.categories.find((c) => c.id === data.categoryId)?.name || "" }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: "p-new-" + Date.now(),
        shopId: shop.id,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"],
        rating: 0,
        reviewCount: 0,
        stock: 0,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
        categoryName: shop.categories.find((c) => c.id === data.categoryId)?.name || "",
        ...data,
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
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
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Tên sản phẩm</Label>
                  <Input name="name" defaultValue={editingProduct?.name || ""} required className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea name="description" defaultValue={editingProduct?.description || ""} className="rounded-xl mt-1" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Giá (VNĐ)</Label>
                    <Input name="price" type="number" defaultValue={editingProduct?.price || ""} required className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label>Giá khuyến mãi</Label>
                    <Input name="salePrice" type="number" defaultValue={editingProduct?.salePrice || ""} className="rounded-xl mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <Select name="categoryId" defaultValue={editingProduct?.categoryId || shop.categories[0]?.id}>
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shop.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">Lưu</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-square overflow-hidden">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-bold text-accent">{formatPrice(product.salePrice || product.price)}</span>
                  {product.salePrice && (
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="flex gap-2">
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

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">Không tìm thấy sản phẩm nào.</div>
        )}
      </AdminLayout>
    </>
  );
}