import Link from "next/link";
import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                VietShop
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Nền tảng thương mại điện tử đa cửa hàng hàng đầu Việt Nam.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-sm uppercase tracking-wider">Sản phẩm</h4>
            <ul className="space-y-2.5">
              <li><Link href="/#features" className="text-sm text-white/60 hover:text-white transition-colors">Tính năng</Link></li>
              <li><Link href="/#shops" className="text-sm text-white/60 hover:text-white transition-colors">Cửa hàng mẫu</Link></li>
              <li><Link href="/admin" className="text-sm text-white/60 hover:text-white transition-colors">Bảng điều khiển</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-sm uppercase tracking-wider">Cửa hàng</h4>
            <ul className="space-y-2.5">
              <li><Link href="/shop/tech-zone" className="text-sm text-white/60 hover:text-white transition-colors">Tech Zone</Link></li>
              <li><Link href="/shop/fashion-hub" className="text-sm text-white/60 hover:text-white transition-colors">Fashion Hub</Link></li>
              <li><Link href="/shop/green-garden" className="text-sm text-white/60 hover:text-white transition-colors">Green Garden</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-sm uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-white/60">hello@vietshop.vn</li>
              <li className="text-sm text-white/60">1900 1234</li>
              <li className="text-sm text-white/60">TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; 2026 VietShop. Đã đăng ký bản quyền.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Điều khoản</Link>
            <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}