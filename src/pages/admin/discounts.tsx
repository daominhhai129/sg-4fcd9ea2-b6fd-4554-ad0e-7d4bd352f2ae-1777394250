import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { discountCodes as initialCodes, products as allProducts, formatPrice } from "@/data/mock-data";
import type { DiscountCode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Tag, Copy, CheckCircle2, Percent, DollarSign, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SHOP_DISCOUNT_LIMIT = 50;

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
  const { t } = useLanguage();
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
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const shopProducts = allProducts.filter((p) => p.shopId === user?.shopId);

  const filtered = codes.filter((c) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const limitReached = codes.length >= SHOP_DISCOUNT_LIMIT;

  const openCreate = () => {
    if (limitReached) {
      toast({ title: t("discount.limitReached"), variant: "destructive" });
      return;
    }
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
      toast({ title: t("discount.toastFill"), variant: "destructive" });
      return;
    }
    if (!editing && codes.length >= SHOP_DISCOUNT_LIMIT) {
      toast({ title: t("discount.limitReached"), variant: "destructive" });
      return;
    }
    const product = form.productId !== "all" ? shopProducts.find((p) => p.id === form.productId) : undefined;
    const data = {
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
      toast({ title: t("discount.toastUpdated") });
    } else {
      const newCode: DiscountCode = {
        id: "dc-" + Date.now(),
        shopId: user?.shopId || "",
        usedCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        ...data,
      };
      setCodes((prev) => [newCode, ...prev]);
      toast({ title: t("discount.toastCreated", { code: newCode.code }) });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setCodes((prev) => prev.filter((c) => c.id !== deleting.id));
    toast({ title: t("discount.toastDeleted", { code: deleting.code }) });
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
    toast({ title: t("discount.toastCopied", { code }) });
  };

  const selectedProduct = form.productId !== "all" ? shopProducts.find((p) => p.id === form.productId) : null;

  return (
    <AdminLayout title={t("nav.discounts")}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{t("discount.subtitle")}</p>
          <p className={cn("text-xs mt-1 font-semibold", limitReached ? "text-destructive" : "text-muted-foreground")}>
            {t("discount.codesUsage", { used: codes.length })}
          </p>
        </div>
        <Button onClick={openCreate} disabled={limitReached} className="gradient-primary text-white border-0 rounded-xl disabled:opacity-50">
          <Plus className="w-4 h-4 mr-2" /> {t("discount.create")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("discount.searchPh")} className="pl-10 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("discount.allStatus")}</SelectItem>
            <SelectItem value="active">{t("discount.active")}</SelectItem>
            <SelectItem value="inactive">{t("discount.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border/50 p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">{t("discount.empty")}</p>
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
                          {c.type === "percentage" ? t("discount.percentOff", { n: c.value }) : t("discount.amountOff", { amount: formatPrice(c.value) })}
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
                    <span className="text-muted-foreground text-xs">{t("discount.applyTo")}</span>
                    <span className="font-medium text-right text-xs truncate max-w-[60%]">{c.productName || t("discount.allProducts")}</span>
                  </div>
                  {c.minOrderValue && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground text-xs">{t("discount.minOrder")}</span>
                      <span className="font-medium text-xs">{formatPrice(c.minOrderValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">{t("discount.used")}</span>
                    <span className="font-medium text-xs">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</span>
                  </div>
                  {c.expiresAt && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground text-xs">{t("discount.expires")}</span>
                      <span className={`font-medium text-xs ${expired ? "text-destructive" : ""}`}>{c.expiresAt}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch checked={c.status === "active"} onCheckedChange={() => toggleStatus(c.id)} />
                      <Badge variant={c.status === "active" && !expired && !exhausted ? "default" : "secondary"} className="text-xs">
                        {expired ? t("discount.expired") : exhausted ? t("discount.exhausted") : c.status === "active" ? t("discount.statusActive") : t("discount.statusInactive")}
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
            <DialogTitle className="font-heading">{editing ? t("discount.editTitle") : t("discount.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">{t("discount.code")}</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1.5 rounded-xl font-mono uppercase" placeholder={t("discount.codePh")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">{t("discount.type")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percentage" | "fixed" })}>
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{t("discount.typePercent")}</SelectItem>
                    <SelectItem value="fixed">{t("discount.typeFixed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("discount.value")}</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-1.5 rounded-xl" placeholder={form.type === "percentage" ? "10" : "50000"} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">{t("discount.applyForLabel")}</Label>
              <Popover open={productPickerOpen} onOpenChange={setProductPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="mt-1.5 w-full justify-between rounded-xl font-normal">
                    <span className="truncate">
                      {form.productId === "all" ? t("discount.allProducts") : selectedProduct?.name || t("discount.selectProduct")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command
                    filter={(value, search) => {
                      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
                      return norm(value).includes(norm(search)) ? 1 : 0;
                    }}
                  >
                    <CommandInput placeholder={t("discount.searchProduct")} />
                    <CommandList>
                      <CommandEmpty>{t("discount.noProductFound")}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => { setForm({ ...form, productId: "all" }); setProductPickerOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", form.productId === "all" ? "opacity-100" : "opacity-0")} />
                          {t("discount.allProducts")}
                        </CommandItem>
                        {shopProducts.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => { setForm({ ...form, productId: p.id }); setProductPickerOpen(false); }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", form.productId === p.id ? "opacity-100" : "opacity-0")} />
                            <span className="truncate">{p.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">{formatPrice(p.salePrice ?? p.price)}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">{t("discount.minOrderLabel")}</Label>
                <Input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className="mt-1.5 rounded-xl" placeholder="0" />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("discount.maxUsesLabel")}</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="mt-1.5 rounded-xl" placeholder="100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">{t("discount.expiresLabel")}</Label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("discount.statusLabel")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("discount.statusActive")}</SelectItem>
                    <SelectItem value="inactive">{t("discount.statusInactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">{t("discount.cancel")}</Button>
            <Button onClick={handleSave} className="gradient-primary text-white border-0 rounded-xl">{editing ? t("discount.update") : t("discount.createBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("discount.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("discount.deleteConfirm", { code: deleting?.code || "" })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">{t("discount.cancel")}</Button>
            <Button onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl">{t("discount.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}