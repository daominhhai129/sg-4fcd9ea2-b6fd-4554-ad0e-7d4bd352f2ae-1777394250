import Link from "next/link";
import Image from "next/image";
import { shops } from "@/data/mock-data";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedShops() {
  return (
    <section id="shops" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Cửa hàng nổi bật</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-heading font-extrabold text-foreground">
            Khám phá các cửa hàng
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Hàng trăm cửa hàng đa dạng ngành hàng đang hoạt động trên nền tảng VietShop
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={"/shop/" + shop.slug}
              className="group rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={shop.banner}
                  alt={shop.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-5 -mt-8 relative">
                <div className="w-14 h-14 rounded-xl border-2 border-card overflow-hidden shadow-md bg-card">
                  <Image
                    src={shop.logo}
                    alt={shop.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="mt-3 font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {shop.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {shop.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {shop.contact.address}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link href="/shop/tech-zone">
              Xem tất cả cửa hàng
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}