<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import QIcon from "./QIcon.vue";

export type WallpaperSortKey = "default" | "newest" | "pixels";
export type WallpaperMediaType = "image" | "video";

export type WallpaperChip = {
  key: string;
  label: string;
};

const props = defineProps<{
  mediaType: WallpaperMediaType;
  keyword: string;
  loading?: boolean;
  sort: WallpaperSortKey;
  total: number;
  title: string;
  subTitle?: string;
  chips: WallpaperChip[];
  activeChip: string;
}>();

const emit = defineEmits<{
  (e: "changeMediaType", v: WallpaperMediaType): void;
  (e: "update:keyword", v: string): void;
  (e: "search"): void;
  (e: "changeSort", v: WallpaperSortKey): void;
  (e: "selectChip", key: string): void;
}>();

function onSubmit() {
  emit("search");
}

const mediaOpen = ref(false);
const mediaAnchorRef = ref<HTMLElement | null>(null);

const mediaOptions = [
  { value: "image" as const, label: "图片" },
  { value: "video" as const, label: "视频" },
];

const mediaLabel = computed(() => {
  return mediaOptions.find((x) => x.value === props.mediaType)?.label ?? "图片";
});

const toggleMedia = () => {
  if (props.loading) return;
  mediaOpen.value = !mediaOpen.value;
};

const closeMedia = () => {
  mediaOpen.value = false;
};

const selectMedia = (v: WallpaperMediaType) => {
  emit("changeMediaType", v);
  closeMedia();
};

const sortOptions = [
  { value: "default" as const, label: "热门" },
  { value: "newest" as const, label: "最新" },
  { value: "pixels" as const, label: "分辨率" },
];

const selectSort = (v: WallpaperSortKey) => {
  emit("changeSort", v);
};

const chipOpen = ref(false);
const chipAnchorRef = ref<HTMLElement | null>(null);

const toggleChip = () => {
  if (props.loading) return;
  chipOpen.value = !chipOpen.value;
};

const closeChip = () => {
  chipOpen.value = false;
};

const selectChip = (key: string) => {
  emit("selectChip", key);
  closeChip();
};

const resetChip = () => {
  const fallback = props.chips?.find((x) => x.key === "all")?.key;
  selectChip(fallback || props.chips?.[0]?.key || "all");
};

const onGlobalClick = (e: MouseEvent) => {
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (mediaOpen.value) {
    if (mediaAnchorRef.value && mediaAnchorRef.value.contains(t)) return;
    closeMedia();
  }
  if (chipOpen.value) {
    if (chipAnchorRef.value && chipAnchorRef.value.contains(t)) return;
    closeChip();
  }
};

onMounted(() => {
  window.addEventListener("click", onGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("click", onGlobalClick);
});
</script>

<template>
  <div class="header">
    <div class="head-row">
      <div class="titles">
        <div class="h1">
          <span class="title-ico">
            <QIcon name="ri-image-2-line" :size="18" />
          </span>
          <span class="title-text">{{ title }}</span>
        </div>
      </div>

      <div class="right">
        <form class="search" @submit.prevent="onSubmit">
          <div class="search-pill">
            <div ref="mediaAnchorRef" class="pill-type">
              <button
                type="button"
                class="type-btn"
                :disabled="loading"
                @click.stop="toggleMedia"
              >
                <span class="type-btn-text">{{ mediaLabel }}</span>
                <QIcon name="ri-arrow-down-s-line" class="type-caret" />
              </button>

              <div v-if="mediaOpen" class="type-pop" @click.stop>
                <button
                  v-for="opt in mediaOptions"
                  :key="opt.value"
                  type="button"
                  class="type-opt"
                  :class="{ active: opt.value === props.mediaType }"
                  @click="selectMedia(opt.value)"
                >
                  <span class="type-opt-text">{{ opt.label }}</span>
                  <QIcon
                    v-if="opt.value === props.mediaType"
                    name="ri-check-line"
                    class="type-opt-check"
                  />
                </button>
              </div>
            </div>

            <div class="pill-input">
              <input
                class="ipt"
                :value="keyword"
                :disabled="loading"
                placeholder="搜索壁纸..."
                @input="
                  emit(
                    'update:keyword',
                    ($event.target as HTMLInputElement).value
                  )
                "
              />
            </div>

            <button
              class="pill-btn"
              type="submit"
              :disabled="loading"
              title="搜索"
            >
              <QIcon name="ri-search-line" :size="18" />
              <span class="pill-btn-text">搜索</span>
            </button>
          </div>
        </form>

        <div ref="chipAnchorRef" class="chip-filter">
          <button
            type="button"
            class="chip-btn"
            :disabled="loading"
            @click.stop="toggleChip"
          >
            <QIcon name="ri-filter-3-line" :size="16" />
            <span class="chip-btn-text">高级筛选</span>
            <QIcon name="ri-arrow-down-s-line" class="chip-caret" />
          </button>

          <div v-if="chipOpen" class="chip-pop" @click.stop>
            <button type="button" class="chip-reset" @click="resetChip">
              清空筛选
            </button>

            <button
              v-for="it in props.chips"
              :key="it.key"
              type="button"
              class="chip-opt"
              :class="{ active: it.key === props.activeChip }"
              @click="selectChip(it.key)"
            >
              <span class="chip-opt-text">{{ it.label }}</span>
              <QIcon
                v-if="it.key === props.activeChip"
                name="ri-check-line"
                class="chip-opt-check"
              />
            </button>
          </div>
        </div>

        <div class="sort seg" role="group" aria-label="排序">
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            type="button"
            class="seg-btn"
            :class="{ active: opt.value === props.sort }"
            @click="selectSort(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: grid;
  gap: 10px;
}

.head-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: start;
}

.titles {
  min-width: 0;
}

.h1 {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.title-ico {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.72);
  flex: 0 0 auto;
}

.title-text {
  min-width: 0;
}

.h2 {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.chip-filter {
  position: relative;
}

.chip-btn {
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.76);
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.chip-btn:hover {
  border-color: rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 1);
}

.chip-btn:disabled {
  opacity: 0.7;
}

.chip-btn-text {
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.chip-caret {
  color: rgba(0, 0, 0, 0.55);
}

.chip-pop {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 260px;
  max-height: 300px;
  overflow: auto;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  z-index: 60;
}

.chip-reset {
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 0.72);
  border-radius: 10px;
  padding: 7px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 400;
  margin-bottom: 6px;
}

.chip-reset:hover {
  background: rgba(15, 23, 42, 0.05);
}

.chip-opt {
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.78);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.chip-opt:hover {
  background: rgba(15, 23, 42, 0.05);
}

.chip-opt.active {
  background: rgba(15, 23, 42, 0.07);
}

.chip-opt-text {
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  line-height: 1.2;
}

.chip-opt-check {
  font-size: 16px;
  color: rgba(25, 135, 84, 0.95);
}

.seg {
  display: inline-flex;
  gap: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.seg-btn {
  border: 0;
  border-radius: 0;
  height: 34px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 0.72);
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.seg-btn + .seg-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.seg-btn:hover {
  background: rgba(15, 23, 42, 0.06);
}

.seg-btn.active {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.92);
  color: #fff;
}

.seg-btn.active:hover {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.96);
}

.search {
  position: relative;
  width: min(520px, 52vw);
  display: block;
}

.search-pill {
  width: 100%;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 0 6px 0 6px;
  gap: 6px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background 0.18s ease;
}

.search-pill:hover {
  border-color: rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 1);
}

.search-pill:focus-within {
  border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.55);
  box-shadow: 0 0 0 0.22rem rgba(var(--bs-primary-rgb, 13, 110, 253), 0.18);
}

.pill-type {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 34px;
  border-radius: 12px;
  padding: 0 2px;
  background: rgba(15, 23, 42, 0.04);
}

.pill-type::after {
  content: "";
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 18px;
  background: rgba(15, 23, 42, 0.12);
}

.type-btn {
  height: 32px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.76);
  outline: 0;
  padding: 0 26px 0 10px;
  min-width: 74px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
  justify-content: space-between;
}

.type-btn:hover {
  border-color: rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 1);
}

.type-btn:disabled {
  opacity: 0.7;
}

.type-btn-text {
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.type-pop {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  min-width: unset;
  padding: 4px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  z-index: 50;
}

.type-opt {
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.78);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.type-opt:hover {
  background: rgba(15, 23, 42, 0.05);
}

.type-opt.active {
  background: rgba(15, 23, 42, 0.07);
}

.type-opt-text {
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  line-height: 1.2;
}

.type-opt-check {
  font-size: 16px;
  color: rgba(130, 230, 190, 0.95);
}

.type-caret {
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

.pill-input {
  position: relative;
  min-width: 0;
}

.ipt {
  width: 100%;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: rgba(0, 0, 0, 0.86);
  outline: 0;
  padding: 0 6px 0 12px;
}

.pill-btn {
  height: 34px;
  border-radius: 12px;
  border: 0;
  background: rgba(90, 80, 210, 0.9);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  gap: 6px;
  transition: transform 0.16s ease, background 0.16s ease,
    border-color 0.16s ease;
}

.pill-btn:hover {
  background: rgba(90, 80, 210, 0.98);
}

.pill-btn:disabled {
  opacity: 0.7;
}

.pill-btn-text {
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.pill-btn:active {
  transform: translateY(1px);
}

.sort {
  position: relative;
}

.sel {
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.76);
  outline: 0;
  padding: 0 10px;
}

.sel:hover {
  border-color: rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 1);
}

.sel:focus {
  border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.55);
  box-shadow: 0 0 0 0.22rem rgba(var(--bs-primary-rgb, 13, 110, 253), 0.18);
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pill {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.65);
}

@media (max-width: 992px) {
  .head-row {
    grid-template-columns: 1fr;
  }
  .right {
    flex-wrap: wrap;
  }
  .search {
    width: 100%;
  }
}
</style>
