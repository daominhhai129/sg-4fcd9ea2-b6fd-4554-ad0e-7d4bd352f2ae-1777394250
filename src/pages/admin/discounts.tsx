import { useState } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { discountCodes as initialCodes, products as allProducts, formatPrice } from "@/data/mock-data";
import type { DiscountCode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Tag, Copy, CheckCircle2, Percent, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormState {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  productId: string;
  minOrderValue: string;
  maxUses: string;
  expiresAt: string;
  status: "active" | "inactive";
}

const emptyForm: FormState = { code: "", type: "percentage", value: "", productId: "all", minOrderValue: "", maxUses: "", expiresAt: "", status: "active" };

export default function AdminDiscounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>(() => initialCodes.filter((d) => d.shopId === user?.shopId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [deleting, setDeleting] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [copied, setCopied] = useState<string | null>(null);

  const shopProducts = allProducts.filter((p) => p.shopId === user?.shopId);

  const filtered = codes.filter((c) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: DiscountCode) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      productId: c.productId || "all",
      minOrderValue: c.minOrderValue ? String(c.minOrderValue) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "",
      expiresAt: c.expiresAt || "",
      status: c.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.value) {
      toast({ title: "Vui lòng nhập đầy đủ mã và giá trị", variant: "destructive" });
      return;
    }
    const product = form.productId !== "all" ? shopProducts.find((p) => p.id === form.productId) : undefined;
    const data: Omit<DiscountCode, "id" | "shopId" | "usedCount" | "createdAt"> = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      productId: form.productId !== "all" ? form.productId : undefined,
      productName: product?.name,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
      status: form.status,
    };
    if (editing) {
      setCodes((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
      toast({ title: "Đã cập nhật mã giảm giá" });
    } else {
      const newCode: DiscountCode = {
        id: "dc-" + Date.now(),
        shopId: user?.shopId || "",
        usedCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        ...data,
      };
      setCodes((prev) => [newCode, ...prev]);
      toast({ title: "Đã tạo mã giảm giá " + newCode.code });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setCodes((prev) => prev.filter((c) => c.id !== deleting.id));
    toast({ title: "Đã xoá mã " + deleting.code });
    setDeleteOpen(false);
    setDeleting(null);
  };

  const toggleStatus = (id: string) => {
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
    toast({ title: "Đã copy mã " + code });
  };

  return (
    <AdminLayout title="Mã giảm giá">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Tạo và quản lý mã giảm giá cho cửa hàng</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-white border-0 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Tạo mã mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã giảm giá..." className="pl-10 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border/50 p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const exhausted = c.maxUses && c.usedCount >= c.maxUses;
            return (
              <div key={c.id} className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        {c.type === "percentage" ? <Percent className="w-4 h-4 text-white" /> : <DollarSign className="w-4 h-4 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-base text-foreground truncate">{c.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.type === "percentage" ? `Giảm ${c.value}%` : `Giảm ${formatPrice(c.value)}`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => copyCode(c.code)} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0">
                      {copied === c.code ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">Áp dụng:</span>
                    <span className="font-medium text-right text-xs truncate max-w-[60%]">{c.productName || "Tất cả sản phẩm"}</span>
                  </div>
                  {c.minOrderValue && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground text-xs">Đơn tối thiểu:</span>
                      <span className="font-medium text-xs">{formatPrice(c.minOrderValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">Đã dùng:</span>
                    <span className="font-medium text-xs">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</span>
                  </div>
                  {c.expiresAt && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground text-xs">Hết hạn:</span>
                      <span className={`font-medium text-xs ${expired ? "text-destructive" : ""}`}>{c.expiresAt}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch checked={c.status === "active"} onCheckedChange={() => toggleStatus(c.id)} />
                      <Badge variant={c.status === "active" && !expired && !exhausted ? "default" : "secondary"} className="text-xs">
                        {expired ? "Hết hạn" : exhausted ? "Hết lượt" : c.status === "active" ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setDeleting(c); setDeleteOpen(true); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Mã giảm giá *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1.5 rounded-xl font-mono uppercase" placeholder="VD: SUMMER20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Loại giảm *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percentage" | "fixed" })}>
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền (đ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Giá trị *</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-1.5 rounded-xl" placeholder={form.type === "percentage" ? "10" : "50000"} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Áp dụng cho</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                  {shopProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Đơn tối thiểu (đ)</Label>
                <Input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className="mt-1.5 rounded-xl" placeholder="0" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Số lượt tối đa</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="mt-1.5 rounded-xl" placeholder="100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Hết hạn</Label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Huỷ</Button>
            <Button onClick={handleSave} className="gradient-primary text-white border-0 rounded-xl">{editing ? "Cập nhật" : "Tạo mã"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xoá mã giảm giá?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn chắc chắn muốn xoá mã <span className="font-mono font-bold text-foreground">{deleting?.code}</span>? Thao tác này không thể hoàn tác.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">Huỷ</Button>
            <Button onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl">Xoá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}