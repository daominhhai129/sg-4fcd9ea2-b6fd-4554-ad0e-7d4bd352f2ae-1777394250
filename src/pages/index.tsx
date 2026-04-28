import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedShops } from "@/components/landing/FeaturedShops";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="VietShop — Nền tảng thương mại điện tử đa cửa hàng"
        description="Khởi tạo cửa hàng trực tuyến, quản lý sản phẩm và đơn hàng dễ dàng. Giao diện đẹp, tối ưu di động."
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedShops />
        <Features />
      </main>
      <Footer />
    </>
  );
}