export interface AnimeResult {
  id: string;
  name: string;
  poster: string;
  duration: string;
  type: string;
  rating: string | null;
  episodes: {
    sub: number | null;
    dub: number | null;
  };
  jname?: string;
}

export interface AnimeInfo {
  id: string;
  name: string;
  poster: string;
  description: string;
  stats: {
    rating: string;
    quality: string;
    episodes: { sub: number; dub: number };
    type: string;
    duration: string;
  };
  moreInfo: Record<string, string | string[]>;
  seasons?: { id: string; name: string; title: string; poster: string; isCurrent: boolean }[];
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
}

export interface EpisodeSource {
  headers?: Record<string, string>;
  sources: { url: string; type: string }[];
  subtitles?: { url: string; lang: string }[];
  anilistID?: number;
  malID?: number;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  jname: string;
  poster: string;
  moreInfo: string[];
}

export interface HomeData {
  trending: AnimeResult[];
  topAiring: AnimeResult[];
  mostPopular: AnimeResult[];
  mostFavorite: AnimeResult[];
  latestCompleted: AnimeResult[];
  latestEpisode: AnimeResult[];
  topUpcoming: AnimeResult[];
  top10: {
    today: AnimeResult[];
    week: AnimeResult[];
    month: AnimeResult[];
  };
}

export interface WatchlistItem {
  id: string;
  name: string;
  poster: string;
  type: string;
  episodes: { sub: number | null; dub: number | null };
  addedAt: number;
}

export interface RoomUser {
  id: string;
  name: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  animeId: string | null;
  currentEpisode: string | null;
  users: RoomUser[];
  messages: ChatMessage[];
}
