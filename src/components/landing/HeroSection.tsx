import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShoppingBag, BarChart3 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Nền tảng thương mại điện tử đa cửa hàng #1 Việt Nam
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-foreground">
            Tạo cửa hàng{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(290,80%,55%)] bg-clip-text text-transparent">
              trực tuyến
            </span>{" "}
            trong vài phút
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Khởi tạo cửa hàng riêng, quản lý sản phẩm, đơn hàng và bài viết dễ dàng.
            Giao diện đẹp, tối ưu cho di động, sẵn sàng bán hàng ngay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 px-8 h-12 text-base" asChild>
              <Link href="/admin">
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
              <Link href="/shop/tech-zone">
                Xem cửa hàng mẫu
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Cửa hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Sản phẩm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">99%</div>
              <div className="text-sm text-muted-foreground">Hài lòng</div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-foreground mb-1">Storefront đẹp</h3>
            <p className="text-sm text-muted-foreground">Giao diện cửa hàng chuyên nghiệp, tối ưu chuyển đổi</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-heading font-bold text-foreground mb-1">Dashboard thông minh</h3>
            <p className="text-sm text-muted-foreground">Quản lý đơn hàng, sản phẩm và doanh thu dễ dàng</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-heading font-bold text-foreground mb-1">Tối ưu di động</h3>
            <p className="text-sm text-muted-foreground">Responsive hoàn hảo trên mọi thiết bị</p>
          </div>
        </div>
      </div>
    </section>
  );
}