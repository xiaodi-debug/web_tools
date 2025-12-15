<script setup lang="ts">
import QIcon from "../../components/QIcon.vue";
import IconSymbol from "../../components/IconSymbol.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";

type HitokotoResponse = {
  hitokoto: string;
  from?: string;
  from_who?: string | null;
};

type FeatureItem = {
  to: string;
  title: string;
  desc: string;
  icon: string;
  iconName?: string;
  badge?: string;
  accent?: "blue" | "purple" | "green" | "orange";
};

type SearchEngine = "baidu" | "google" | "bing" | "github" | "yandex";

type SearchEngineOption = {
  value: SearchEngine;
  label: string;
  iconName: string;
};

const features: FeatureItem[] = [
  {
    to: "/resources",
    title: "资源搜索",
    desc: "网盘/资源聚合搜索，支持分类、排序与热榜。",
    icon: "ri-search-line",
    iconName: "sousuo_huaban1",
    badge: "NEW",
    accent: "blue",
  },
  {
    to: "/wallpapers",
    title: "壁纸搜索",
    desc: "发现高清壁纸，支持筛选、收藏与详情预览。",
    icon: "ri-image-line",
    iconName: "wallpaper",
    accent: "purple",
  },
  {
    to: "/music",
    title: "音乐搜索",
    desc: "搜索歌曲并用播放器试听，支持 SQ/HQ 展示与下载。",
    icon: "ri-music-2-line",
    iconName: "yinle",
    badge: "HOT",
    accent: "green",
  },
  {
    to: "/video",
    title: "视频解析",
    desc: "单条/批量解析视频链接，快速播放与下载。",
    icon: "ri-video-line",
    iconName: "shipinjiexi",
    accent: "orange",
  },
];

const now = ref(new Date());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});

const timeText = computed(() => {
  const d = now.value;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
});

const dateText = computed(() => {
  const d = now.value;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const week = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ][d.getDay()];
  return `${y}年${m}月${day}日${week}`;
});

const keyword = ref("");

const onSearch = () => {
  const q = keyword.value.trim();
  if (!q) return;

  const url =
    engine.value === "baidu"
      ? `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`
      : engine.value === "google"
      ? `https://www.google.com/search?q=${encodeURIComponent(q)}`
      : engine.value === "bing"
      ? `https://www.bing.com/search?q=${encodeURIComponent(q)}`
      : engine.value === "github"
      ? `https://github.com/search?q=${encodeURIComponent(q)}`
      : `https://yandex.com/search/?text=${encodeURIComponent(q)}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const engine = ref<SearchEngine>("baidu");

const engineOptions: SearchEngineOption[] = [
  {
    value: "baidu",
    label: "百度",
    iconName: "baidu",
  },
  {
    value: "google",
    label: "Google",
    iconName: "guge",
  },
  {
    value: "bing",
    label: "Bing",
    iconName: "bing",
  },
  {
    value: "github",
    label: "GitHub",
    iconName: "github",
  },
  {
    value: "yandex",
    label: "Yandex",
    iconName: "yandex",
  },
];

const currentEngine = computed<SearchEngineOption>(() => {
  return (
    engineOptions.find((x) => x.value === engine.value) ?? engineOptions[0]!
  );
});

const engineMenuOpen = ref(false);
const toggleEngineMenu = () => {
  engineMenuOpen.value = !engineMenuOpen.value;
};

const selectEngine = (v: SearchEngine) => {
  engine.value = v;
  engineMenuOpen.value = false;
};

const onGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (target.closest(".portal-search")) return;
  engineMenuOpen.value = false;
};

const quote = ref<HitokotoResponse | null>(null);
const quoteLoading = ref(false);
const quoteError = ref(false);

const fetchQuote = async () => {
  quoteLoading.value = true;
  quoteError.value = false;

  try {
    const res = await fetch("https://v1.hitokoto.cn/?encode=json", {
      method: "GET",
    });
    if (!res.ok) throw new Error("hitokoto_fetch_failed");
    const data = (await res.json()) as HitokotoResponse;
    if (!data?.hitokoto) throw new Error("hitokoto_invalid_payload");
    quote.value = data;
  } catch {
    quoteError.value = true;
    if (!quote.value) {
      quote.value = {
        hitokoto: "保持好奇，保持热爱。",
        from: "Cloud Tools",
        from_who: null,
      };
    }
  } finally {
    quoteLoading.value = false;
  }
};

onMounted(() => {
  fetchQuote();
  window.addEventListener("click", onGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("click", onGlobalClick);
});
</script>

<template>
  <div class="portal">
    <div class="container-fluid portal-shell">
      <div class="portal-center">
        <div class="portal-hero">
          <div class="portal-title">Cloud Tools</div>
          <div class="portal-clock">
            <div class="clock-time">{{ timeText }}</div>
            <div class="clock-date">{{ dateText }}</div>
          </div>
        </div>
        <div class="portal-search">
          <div class="search-inner">
            <div class="search-engine-wrap">
              <div>
                <IconSymbol
                  :title="`搜索引擎：${currentEngine.label}`"
                  @click.stop="toggleEngineMenu"
                  class="engine-icon"
                  :name="currentEngine.iconName"
                  :size="20"
                />
              </div>
            </div>

            <input
              v-model="keyword"
              class="search-input"
              placeholder="搜索网盘云音乐..."
              @keydown.enter.prevent="onSearch"
            />
            <i class="iconfont icon-wangluo"></i>
            <button
              type="button"
              class="search-btn"
              title="搜索"
              @click="onSearch"
            >
              <QIcon name="ri-search-line" :size="16" />
            </button>
          </div>

          <div v-if="engineMenuOpen" class="engine-panel" @click.stop>
            <button
              v-for="opt in engineOptions"
              :key="opt.value"
              type="button"
              class="engine-tile"
              :class="opt.value === engine ? 'is-active' : ''"
              :title="opt.label"
              @click="selectEngine(opt.value)"
            >
              <div class="engine-tile-ico">
                <IconSymbol :name="opt.iconName" :size="18" />
              </div>
              <div class="engine-tile-text">{{ opt.label }}</div>
            </button>

            <button
              type="button"
              class="engine-tile"
              title="添加"
              tabindex="-1"
            >
              <div class="engine-tile-ico">
                <QIcon name="ri-add-line" :size="18" />
              </div>
              <div class="engine-tile-text">添加</div>
            </button>
          </div>
        </div>

        <div class="metrics">
          <RouterLink
            v-for="f in features"
            :key="f.to"
            class="metric metric-link"
            :to="f.to"
          >
            <div class="metric-k mb-2">{{ f.title }}</div>
            <div class="metric-v">{{ f.desc }}</div>
            <div
              class="metric-ico"
              :class="f.accent ? `accent-${f.accent}` : ''"
            >
              <IconSymbol v-if="f.iconName" :name="f.iconName" :size="16" />
              <QIcon v-else :name="f.icon" :size="16" />
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="quote-mini" :class="quoteLoading ? 'is-loading' : ''">
        <div class="quote-mini-ico">
          <QIcon name="ri-double-quotes-l" :size="16" />
        </div>
        <div class="quote-mini-text">
          {{ quoteLoading ? "获取中..." : quote?.hitokoto }}
        </div>
        <button
          type="button"
          class="quote-mini-btn"
          :disabled="quoteLoading"
          title="换一句"
          @click="fetchQuote"
        >
          <QIcon name="ri-refresh-line" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal {
  position: relative;
  min-height: calc(100vh);
  overflow: hidden;
  color: rgba(255, 255, 255, 0.92);
}

.portal-bg {
  display: none;
}

.portal-vignette {
  display: none;
}

.portal-shell {
  position: relative;
  max-width: 1400px;
  min-height: calc(100vh);
  padding-bottom: 5px;
  display: flex;
  flex-direction: column;
}

.portal-top {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.portal-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.brand-text {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.portal-clock {
  text-align: right;
}

.clock-time {
  font-size: clamp(56px, 7vw, 96px);
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1;
}

.clock-date {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 18px;
  font-weight: 500;
}

:global([data-bs-theme="light"]) .clock-date {
  color: rgba(0, 0, 0, 0.55);
}

.portal-settings {
  display: flex;
  justify-content: flex-end;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.portal-center {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.portal-hero {
  width: min(1200px, 92vw);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding-top: 10px;
}

.portal-title {
  font-weight: 600;
  font-size: clamp(42px, 5.6vw, 72px);
  letter-spacing: 0.1px;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  line-height: 1.05;
}

.portal-search {
  width: min(760px, 92vw);
  margin-top: 16px;
  position: relative;
}

.search-inner {
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.12);
  display: grid;
  grid-template-columns: 34px 1fr 34px 34px;
  align-items: center;
  padding: 0 8px;
  gap: 8px;
}

.search-engine-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.engine-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 100%;
  border-radius: 18px;
  padding: 14px 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: flex-start;
  z-index: 30;
}

.engine-tile {
  width: 64px;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.76);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.engine-tile-ico {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.04);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.engine-tile.is-active .engine-tile-ico {
  border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.28);
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.1);
}

.engine-tile-text {
  font-size: 12px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
}

.search-input {
  width: 100%;
  height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.86);
  font-size: 14px;
  padding: 0 10px;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.45);
}

.search-engine,
.search-hot,
.search-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background-color: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: rgba(0, 0, 0, 0.76);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.search-engine {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
}

.engine-icon {
  width: 24px;
  height: 24px;
  display: block;
  cursor: pointer;
}

.engine-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  border-radius: 14px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  display: grid;
  grid-template-columns: repeat(3, 34px);
  gap: 8px;
  z-index: 20;
}

:global([data-bs-theme="light"]) .engine-menu {
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: none;
}

.engine-item {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

:global([data-bs-theme="light"]) .engine-item {
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.04);
}

.engine-item.is-active {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.14);
}

.engine-item-ico {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: block;
}

.search-hot {
  background: rgba(255, 59, 59, 0.85);
  border-color: rgba(255, 255, 255, 0.18);
}

.search-hot-ico {
  width: 16px;
  height: 16px;
  display: block;
}

.search-engine:hover,
.search-hot:hover,
.search-btn:hover {
  filter: brightness(1.05);
}

.metrics {
  width: min(860px, 92vw);
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric {
  position: relative;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
}

.metric-link {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.86);
  cursor: pointer;
  user-select: none;
  transition: transform 160ms ease, box-shadow 160ms ease,
    border-color 160ms ease;
}

.metric-link * {
  user-select: none;
  cursor: pointer;
}

.metric-link:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 23, 42, 0.18);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
}

.metric-k {
  height: 24px;
  line-height: 24px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: rgba(0, 0, 0, 0.84);
}

.metric-v {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  color: rgba(0, 0, 0, 0.6);
}

.metric-ico {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.metric-ico.accent-purple {
  background: rgba(179, 88, 255, 0.18);
}

.metric-ico.accent-blue {
  background: rgba(80, 170, 255, 0.18);
}

.metric-ico.accent-green {
  background: rgba(25, 135, 84, 0.2);
}

.metric-ico.accent-orange {
  background: rgba(255, 193, 7, 0.18);
}

.quote-mini {
  width: min(400px, 60vw);
  margin: 12px auto 0;
  border-radius: 999px;
  padding: 3px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
  display: grid;
  grid-template-columns: 32px 1fr 34px;
  align-items: center;
  gap: 8px;
}

.quote-mini.is-loading {
  opacity: 0.85;
}

.quote-mini-ico {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.04);
  color: rgba(0, 0, 0, 0.76);
}

.quote-mini-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.76);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quote-mini-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.04);
  color: rgba(0, 0, 0, 0.76);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.quote-mini-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tile {
  border-radius: 16px;
  padding: 14px 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(14px);
  text-decoration: none;
  color: rgba(255, 255, 255, 0.92);
  min-height: 92px;
  position: relative;
  display: grid;
  grid-template-rows: auto auto;
  gap: 10px;
  align-content: center;
  justify-items: center;
  transition: transform 160ms ease, background 160ms ease,
    border-color 160ms ease;
}

.tile-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.4px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
}

.tile:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.24);
}

.tile-ico {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.1);
}

.tile-ico.accent-blue {
  background: rgba(80, 170, 255, 0.18);
}

.tile-ico.accent-purple {
  background: rgba(179, 88, 255, 0.18);
}

.tile-ico.accent-green {
  background: rgba(25, 135, 84, 0.2);
}

.tile-ico.accent-orange {
  background: rgba(255, 193, 7, 0.18);
}

.tile-ico.accent-gray {
  background: rgba(255, 255, 255, 0.12);
}

.tile-title {
  font-weight: 600;
  font-size: 13px;
}

@media (max-width: 768px) {
  .portal-top {
    grid-template-columns: 1fr auto;
    gap: 10px;
  }
  .portal-settings {
    display: none;
  }
  .portal-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .portal-clock {
    text-align: left;
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .tiles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
