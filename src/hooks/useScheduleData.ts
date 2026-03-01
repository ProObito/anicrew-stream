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
        popularity
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
      // Fetch past 1 day + next 7 days to cover today's already aired shows
      const dayAgo = now - 24 * 60 * 60;
      const weekLater = now + 7 * 24 * 60 * 60;

      // Fetch multiple pages for more coverage
      const fetchPage = async (page: number) => {
        const res = await fetch(ANILIST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: SCHEDULE_QUERY,
            variables: {
              page,
              perPage: 50,
              airingAtGreater: dayAgo,
              airingAtLesser: weekLater,
            },
          }),
        });
        const json = await res.json();
        return json?.data?.Page?.airingSchedules ?? [];
      };

      // Fetch 2 pages for better coverage
      const [page1, page2] = await Promise.all([fetchPage(1), fetchPage(2)]);
      const schedules = [...page1, ...page2];

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const grouped: Record<string, AiringAnime[]> = {};

      // De-duplicate by media id + episode
      const seen = new Set<string>();

      for (const s of schedules) {
        if (!s.media) continue;
        const key = `${s.media.id}-${s.episode}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const date = new Date(s.airingAt * 1000);
        const dayName = days[date.getDay()];
        if (!grouped[dayName]) grouped[dayName] = [];

        grouped[dayName].push({
          id: s.media.id,
          title: s.media.title?.english || s.media.title?.romaji || "Unknown",
          image: s.media.coverImage?.large || "",
          episode: s.episode,
          airingAt: s.airingAt,
          timeUntilAiring: s.timeUntilAiring,
          genres: s.media.genres ?? [],
        });
      }

      // Sort each day by airing time
      for (const day of Object.keys(grouped)) {
        grouped[day].sort((a, b) => a.airingAt - b.airingAt);
      }

      return grouped;
    },
    staleTime: 10 * 60 * 1000,
  });
}
