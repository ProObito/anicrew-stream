import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "crimson" | "ocean" | "emerald" | "violet" | "sunset" | "midnight";

interface ThemeState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

export const THEMES: Record<ThemeName, { label: string; color: string; emoji: string }> = {
  crimson:  { label: "Crimson",  color: "hsl(0 72% 51%)",    emoji: "🔴" },
  ocean:    { label: "Ocean",    color: "hsl(200 80% 50%)",   emoji: "🔵" },
  emerald:  { label: "Emerald",  color: "hsl(152 69% 45%)",   emoji: "🟢" },
  violet:   { label: "Violet",   color: "hsl(270 70% 55%)",   emoji: "🟣" },
  sunset:   { label: "Sunset",   color: "hsl(25 95% 55%)",    emoji: "🟠" },
  midnight: { label: "Midnight", color: "hsl(220 60% 50%)",   emoji: "🔷" },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "crimson",
      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
    }),
    { name: "anicrew-theme" }
  )
);
