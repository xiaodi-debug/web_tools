import Mock from "mockjs";

type SortType = "latest" | "hot" | "all";

type CategoryKey =
  | "all"
  | "movie"
  | "tv"
  | "anime"
  | "music"
  | "game"
  | "software"
  | "doc"
  | "other";

const categories: Array<{ key: CategoryKey; name: string }> = [
  { key: "all", name: "全部" },
  { key: "movie", name: "影视" },
  { key: "tv", name: "剧集" },
  { key: "anime", name: "动漫" },
  { key: "music", name: "音乐" },
  { key: "game", name: "游戏" },
  { key: "software", name: "软件" },
  { key: "doc", name: "资料" },
  { key: "other", name: "其它" },
];

const randomSize = () => {
  const unit = Mock.Random.pick(["MB", "GB"]);
  const n =
    unit === "GB"
      ? Mock.Random.float(0.7, 8, 1, 1)
      : Mock.Random.integer(200, 980);
  return `${n}${unit}`;
};

const randomTitle = (keyword: string, idx: number) => {
  const base = keyword?.trim()
    ? keyword.trim()
    : Mock.Random.pick(["资源", "合集", "高清", "网盘", "教程"]);
  const suffix = Mock.Random.pick([
    "1080P",
    "4K",
    "合集",
    "中字",
    "无损",
    "完整版",
    "珍藏版",
    "高码率",
  ]);
  return `${base} ${suffix} #${idx}`;
};

const genItem = (
  keyword: string,
  category: CategoryKey,
  sort: SortType,
  idx: number
) => {
  const id = `${category}-${sort}-${Mock.Random.guid()}`;
  const title = randomTitle(keyword, idx);
  const updatedAt = Mock.Random.datetime("yyyy-MM-dd HH:mm:ss");
  const source = Mock.Random.pick([
    "夸克",
    "百度网盘",
    "阿里云盘",
    "迅雷",
    "天翼",
  ]);
  const size = randomSize();
  const hot = Mock.Random.integer(120, 9800);

  const qualityTag = Mock.Random.pick([
    "1080p",
    "4K",
    "FLAC",
    "Windows",
    "PDF",
    "MP3",
  ]);
  const rating = Mock.Random.float(3.8, 5, 1, 1);
  const views = `${Mock.Random.float(1.2, 56.0, 1, 1)}k`;

  const extractedUrl = `https://example.com/share/${encodeURIComponent(id)}`;
  const downloadUrl = `https://example.com/download/${encodeURIComponent(id)}`;

  const coverUrl = `https://picsum.photos/seed/${encodeURIComponent(
    id
  )}/640/360`;

  return {
    id,
    title,
    category,
    coverUrl,
    qualityTag,
    rating,
    views,
    source,
    size,
    updatedAt,
    hot,
    extractedUrl,
    downloadUrl,
    tags: Mock.Random.shuffle([
      categories.find((c) => c.key === category)?.name || "其它",
      source,
      sort === "hot" ? "热门" : "最新",
    ]).slice(0, 3),
  };
};

export const setupResourceMock = () => {
  Mock.mock(/\/api\/resources\/categories/, "get", () => {
    return {
      code: 0,
      message: "ok",
      data: {
        list: categories,
      },
    };
  });

  Mock.mock(/\/api\/resources\/search/, "get", (options: { url: string }) => {
    const url = new URL(options.url, "http://localhost");
    const keyword = url.searchParams.get("keyword") || "";
    const category = (url.searchParams.get("category") || "all") as CategoryKey;
    const sort = (url.searchParams.get("sort") || "latest") as SortType;
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 10);

    const total = 217;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const list = Array.from({ length: Math.max(0, end - start) }).map((_, i) =>
      genItem(keyword, category, sort, start + i + 1)
    );

    return {
      code: 0,
      message: "ok",
      data: {
        list,
        total,
        page,
        pageSize,
      },
    };
  });

  Mock.mock(/\/api\/resources\/hot\/daily/, "get", () => {
    const list = Array.from({ length: 10 }).map((_, i) => {
      const id = Mock.Random.guid();
      return {
        id,
        rank: i + 1,
        title: `${Mock.Random.pick([
          "每日",
          "热门",
          "爆款",
          "推荐",
        ])} ${Mock.Random.pick([
          "资源",
          "合集",
          "教程",
          "影视",
          "资料",
        ])} ${Mock.Random.integer(1, 999)}`,
        url: `https://example.com/hot/${encodeURIComponent(id)}`,
      };
    });
    return {
      code: 0,
      message: "ok",
      data: {
        list,
      },
    };
  });

  Mock.mock(/\/api\/resources\/hot\/recommend/, "get", () => {
    const list = Array.from({ length: 8 }).map((_, i) => {
      const id = Mock.Random.guid();
      return {
        id,
        rank: i + 1,
        title: `${Mock.Random.pick([
          "推荐",
          "精选",
          "口碑",
          "高分",
        ])} ${Mock.Random.pick([
          "资源",
          "合集",
          "工具",
          "课程",
          "剧集",
        ])} ${Mock.Random.integer(1, 999)}`,
        url: `https://example.com/recommend/${encodeURIComponent(id)}`,
      };
    });
    return {
      code: 0,
      message: "ok",
      data: {
        list,
      },
    };
  });
};
