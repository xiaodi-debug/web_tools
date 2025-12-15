<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { OverlayScrollbars } from "overlayscrollbars";
import AppNavbar from "./components/AppNavbar.vue";
import FloatingMiniPlayer from "./components/FloatingMiniPlayer.vue";
import ScrollFab from "./components/ScrollFab.vue";

type PicsumItem = {
  id: string;
  download_url: string;
};

const STORAGE_KEY = "cloudtools_wallpaper_url";

const wallpaperUrl = ref<string>("");
const wallpaperLoading = ref(false);
const wallpaperError = ref(false);
const wallpaperList = ref<PicsumItem[]>([]);
const wallpaperIdx = ref(0);
const wallpaperPage = ref(1);

const scrollHostRef = ref<HTMLElement | null>(null);
let osInstance: ReturnType<typeof OverlayScrollbars> | null = null;

const loadWallpaperList = async () => {
  const page = wallpaperPage.value;
  const res = await fetch(
    `https://picsum.photos/v2/list?page=${page}&limit=24`,
    { method: "GET" }
  );
  if (!res.ok) throw new Error("picsum_list_failed");
  const data = (await res.json()) as PicsumItem[];
  if (!Array.isArray(data) || !data.length)
    throw new Error("picsum_list_empty");
  wallpaperList.value = data;
  wallpaperIdx.value = 0;
  wallpaperPage.value = page + 1;
};

const applyWallpaper = async (item: PicsumItem) => {
  const url = `https://picsum.photos/id/${encodeURIComponent(
    item.id
  )}/1920/1080`;
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("wallpaper_load_failed"));
    img.src = url;
  });
  wallpaperUrl.value = url;
  localStorage.setItem(STORAGE_KEY, url);
};

const nextWallpaper = async () => {
  wallpaperLoading.value = true;
  wallpaperError.value = false;
  try {
    if (!wallpaperList.value.length) {
      await loadWallpaperList();
    }
    if (wallpaperIdx.value >= wallpaperList.value.length) {
      await loadWallpaperList();
    }
    const item = wallpaperList.value[wallpaperIdx.value];
    if (!item) throw new Error("wallpaper_item_missing");
    wallpaperIdx.value += 1;
    await applyWallpaper(item);
  } catch {
    wallpaperError.value = true;
    const url = `https://picsum.photos/1920/1080?random=${Date.now()}`;
    wallpaperUrl.value = url;
    localStorage.setItem(STORAGE_KEY, url);
  } finally {
    wallpaperLoading.value = false;
  }
};

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) wallpaperUrl.value = saved;
  if (scrollHostRef.value) {
    osInstance = OverlayScrollbars(
      scrollHostRef.value,
      {
        scrollbars: {
          autoHide: "scroll",
          autoHideDelay: 600,
          theme: "os-theme-dark",
        },
      },
      {}
    );

    try {
      const vp = osInstance?.elements().viewport as HTMLElement | undefined;
      (window as any).__appScrollViewport = vp || scrollHostRef.value;

      try {
        window.dispatchEvent(
          new CustomEvent("app-scroll-ready", {
            detail: (window as any).__appScrollViewport,
          })
        );
      } catch {
        // ignore
      }
    } catch {
      (window as any).__appScrollViewport = scrollHostRef.value;
    }
  }
  nextTick(() => {
    // document.addEventListener("keydown", function (e) {
    //   if (e.key == "F12") {
    //     e.preventDefault(); // 如果按下键F12,阻止事件
    //   }
    // });
  });
});

onUnmounted(() => {
  try {
    osInstance?.destroy();
  } catch {
    // ignore
  }
  osInstance = null;

  try {
    delete (window as any).__appScrollViewport;
  } catch {
    // ignore
  }
});
</script>

<template>
  <div class="app-root" @contextmenu.prevent @copy.prevent>
    <div class="global-bg"></div>
    <div
      v-if="wallpaperUrl"
      class="global-wallpaper"
      :class="wallpaperLoading ? 'is-loading' : ''"
      :style="{ backgroundImage: `url(${wallpaperUrl})` }"
    ></div>
    <div class="global-vignette"></div>

    <div class="app-shell" style="min-height: 100vh">
      <AppNavbar />
      <main class="app-main">
        <div ref="scrollHostRef" class="app-scroll">
          <div class="app-scroll-inner">
            <RouterView />
          </div>
        </div>
      </main>

      <ScrollFab />

      <FloatingMiniPlayer />

      <button
        type="button"
        class="bg-switch"
        :class="wallpaperError ? 'is-error' : ''"
        :disabled="wallpaperLoading"
        title="切换背景"
        @click="nextWallpaper"
      >
        <i
          class="ri-palette-line"
          :class="wallpaperLoading ? 'is-hidden' : ''"
          style="font-size: 18px"
        ></i>
        <i
          class="ri-loader-4-line"
          :class="wallpaperLoading ? 'spin' : 'is-hidden'"
          style="font-size: 18px"
        ></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  cursor: default;
}

:global(input),
:global(textarea),
:global([contenteditable="true"]) {
  cursor: text;
}

:global(a),
:global(button),
:global([role="button"]),
:global([role="tab"]),
:global(label),
:global(summary) {
  cursor: pointer;
}

.app-shell {
  position: relative;
  z-index: 1;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  min-height: 0;
  padding-left: 0;
  display: flex;
}

.app-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.app-scroll-inner {
  min-height: 100%;
}

.global-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(18, 26, 38, 1), rgba(16, 18, 30, 1));
  z-index: 0;
}

.global-wallpaper {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 1;
  transition: opacity 220ms ease;
  z-index: 0;
}

.global-wallpaper.is-loading {
  opacity: 0.14;
}

.global-vignette {
  position: fixed;
  inset: 0;
  display: block;
  background: radial-gradient(
      900px 480px at 50% 35%,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.32) 72%,
      rgba(0, 0, 0, 0.48) 100%
    ),
    linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18));
  z-index: 0;
}

.bg-switch {
  position: fixed;
  right: 18px;
  bottom: 72px;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1041;
}

.bg-switch:focus {
  outline: none;
  box-shadow: none;
}

.bg-switch:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
}

.bg-switch:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.bg-switch.is-error {
  border-color: rgba(255, 193, 7, 0.5);
}

.spin {
  animation: spin 1s linear infinite;
}

.is-hidden {
  display: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
