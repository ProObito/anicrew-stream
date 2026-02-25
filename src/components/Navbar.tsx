import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, Users, Menu, X } from "lucide-react";
import { useSearchSuggestion } from "@/hooks/useAnimeData";
import { useWatchlistStore } from "@/store/watchlistStore";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);
  const watchlistCount = useWatchlistStore((s) => s.items.length);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-display font-bold gradient-text">
            AniCrew
          </span>
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex relative flex-1 max-w-md mx-8"
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
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-neon transition-all"
            />
          </div>

          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div
              ref={suggestRef}
              className="absolute top-full left-0 right-0 mt-2 glass-card p-2 max-h-80 overflow-y-auto animate-fade-in"
            >
              {suggestions.map((s: any) => (
                <Link
                  key={s.id}
                  to={`/anime/${s.id}`}
                  onClick={() => {
                    setShowSuggestions(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <img
                    src={s.poster}
                    alt={s.name}
                    className="w-10 h-14 object-cover rounded-md"
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

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/watchlist"
            className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Heart className="w-4 h-4" />
            Watchlist
            {watchlistCount > 0 && (
              <span className="absolute -top-1.5 -right-3 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {watchlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/room"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Users className="w-4 h-4" />
            Watch Party
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden p-2 text-foreground"
        >
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden glass-card border-t border-border/50 p-4 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm
                  placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </form>
          <div className="flex flex-col gap-3">
            <Link
              to="/watchlist"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Heart className="w-4 h-4" /> Watchlist ({watchlistCount})
            </Link>
            <Link
              to="/room"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Users className="w-4 h-4" /> Watch Party
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
