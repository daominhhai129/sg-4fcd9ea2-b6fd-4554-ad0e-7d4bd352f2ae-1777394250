import { useState } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProductCategory } from "@/types";

const shop = shops[0];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>(shop.categories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      slug: (form.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
      description: form.get("description") as string,
      image: form.get("image") as string || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    };

    if (editing) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c))
      );
    } else {
      const newCat: ProductCategory = {
        id: "cat-new-" + Date.now(),
        shopId: shop.id,
        productCount: 0,
        ...data,
      };
      setCategories((prev) => [newCat, ...prev]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <SEO title="Danh mục — Admin" />
      <AdminLayout title="Danh mục">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{categories.length} danh mục</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0" onClick={() => { setEditing(null); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Tên danh mục</Label>
                  <Input name="name" defaultValue={editing?.name || ""} required className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea name="description" defaultValue={editing?.description || ""} className="rounded-xl mt-1" rows={2} />
                </div>
                <div>
                  <Label>URL hình ảnh</Label>
                  <Input name="image" defaultValue={editing?.image || ""} className="rounded-xl mt-1" placeholder="https://..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">Lưu</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden group">
              <div className="relative h-36 overflow-hidden">
                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-heading font-bold text-lg">{cat.name}</h3>
                  <p className="text-white/80 text-xs">{cat.productCount} sản phẩm</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs" onClick={() => { setEditing(cat); setDialogOpen(true); }}>
                    <Pencil className="w-3 h-3 mr-1" />
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-16">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Chưa có danh mục nào.</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}