<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  fetchWallpaperList,
  type WallpaperCategory,
  type WallpaperItem,
} from "../../api/wallpaper";
import WallpaperGallery from "../../components/WallpaperGallery.vue";
import WallpaperSearchHeader, {
  type WallpaperMediaType,
  type WallpaperSortKey,
} from "../../components/WallpaperSearchHeader.vue";
import type { WallpaperChip } from "../../components/WallpaperTagChips.vue";

const category = ref<WallpaperCategory>("desktop");
const keyword = ref("");

const mediaType = ref<WallpaperMediaType>("image");

const sort = ref<WallpaperSortKey>("default");

const activeChip = ref<string>("all");

const chips = computed<WallpaperChip[]>(() => {
  if (category.value === "mobile") {
    return [
      { key: "all", label: "全部" },
      { key: "4k", label: "4k" },
      { key: "dark", label: "黑暗" },
      { key: "minimal", label: "极简" },
      { key: "anime", label: "二次元" },
      { key: "nature", label: "自然" },
    ];
  }
  if (category.value === "avatar") {
    return [
      { key: "all", label: "全部" },
      { key: "girl", label: "女生" },
      { key: "boy", label: "男生" },
      { key: "anime", label: "二次元" },
      { key: "cute", label: "可爱" },
      { key: "simple", label: "简约" },
    ];
  }
  return [
    { key: "all", label: "筛选条件" },
    { key: "8k", label: "8k壁纸" },
    { key: "4k", label: "4k" },
    { key: "wide", label: "宽屏桌面" },
    { key: "black", label: "黑暗" },
    { key: "minimal", label: "极简" },
    { key: "cyber", label: "赛博" },
    { key: "nature", label: "自然" },
  ];
});

const titleText = computed(() => {
  const base =
    category.value === "desktop"
      ? "桌面"
      : category.value === "mobile"
      ? "手机"
      : "头像";
  const chipLabel = chips.value.find((x) => x.key === activeChip.value)?.label;
  const q = keyword.value.trim();
  if (q) return `${q} ${base} 图片`;
  if (chipLabel && chipLabel !== "筛选条件" && chipLabel !== "全部")
    return `${chipLabel} ${base} 图片`;
  return `${base} 图片`;
});

const subTitleText = computed(() => {
  return "点击图片可在新窗口打开";
});

const page = ref(1);
const pageSize = ref(24);
const total = ref(0);
const list = ref<WallpaperItem[]>([]);
const loading = ref(false);

const requestSeq = ref(0);

const hasMore = computed(() => list.value.length < total.value);

const load = async (reset = false) => {
  if (loading.value) return;
  if (!reset && !hasMore.value && list.value.length > 0) return;

  const seq = ++requestSeq.value;
  loading.value = true;
  try {
    const res = await fetchWallpaperList({
      category: category.value,
      keyword: keyword.value.trim() || undefined,
      page: reset ? 1 : page.value,
      pageSize: pageSize.value,
    });

    if (seq !== requestSeq.value) return;

    total.value = res.total;
    page.value = res.page;
    pageSize.value = res.pageSize;

    if (reset) {
      list.value = res.list;
    } else {
      list.value = [...list.value, ...res.list];
    }
  } finally {
    if (seq === requestSeq.value) {
      loading.value = false;
    }
  }
};

const onSearch = async () => {
  activeChip.value = keyword.value.trim() ? "custom" : activeChip.value;
  page.value = 1;
  list.value = [];
  total.value = 0;
  await load(true);
};

const onChangeSort = (v: WallpaperSortKey) => {
  sort.value = v;
};

const onSelectChip = async (it: WallpaperChip) => {
  activeChip.value = it.key;
  if (it.key === "all") keyword.value = "";
  else keyword.value = it.label;
  await onSearch();
};

const onSelectChipKey = async (key: string) => {
  const it = chips.value.find((x) => x.key === key);
  if (!it) return;
  await onSelectChip(it);
};

const onLoadMore = async () => {
  page.value += 1;
  await load(false);
};

watch(
  () => category.value,
  async () => {
    activeChip.value = "all";
    keyword.value = "";
    page.value = 1;
    list.value = [];
    total.value = 0;
    await load(true);
  },
  { immediate: true }
);
</script>

<template>
  <div class="container-fluid py-3 portal-page">
    <div class="head-wrap">
      <WallpaperSearchHeader
        :title="titleText"
        :subTitle="subTitleText"
        :mediaType="mediaType"
        :keyword="keyword"
        :loading="loading"
        :sort="sort"
        :total="total"
        :chips="chips"
        :activeChip="activeChip"
        @update:keyword="(v) => (keyword = v)"
        @search="onSearch"
        @changeMediaType="(v) => (mediaType = v)"
        @changeSort="onChangeSort"
        @selectChip="onSelectChipKey"
      />

      <div class="cat seg mt-2" role="group" aria-label="分类">
        <button
          type="button"
          class="seg-btn"
          :class="{ active: category === 'desktop' }"
          @click="category = 'desktop'"
        >
          桌面
        </button>
        <button
          type="button"
          class="seg-btn"
          :class="{ active: category === 'mobile' }"
          @click="category = 'mobile'"
        >
          手机
        </button>
        <button
          type="button"
          class="seg-btn"
          :class="{ active: category === 'avatar' }"
          @click="category = 'avatar'"
        >
          头像
        </button>
      </div>
    </div>

    <div class="divider" />

    <WallpaperGallery :key="category" :category="category" :list="list" />

    <div class="d-flex justify-content-center py-4">
      <button
        v-if="hasMore"
        class="btn btn-outline-secondary"
        type="button"
        :disabled="loading"
        @click="onLoadMore"
      >
        {{ loading ? "加载中..." : "加载更多" }}
      </button>
      <span v-else class="text-secondary small">没有更多了</span>
    </div>
  </div>
</template>

<style scoped>
.head-wrap {
  padding: 0;
}

.divider {
  height: 1px;
  margin: 12px 0 8px;
  background: rgba(15, 23, 42, 0.12);
}

.cat.seg {
  display: inline-flex;
  gap: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.cat .seg-btn {
  border: 0;
  border-radius: 0;
  height: 34px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 0.72);
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.cat .seg-btn + .seg-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.cat .seg-btn:hover {
  background: rgba(15, 23, 42, 0.06);
}

.cat .seg-btn.active {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.92);
  color: #fff;
}

.cat .seg-btn.active:hover {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.96);
}
</style>
