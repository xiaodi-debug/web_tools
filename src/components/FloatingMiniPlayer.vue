<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import APlayer from "aplayer";
import { OverlayScrollbars } from "overlayscrollbars";
import { createPopper, type Instance } from "@popperjs/core";

export type MiniPlayerTrack = {
  title: string;
  artist: string;
  url: string;
  cover?: string;
};

type MiniPlayerApi = {
  setList: (list: MiniPlayerTrack[], playIndex?: number) => void;
  add: (track: MiniPlayerTrack, playNow?: boolean) => void;
  play: (track: MiniPlayerTrack) => void;
  toggle: () => void;
  prev: () => void;
  next: () => void;
  show: () => void;
  hide: () => void;
};

declare global {
  interface Window {
    $miniPlayer?: MiniPlayerApi;
  }
}

const STORAGE_KEY_POS = "cloudtools_mini_player_pos";

const wrapRef = ref<HTMLElement | null>(null);
const apRef = ref<HTMLElement | null>(null);
let ap: any = null;
const visible = ref(false);

const title = ref("凄美地");
const artist = ref("演唱者： 向楠/桑田/谢子因/蔡辛豪/胡宇");
const desc = ref("");

const duration = ref(0);
const currentTime = ref(0);
const seeking = ref(false);
const seekValue = ref(0);

const playing = ref(false);
const hoverKey = ref<null | "seq" | "prev" | "play" | "next" | "list">(null);
const seqActive = ref(false);
const listActive = ref(false);
const miniMode = ref(false);

const mockCover = ref(
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=60"
);

const cover = ref<string | undefined>(mockCover.value);

const placeholderDisk = new URL(
  "../assets/image/music/placeholder_disk_play_song.png",
  import.meta.url
).href;

const tonearmImg = new URL(
  "../assets/image/music/stick_bg.png",
  import.meta.url
).href;

const assets = {
  prev: new URL("../assets/image/music/prev.png", import.meta.url).href,
  prevHover: new URL("../assets/image/music/prev_hover.png", import.meta.url)
    .href,
  next: new URL("../assets/image/music/next.png", import.meta.url).href,
  nextHover: new URL("../assets/image/music/next_hover.png", import.meta.url)
    .href,
  play: new URL("../assets/image/music/play.png", import.meta.url).href,
  playHover: new URL("../assets/image/music/play_hover.png", import.meta.url)
    .href,
  pause: new URL("../assets/image/music/pause.png", import.meta.url).href,
  pauseHover: new URL("../assets/image/music/pause_hover.png", import.meta.url)
    .href,
  playbarPlay: new URL(
    "../assets/image/music/playbar_btn_play.png",
    import.meta.url
  ).href,
  playbarPause: new URL(
    "../assets/image/music/playbar_btn_pause.png",
    import.meta.url
  ).href,
  list: new URL("../assets/image/music/list.png", import.meta.url).href,
  listHover: new URL("../assets/image/music/list_hover.png", import.meta.url)
    .href,
  seq: new URL("../assets/image/music/seq.png", import.meta.url).href,
  seqHover: new URL("../assets/image/music/seq_hover.png", import.meta.url)
    .href,
};

const iconPrev = computed(() =>
  hoverKey.value === "prev" ? assets.prevHover : assets.prev
);
const iconNext = computed(() =>
  hoverKey.value === "next" ? assets.nextHover : assets.next
);
const iconList = computed(() => {
  if (listActive.value) return assets.listHover;
  return hoverKey.value === "list" ? assets.listHover : assets.list;
});
const iconSeq = computed(() => {
  if (seqActive.value) return assets.seqHover;
  return hoverKey.value === "seq" ? assets.seqHover : assets.seq;
});

const iconPlayPause = computed(() => {
  if (playing.value) return assets.playbarPause;
  return assets.playbarPlay;
});

const playlistRef = ref<any[]>([]);
const activeIndexRef = ref(-1);

const hasPlayable = computed(() => (playlistRef.value?.length || 0) > 0);

watch(
  () => hasPlayable.value,
  (v) => {
    if (!v) {
      visible.value = false;
      listActive.value = false;
    }
  }
);

const listItems = computed(() => {
  const audios = playlistRef.value || [];
  return audios.map((x: any, idx: number) => ({
    idx,
    title: x?.name || "",
    artist: x?.artist || "",
    cover: x?.cover as string | undefined,
  }));
});

const listItemsLatest10 = computed(() => {
  const arr = listItems.value;
  if (!arr.length) return [];
  return arr.slice(Math.max(0, arr.length - 10)).reverse();
});

const activeIndex = computed(() => activeIndexRef.value);

function switchTo(idx: number) {
  if (!ap) return;
  try {
    ap.list.switch(idx);
    ap.play();
    activeIndexRef.value = idx;
    playlistRef.value = [...(ap?.list?.audios || [])];
    listActive.value = false;
  } catch {
    // ignore
  }
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

const timeLeftText = computed(() =>
  formatTime(seeking.value ? seekValue.value : currentTime.value)
);
const timeRightText = computed(() => formatTime(duration.value));

const progressValue = computed(() => {
  if (duration.value <= 0) return 0;
  const t = seeking.value ? seekValue.value : currentTime.value;
  return Math.min(100, Math.max(0, (t / duration.value) * 100));
});

function toAPlayerAudio(t: MiniPlayerTrack) {
  return {
    name: t.title,
    artist: t.artist,
    url: t.url,
    cover: t.cover,
  };
}

function syncFromAPlayer(): void {
  if (!ap) return;
  const audioEl = ap.audio;
  if (audioEl) {
    duration.value = Number(audioEl.duration) || 0;
    if (!seeking.value) currentTime.value = Number(audioEl.currentTime) || 0;
    playing.value = !audioEl.paused;
  }
  const cur = ap?.list?.audios?.[ap?.list?.index];
  activeIndexRef.value =
    typeof ap?.list?.index === "number" ? ap.list.index : -1;
  playlistRef.value = [...(ap?.list?.audios || [])];
  if (cur) {
    title.value = cur.name || "";
    artist.value = cur.artist || "";
    cover.value = cur.cover || cover.value;
  }
}

function toggle() {
  if (!ap) return;
  try {
    if (ap.audio?.paused) ap.play();
    else ap.pause();
  } catch {
    // ignore
  }
}

function prev() {
  if (!ap) return;
  try {
    ap.skipBack();
  } catch {
    // ignore
  }
}

function next() {
  if (!ap) return;
  try {
    ap.skipForward();
  } catch {
    // ignore
  }
}

function onSeekInput(pctStr: string) {
  seeking.value = true;
  const pct = Number(pctStr) || 0;
  seekValue.value = duration.value > 0 ? (pct / 100) * duration.value : 0;
}

function onSeekCommit(pctStr: string) {
  if (!ap || !ap.audio) {
    seeking.value = false;
    return;
  }
  const pct = Number(pctStr) || 0;
  const t = duration.value > 0 ? (pct / 100) * duration.value : 0;
  try {
    ap.audio.currentTime = t;
    currentTime.value = t;
  } catch {
    // ignore
  } finally {
    seeking.value = false;
  }
}

function setList(list: MiniPlayerTrack[], playIndex = 0) {
  if (!ap) return;
  const audios = list.map(toAPlayerAudio);
  ap.list.clear();
  ap.list.add(audios);
  const idx = clamp(playIndex, 0, Math.max(0, audios.length - 1));
  ap.list.switch(idx);
  ap.play();
  activeIndexRef.value = idx;
  playlistRef.value = [...(ap?.list?.audios || [])];
}

function add(track: MiniPlayerTrack, playNow = false) {
  if (!ap) return;
  const audio = toAPlayerAudio(track);
  const list = ap.list?.audios || [];
  const exists = list.some((x: any) => x.url === audio.url);
  if (!exists) ap.list.add([audio]);

  playlistRef.value = [...(ap?.list?.audios || [])];

  if (playNow) {
    const idx = (ap.list?.audios || []).findIndex(
      (x: any) => x.url === audio.url
    );
    if (idx >= 0) ap.list.switch(idx);
    ap.play();
    activeIndexRef.value = idx;
  }
}

function play(track: MiniPlayerTrack) {
  add(track, true);
}

function show() {
  if (!hasPlayable.value) return;
  visible.value = true;
}

function hide() {
  visible.value = false;
}

const listBtnRef = ref<HTMLElement | null>(null);
const listPopRef = ref<HTMLElement | null>(null);
const listScrollRef = ref<HTMLElement | null>(null);
let listPopper: Instance | null = null;
let listOs: ReturnType<typeof OverlayScrollbars> | null = null;

const destroyListPopper = () => {
  try {
    listPopper?.destroy();
  } catch {
    // ignore
  }
  listPopper = null;
};

const destroyListOs = () => {
  try {
    listOs?.destroy();
  } catch {
    // ignore
  }
  listOs = null;
};

const ensureListPopper = async () => {
  await nextTick();
  if (!listActive.value) return;
  const anchor = listBtnRef.value;
  const popEl = listPopRef.value;
  if (!anchor || !popEl) return;

  if (!listPopper) {
    listPopper = createPopper(anchor, popEl, {
      placement: "top-end",
      strategy: "fixed",
      modifiers: [
        { name: "offset", options: { offset: [0, 10] } },
        { name: "preventOverflow", options: { padding: 8 } },
        {
          name: "flip",
          options: { fallbackPlacements: ["top-start", "bottom-end"] },
        },
      ],
    });
  } else {
    listPopper.update();
  }

  await nextTick();
  const host = listScrollRef.value;
  if (!host) return;
  destroyListOs();
  try {
    listOs = OverlayScrollbars(
      host,
      {
        scrollbars: {
          autoHide: "scroll",
          autoHideDelay: 600,
          theme: "os-theme-dark",
        },
      },
      {}
    );
  } catch {
    // ignore
  }
};

watch(
  () => listActive.value,
  async (v) => {
    if (v) await ensureListPopper();
    else {
      destroyListOs();
      destroyListPopper();
    }
  }
);

watch(
  () => miniMode.value,
  (v) => {
    if (!v) return;
    listActive.value = false;
    pos.value = calcDefaultPos();
    ensureInViewport();
    savePos();
  }
);

const pos = ref({ x: 0, y: 0 });
const posStyle = computed(() => ({
  transform: `translate3d(${pos.value.x}px, ${pos.value.y}px, 0)`,
}));

const dragging = ref(false);
let dragStart = { x: 0, y: 0, px: 0, py: 0 };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function calcDefaultPos() {
  const w = window.innerWidth;
  const x = Math.max(16, w - 320 - 18);
  const y = 18;
  return { x, y };
}

function loadPos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POS);
    if (!raw) return;
    const p = JSON.parse(raw) as { x?: number; y?: number };
    if (typeof p.x === "number" && typeof p.y === "number") {
      pos.value = { x: p.x, y: p.y };
    }
  } catch {
    // ignore
  }
}

function savePos() {
  try {
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(pos.value));
  } catch {
    // ignore
  }
}

function ensureInViewport() {
  const el = wrapRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const padding = 8;
  const maxX = window.innerWidth - rect.width - padding;
  const maxY = window.innerHeight - rect.height - padding;
  pos.value = {
    x: clamp(pos.value.x, padding, Math.max(padding, maxX)),
    y: clamp(pos.value.y, padding, Math.max(padding, maxY)),
  };
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true;
  dragStart = {
    x: e.clientX,
    y: e.clientY,
    px: pos.value.x,
    py: pos.value.y,
  };
  try {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  } catch {
    // ignore
  }
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  pos.value = { x: dragStart.px + dx, y: dragStart.py + dy };
}

function onPointerUp() {
  if (!dragging.value) return;
  dragging.value = false;
  ensureInViewport();
  savePos();
}

onMounted(() => {
  if (!pos.value.x && !pos.value.y) pos.value = calcDefaultPos();
  loadPos();
  ensureInViewport();

  if (apRef.value) {
    ap = new (APlayer as any)({
      container: apRef.value,
      fixed: false,
      mini: true,
      autoplay: false,
      loop: "all",
      order: "list",
      preload: "auto",
      volume: 0.7,
      listFolded: true,
      lrcType: 0,
      audio: [],
    });

    try {
      ap.on("play", () => {
        playing.value = true;
      });
      ap.on("pause", () => {
        playing.value = false;
      });
      ap.on("timeupdate", () => {
        if (!seeking.value) {
          currentTime.value = Number(ap?.audio?.currentTime) || 0;
        }
      });
      ap.on("loadedmetadata", () => {
        duration.value = Number(ap?.audio?.duration) || 0;
      });
      ap.on("listswitch", () => {
        syncFromAPlayer();
      });
      ap.on("canplay", () => {
        syncFromAPlayer();
      });
    } catch {
      // ignore
    }

    syncFromAPlayer();
  }

  window.$miniPlayer = {
    setList,
    add,
    play,
    toggle,
    prev,
    next,
    show,
    hide,
  };
});

onUnmounted(() => {
  try {
    ap?.destroy();
  } catch {
    // ignore
  }
  ap = null;
  destroyListOs();
  destroyListPopper();
  if (window.$miniPlayer) delete window.$miniPlayer;
});

const onGlobalClick = (e: MouseEvent) => {
  if (!listActive.value) return;
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (listBtnRef.value && listBtnRef.value.contains(t)) return;
  if (listPopRef.value && listPopRef.value.contains(t)) return;
  listActive.value = false;
};

const onKeydown = (e: KeyboardEvent) => {
  if (!listActive.value) return;
  if (e.key === "Escape") listActive.value = false;
};

onMounted(() => {
  window.addEventListener("click", onGlobalClick);
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("click", onGlobalClick);
  window.removeEventListener("keydown", onKeydown);
});

watch(
  () => visible.value,
  (v) => {
    if (v) ensureInViewport();
  }
);
</script>

<template>
  <div
    v-show="visible && hasPlayable"
    ref="wrapRef"
    class="mini-player"
    :style="posStyle"
  >
    <div
      class="mini-card"
      :class="[dragging ? 'is-dragging' : '', miniMode ? 'is-mini' : '']"
      :style="({ '--card-bg': `url(${cover || mockCover})` } as any)"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @dblclick="miniMode = !miniMode"
    >
      <div v-if="miniMode" class="compact">
        <img
          class="compact-cover"
          :src="cover || mockCover"
          alt="cover"
          draggable="false"
        />
        <div class="compact-title">{{ title || "未播放" }}</div>
        <div class="compact-expand" aria-hidden="true">
          <i class="ri-arrow-up-s-line"></i>
        </div>
      </div>

      <template v-else>
        <div class="content">
          <div class="left">
            <div class="vinyl-wrap">
              <div class="vinyl-aka" :class="playing ? 'is-playing' : ''">
                <img
                  class="vinyl"
                  :class="playing ? 'is-playing' : ''"
                  :src="placeholderDisk"
                  alt=""
                  draggable="false"
                />
                <img
                  class="vinyl-cover"
                  :class="playing ? 'is-playing' : ''"
                  :src="cover || mockCover"
                  alt="cover"
                  draggable="false"
                />
              </div>

              <img
                class="tonearm"
                :src="tonearmImg"
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            </div>
          </div>

          <div class="right">
            <div class="rt-title">{{ title }}</div>
            <div class="rt-sub">{{ artist }}</div>
            <div class="rt-sub">{{ desc }}</div>
          </div>
        </div>

        <div class="bottom">
          <div class="progress-row">
            <div class="time start">{{ timeLeftText }}</div>
            <input
              class="progress"
              type="range"
              min="0"
              max="100"
              :value="progressValue"
              :style="({ '--pct': progressValue + '%' } as any)"
              @input="onSeekInput(($event.target as HTMLInputElement).value)"
              @change="onSeekCommit(($event.target as HTMLInputElement).value)"
              @pointerdown.stop
            />
            <div class="time end">{{ timeRightText }}</div>
          </div>

          <div class="controls">
            <div
              class="ctl"
              role="button"
              tabindex="0"
              title="顺序"
              @pointerdown.stop
              @mouseenter="hoverKey = 'seq'"
              @mouseleave="hoverKey = null"
              @click.stop="seqActive = !seqActive"
            >
              <img class="ctl-img" :src="iconSeq" alt="" draggable="false" />
            </div>

            <div
              class="ctl"
              role="button"
              tabindex="0"
              title="上一首"
              @pointerdown.stop
              @mouseenter="hoverKey = 'prev'"
              @mouseleave="hoverKey = null"
              @click.stop="prev"
            >
              <img class="ctl-img" :src="iconPrev" alt="" draggable="false" />
            </div>

            <div
              class="ctl main"
              role="button"
              tabindex="0"
              :title="playing ? '暂停' : '播放'"
              @pointerdown.stop
              @mouseenter="hoverKey = 'play'"
              @mouseleave="hoverKey = null"
              @click.stop="toggle"
            >
              <img
                class="ctl-img main"
                :src="iconPlayPause"
                alt=""
                draggable="false"
              />
            </div>

            <div
              class="ctl"
              role="button"
              tabindex="0"
              title="下一首"
              @pointerdown.stop
              @mouseenter="hoverKey = 'next'"
              @mouseleave="hoverKey = null"
              @click.stop="next"
            >
              <img class="ctl-img" :src="iconNext" alt="" draggable="false" />
            </div>

            <div
              ref="listBtnRef"
              class="ctl"
              role="button"
              tabindex="0"
              title="列表"
              @pointerdown.stop
              @mouseenter="hoverKey = 'list'"
              @mouseleave="hoverKey = null"
              @click.stop="listActive = !listActive"
            >
              <img class="ctl-img" :src="iconList" alt="" draggable="false" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div
        v-show="visible && hasPlayable && listActive"
        ref="listPopRef"
        class="list-pop"
        @pointerdown.stop
      >
        <div class="lp-head">
          <div class="lp-title">播放列表</div>
          <div class="lp-sub">最新 10 条</div>
        </div>
        <div ref="listScrollRef" class="lp-body">
          <div
            v-for="it in listItemsLatest10"
            :key="it.idx"
            class="lp-item"
            :class="it.idx === activeIndex ? 'is-active' : ''"
            @click.stop="switchTo(it.idx)"
          >
            <div class="lp-item-title">{{ it.title }}</div>
            <div class="lp-item-sub">{{ it.artist }}</div>
          </div>
          <div v-if="listItemsLatest10.length === 0" class="lp-empty">
            暂无歌曲
          </div>
        </div>
      </div>
    </Teleport>

    <div ref="apRef" class="ap-engine" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.mini-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  z-index: 1060;
}

.mini-card {
  user-select: none;
  position: relative;
  border-radius: 18px;
  width: 320px;
  height: 200px;
  background: #fff;
  overflow: hidden;
  cursor: grab;
  direction: ltr;
}

.mini-btn {
  position: absolute !important;
  top: 10px !important;
  z-index: 111;
  right: 10px !important;
  inset-inline-end: 10px !important;
  width: 30px !important;
  height: 30px !important;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}

.mini-btn:hover {
  background: rgba(0, 0, 0, 0.32);
  border-color: rgba(255, 255, 255, 0.22);
}

.mini-btn i {
  font-size: 18px;
  line-height: 1;
}

.mini-card.is-mini {
  height: 64px;
}

.compact {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}

.compact-cover {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  object-fit: cover;
  flex: none;
}

.compact-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-expand {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
}

.mini-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--card-bg);
  background-size: cover;
  background-position: center;
  transform: scale(1.18);
  filter: blur(2px);
  opacity: 0.75;
  pointer-events: none;
}

.mini-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
      160px 120px at 18% 38%,
      rgba(0, 0, 0, 0.18),
      transparent 62%
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(0, 0, 0, 0.1) 40%,
      rgba(255, 190, 150, 0.12) 70%,
      rgba(255, 255, 255, 0.06) 100%
    );
  /* opacity: 0.22; */
  pointer-events: none;
}

.mini-card > * {
  position: relative;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  height: 118px;
  padding: 10px 12px 0;
  gap: 12px;
}

.left {
  width: 150px;
  flex: none;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.vinyl-wrap {
  position: relative;
  width: 140px;
  height: 110px;
}

.vinyl-aka {
  position: relative;
  width: 110px;
  height: 110px;
}
.vinyl {
  position: absolute;
  left: 0;
  top: 0;
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 999px;
  transform-origin: center;
}

.vinyl-aka.is-playing {
  animation: vinylSpin 6s linear infinite;
}

.vinyl-cover {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 85px;
  height: 85px;
  object-fit: cover;
  border-radius: 999px;
  /* transform-origin: center; */
}

/* .vinyl-cover.is-playing {
  animation: vinylSpin 6s linear infinite;
} */

@keyframes vinylSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tonearm {
  position: absolute;
  left: 94px;
  top: -8px;
  width: 58px;
  height: 110px;
  object-fit: contain;
  pointer-events: none;
  transform: scaleX(-1) rotate(12deg);
  transform-origin: 12px 10px;
}

.right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  padding: 0 10px;
}

.rt-title {
  font-size: 16px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.75);
}

.rt-sub {
  margin-top: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: 10px 12px 10px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  flex: none;
  width: 44px;
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
}

.time.start {
  text-align: left;
}

.time.end {
  text-align: right;
}

.progress {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.95) var(--pct),
    rgba(255, 255, 255, 0.35) var(--pct),
    rgba(255, 255, 255, 0.35) 100%
  );
  border-radius: 999px;
  outline: none;
  cursor: pointer;
}

.progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 0;
}

.progress::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 0;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.ctl {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  padding: 0;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.ctl-img {
  cursor: pointer;
}

.ctl.main {
  width: 56px;
  height: 56px;
}

.ctl-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: block;
}

.ctl-img.main {
  width: 40px;
  height: 40px;
}

.list-pop {
  width: 260px;
  max-height: 360px;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    rgba(18, 20, 26, 0.62) 0%,
    rgba(12, 14, 20, 0.52) 100%
  );
  backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  z-index: 2000;
}

.lp-head {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.lp-title {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
}

.lp-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
}

.lp-body {
  max-height: 300px;
  overflow: auto;
  padding: 6px;
}

.lp-item {
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid transparent;
}

.lp-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.16);
}

.lp-item.is-active {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.22);
}

.lp-item-title {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-item-sub {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.76);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-empty {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.76);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.7);
}

.ap-engine {
  position: fixed;
  left: -99999px;
  top: -99999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.ap-engine :global(.aplayer) {
  display: none;
}
</style>
