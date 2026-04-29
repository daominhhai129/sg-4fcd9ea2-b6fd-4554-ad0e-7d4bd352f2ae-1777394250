import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages?: string; autoDisplay?: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

function getCurrentLang(): "vi" | "en" {
  if (typeof document === "undefined") return "vi";
  const m = document.cookie.match(/googtrans=\/[^/]+\/(\w+)/);
  return m && m[1] === "en" ? "en" : "vi";
}

export function LanguageToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState<"vi" | "en">("vi");

  useEffect(() => {
    setMounted(true);
    setCurrent(getCurrentLang());

    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "vi", includedLanguages: "en,vi", autoDisplay: false },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const setLang = (lang: "vi" | "en") => {
    if (lang === current) return;
    const value = lang === "vi" ? "" : "/vi/en";
    const host = window.location.hostname;
    const expires = lang === "vi" ? "expires=Thu, 01 Jan 1970 00:00:00 GMT;" : "";
    document.cookie = `googtrans=${value}; path=/; ${expires}`;
    document.cookie = `googtrans=${value}; path=/; domain=${host}; ${expires}`;
    document.cookie = `googtrans=${value}; path=/; domain=.${host}; ${expires}`;
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1 bg-muted rounded-lg p-1 w-fit", className)} suppressHydrationWarning>
        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-card text-primary shadow-sm">VI</span>
        <span className="px-2 py-1 text-xs font-semibold rounded-md text-muted-foreground">EN</span>
      </div>
    );
  }

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <div className={cn("flex items-center gap-1 bg-muted rounded-lg p-1 w-fit notranslate", className)} translate="no">
        <button
          type="button"
          onClick={() => setLang("vi")}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
            current === "vi" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
            current === "en" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          EN
        </button>
      </div>
    </>
  );
}