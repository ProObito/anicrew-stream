import { NavLink } from "react-router-dom";
import { Home, Film, Tv, Sparkles, Calendar, Heart, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/movies", label: "Movies", icon: Film },
  { to: "/series", label: "Series", icon: Tv },
  { to: "/anime", label: "Anime", icon: Sparkles },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/watchlist", label: "Watchlist", icon: Heart },
];

const BottomNav = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5 overflow-x-auto">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[52px] py-1.5 px-1 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <it.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5 uppercase tracking-wider">
              {it.label}
            </span>
          </NavLink>
        ))}
        {user ? (
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center min-w-[52px] py-1.5 px-1 rounded-lg text-muted-foreground hover:text-primary"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5 uppercase tracking-wider">Logout</span>
          </button>
        ) : (
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[52px] py-1.5 px-1 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-0.5 uppercase tracking-wider">Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
