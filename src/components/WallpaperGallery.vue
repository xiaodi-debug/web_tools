<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Waterfall from "vue3-waterfall-plugin";
import QIcon from "./QIcon.vue";
import type { WallpaperCategory, WallpaperItem } from "../api/wallpaper";

const props = defineProps<{
  category: WallpaperCategory;
  list: WallpaperItem[];
  loading?: boolean;
}>();

const loadedIds = ref(new Set<string>());
const favorites = ref(new Set<string>());
const copiedId = ref<string | null>(null);
const waterfallRef = ref<any>(null);

const router = useRouter();

const DETAIL_STORAGE_KEY = "wallpaper_detail_item";

const isLoaded = (id: string) => loadedIds.value.has(id);
const isFav = (id: string) => favorites.value.has(id);

const onOpen = (item: WallpaperItem) => {
  window.open(item.url, "_blank");
};

const onGoDetail = (item: WallpaperItem) => {
  try {
    window.sessionStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(item));
  } catch {
    // ignore
  }
  router.push(`/wallpapers/${item.id}`);
};

const toggleFav = (id: string) => {
  const next = new Set(favorites.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  favorites.value = next;
};

const onDownload = (item: WallpaperItem) => {
  window.open(item.url, "_blank");
};

const onCopy = async (item: WallpaperItem) => {
  try {
    await navigator.clipboard.writeText(item.url);
    copiedId.value = item.id;
    window.setTimeout(() => {
      if (copiedId.value === item.id) copiedId.value = null;
    }, 900);
  } catch {
    // ignore
  }
};

const formatPixels = (w: number, h: number) => `${w}×${h}`;
const approxSize = (w: number, h: number) => {
  const mb = (w * h * 3) / 1024 / 1024;
  return `${mb.toFixed(1)}MB`;
};

const onImgLoad = (item: WallpaperItem, el: HTMLImageElement | null) => {
  if (!el) return;
  const next = new Set(loadedIds.value);
  next.add(item.id);
  loadedIds.value = next;
  waterfallRef.value?.refresh?.();
};

const skeletonClass = (id: string) => {
  const loaded = isLoaded(id);
  return [{ loaded }];
};

const desktopConfig = computed(() => ({
  gutter: 14,
  width: 268,
  breakpoints: {
    1400: { rowPerView: 5 },
    1100: { rowPerView: 4 },
    850: { rowPerView: 3 },
    620: { rowPerView: 2 },
    480: { rowPerView: 1 },
  },
}));

const mobileConfig = computed(() => ({
  gutter: 14,
  width: 210,
  breakpoints: {
    1400: { rowPerView: 6 },
    1100: { rowPerView: 5 },
    850: { rowPerView: 4 },
    620: { rowPerView: 3 },
    480: { rowPerView: 2 },
  },
}));

const avatarConfig = computed(() => ({
  gutter: 14,
  width: 120,
  breakpoints: {
    1400: { rowPerView: 10 },
    1100: { rowPerView: 9 },
    850: { rowPerView: 7 },
    620: { rowPerView: 5 },
    480: { rowPerView: 4 },
  },
}));

watch(
  () => props.category,
  () => {
    loadedIds.value = new Set<string>();
    copiedId.value = null;
    // keep favorites across categories? reset to avoid cross-category bleed
    favorites.value = new Set<string>();
    waterfallRef.value = null;
  }
);
</script>

<template>
  <div v-if="props.category === 'desktop'" class="gallery">
    <Waterfall
      ref="waterfallRef"
      :key="'desktop'"
      :list="props.list"
      :gutter="desktopConfig.gutter"
      :width="desktopConfig.width"
      :breakpoints="desktopConfig.breakpoints"
      animationEffect="fadeIn"
      backgroundColor="transparent"
    >
      <template #item="slotProps">
        <button class="card-btn" type="button" @click="onOpen(slotProps.data)">
          <div class="media">
            <div
              class="img-skeleton"
              :class="skeletonClass(slotProps.data.id)"
            ></div>
            <img
              class="img"
              :class="{ loaded: isLoaded(slotProps.data.id) }"
              :src="slotProps.data.thumbUrl"
              :alt="slotProps.data.title"
              loading="lazy"
              @load="(e) => onImgLoad(slotProps.data, e.target as HTMLImageElement)"
            />

            <div class="overlay">
              <div class="overlay-top">
                <div class="overlay-title text-truncate">
                  {{ slotProps.data.title }}
                </div>
                <div v-if="slotProps.data.tags?.length" class="overlay-tags">
                  <span
                    v-for="t in slotProps.data.tags.slice(0, 3)"
                    :key="t"
                    class="tag-chip"
                  >
                    {{ t }}
                  </span>
                </div>
              </div>

              <div class="overlay-center">
                <button
                  class="go-btn"
                  type="button"
                  @click.stop.prevent="onGoDetail(slotProps.data)"
                >
                  前往
                </button>
              </div>

              <div class="overlay-bottom">
                <div class="overlay-stats">
                  <span class="stat">{{
                    formatPixels(slotProps.data.width, slotProps.data.height)
                  }}</span>
                  <span class="dot"></span>
                  <span class="stat">{{
                    approxSize(slotProps.data.width, slotProps.data.height)
                  }}</span>
                </div>
                <div class="overlay-actions">
                  <button
                    class="overlay-btn"
                    type="button"
                    @click.stop.prevent="onDownload(slotProps.data)"
                    title="下载"
                  >
                    <QIcon name="ri-download-2-line" :size="18" />
                  </button>
                  <button
                    class="overlay-btn"
                    type="button"
                    @click.stop.prevent="toggleFav(slotProps.data.id)"
                    title="收藏"
                  >
                    <QIcon
                      :name="
                        isFav(slotProps.data.id)
                          ? 'ri-heart-3-fill'
                          : 'ri-heart-3-line'
                      "
                      :size="18"
                    />
                  </button>
                  <button
                    class="overlay-btn"
                    type="button"
                    @click.stop.prevent="onCopy(slotProps.data)"
                    title="复制链接"
                  >
                    <QIcon
                      :name="
                        copiedId === slotProps.data.id
                          ? 'ri-check-line'
                          : 'ri-link'
                      "
                      :size="18"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </button>
      </template>
    </Waterfall>
  </div>

  <div v-else-if="props.category === 'mobile'" class="gallery">
    <Waterfall
      ref="waterfallRef"
      :key="'mobile'"
      :list="props.list"
      :gutter="mobileConfig.gutter"
      :width="mobileConfig.width"
      :breakpoints="mobileConfig.breakpoints"
      animationEffect="fadeIn"
      backgroundColor="transparent"
    >
      <template #item="slotProps">
        <button class="card-btn" type="button" @click="onOpen(slotProps.data)">
          <div class="phone-shell">
            <div class="phone-top" aria-hidden="true">
              <span class="phone-hole"></span>
              <span class="phone-speaker"></span>
            </div>
            <div class="phone-screen">
              <div class="media phone-ratio">
                <div
                  class="img-skeleton"
                  :class="skeletonClass(slotProps.data.id)"
                ></div>
                <img
                  class="img"
                  :class="{ loaded: isLoaded(slotProps.data.id) }"
                  :src="slotProps.data.thumbUrl"
                  :alt="slotProps.data.title"
                  loading="lazy"
                  @load="(e) => onImgLoad(slotProps.data, e.target as HTMLImageElement)"
                />

                <div class="overlay">
                  <div class="overlay-top">
                    <div class="overlay-title text-truncate">
                      {{ slotProps.data.title }}
                    </div>
                    <div
                      v-if="slotProps.data.tags?.length"
                      class="overlay-tags"
                    >
                      <span
                        v-for="t in slotProps.data.tags.slice(0, 3)"
                        :key="t"
                        class="tag-chip"
                      >
                        {{ t }}
                      </span>
                    </div>
                  </div>

                  <div class="overlay-center">
                    <button
                      class="go-btn"
                      type="button"
                      @click.stop.prevent="onGoDetail(slotProps.data)"
                    >
                      前往
                    </button>
                  </div>

                  <div class="overlay-bottom">
                    <div class="overlay-stats">
                      <span class="stat">{{
                        formatPixels(
                          slotProps.data.width,
                          slotProps.data.height
                        )
                      }}</span>
                      <span class="dot"></span>
                      <span class="stat">{{
                        approxSize(slotProps.data.width, slotProps.data.height)
                      }}</span>
                    </div>
                    <div class="overlay-actions">
                      <button
                        class="overlay-btn"
                        type="button"
                        @click.stop.prevent="onDownload(slotProps.data)"
                        title="下载"
                      >
                        <QIcon name="ri-download-2-line" :size="18" />
                      </button>
                      <button
                        class="overlay-btn"
                        type="button"
                        @click.stop.prevent="toggleFav(slotProps.data.id)"
                        title="收藏"
                      >
                        <QIcon
                          :name="
                            isFav(slotProps.data.id)
                              ? 'ri-heart-3-fill'
                              : 'ri-heart-3-line'
                          "
                          :size="18"
                        />
                      </button>
                      <button
                        class="overlay-btn"
                        type="button"
                        @click.stop.prevent="onCopy(slotProps.data)"
                        title="复制链接"
                      >
                        <QIcon
                          :name="
                            copiedId === slotProps.data.id
                              ? 'ri-check-line'
                              : 'ri-link'
                          "
                          :size="18"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </template>
    </Waterfall>
  </div>

  <div v-else class="gallery">
    <Waterfall
      ref="waterfallRef"
      :key="'avatar'"
      :list="props.list"
      :gutter="avatarConfig.gutter"
      :width="avatarConfig.width"
      :breakpoints="avatarConfig.breakpoints"
      animationEffect="fadeIn"
      backgroundColor="transparent"
    >
      <template #item="slotProps">
        <button
          class="avatar-btn"
          type="button"
          @click="onOpen(slotProps.data)"
        >
          <div class="avatar-square">
            <div
              class="img-skeleton"
              :class="skeletonClass(slotProps.data.id)"
            ></div>
            <img
              class="img"
              :class="{ loaded: isLoaded(slotProps.data.id) }"
              :src="slotProps.data.thumbUrl"
              :alt="slotProps.data.title"
              loading="lazy"
              @load="(e) => onImgLoad(slotProps.data, e.target as HTMLImageElement)"
            />
          </div>
        </button>
      </template>
    </Waterfall>
  </div>
</template>

<style scoped>
.gallery :deep(.wf-list) {
  width: 100%;
}

.card-btn {
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  clip-path: inset(0 round 18px);
  isolation: isolate;
  contain: paint;
  transition: transform 0.22s ease;
  width: 100%;
  background-color: #d5d5d5;
}

.card-btn:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.card-btn:focus-visible {
  z-index: 10;
}

.media {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: inherit;
  clip-path: inset(0 round 18px);
}

.img-skeleton {
  position: absolute;
  inset: 0;
  overflow: hidden;
  clip-path: inset(0 round 18px);
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
  z-index: 1;
  opacity: 1;
  transition: opacity 0.18s ease;
}

.img-skeleton.loaded {
  opacity: 0;
}

.img-skeleton::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.16) 45%,
    rgba(255, 255, 255, 0.06) 70%
  );
  transform: translateX(-60%);
  animation: shimmer 1.2s ease-in-out infinite;
}

.img-skeleton::after {
  content: none;
}

.img {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transform: scale(1.02);
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.img.loaded {
  opacity: 1;
  transform: scale(1);
}

@keyframes shimmer {
  0% {
    transform: translateX(-60%);
  }
  100% {
    transform: translateX(60%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .img-skeleton::before,
  .img-skeleton::after {
    animation: none;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.54));
  z-index: 2;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.card-btn:hover .overlay,
.card-btn:focus-visible .overlay {
  opacity: 1;
  transform: translateY(0);
}

.overlay-top {
  display: grid;
  gap: 8px;
}

.overlay-title {
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.9rem;
  font-weight: 600;
}

.overlay-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.overlay-center {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.go-btn {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.92);
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.2px;
  transform: translateY(6px);
  opacity: 0;
  transition: transform 0.22s ease, opacity 0.22s ease, background 0.22s ease;
}

.card-btn:hover .go-btn,
.card-btn:focus-visible .go-btn {
  transform: translateY(0);
  opacity: 1;
}

.go-btn:hover {
  background: rgba(0, 0, 0, 0.42);
}

.tag-chip {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.22);
}

.overlay-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.overlay-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
}

.overlay-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transform: translateY(4px);
  opacity: 0;
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.card-btn:hover .overlay-actions,
.card-btn:focus-visible .overlay-actions {
  transform: translateY(0);
  opacity: 1;
}

.overlay-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.overlay-btn:hover {
  background: rgba(0, 0, 0, 0.32);
}

.phone-shell {
  position: relative;
  padding: 12px;
  border-radius: 26px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.1));
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.phone-screen {
  border-radius: 22px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: block;
}

:global([data-bs-theme="dark"]) .phone-shell {
  border-color: rgba(255, 255, 255, 0.16);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

:global([data-bs-theme="dark"]) .phone-screen {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.phone-ratio {
  width: 100%;
  aspect-ratio: 9 / 16;
  display: block;
  min-height: 360px;
}

.phone-top {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  pointer-events: none;
}

.phone-hole {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.75);
}

.phone-speaker {
  width: 38px;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
}

.avatar-btn {
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
}

.avatar-square {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  transition: border-radius 0.18s ease, transform 0.18s ease;
}

.avatar-btn:hover .avatar-square,
.avatar-btn:focus-visible .avatar-square {
  border-radius: 999px;
  transform: translateY(-1px);
}
</style>
