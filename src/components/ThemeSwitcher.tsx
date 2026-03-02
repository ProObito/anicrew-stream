import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore, THEMES, type ThemeName } from "@/store/themeStore";

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl p-3 shadow-xl min-w-[190px]"
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Theme</p>
              <div className="flex flex-col gap-1">
                {(Object.keys(THEMES) as ThemeName[]).map((key, idx) => {
                  const t = THEMES[key];
                  const isActive = theme === key;
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      onClick={() => { setTheme(key); setOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-primary/15 text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <motion.span
                        className="w-4 h-4 rounded-full shrink-0 relative flex items-center justify-center"
                        style={{ backgroundColor: t.color }}
                        whileHover={{ scale: 1.3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            >
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                      <span>{t.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
