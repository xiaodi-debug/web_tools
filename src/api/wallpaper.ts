import { request } from "../utils/request";

export type WallpaperCategory = "desktop" | "mobile" | "avatar";

export type WallpaperItem = {
  id: string;
  title: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  tags?: string[];
};

export type WallpaperListReq = {
  category: WallpaperCategory;
  keyword?: string;
  page: number;
  pageSize: number;
};

export type WallpaperListRes = {
  list: WallpaperItem[];
  total: number;
  page: number;
  pageSize: number;
};

export const fetchWallpaperList = (params: WallpaperListReq) => {
  return request<WallpaperListRes>({
    url: "/wallpaper/list",
    method: "get",
    params,
  }).then((res) => res.data);
};
