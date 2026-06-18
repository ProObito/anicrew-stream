import { useQuery } from "@tanstack/react-query";
import { mm, normalizeMM, pickArray } from "@/lib/multimovies";
import MMCard from "@/components/MMCard";
import { SkeletonGrid } from "@/components/SkeletonCard";

const MoviesPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mm-movies-list"],
    queryFn: async () => {
      // Aggregate enough to show ~100
      const pages = await Promise.all([1, 2, 3, 4, 5, 6].map((p) => mm.movies(p).catch(() => null)));
      const items: any[] = [];
      for (const p of pages) {
        items.push(...pickArray(p, "movies", "items", "results"));
        if (items.length >= 100) break;
      }
      return items.slice(0, 100).map(normalizeMM);
    },
  });

  return (
    <div className="pt-20 pb-24 md:pb-10 px-4 md:px-16 lg:px-24">
      <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight mb-6">
        Movies
      </h1>
      {isLoading && <SkeletonGrid count={18} />}
      {isError && <p className="text-muted-foreground">Failed to load movies.</p>}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((m) => (
            <MMCard key={m.slug} item={m} kind="movie" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
