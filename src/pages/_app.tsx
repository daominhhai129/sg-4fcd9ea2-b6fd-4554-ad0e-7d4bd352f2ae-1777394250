import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";
import { CartPreview } from "@/components/storefront/CartPreview";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />
          <CartPreview />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}