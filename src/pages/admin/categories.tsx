import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, FolderOpen, GripVertical } from "lucide-react";
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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const syncToShop = (next: ProductCategory[]) => {
    shop.categories.splice(0, shop.categories.length, ...next);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      slug: (form.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
      description: form.get("description") as string,
    };

    let next: ProductCategory[];
    if (editing) {
      next = categories.map((c) => (c.id === editing.id ? { ...c, ...data } : c));
    } else {
      const newCat: ProductCategory = {
        id: "cat-new-" + Date.now(),
        shopId: shop.id,
        productCount: 0,
        ...data,
      };
      next = [newCat, ...categories];
    }
    setCategories(next);
    syncToShop(next);
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    syncToShop(next);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragOverId) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const fromIdx = categories.findIndex((c) => c.id === draggedId);
    const toIdx = categories.findIndex((c) => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...categories];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setCategories(next);
    syncToShop(next);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <>
      <SEO title="Danh mục — Admin" />
      <AdminLayout title="Danh mục">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{categories.length} danh mục</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">Kéo thả để sắp xếp thứ tự hiển thị trên storefront</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0" onClick={() => { setEditing(null); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="font-heading">{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Tên danh mục <span className="text-destructive">*</span></Label>
                  <Input name="name" defaultValue={editing?.name || ""} required className="rounded-xl mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mô tả</Label>
                  <Textarea name="description" defaultValue={editing?.description || ""} className="rounded-xl mt-1.5" rows={3} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">Lưu</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-10 px-2 py-3"></th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Tên danh mục</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Mô tả</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell w-28">Sản phẩm</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const isDragging = draggedId === cat.id;
                  const isOver = dragOverId === cat.id && draggedId !== cat.id;
                  return (
                    <tr
                      key={cat.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cat.id)}
                      onDragOver={(e) => handleDragOver(e, cat.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, cat.id)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-border/50 last:border-0 transition-all ${isDragging ? "opacity-40" : ""} ${isOver ? "bg-primary/10 border-t-2 border-t-primary" : "hover:bg-muted/30"}`}
                    >
                      <td className="px-2 py-3">
                        <div className="cursor-grab active:cursor-grabbing flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Kéo để sắp xếp">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{cat.productCount} sản phẩm</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">{cat.description}</p>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">{cat.productCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="rounded-xl h-8 px-2.5" onClick={() => { setEditing(cat); setDialogOpen(true); }}>
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Sửa
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl h-8 px-2.5" onClick={() => handleDelete(cat.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="text-center py-16">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Chưa có danh mục nào.</p>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}