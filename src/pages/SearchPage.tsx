import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchAnime } from "@/hooks/useAnimeData";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import ErrorFallback from "@/components/ErrorFallback";

const TYPES = ["All", "TV", "Movie", "OVA", "ONA", "Special"];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "All";
  const [query, setQuery] = useState(initialQ);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, refetch } = useSearchAnime(initialQ, page);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setTypeFilter(searchParams.get("type") || "All");
    setPage(1);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params: Record<string, string> = { q: query.trim() };
      if (typeFilter !== "All") params.type = typeFilter;
      setSearchParams(params);
    }
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    if (initialQ) {
      const params: Record<string, string> = { q: initialQ };
      if (type !== "All") params.type = type;
      setSearchParams(params);
    }
  };

  const filteredAnimes = data?.animes?.filter((a: any) =>
    typeFilter === "All" ? true : a.type?.toLowerCase() === typeFilter.toLowerCase()
  );

  return (
    <div className="pt-20 pb-10 px-8 md:px-16 lg:px-24">
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anime..."
              className="w-full pl-12 pr-4 py-4 rounded bg-secondary border border-border text-foreground text-lg
                placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded flex items-center justify-center border transition-colors ${
              showFilters ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  typeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {!initialQ && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground text-lg font-medium">Search for your favorite anime</p>
        </div>
      )}

      {isError && <ErrorFallback message="Search failed" onRetry={() => refetch()} />}

      {isLoading && <SkeletonGrid count={12} />}

      {filteredAnimes && (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            Showing results for "<span className="text-foreground font-medium">{initialQ}</span>"
            {typeFilter !== "All" && <span> · Type: <span className="text-primary">{typeFilter}</span></span>}
            {data.totalPages > 1 && ` — Page ${page} of ${data.totalPages}`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAnimes.map((a: any) => (
              <AnimeCard key={a.id} anime={a} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-glass text-sm disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground font-medium">
                {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-glass text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {filteredAnimes?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No results found</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
