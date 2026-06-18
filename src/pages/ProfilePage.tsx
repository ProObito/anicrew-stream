import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlistStore } from "@/store/watchlistStore";
import { LogOut, Shield, Heart, Mail } from "lucide-react";

const ProfilePage = () => {
  const { user, isAdmin, signOut } = useAuth();
  const watchlistCount = useWatchlistStore((s) => s.items.length);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/auth", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const name = (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "Friend";
  const avatar = (user.user_metadata as any)?.avatar_url;

  return (
    <div className="pt-20 pb-24 md:pb-10 px-4 md:px-12 lg:px-24 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center overflow-hidden shrink-0">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-display font-black uppercase text-primary">{name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-black uppercase tracking-tight">{name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate("/watchlist")} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 border border-border hover:border-primary/40 transition text-left">
              <Heart className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Watchlist</div>
                <div className="font-bold">{watchlistCount} items</div>
              </div>
            </button>
            {isAdmin && (
              <button onClick={() => navigate("/admin")} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60 border border-border hover:border-primary/40 transition text-left">
                <Shield className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div>
                  <div className="font-bold">Dashboard</div>
                </div>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => signOut().then(() => navigate("/"))}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive font-bold uppercase tracking-wider text-sm hover:bg-destructive/25 transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
