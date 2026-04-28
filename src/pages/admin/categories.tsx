import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, FolderOpen, ImagePlus, X } from "lucide-react";
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
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialogOpen) {
      setImageUrl(editing?.image || "");
    }
  }, [dialogOpen, editing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      slug: (form.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
      description: form.get("description") as string,
      image: imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
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
    setImageUrl("");
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
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setImageUrl(""); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0" onClick={() => { setEditing(null); setImageUrl(""); setDialogOpen(true); }}>
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
                  <Label className="text-sm font-semibold">Tên danh mục <span className="text-destructive">*</span></Label>
                  <Input name="name" defaultValue={editing?.name || ""} required className="rounded-xl mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mô tả</Label>
                  <Textarea name="description" defaultValue={editing?.description || ""} className="rounded-xl mt-1.5" rows={2} />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Ảnh danh mục</Label>
                  <div className="mt-1.5">
                    {imageUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-border group">
                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                        <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-destructive text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-destructive/80 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-foreground rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-white transition-colors flex items-center gap-1.5">
                          <ImagePlus className="w-3.5 h-3.5" />
                          Đổi ảnh
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Tải ảnh lên</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 w-20">Ảnh</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Tên danh mục</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Mô tả</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell w-28">Sản phẩm</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/50">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" />
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
                ))}
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