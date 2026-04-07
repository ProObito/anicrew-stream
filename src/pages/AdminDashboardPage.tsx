import { useState } from "react";
import { Film, PlusCircle, Users, Search, Trash2, ShieldPlus, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EpisodeLinkEditor from "@/components/EpisodeLinkEditor";
import { toast } from "sonner";

type Tab = "editEpisodes" | "manageAdmins";

const ANILIST_SEARCH = "https://graphql.anilist.co";

const AdminDashboardPage = () => {
  const { user, isAdmin, isOwner, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("editEpisodes");

  // Anime search for episode editing
  const [animeSearch, setAnimeSearch] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<{ id: number; title: string } | null>(null);

  // Admin management
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const qc = useQueryClient();

  // Search Anilist
  const { data: searchResults } = useQuery({
    queryKey: ["admin-anime-search", animeSearch],
    queryFn: async () => {
      const res = await fetch(ANILIST_SEARCH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query($search:String){Page(page:1,perPage:10){media(search:$search,type:ANIME){id title{romaji english}coverImage{medium}}}}`,
          variables: { search: animeSearch },
        }),
      });
      const json = await res.json();
      return json.data?.Page?.media ?? [];
    },
    enabled: animeSearch.length >= 2,
  });

  // Fetch all admins (owner only)
  const { data: adminUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, profiles(email, display_name)")
        .in("role", ["admin", "owner"]);
      if (error) throw error;
      return data;
    },
    enabled: isOwner,
  });

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    try {
      // Find user by email in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", newAdminEmail.trim())
        .single();
      if (!profile) {
        toast.error("User not found. They must sign up first.");
        return;
      }
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.user_id, role: "admin" as const });
      if (error) throw error;
      toast.success(`${newAdminEmail} is now an admin!`);
      setNewAdminEmail("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveAdmin = async (roleId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) toast.error(error.message);
    else {
      toast.success("Admin removed");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 pt-16">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const sidebarItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "editEpisodes", label: "Edit Episodes", icon: <Film className="w-5 h-5" /> },
    ...(isOwner ? [{ id: "manageAdmins" as Tab, label: "Manage Admins", icon: <Users className="w-5 h-5" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex pt-16">
      {/* SIDEBAR */}
      <div className="w-64 bg-card border-r border-border flex-col p-6 hidden md:flex shrink-0">
        <h2 className="text-2xl font-display font-black uppercase text-primary mb-10 tracking-widest">
          Admin Panel
        </h2>
        <nav className="flex flex-col space-y-2 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition text-sm font-medium ${
                activeTab === item.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Logged in as</p>
          <p className="font-bold text-sm text-primary">
            {isOwner ? "OWNER" : "ADMIN"} ({user.email})
          </p>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "editEpisodes" && (
            <div className="max-w-4xl">
              <h1 className="text-3xl font-display font-bold mb-6">Edit Anime Episodes</h1>
              
              {/* Search Anime */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={animeSearch}
                  onChange={(e) => { setAnimeSearch(e.target.value); setSelectedAnime(null); }}
                  placeholder="Search anime on AniList..."
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition"
                />
                {searchResults && searchResults.length > 0 && !selectedAnime && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl max-h-60 overflow-y-auto z-10">
                    {searchResults.map((a: any) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedAnime({ id: a.id, title: a.title?.english || a.title?.romaji });
                          setAnimeSearch(a.title?.english || a.title?.romaji);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition text-left"
                      >
                        <img src={a.coverImage?.medium} alt="" className="w-8 h-12 object-cover rounded" />
                        <span className="text-sm font-medium text-foreground">{a.title?.english || a.title?.romaji}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedAnime && (
                <EpisodeLinkEditor
                  anilistId={String(selectedAnime.id)}
                  animeName={selectedAnime.title}
                />
              )}
            </div>
          )}

          {activeTab === "manageAdmins" && isOwner && (
            <div className="max-w-2xl">
              <h1 className="text-3xl font-display font-bold mb-6">Manage Admins</h1>
              
              {/* Add admin */}
              <div className="flex gap-3 mb-8">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="User email to make admin..."
                  className="flex-1 bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition text-sm"
                />
                <button
                  onClick={handleAddAdmin}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm transition"
                >
                  <ShieldPlus className="w-4 h-4" />
                  Add Admin
                </button>
              </div>

              {/* Current admins */}
              <div className="space-y-3">
                {adminUsers?.map((ar: any) => {
                  const profile = Array.isArray(ar.profiles) ? ar.profiles[0] : ar.profiles;
                  return (
                    <div key={ar.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
                      <div>
                        <p className="font-medium text-foreground">{profile?.display_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${
                          ar.role === "owner" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                        }`}>
                          {ar.role}
                        </span>
                      </div>
                      {ar.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveAdmin(ar.id)}
                          className="text-destructive hover:text-destructive/80 p-2"
                        >
                          <ShieldOff className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
