import { request } from "../utils/request";

export type MusicItem = {
  id: string;
  name: string;
  artist: string;
  cover: string;
  url: string;
  sq?: boolean;
  hq?: boolean;
  qualities?: Array<"SQ" | "HQ">;
  album?: string;
  duration?: number;
};

export type MusicSearchParams = {
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type MusicSearchResponse = {
  list: MusicItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type MusicHotItem = MusicItem & { rank: number };

export async function searchMusic(params: MusicSearchParams) {
  return request<MusicSearchResponse>({
    url: "/music/search",
    method: "get",
    params,
  });
}

export async function fetchMusicHot() {
  return request<{ list: MusicHotItem[] }>({
    url: "/music/hot",
    method: "get",
  });
}
