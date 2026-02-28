import { useState } from "react";
import { Film, PlusCircle, Users, Upload, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "manageAnime" | "addAnime" | "users";

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("manageAnime");

  // Placeholder — real auth will replace this
  const currentUser = { email: "admin@example.com", role: "OWNER" };

  const sidebarItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "manageAnime", label: "Manage Anime", icon: <Film className="w-5 h-5" /> },
    { id: "addAnime", label: "Add New Anime", icon: <PlusCircle className="w-5 h-5" /> },
    { id: "users", label: "Check Users", icon: <Users className="w-5 h-5" /> },
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
            {currentUser.role} ({currentUser.email})
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

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ADD NEW ANIME */}
          {activeTab === "addAnime" && (
            <div className="max-w-3xl">
              <h1 className="text-3xl font-display font-bold mb-8">Upload New Anime</h1>
              <form className="space-y-6 bg-card p-8 rounded-2xl border border-border">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Anime Title</label>
                  <input
                    type="text"
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition"
                    placeholder="e.g. Naruto Shippuden"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Synopsis / Info</label>
                  <textarea
                    rows={4}
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition resize-none"
                    placeholder="Anime description..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Cover Image URL</label>
                    <input
                      type="text"
                      className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Banner URL</label>
                    <input
                      type="text"
                      className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary transition"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center space-x-2 w-full bg-primary hover:brightness-110 text-primary-foreground p-4 rounded-xl font-bold transition mt-6"
                >
                  <Upload className="w-5 h-5" />
                  <span>Publish Anime</span>
                </button>
              </form>
            </div>
          )}

          {/* MANAGE ANIME */}
          {activeTab === "manageAnime" && (
            <div>
              <h1 className="text-3xl font-display font-bold mb-8">Manage Database</h1>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary border-b border-border text-muted-foreground uppercase text-xs tracking-wider">
                      <th className="p-4">Cover</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Episodes</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {/* Placeholder row — connect to real backend */}
                    <tr className="hover:bg-secondary/50 transition">
                      <td className="p-4">
                        <div className="w-12 h-16 bg-muted rounded" />
                      </td>
                      <td className="p-4 font-medium text-foreground">Solo Leveling</td>
                      <td className="p-4 text-muted-foreground">12 Uploaded</td>
                      <td className="p-4 flex space-x-3">
                        <button className="text-primary hover:text-primary/80 p-2">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-destructive hover:text-destructive/80 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-secondary/50 transition">
                      <td className="p-4">
                        <div className="w-12 h-16 bg-muted rounded" />
                      </td>
                      <td className="p-4 font-medium text-foreground">Jujutsu Kaisen</td>
                      <td className="p-4 text-muted-foreground">24 Uploaded</td>
                      <td className="p-4 flex space-x-3">
                        <button className="text-primary hover:text-primary/80 p-2">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-destructive hover:text-destructive/80 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                ⚠️ Backend integration needed — connect to your database to manage real anime entries.
              </p>
            </div>
          )}

          {/* CHECK USERS */}
          {activeTab === "users" && (
            <div>
              <h1 className="text-3xl font-display font-bold mb-8">Registered Users</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder user cards */}
                {["AnimeFan99", "NarutoLover", "OtakuKing"].map((name) => (
                  <div key={name} className="bg-card p-6 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <span className="bg-secondary text-xs font-bold px-2 py-1 rounded text-muted-foreground">
                        USER
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">{name.toLowerCase()}@gmail.com</p>
                    <button className="w-full mt-4 border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground py-2 rounded-lg text-sm font-medium transition">
                      Ban User
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                ⚠️ Backend integration needed — connect to your auth system to manage real users.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
