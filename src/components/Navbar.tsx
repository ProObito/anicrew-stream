import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, Users, Menu, X, LogIn, LogOut, Shield } from "lucide-react";
import { useSearchSuggestion } from "@/hooks/useAnimeData";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useAuth } from "@/hooks/useAuth";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);
  const watchlistCount = useWatchlistStore((s) => s.items.length);
  const { user, isAdmin, signOut } = useAuth();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: suggestions } = useSearchSuggestion(debouncedQuery);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestRef.current &&
        !suggestRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setQuery("");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-background/95 backdrop-blur-md border-b border-border/50" : "bg-gradient-to-b from-background/80 to-transparent"
    }`}>
      <div className="flex items-center justify-between h-16 px-8 md:px-16 lg:px-24">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-neon">
            <span className="text-primary-foreground font-display font-black text-lg leading-none">A</span>
          </div>
          <span className="text-2xl font-display font-black tracking-tight uppercase text-foreground group-hover:text-primary transition-colors">
            nicrew
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/search" className="hover:text-primary transition-colors">Search</Link>
          <Link to="/watchlist" className="relative hover:text-primary transition-colors flex items-center gap-1">
            Watchlist
            {watchlistCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                {watchlistCount}
              </span>
            )}
          </Link>
          <Link to="/room" className="hover:text-primary transition-colors">Watch Party</Link>
          {isAdmin && <Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-1"><Shield className="w-3 h-3" />Admin</Link>}
        </div>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex relative max-w-xs"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search anime..."
              className="w-full pl-9 pr-4 py-2 rounded bg-secondary/80 border border-border text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm"
            />
          </div>

          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div
              ref={suggestRef}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md p-2 max-h-80 overflow-y-auto z-50 animate-fade-in"
            >
              {suggestions.map((s: any) => (
                <Link
                  key={s.id}
                  to={`/anime/${s.id}`}
                  onClick={() => {
                    setShowSuggestions(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-2 rounded hover:bg-secondary transition-colors"
                >
                  <img
                    src={s.poster}
                    alt={s.name}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.moreInfo?.join(" • ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>

        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={() => signOut()} className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-primary text-xs uppercase tracking-wider font-medium transition">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <Link to="/auth" className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-primary text-xs uppercase tracking-wider font-medium transition">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
          <ThemeSwitcher />
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-card border-t border-border p-6 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                className="w-full pl-10 pr-4 py-2.5 rounded bg-secondary border border-border text-foreground text-sm
                  placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </form>
          <div className="flex flex-col gap-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            <Link to="/" onClick={() => setMobileMenu(false)} className="hover:text-primary transition-colors">Home</Link>
            <Link to="/search" onClick={() => setMobileMenu(false)} className="hover:text-primary transition-colors">Search</Link>
            <Link to="/watchlist" onClick={() => setMobileMenu(false)} className="hover:text-primary transition-colors flex items-center gap-2">
              Watchlist {watchlistCount > 0 && `(${watchlistCount})`}
            </Link>
            <Link to="/room" onClick={() => setMobileMenu(false)} className="hover:text-primary transition-colors">Watch Party</Link>
            {isAdmin && <Link to="/admin" onClick={() => setMobileMenu(false)} className="hover:text-primary transition-colors">Admin Panel</Link>}
            {user ? (
              <button onClick={() => { signOut(); setMobileMenu(false); }} className="hover:text-primary transition-colors text-left">Logout</button>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenu(false)} className="hover:text-primary transition-colors">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
