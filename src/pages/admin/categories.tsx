import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, FolderOpen, GripVertical, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductCategory } from "@/types";

const shop = shops[0];

const NO_PARENT = "__none__";

export default function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<ProductCategory[]>(shop.categories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [parentId, setParentId] = useState<string>(NO_PARENT);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const syncToShop = (next: ProductCategory[]) => {
    shop.categories.splice(0, shop.categories.length, ...next);
  };

  // Sort: roots first, with their children right after each root
  const sorted = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId);
    const result: ProductCategory[] = [];
    roots.forEach((r) => {
      result.push(r);
      categories.filter((c) => c.parentId === r.id).forEach((child) => result.push(child));
    });
    // Orphans (parent missing)
    categories.forEach((c) => {
      if (c.parentId && !roots.find((r) => r.id === c.parentId) && !result.find((x) => x.id === c.id)) {
        result.push(c);
      }
    });
    return result;
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId && c.id !== editing?.id),
    [categories, editing]
  );

  const openCreate = () => {
    setEditing(null);
    setParentId(NO_PARENT);
    setDialogOpen(true);
  };

  const openEdit = (cat: ProductCategory) => {
    setEditing(cat);
    setParentId(cat.parentId || NO_PARENT);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const description = form.get("description") as string;
    const finalParent = parentId === NO_PARENT ? undefined : parentId;

    let next: ProductCategory[];
    if (editing) {
      next = categories.map((c) =>
        c.id === editing.id
          ? { ...c, name, description, slug: name.toLowerCase().replace(/\s+/g, "-"), parentId: finalParent }
          : c
      );
    } else {
      const newCat: ProductCategory = {
        id: "cat-new-" + Date.now(),
        shopId: shop.id,
        productCount: 0,
        name,
        description,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        parentId: finalParent,
      };
      next = [newCat, ...categories];
    }
    setCategories(next);
    syncToShop(next);
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    // Also clear parentId on children of deleted parent
    const next = categories
      .filter((c) => c.id !== id)
      .map((c) => (c.parentId === id ? { ...c, parentId: undefined } : c));
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
  const handleDragLeave = () => setDragOverId(null);
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

  const findParentName = (pid?: string) => categories.find((c) => c.id === pid)?.name;

  return (
    <>
      <SEO title={t("nav.categories") + " — Admin"} />
      <AdminLayout title={t("nav.categories")}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("cat.count").replace("{n}", String(categories.length))}</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">{t("cat.dragHint")}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white border-0" onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                {t("cat.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="font-heading">{editing ? t("cat.editTitle") : t("cat.addNew")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">{t("cat.name")} <span className="text-destructive">*</span></Label>
                  <Input name="name" defaultValue={editing?.name || ""} required className="rounded-xl mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">{t("cat.colParent")}</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger className="rounded-xl mt-1.5">
                      <SelectValue placeholder={t("cat.colParent")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PARENT}>—</SelectItem>
                      {rootCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Chọn danh mục cha để tạo cấp con. Để trống để làm danh mục gốc.</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">{t("cat.description")}</Label>
                  <Textarea name="description" defaultValue={editing?.description || ""} className="rounded-xl mt-1.5" rows={3} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">{t("common.save")}</Button>
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{t("cat.colName")}</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">{t("cat.colParent")}</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">{t("cat.colDesc")}</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell w-28">{t("cat.colProducts")}</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 w-32">{t("cat.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((cat) => {
                  const isDragging = draggedId === cat.id;
                  const isOver = dragOverId === cat.id && draggedId !== cat.id;
                  const isChild = !!cat.parentId;
                  const parentName = findParentName(cat.parentId);
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
                        <div className="cursor-grab active:cursor-grabbing flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title={t("cat.dragTip")}>
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2 ${isChild ? "pl-6" : ""}`}>
                          {isChild && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                            {!isChild && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">{t("cat.rootBadge")}</span>
                            )}
                            <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{cat.productCount} {t("cat.unitProducts")}</p>
                            {isChild && parentName && (
                              <p className="text-xs text-muted-foreground lg:hidden mt-0.5">↳ {parentName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {parentName ? (
                          <span className="text-sm text-foreground/80">{parentName}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">{cat.description}</p>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">{cat.productCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="rounded-xl h-8 px-2.5" onClick={() => openEdit(cat)}>
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            {t("common.edit")}
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
                <p className="text-muted-foreground">{t("cat.empty")}</p>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}