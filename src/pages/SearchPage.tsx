import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import TmdbCard from "@/components/TmdbCard";

const SearchPage = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data, isFetching } = useQuery({
    queryKey: ["tmdb", "search", q],
    queryFn: () => tmdb.search(q),
    enabled: q.trim().length > 1,
  });

  const results = (data?.results || []).filter((r: any) => r.media_type === "movie" || r.media_type === "tv");

  return (
    <div className="pt-20 pb-24 md:pb-10 px-4 md:px-12 lg:px-24 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight mb-4">Search</h1>

      <div className="relative mb-6 max-w-2xl">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies, series, anime..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/80 border border-border text-base focus:outline-none focus:border-primary/50"
        />
      </div>

      {q.trim().length < 2 && (
        <div className="text-sm text-muted-foreground">
          Type at least 2 characters to search. For anime,{" "}
          <button onClick={() => navigate("/anime")} className="text-primary underline">browse the Anime section</button>.
        </div>
      )}

      {isFetching && <div className="text-muted-foreground text-sm">Searching...</div>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((r: any) => (
            <TmdbCard key={`${r.id}-${r.media_type}`} item={r} />
          ))}
        </div>
      )}

      {q.trim().length > 1 && !isFetching && results.length === 0 && (
        <div className="text-muted-foreground text-sm">No results found.</div>
      )}
    </div>
  );
};

export default SearchPage;
