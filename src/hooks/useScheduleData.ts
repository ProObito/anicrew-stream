import { useQuery } from "@tanstack/react-query";

interface AiringAnime {
  id: number;
  title: string;
  image: string;
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
  genres: string[];
}

const ANILIST_URL = "https://graphql.anilist.co";

const SCHEDULE_QUERY = `
query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
  Page(page: $page, perPage: $perPage) {
    airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: TIME) {
      id
      airingAt
      timeUntilAiring
      episode
      media {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        genres
        format
        episodes
      }
    }
  }
}
`;

export function useWeeklySchedule() {
  return useQuery({
    queryKey: ["schedule-weekly"],
    queryFn: async (): Promise<Record<string, AiringAnime[]>> => {
      const now = Math.floor(Date.now() / 1000);
      const weekLater = now + 7 * 24 * 60 * 60;

      const res = await fetch(ANILIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: SCHEDULE_QUERY,
          variables: {
            page: 1,
            perPage: 50,
            airingAtGreater: now,
            airingAtLesser: weekLater,
          },
        }),
      });

      const json = await res.json();
      const schedules = json?.data?.Page?.airingSchedules ?? [];

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const grouped: Record<string, AiringAnime[]> = {};

      for (const s of schedules) {
        const date = new Date(s.airingAt * 1000);
        const dayName = days[date.getDay()];
        if (!grouped[dayName]) grouped[dayName] = [];

        grouped[dayName].push({
          id: s.media?.id ?? s.id,
          title: s.media?.title?.english || s.media?.title?.romaji || "Unknown",
          image: s.media?.coverImage?.large || "",
          episode: s.episode,
          airingAt: s.airingAt,
          timeUntilAiring: s.timeUntilAiring,
          genres: s.media?.genres ?? [],
        });
      }

      return grouped;
    },
    staleTime: 10 * 60 * 1000,
  });
}
