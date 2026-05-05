import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { shops, getOrdersByShop } from "@/data/mock-data";
import { Users, Search, Download, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomerRow {
  email: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function CustomersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const shop = shops.find((s) => s.id === user?.shopId) || shops[0];
  const [query, setQuery] = useState("");

  const customers = useMemo<CustomerRow[]>(() => {
    const orders = getOrdersByShop(shop.id);
    const map = new Map<string, CustomerRow>();
    orders.forEach((o) => {
      const key = o.customerEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.total;
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
          existing.address = o.address;
          existing.phone = o.customerPhone;
          existing.name = o.customerName;
        }
      } else {
        map.set(key, {
          email: o.customerEmail,
          name: o.customerName,
          phone: o.customerPhone,
          address: o.address,
          totalOrders: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [shop.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [customers, query]);

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast({ variant: "destructive", title: "Không có khách hàng để xuất" });
      return;
    }
    const rows: string[][] = [
      ["STT", "Họ tên", "Email", "Số điện thoại", "Địa chỉ"],
      ...filtered.map((c, i) => [
        String(i + 1),
        c.name,
        c.email,
        c.phone,
        c.address,
      ]),
    ];
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv("khach-hang-" + shop.slug + "-" + date + ".csv", rows);
    toast({ variant: "success", title: "Đã xuất " + filtered.length + " khách hàng", description: "File CSV đã được tải về (mở bằng Excel)" });
  };

  return (
    <>
      <SEO title="Quản lý khách hàng — Admin" />
      <AdminLayout title="Quản lý khách hàng" shopName={shop.name}>
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="w-4 h-4" />
              Tổng khách hàng
            </div>
            <p className="text-2xl font-heading font-bold">{customers.length}</p>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  className="pl-10 rounded-xl"
                />
              </div>
              <Button onClick={handleExport} className="rounded-xl gradient-primary text-white border-0">
                <Download className="w-4 h-4 mr-1.5" />
                Xuất Excel ({filtered.length})
              </Button>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                {query ? "Không tìm thấy khách hàng phù hợp" : "Chưa có khách hàng nào"}
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold">Khách hàng</th>
                        <th className="text-left px-5 py-3 font-semibold">Liên hệ</th>
                        <th className="text-left px-5 py-3 font-semibold">Địa chỉ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((c) => (
                        <tr key={c.email} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{c.phone}</td>
                          <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{c.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-border">
                  {filtered.map((c) => (
                    <div key={c.email} className="p-4">
                      <p className="font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate mb-2">{c.email}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</p>
                        <p className="flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5" />{c.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
            <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Danh sách khách hàng được tổng hợp từ các đơn hàng đã đặt tại {shop.name}. File CSV xuất ra mở được trực tiếp bằng Microsoft Excel.
          </p>
        </div>
      </AdminLayout>
    </>
  );
}