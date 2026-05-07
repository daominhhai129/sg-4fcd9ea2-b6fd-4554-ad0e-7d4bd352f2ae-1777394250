import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, formatPrice } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MapPin, Phone, Mail, Package, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Order } from "@/types";

const shop = shops[0];

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>(() =>
    [...shop.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 500)
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const PER_PAGE = 10;

  const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
    pending: { label: t("status.pending"), className: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    confirmed: { label: t("status.confirmed"), className: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
    cancelled: { label: t("status.cancelled"), className: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  };

  const filtered = useMemo(() => {
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.customerName.toLowerCase().includes(q) || o.id.includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    return result;
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE), [filtered, currentPage]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const updateStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <>
      <SEO title={t("nav.orders") + " — Admin"} />
      <AdminLayout title={t("nav.orders")}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t("orders.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 rounded-xl">
                <SelectValue placeholder={t("orders.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl border border-border p-0.5 bg-card">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={"inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors " + (view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={"inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors " + (view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{t("orders.count").replace("{n}", String(filtered.length))}</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-border/50 bg-card">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t("orders.empty")}</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((order) => {
              const sc = statusConfig[order.status];
              return (
                <div key={order.id} className="rounded-2xl bg-card border-2 border-foreground/15 p-4 hover:shadow-lg hover:border-primary/50 transition-all flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{t("orders.id")}</p>
                      <p className="text-sm font-mono font-semibold text-foreground truncate">{order.id}</p>
                    </div>
                    <div className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 " + sc.className}>
                      <span className={"w-1.5 h-1.5 rounded-full " + sc.dot} />
                      {sc.label}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <p className="text-sm font-semibold text-foreground truncate">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" /><span className="truncate">{order.customerPhone}</span></p>
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5"><MapPin className="w-3 h-3 shrink-0 mt-0.5" /><span className="line-clamp-1">{order.address}</span></p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orders.itemsCount").replace("{n}", String(order.items.length))}</p>
                      <p className="text-base font-bold text-accent">{formatPrice(order.total)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                  </div>

                  <Select value={order.status} onValueChange={(val) => updateStatus(order.id, val as Order["status"])}>
                    <SelectTrigger className="rounded-xl h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-2">
                    <a href={"tel:" + order.customerPhone} className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                      {t("common.call")}
                    </a>
                    <Button size="sm" variant="outline" className="rounded-xl h-9 text-xs" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      {t("common.details")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">{t("orders.id")}</th>
                    <th className="text-left font-semibold px-4 py-3">Khách hàng</th>
                    <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Địa chỉ</th>
                    <th className="text-left font-semibold px-4 py-3 hidden lg:table-cell">SP</th>
                    <th className="text-right font-semibold px-4 py-3">{t("orders.total")}</th>
                    <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Ngày</th>
                    <th className="text-left font-semibold px-4 py-3">{t("orders.status")}</th>
                    <th className="text-right font-semibold px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order) => {
                    const sc = statusConfig[order.status];
                    return (
                      <tr key={order.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground truncate max-w-[180px]">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground max-w-[240px] truncate">{order.address}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{order.items.length}</td>
                        <td className="px-4 py-3 text-right font-bold text-accent whitespace-nowrap">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground whitespace-nowrap">{order.createdAt}</td>
                        <td className="px-4 py-3">
                          <Select value={order.status} onValueChange={(val) => updateStatus(order.id, val as Order["status"])}>
                            <SelectTrigger className={"rounded-lg h-8 text-xs w-32 border " + sc.className}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, val]) => (
                                <SelectItem key={key} value={key}>{val.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <a href={"tel:" + order.customerPhone} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors" aria-label="Call">
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors" aria-label="Details">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length > PER_PAGE && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" className="rounded-xl" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button key={n} variant={n === currentPage ? "default" : "outline"} size="sm" className={"rounded-xl w-9 " + (n === currentPage ? "gradient-primary text-white border-0" : "")} onClick={() => setPage(n)}>
                {n}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-xl" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{t("orders.detailTitle")} {selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-5">
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{selectedOrder.customerPhone}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{selectedOrder.customerEmail}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{selectedOrder.address}</p>
                  {selectedOrder.note && <p className="text-muted-foreground italic">{t("orders.note")}: {selectedOrder.note}</p>}
                </div>
                <a href={"tel:" + selectedOrder.customerPhone} className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-sm font-semibold transition-colors">
                  <Phone className="w-4 h-4" />
                  {t("orders.callCustomer")}
                </a>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.productImage} alt={item.productName} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-medium text-foreground">{t("orders.total")}</span>
                  <span className="text-lg font-heading font-extrabold text-accent">{formatPrice(selectedOrder.total)}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">{t("orders.updateStatus")}</label>
                  <Select value={selectedOrder.status} onValueChange={(val) => updateStatus(selectedOrder.id, val as Order["status"])}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}