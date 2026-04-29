import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-full">
      <button
        onClick={() => setLanguage("vi")}
        className={cn(
          "flex-1 px-2 py-1 text-xs font-semibold rounded-md transition-colors",
          language === "vi" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "flex-1 px-2 py-1 text-xs font-semibold rounded-md transition-colors",
          language === "en" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}