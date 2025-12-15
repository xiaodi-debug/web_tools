import Mock from "mockjs";

type MusicItem = {
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

const genSong = (keyword: string, idx: number): MusicItem => {
  const id = Mock.Random.guid();
  const name = keyword?.trim()
    ? `${keyword.trim()} - ${Mock.Random.pick([
        "Live",
        "Remix",
        "Acoustic",
        "Version",
      ])}`
    : `${Mock.Random.pick([
        "夏天",
        "星空",
        "海边",
        "夜晚",
        "旅行",
      ])} ${Mock.Random.pick(["心动", "告白", "回忆", "自由", "拥抱"])}`;

  const artist = Mock.Random.pick([
    "Jay",
    "Eason",
    "G.E.M.",
    "YOASOBI",
    "RADWIMPS",
    "Aimer",
    "Linkin Park",
    "Coldplay",
  ]);

  // public demo media (stable)
  const url = Mock.Random.pick([
    "https://moeplayer.b0.upaiyun.com/aplayer/secretbase.mp3",
    "https://moeplayer.b0.upaiyun.com/aplayer/angel.mp3",
    "https://moeplayer.b0.upaiyun.com/aplayer/snow.mp3",
  ]);

  const cover = `https://picsum.photos/seed/music-${encodeURIComponent(
    `${keyword}-${idx}-${id}`
  )}/120/120`;

  const qualities = Mock.Random.shuffle(["SQ", "HQ"]).slice(
    0,
    Mock.Random.integer(1, 2)
  ) as Array<"SQ" | "HQ">;

  return {
    id,
    name,
    artist,
    cover,
    url,
    sq: qualities.includes("SQ"),
    hq: qualities.includes("HQ"),
    qualities,
    album: Mock.Random.pick(["Single", "Best", "Album", "EP"]),
    duration: Mock.Random.integer(120, 320),
  };
};

export const setupMusicMock = () => {
  Mock.mock(/\/api\/music\/search/, "get", (options: { url: string }) => {
    const url = new URL(options.url, "http://localhost");
    const keyword = url.searchParams.get("keyword") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 15);

    const total = 188;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    const list = Array.from({ length: Math.max(0, end - start) }).map((_, i) =>
      genSong(keyword, start + i + 1)
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

  Mock.mock(/\/api\/music\/hot/, "get", () => {
    const list = Array.from({ length: 12 }).map((_, i) => {
      const it = genSong("", i + 1);
      return {
        ...it,
        rank: i + 1,
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
