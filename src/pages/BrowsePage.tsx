import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Film, Tv } from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import TmdbRow from "@/components/TmdbRow";
import TmdbCard from "@/components/TmdbCard";

const BrowsePage = () => {
  const [kind, setKind] = useState<"movie" | "tv">("movie");
  const [q, setQ] = useState("");
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

  const genres = useQuery({ queryKey: ["tmdb", kind, "genres"], queryFn: () => tmdb.genres(kind) });

  const search = useQuery({
    queryKey: ["tmdb", "search", q],
    queryFn: () => tmdb.search(q),
    enabled: q.trim().length > 1,
  });

  const genreDiscover = useQuery({
    queryKey: ["tmdb", kind, "discover", activeGenre],
    queryFn: () => tmdb.discover(kind, { with_genres: activeGenre!, sort_by: "popularity.desc" }),
    enabled: activeGenre !== null,
  });

  const trending = useQuery({ queryKey: ["tmdb", kind, "trending"], queryFn: () => tmdb.trending(kind) });

  return (
    <div className="pt-20 pb-24 md:pb-10 px-4 md:px-12 lg:px-24 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight mb-4">Browse</h1>

      {/* Search */}
      <div className="relative mb-5 max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies & series..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Kind toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => { setKind("movie"); setActiveGenre(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            kind === "movie" ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground"
          }`}
        >
          <Film className="w-4 h-4" /> Movies
        </button>
        <button
          onClick={() => { setKind("tv"); setActiveGenre(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            kind === "tv" ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground"
          }`}
        >
          <Tv className="w-4 h-4" /> Series
        </button>
      </div>

      {/* Genre chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveGenre(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeGenre === null ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {genres.data?.genres.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGenre(g.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeGenre === g.id ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Search results */}
      {q.trim().length > 1 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" /> Results for "{q}"
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {search.data?.results
              .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
              .map((r: any) => (
                <TmdbCard key={`${r.id}-${r.media_type}`} item={r} />
              ))}
          </div>
        </div>
      )}

      {/* Genre grid */}
      {activeGenre !== null && q.trim().length < 2 && (
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" /> {genres.data?.genres.find((g) => g.id === activeGenre)?.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {genreDiscover.data?.results.map((r) => (
              <TmdbCard key={r.id} item={r} kind={kind} />
            ))}
          </div>
        </div>
      )}

      {/* Default: trending */}
      {activeGenre === null && q.trim().length < 2 && (
        <TmdbRow title={kind === "movie" ? "Trending Movies" : "Trending Series"} items={trending.data?.results} kind={kind} isLoading={trending.isLoading} />
      )}
    </div>
  );
};

export default BrowsePage;
