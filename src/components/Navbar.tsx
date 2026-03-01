import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, Users, Menu, X } from "lucide-react";
import { useSearchSuggestion } from "@/hooks/useAnimeData";
import { useWatchlistStore } from "@/store/watchlistStore";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
      scrolled ? "bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-white/10 shadow-lg" : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"
    }`}>
      <div className="flex items-center justify-between h-16 px-8 md:px-16 lg:px-24">
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <span className="text-3xl font-display font-black tracking-tighter uppercase text-white drop-shadow-md">
            Ani<span className="text-red-600">Crew</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300 uppercase tracking-widest">
          <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
          <Link to="/search" className="hover:text-red-500 transition-colors">Search</Link>
          <Link to="/watchlist" className="relative hover:text-red-500 transition-colors flex items-center gap-1">
            Watchlist
            {watchlistCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                {watchlistCount}
              </span>
            )}
          </Link>
          <Link to="/room" className="hover:text-red-500 transition-colors">Watch Party</Link>
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

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden p-2 text-white"
        >
          {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-[#0f0f0f]/95 backdrop-blur-lg border-t border-white/10 p-6 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                className="w-full pl-10 pr-4 py-2.5 rounded bg-black/50 border border-white/20 text-white text-sm
                  placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-all"
              />
            </div>
          </form>
          <div className="flex flex-col gap-4 text-sm font-medium uppercase tracking-widest text-gray-300">
            <Link to="/" onClick={() => setMobileMenu(false)} className="hover:text-red-500 transition-colors">Home</Link>
            <Link to="/search" onClick={() => setMobileMenu(false)} className="hover:text-red-500 transition-colors">Search</Link>
            <Link to="/watchlist" onClick={() => setMobileMenu(false)} className="hover:text-red-500 transition-colors flex items-center gap-2">
              Watchlist {watchlistCount > 0 && `(${watchlistCount})`}
            </Link>
            <Link to="/room" onClick={() => setMobileMenu(false)} className="hover:text-red-500 transition-colors">Watch Party</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
