import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSearchAnime } from "@/hooks/useAnimeData";
import AnimeCard from "@/components/AnimeCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import ErrorFallback from "@/components/ErrorFallback";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useSearchAnime(initialQ, page);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setPage(1);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="pt-20 pb-10 container mx-auto px-4">
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary border border-border text-foreground text-lg
              placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-neon transition-all"
          />
        </div>
      </form>

      {!initialQ && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground text-lg">Search for your favorite anime</p>
        </div>
      )}

      {isError && <ErrorFallback message="Search failed" onRetry={() => refetch()} />}

      {isLoading && <SkeletonGrid count={12} />}

      {data?.animes && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing results for "<span className="text-foreground">{initialQ}</span>"
            {data.totalPages > 1 && ` — Page ${page} of ${data.totalPages}`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.animes.map((a: any) => (
              <AnimeCard key={a.id} anime={a} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-glass disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-glass disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {data?.animes?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No results found</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
