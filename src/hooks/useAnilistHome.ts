import { useQuery } from "@tanstack/react-query";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FRAGMENT = `
  fragment MediaFields on Media {
    id
    title { romaji english }
    coverImage { extraLarge large }
    bannerImage
    format
    episodes
    duration
    averageScore
    popularity
    genres
    description(asHtml: false)
    status
    season
    seasonYear
    nextAiringEpisode { episode timeUntilAiring }
  }
`;

const HOME_QUERY = `
${MEDIA_FRAGMENT}
query {
  trending: Page(page: 1, perPage: 20) {
    media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ...MediaFields }
  }
  popular: Page(page: 1, perPage: 20) {
    media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ...MediaFields }
  }
  topRated: Page(page: 1, perPage: 20) {
    media(sort: SCORE_DESC, type: ANIME, isAdult: false, averageScore_greater: 75) { ...MediaFields }
  }
  topAiring: Page(page: 1, perPage: 20) {
    media(sort: POPULARITY_DESC, type: ANIME, status: RELEASING, isAdult: false) { ...MediaFields }
  }
  upcoming: Page(page: 1, perPage: 20) {
    media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED, isAdult: false) { ...MediaFields }
  }
  recentlyUpdated: Page(page: 1, perPage: 20) {
    media(sort: UPDATED_AT_DESC, type: ANIME, status: RELEASING, isAdult: false) { ...MediaFields }
  }
  completed: Page(page: 1, perPage: 20) {
    media(sort: END_DATE_DESC, type: ANIME, status: FINISHED, isAdult: false, episodes_greater: 1) { ...MediaFields }
  }
}
`;

export interface AnilistAnime {
  id: number;
  name: string;
  poster: string;
  bannerImage: string | null;
  type: string;
  duration: string;
  rating: string | null;
  episodes: { sub: number | null; dub: number | null };
  jname?: string;
  description?: string;
  genres: string[];
  popularity: number;
  nextEpisode?: number;
}

const FORMAT_MAP: Record<string, string> = {
  TV: "TV", TV_SHORT: "TV Short", MOVIE: "Movie", SPECIAL: "Special",
  OVA: "OVA", ONA: "ONA", MUSIC: "Music",
};

function mapMedia(media: any): AnilistAnime {
  return {
    id: media.id,
    name: media.title?.english || media.title?.romaji || "Unknown",
    poster: media.coverImage?.extraLarge || media.coverImage?.large || "",
    bannerImage: media.bannerImage || null,
    type: FORMAT_MAP[media.format] || media.format || "",
    duration: media.duration ? `${media.duration}m` : "",
    rating: media.averageScore ? `${media.averageScore}%` : null,
    episodes: {
      sub: media.episodes || media.nextAiringEpisode?.episode || null,
      dub: null,
    },
    jname: media.title?.romaji || "",
    description: media.description?.replace(/<[^>]*>/g, "") || "",
    genres: media.genres || [],
    popularity: media.popularity || 0,
    nextEpisode: media.nextAiringEpisode?.episode,
  };
}

export function useAnilistHome() {
  return useQuery({
    queryKey: ["anilist-home"],
    queryFn: async () => {
      const res = await fetch(ANILIST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: HOME_QUERY }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "AniList error");
      return json.data;
    },
    select: (data) => ({
      trending: (data.trending?.media || []).map(mapMedia),
      topAiring: (data.topAiring?.media || []).map(mapMedia),
      mostPopular: (data.popular?.media || []).map(mapMedia),
      topRated: (data.topRated?.media || []).map(mapMedia),
      upcoming: (data.upcoming?.media || []).map(mapMedia),
      recentlyUpdated: (data.recentlyUpdated?.media || []).map(mapMedia),
      completed: (data.completed?.media || []).map(mapMedia),
      spotlight: (data.trending?.media || [])
        .filter((m: any) => m.bannerImage)
        .slice(0, 8)
        .map(mapMedia),
    }),
    staleTime: 10 * 60 * 1000,
  });
}
