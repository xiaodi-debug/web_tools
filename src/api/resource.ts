import { request } from "../utils/request";

export type ResourceCategory = {
  key: string;
  name: string;
};

export type ResourceSort = "latest" | "hot" | "all";

export type ResourceSearchItem = {
  id: string;
  title: string;
  category: string;
  coverUrl?: string;
  qualityTag?: string;
  rating?: number;
  views?: string;
  source?: string;
  size?: string;
  updatedAt?: string;
  hot?: number;
  extractedUrl: string;
  downloadUrl?: string;
  tags?: string[];
};

export type ResourceSearchParams = {
  keyword?: string;
  category?: string;
  sort?: ResourceSort;
  page?: number;
  pageSize?: number;
};

export type ResourceSearchResponse = {
  list: ResourceSearchItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type HotItem = {
  id: string;
  rank: number;
  title: string;
  url: string;
};

export async function fetchResourceCategories() {
  return request<{ list: ResourceCategory[] }>({
    url: "/resources/categories",
    method: "get",
  });
}

export async function searchResources(params: ResourceSearchParams) {
  return request<ResourceSearchResponse>({
    url: "/resources/search",
    method: "get",
    params,
  });
}

export async function fetchDailyHot() {
  return request<{ list: HotItem[] }>({
    url: "/resources/hot/daily",
    method: "get",
  });
}

export async function fetchRecommendHot() {
  return request<{ list: HotItem[] }>({
    url: "/resources/hot/recommend",
    method: "get",
  });
}
