import AnimeCard from "./AnimeCard";
import { SkeletonGrid } from "./SkeletonCard";
import type { AnimeResult } from "@/types/anime";

interface AnimeGridProps {
  title: string;
  animes: AnimeResult[] | undefined;
  isLoading?: boolean;
  count?: number;
}

const AnimeGrid = ({ title, animes, isLoading, count = 12 }: AnimeGridProps) => {
  if (isLoading) {
    return (
      <section className="mb-10">
        <h2 className="section-title mb-4">{title}</h2>
        <SkeletonGrid count={count} />
      </section>
    );
  }

  if (!animes || animes.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="section-title mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animes.slice(0, count).map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
};

export default AnimeGrid;
