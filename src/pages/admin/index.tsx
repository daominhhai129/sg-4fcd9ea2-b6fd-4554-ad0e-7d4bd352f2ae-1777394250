import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops, formatPrice } from "@/data/mock-data";
import {
  Package,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

const shop = shops[0];

const stats = [
  {
    label: "Doanh thu",
    value: formatPrice(shop.orders.reduce((s, o) => s + o.total, 0)),
    icon: DollarSign,
    change: "+12.5%",
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Đơn hàng",
    value: shop.orders.length.toString(),
    icon: ShoppingBag,
    change: "+8.2%",
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Sản phẩm",
    value: shop.products.length.toString(),
    icon: Package,
    change: "+3",
    color: "text-violet-600 bg-violet-50",
  },
];

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700" },
  shipping: { label: "Đang giao", className: "bg-purple-100 text-purple-700" },
  delivered: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

export default function AdminDashboard() {
  return (
    <>
      <SEO title="Tổng quan — Admin" />
      <AdminLayout title="Tổng quan">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-card border border-border/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-heading font-extrabold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border/50 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-foreground">Đơn hàng gần đây</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {shop.orders.slice(0, 8).map((order) => {
              const status = statusMap[order.status];
              return (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}