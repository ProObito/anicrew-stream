import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistItem, AnimeResult } from "@/types/anime";

interface WatchlistStore {
  items: WatchlistItem[];
  addToWatchlist: (anime: AnimeResult) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToWatchlist: (anime) => {
        if (get().items.some((i) => i.id === anime.id)) return;
        set((s) => ({
          items: [
            {
              id: anime.id,
              name: anime.name,
              poster: anime.poster,
              type: anime.type,
              episodes: anime.episodes,
              addedAt: Date.now(),
            },
            ...s.items,
          ],
        }));
      },
      removeFromWatchlist: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      isInWatchlist: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "anicrew-watchlist" }
  )
);
