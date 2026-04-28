import { Package, ShoppingCart, FileText, Settings, TrendingUp, Layers } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Quản lý sản phẩm",
    description: "Thêm, sửa, xóa sản phẩm nhanh chóng. Hỗ trợ nhiều ảnh, phân loại và quản lý tồn kho.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: ShoppingCart,
    title: "Quản lý đơn hàng",
    description: "Theo dõi đơn hàng real-time, cập nhật trạng thái từ chờ xử lý đến hoàn thành.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Layers,
    title: "Danh mục linh hoạt",
    description: "Tổ chức sản phẩm theo danh mục, giúp khách hàng dễ dàng tìm kiếm và mua sắm.",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileText,
    title: "Blog & Bài viết",
    description: "Viết blog, chia sẻ thông tin sản phẩm và xây dựng thương hiệu cho cửa hàng.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: TrendingUp,
    title: "Thống kê doanh thu",
    description: "Dashboard trực quan với biểu đồ doanh thu, đơn hàng và số liệu kinh doanh.",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    icon: Settings,
    title: "Cài đặt cửa hàng",
    description: "Tùy chỉnh thông tin, logo, banner và liên hệ của cửa hàng theo ý muốn.",
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Tính năng</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-heading font-extrabold text-foreground">
            Mọi thứ bạn cần để bán hàng
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Bộ công cụ quản lý cửa hàng toàn diện, dễ sử dụng, giúp bạn tập trung vào kinh doanh
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={"w-12 h-12 rounded-xl flex items-center justify-center mb-4 " + f.bg}>
                <f.icon className={"w-6 h-6 " + f.color} />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}