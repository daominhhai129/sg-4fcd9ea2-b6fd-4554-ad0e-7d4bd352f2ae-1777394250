import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center gap-1 bg-muted rounded-lg p-1", className)}>
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        className={cn(
          "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
          language === "vi" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={language === "vi"}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
          language === "en" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
}