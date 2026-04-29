import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { shops, formatPrice } from "@/data/mock-data";
import { DollarSign, Package as PackageIcon, ShoppingBag, FolderOpen, FileText, CalendarClock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { user, getShopConfig } = useAuth();
  const { t, lang } = useLanguage();
  const shop = shops.find((s) => s.id === user?.shopId) || shops[0];
  const shopConfig = getShopConfig(shop.id);

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: t("status.pending"), className: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: t("status.confirmed"), className: "bg-green-100 text-green-700" },
    cancelled: { label: t("status.cancelled"), className: "bg-red-100 text-red-700" },
  };

  const revenue = shop.orders.filter((o) => o.status === "confirmed").reduce((s, o) => s + o.total, 0);
  const recentOrders = [...shop.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  const expiry = user?.expiresAt ? new Date(user.expiresAt) : null;
  const today = new Date();
  const daysLeft = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const expiryWarning = daysLeft !== null && daysLeft <= 30;

  const stats = [
    { label: t("dashboard.revenue"), value: formatPrice(revenue), icon: DollarSign, change: "+12.5%", trend: "up", bg: "bg-green-50", iconColor: "text-green-600" },
    { label: t("dashboard.orders"), value: shop.orders.length.toString(), icon: ShoppingBag, change: "+8.2%", trend: "up", bg: "bg-primary/10", iconColor: "text-primary" },
    { label: t("dashboard.products"), value: shop.products.length.toString(), icon: PackageIcon, change: "+3", trend: "up", bg: "bg-accent/10", iconColor: "text-accent" },
  ];

  const limits = shopConfig
    ? [
        { label: t("dashboard.products"), icon: PackageIcon, usage: shopConfig.usage.products, limit: shopConfig.limits.products },
        { label: t("dashboard.categories"), icon: FolderOpen, usage: shopConfig.usage.categories, limit: shopConfig.limits.categories },
        { label: t("dashboard.posts"), icon: FileText, usage: shopConfig.usage.posts, limit: shopConfig.limits.posts },
      ]
    : [];

  return (
    <>
      <SEO title={t("nav.dashboard")} description="Bảng điều khiển quản trị" />
      <AdminLayout title={t("nav.dashboard")} shopName={shop.name}>
        <div className="space-y-6">
          {expiry && (
            <div className={cn("rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", expiryWarning ? "bg-yellow-50 border-yellow-200" : "bg-card border-border/50")}>
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", expiryWarning ? "bg-yellow-100 text-yellow-700" : "bg-primary/10 text-primary")}>
                  {expiryWarning ? <AlertTriangle className="w-5 h-5" /> : <CalendarClock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.expiry")}</p>
                  <p className="font-heading font-bold text-foreground">
                    {expiry.toLocaleDateString(lang === "en" ? "en-US" : "vi-VN")}
                    <span className={cn("ml-2 text-sm font-medium", expiryWarning ? "text-yellow-700" : "text-muted-foreground")}>
                      ({daysLeft !== null && daysLeft >= 0 ? t("dashboard.daysLeft").replace("{n}", String(daysLeft)) : t("dashboard.expired")})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                  </div>
                  <span className="text-xs font-semibold text-green-600">↗ {stat.change}</span>
                </div>
                <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {limits.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h2 className="font-heading font-bold text-foreground mb-4">{t("dashboard.usageLimits")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {limits.map((item) => {
                  const pct = Math.min((item.usage / item.limit) * 100, 100);
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><item.icon className="w-3.5 h-3.5" />{item.label}</span>
                        <span className="font-semibold text-foreground">{item.usage}<span className="text-muted-foreground font-normal">/{item.limit}</span></span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-destructive" : pct > 50 ? "bg-accent" : "bg-primary")} style={{ width: pct + "%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-card border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">{t("dashboard.recentOrders")}</h2>
            </div>
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const status = statusMap[order.status] || statusMap.pending;
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "vi-VN")}</p>
                      </div>
                    </div>
                    <div className="flex items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0 flex-col sm:flex-row">
                      <span className="font-bold text-sm text-foreground whitespace-nowrap">{formatPrice(order.total)}</span>
                      <span className={cn("px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap", status.className)}>{status.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}