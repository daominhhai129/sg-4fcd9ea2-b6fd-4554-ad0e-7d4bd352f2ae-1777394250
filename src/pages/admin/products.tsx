import { useState, useMemo } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const statusConfig: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
  active: { label: "Đang bán", variant: "default" },
  draft: { label: "Nháp", variant: "secondary" },
  outOfStock: { label: "Hết hàng", variant: "destructive" },
};

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
      stock: Number(form.get("stock")),
      categoryId: form.get("categoryId") as string,
      status: form.get("status") as Product["status"],
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tồn kho</Label>
                    <Input name="stock" type="number" defaultValue={editingProduct?.stock || 0} className="rounded-xl mt-1" />
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
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select name="status" defaultValue={editingProduct?.status || "active"}>
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang bán</SelectItem>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="outOfStock">Hết hàng</SelectItem>
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

        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Sản phẩm</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4 hidden md:table-cell">Danh mục</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">Giá</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-4 hidden sm:table-cell">Kho</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-4 hidden sm:table-cell">Trạng thái</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const sc = statusConfig[product.status];
                  return (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                          </div>
                          <span className="text-sm font-medium text-foreground line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{product.categoryName}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-bold text-accent">{formatPrice(product.salePrice || product.price)}</span>
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <span className="text-sm text-foreground">{product.stock}</span>
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(product)}>
                              <Pencil className="w-4 h-4 mr-2" />Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />Xem
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Không tìm thấy sản phẩm nào.</div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}