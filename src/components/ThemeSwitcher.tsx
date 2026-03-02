import { useState } from "react";
import { Palette } from "lucide-react";
import { useThemeStore, THEMES, type ThemeName } from "@/store/themeStore";

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl p-3 shadow-xl animate-fade-in min-w-[180px]">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Theme</p>
            <div className="flex flex-col gap-1">
              {(Object.keys(THEMES) as ThemeName[]).map((key) => {
                const t = THEMES[key];
                const isActive = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setTheme(key); setOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-primary/15 text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 shrink-0"
                      style={{
                        backgroundColor: t.color,
                        borderColor: isActive ? "hsl(var(--foreground))" : "transparent",
                      }}
                    />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
