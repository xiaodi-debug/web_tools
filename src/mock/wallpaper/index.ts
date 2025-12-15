import Mock from "mockjs";

type Category = "desktop" | "mobile" | "avatar";

const getSize = (category: Category) => {
  if (category === "mobile") return { w: 1080, h: 1920, tw: 360, th: 640 };
  if (category === "avatar") return { w: 512, h: 512, tw: 256, th: 256 };
  // desktop: vary height per item so CSS columns look like a real waterfall
  const w = 1920;
  const h = 900 + Math.floor(Math.random() * 900); // 900 ~ 1800
  const tw = 520;
  const th = Math.max(260, Math.floor(tw * (h / w)));
  return { w, h, tw, th };
};

export const setupWallpaperMock = () => {
  Mock.mock(/\/api\/wallpaper\/list/, "get", (options: { url: string }) => {
    const url = new URL(options.url, "http://localhost");
    const category = (url.searchParams.get("category") ||
      "desktop") as Category;
    const keyword = url.searchParams.get("keyword") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 24);

    const total = 500;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    const list = Array.from({ length: Math.max(0, end - start) }).map(
      (_, idx) => {
        const { w, h, tw, th } = getSize(category);
        const id = `${category}-${start + idx + 1}`;
        const seed = encodeURIComponent(
          `${category}-${keyword}-${start + idx + 1}`
        );

        const urlFull = `https://picsum.photos/seed/${seed}/${w}/${h}`;
        const thumbUrl = `https://picsum.photos/seed/${seed}/${tw}/${th}`;

        return {
          id,
          title: keyword
            ? `${keyword} #${start + idx + 1}`
            : `壁纸 #${start + idx + 1}`,
          url: urlFull,
          thumbUrl,
          width: w,
          height: h,
          tags:
            category === "avatar"
              ? ["头像", "可爱"]
              : category === "mobile"
              ? ["手机", "竖屏"]
              : ["电脑", "高清"],
        };
      }
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
};
