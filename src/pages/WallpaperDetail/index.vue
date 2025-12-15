<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import QIcon from "../../components/QIcon.vue";
import { fetchWallpaperList, type WallpaperItem } from "../../api/wallpaper";

const STORAGE_KEY = "wallpaper_detail_item";

const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.id || ""));

const item = ref<WallpaperItem | null>(null);

const favorites = ref(new Set<string>());
const copied = ref(false);

const formatPixels = (w: number, h: number) => `${w}×${h}`;
const approxSize = (w: number, h: number) => {
  const mb = (w * h * 3) / 1024 / 1024;
  return `${mb.toFixed(1)}MB`;
};

const loadItem = async () => {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as WallpaperItem;
      if (parsed?.id === id.value) {
        item.value = parsed;
        return;
      }
    } catch {
      // ignore
    }
  }

  const res = await fetchWallpaperList({
    category: "desktop",
    page: 1,
    pageSize: 48,
  });
  item.value = res.list.find((x) => x.id === id.value) || null;
};

const onBack = () => {
  if (window.history.length > 1) router.back();
  else router.push("/wallpapers");
};

const onDownload = () => {
  if (!item.value) return;
  window.open(item.value.url, "_blank");
};

const onToggleFav = () => {
  if (!item.value) return;
  const next = new Set(favorites.value);
  if (next.has(item.value.id)) next.delete(item.value.id);
  else next.add(item.value.id);
  favorites.value = next;
};

const onCopy = async () => {
  if (!item.value) return;
  try {
    await navigator.clipboard.writeText(item.value.url);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 900);
  } catch {
    // ignore
  }
};

const onSelectRec = (w: WallpaperItem) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(w));
  } catch {
    // ignore
  }
};

const isFav = computed(() =>
  item.value ? favorites.value.has(item.value.id) : false
);

const recList = ref<WallpaperItem[]>([]);
const loadingRec = ref(false);

const loadRecs = async () => {
  if (!item.value) return;
  loadingRec.value = true;
  try {
    const keyword = item.value.tags?.[0];
    const res = await fetchWallpaperList({
      category: "desktop",
      page: 1,
      pageSize: 36,
      keyword: keyword || undefined,
    });
    const base = res.list.filter((x) => x.id !== item.value?.id);
    // Need at least 24 items to build 6 collage cards (4 items each)
    const padded: WallpaperItem[] = [];
    const target = 24;
    if (base.length === 0) {
      recList.value = [];
      return;
    }
    for (let i = 0; i < Math.min(base.length, target); i++)
      padded.push(base[i]!);
    while (padded.length < target) {
      padded.push(base[padded.length % base.length]!);
    }
    recList.value = padded;
  } finally {
    loadingRec.value = false;
  }
};

const tags = computed(() => item.value?.tags || []);

const collectionNames = [
  "北风",
  "小羊星冰乐",
  "云端收藏",
  "星河漫游",
  "夜航船",
  "猫猫仓库",
];

const collectionGroups = computed(() => {
  const src = recList.value;
  const out: Array<{
    id: string;
    name: string;
    items: WallpaperItem[];
    avatarUrl: string;
  }> = [];

  const groupCount = 6;
  for (let gi = 0; gi < groupCount; gi++) {
    const start = gi * 4;
    const items = src.slice(start, start + 4);
    const name = collectionNames[gi % collectionNames.length] ?? "收藏";
    const avatarUrl = items[1]?.thumbUrl || items[0]?.thumbUrl || "";
    out.push({
      id: `col_${gi}`,
      name,
      items,
      avatarUrl,
    });
  }
  return out;
});

watch(
  id,
  async () => {
    item.value = null;
    recList.value = [];
    await loadItem();
    await loadRecs();
  },
  { immediate: true }
);
</script>

<template>
  <div class="detail">
    <div class="container-fluid py-3 detail-shell portal-page">
      <div class="d-flex align-items-center gap-2 mb-3">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="onBack"
        >
          <QIcon name="ri-arrow-left-line" :size="18" />
          返回
        </button>
        <div class="text-secondary small" v-if="item">{{ item.title }}</div>
      </div>

      <div class="row g-4" v-if="item">
        <div class="col-12 col-lg-7">
          <div class="preview">
            <img class="preview-img" :src="item.url" :alt="item.title" />
          </div>

          <div class="section mt-4">
            <div class="section-title">相关标签</div>
            <div v-if="tags.length" class="tag-row">
              <span v-for="t in tags" :key="t" class="tag-pill">{{ t }}</span>
            </div>
            <div v-else class="text-secondary small">暂无标签</div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="info-card portal-card portal-card-pad">
            <div class="info-top">
              <div class="info-title">{{ item.title }}</div>
              <div class="info-sub text-secondary small">
                <span>{{ formatPixels(item.width, item.height) }}</span>
                <span class="mx-2">·</span>
                <span>{{ approxSize(item.width, item.height) }}</span>
              </div>
            </div>

            <div class="actions">
              <button type="button" class="action-btn" @click="onDownload">
                <QIcon name="ri-download-2-line" :size="18" />
                下载
              </button>
              <button type="button" class="action-btn" @click="onToggleFav">
                <QIcon
                  :name="isFav ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
                  :size="18"
                />
                收藏
              </button>
              <button type="button" class="action-btn" @click="onCopy">
                <QIcon
                  :name="copied ? 'ri-check-line' : 'ri-link'"
                  :size="18"
                />
                复制
              </button>
            </div>

            <div class="desc mt-2">
              <div class="desc-title mb-2">描述</div>
              <div class="desc-body mb-2">悄悄做个梦给你~</div>
              <div class="desc-body">又怕做梦梦到你~</div>
            </div>
          </div>

          <div class="section mt-4">
            <div class="section-title">相关推荐</div>
            <div v-if="loadingRec" class="text-secondary small">加载中...</div>
            <div v-else-if="recList.length" class="rec-grid">
              <RouterLink
                v-for="w in recList.filter((_, i) => i < 12)"
                :key="w.id"
                class="rec-item"
                :to="`/wallpapers/${w.id}`"
                @click="onSelectRec(w)"
              >
                <img
                  class="rec-img"
                  :src="w.thumbUrl"
                  :alt="w.title"
                  loading="lazy"
                />
              </RouterLink>
            </div>
            <div v-else class="text-secondary small">暂无推荐</div>
          </div>
        </div>
      </div>

      <div v-if="item" class="section mt-4">
        <div class="section-title">相关收藏</div>
        <div class="collection-grid">
          <div
            v-for="g in collectionGroups"
            :key="g.id"
            class="collection-card"
            :class="{ empty: !g.items.length }"
          >
            <div class="collage">
              <div
                v-for="w in g.items"
                :key="`c_${g.id}_${w.id}`"
                class="collage-cell"
              >
                <img
                  class="collage-img"
                  :src="w.thumbUrl"
                  :alt="w.title"
                  loading="lazy"
                />
              </div>
              <div
                v-if="!g.items.length"
                class="collage-empty text-secondary small"
              >
                暂无收藏
              </div>
            </div>

            <div class="collage-avatar" aria-hidden="true">
              <div
                class="avatar-ring"
                :style="
                  g.avatarUrl
                    ? { backgroundImage: `url(${g.avatarUrl})` }
                    : undefined
                "
              >
                <QIcon v-if="!g.avatarUrl" name="ri-user-3-line" :size="18" />
              </div>
            </div>

            <div class="collage-title">{{ g.name }}</div>
          </div>
        </div>
      </div>

      <div v-if="!item" class="text-secondary">未找到该壁纸（mock）</div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  position: relative;
  min-height: calc(100vh);
}

.detail-shell {
  position: relative;
}

.preview {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-img {
  width: 100%;
  height: auto;
  display: block;
}

:global([data-bs-theme="dark"]) .preview {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.info-card {
  padding: 16px;
}

.info-title {
  font-weight: 400;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.action-btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.88);
  border-radius: 999px;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

:global([data-bs-theme="dark"]) .action-btn {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.92);
}

.section-title {
  font-weight: 400;
  margin-bottom: 10px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-pill {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.9);
}

:global([data-bs-theme="light"]) .tag-pill {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.82);
  color: rgba(0, 0, 0, 0.86);
}

.rec-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.rec-item {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.06);
  aspect-ratio: 1 / 1;
}

.rec-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

:global([data-bs-theme="dark"]) .rec-item {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  align-items: start;
  justify-items: start;
  width: 100%;
  overflow-x: clip;
}

.collection-card {
  position: relative;
  width: 100%;
  max-width: 280px;
  overflow: hidden;
  border-radius: 18px;
}

.collage {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  padding: 0;
  border-radius: 18px;
  overflow: hidden;
  background: transparent;
}

:global([data-bs-theme="dark"]) .collage {
  background: transparent;
}

.collage-cell {
  border-radius: 14px;
  overflow: hidden;
  border: none;
  background: transparent;
  aspect-ratio: 1 / 1;
  transform: scale(1);
  transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.collage-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.collage-empty {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collage-avatar {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.avatar-ring {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
  transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
  background-size: cover;
  background-position: center;
}

:global([data-bs-theme="dark"]) .avatar-ring {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);
}

.collage-title {
  position: absolute;
  left: 50%;
  top: 8px;
  transform: translate(-50%, 10px);
  opacity: 0;
  z-index: 4;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.6px;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.26s ease;
  pointer-events: none;
}

:global([data-bs-theme="light"]) .collage-title {
  color: rgba(0, 0, 0, 0.86);
  text-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
}

.collection-card:hover .collage-cell {
  transform: scale(0.9);
}

.collection-card:hover .avatar-ring {
  transform: scale(1.28);
}

.collection-card:hover .collage-title {
  transform: translate(-50%, 0);
  opacity: 1;
}
</style>
