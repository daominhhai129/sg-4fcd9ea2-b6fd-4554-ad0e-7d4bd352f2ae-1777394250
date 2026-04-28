import { useState, useMemo } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops, formatPrice } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Clock, MapPin, Phone, Mail } from "lucide-react";
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

const statusConfig: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive"; className: string }> = {
  pending: { label: "Chờ xác nhận", variant: "outline", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Đã xác nhận", variant: "outline", className: "bg-blue-100 text-blue-700 border-blue-200" },
  shipping: { label: "Đang giao", variant: "outline", className: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "Hoàn thành", variant: "outline", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Đã hủy", variant: "destructive", className: "" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(shop.orders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const updateStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <>
      <SEO title="Đơn hàng — Admin" />
      <AdminLayout title="Đơn hàng">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm đơn hàng..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 rounded-xl">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} đơn hàng</p>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Mã đơn</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Khách hàng</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">Tổng tiền</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-4 hidden sm:table-cell">Trạng thái</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-4 hidden md:table-cell">Ngày tạo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const sc = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm font-mono font-medium text-foreground">{order.id}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </td>
                      <td className="p-4 text-right text-sm font-bold text-accent">{formatPrice(order.total)}</td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <span className={"inline-block px-2.5 py-1 rounded-lg text-xs font-medium " + sc.className}>{sc.label}</span>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell text-sm text-muted-foreground">{order.createdAt}</td>
                      <td className="p-4 text-right">
                        <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Không tìm thấy đơn hàng nào.</div>
          )}
        </div>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-5">
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{selectedOrder.customerPhone}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{selectedOrder.customerEmail}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{selectedOrder.address}</p>
                  {selectedOrder.note && <p className="text-muted-foreground italic">Ghi chú: {selectedOrder.note}</p>}
                </div>
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
                  <span className="font-medium text-foreground">Tổng cộng</span>
                  <span className="text-lg font-heading font-extrabold text-accent">{formatPrice(selectedOrder.total)}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Cập nhật trạng thái</label>
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