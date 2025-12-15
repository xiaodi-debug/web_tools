export type VideoPlatform =
  | "douyin"
  | "tiktok"
  | "kuaishou"
  | "xiaohongshu"
  | "bilibili"
  | "youtube"
  | "weibo"
  | "xigua"
  | "haokan"
  | "wechat_video"
  | "pipixia"
  | "jd";

export type ParseResult = {
  platform: VideoPlatform;
  title: string;
  author?: string;
  coverUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
  sourceUrl: string;
  extractedUrl: string;
  downloadUrl?: string;
};

export type PlatformCard = {
  key: VideoPlatform;
  name: string;
  iconName: string;
};

export const platformCards: PlatformCard[] = [
  {
    key: "bilibili",
    name: "哔哩哔哩",
    iconName: "bilibili",
  },
  {
    key: "douyin",
    name: "抖音",
    iconName: "douyin",
  },
  {
    key: "xiaohongshu",
    name: "小红书",
    iconName: "xiaohongshu",
  },
  {
    key: "kuaishou",
    name: "快手",
    iconName: "kuaishou",
  },
  {
    key: "tiktok",
    name: "Tik Tok",
    iconName: "tiktok",
  },
  {
    key: "youtube",
    name: "YouTube",
    iconName: "youtube",
  },
  {
    key: "weibo",
    name: "微博",
    iconName: "shejiaotubiao-06",
  },
  {
    key: "pipixia",
    name: "皮皮虾",
    iconName: "pipixia",
  },
  {
    key: "xigua",
    name: "西瓜视频",
    iconName: "xigua",
  },
  {
    key: "haokan",
    name: "好看视频",
    iconName: "haokanshipin",
  },
  {
    key: "wechat_video",
    name: "微视/视频号",
    iconName: "tengxunweishi",
  },
  {
    key: "jd",
    name: "京东",
    iconName: "jingdong",
  },
];

export function extractUrl(text: string) {
  const t = (text || "").trim();
  if (!t) return "";
  const match = t.match(/https?:\/\/[^\s]+/i);
  if (match?.[0]) return match[0].replace(/[)\]}>"'，。,.!]+$/, "");
  return "";
}

export function extractUrls(text: string) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const urls = lines.map((l) => extractUrl(l)).filter(Boolean);
  // unique
  return Array.from(new Set(urls));
}

export function detectPlatform(u: string): VideoPlatform {
  const lower = u.toLowerCase();
  if (/(v\.douyin\.com|douyin\.com)/.test(lower)) return "douyin";
  if (/(tiktok\.com|vm\.tiktok\.com)/.test(lower)) return "tiktok";
  if (/(kuaishou\.com|v\.kuaishou\.com)/.test(lower)) return "kuaishou";
  if (/xiaohongshu\.com/.test(lower)) return "xiaohongshu";
  if (/(bilibili\.com|b23\.tv)/.test(lower)) return "bilibili";
  if (/(youtube\.com|youtu\.be)/.test(lower)) return "youtube";
  if (/weibo\.com/.test(lower)) return "weibo";
  if (/(ixigua\.com|xiguaapp\.cn)/.test(lower)) return "xigua";
  if (/haokan\.baidu\.com/.test(lower)) return "haokan";
  if (/(weishi\.qq\.com|channels\.weixin\.qq\.com)/.test(lower))
    return "wechat_video";
  if (/pipix\.com/.test(lower)) return "pipixia";
  return "jd";
}

export async function parseVideo(sourceUrl: string): Promise<ParseResult> {
  const extracted = extractUrl(sourceUrl);
  const platform = detectPlatform(extracted);
  await new Promise((r) => setTimeout(r, 650));

  const coverUrl =
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60";
  const videoUrl =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  const platformName =
    platformCards.find((x) => x.key === platform)?.name || platform;

  if (platform === "xigua") {
    return {
      platform,
      title: "西瓜视频示例（xgplayer）",
      author: "Demo",
      coverUrl,
      videoUrl,
      durationSeconds: 38,
      sourceUrl,
      extractedUrl: extracted,
      downloadUrl: videoUrl,
    };
  }

  return {
    platform,
    title: `示例解析结果（${platformName}）`,
    author: "Demo",
    coverUrl,
    videoUrl,
    durationSeconds: 38,
    sourceUrl,
    extractedUrl: extracted,
    downloadUrl: videoUrl,
  };
}
