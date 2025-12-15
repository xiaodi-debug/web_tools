<script setup lang="ts">
import QIcon from "./QIcon.vue";
import type { MusicItem } from "../api/music";

defineProps<{
  list: MusicItem[];
  loading?: boolean;
  errorMsg?: string | null;
}>();

const emit = defineEmits<{
  (e: "play", it: MusicItem): void;
  (e: "add", it: MusicItem): void;
}>();

function getQualityTags(it: MusicItem): Array<"SQ" | "HQ"> {
  const tags: Array<"SQ" | "HQ"> = [];
  if (it.sq) tags.push("SQ");
  if (it.hq) tags.push("HQ");
  if (tags.length) return tags;
  return (it.qualities || []) as Array<"SQ" | "HQ">;
}

function formatDuration(sec?: number) {
  if (typeof sec !== "number" || !Number.isFinite(sec) || sec <= 0)
    return "--:--";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
</script>

<template>
  <div class="wrap">
    <div class="thead">
      <div class="c idx">#</div>
      <div class="c song">歌曲</div>
      <div class="c artist">歌手</div>
      <div class="c album">专辑</div>
      <div class="c dur">时长</div>
      <div class="c act">操作</div>
    </div>

    <div v-if="errorMsg" class="alert alert-danger mb-0" role="alert">
      {{ errorMsg }}
    </div>

    <div v-else class="tbody">
      <div v-if="loading" class="empty">加载中...</div>
      <div v-else-if="!list.length" class="empty">暂无数据</div>

      <div v-for="(it, i) in list" :key="it.id" class="tr">
        <div class="c idx">{{ String(i + 1).padStart(2, "0") }}</div>

        <div class="c song songcell">
          <span class="name text-truncate">{{ it.name }}</span>
          <span
            v-for="q in getQualityTags(it)"
            :key="q"
            class="tag"
            :class="q.toLowerCase()"
          >
            {{ q }}
          </span>
        </div>

        <div class="c artist text-truncate">{{ it.artist }}</div>
        <div class="c album text-truncate">{{ it.album || "-" }}</div>
        <div class="c dur">{{ formatDuration(it.duration) }}</div>

        <div class="c act">
          <button
            type="button"
            class="icon-btn"
            title="播放"
            @click.stop="emit('play', it)"
          >
            <QIcon name="ri-play-circle-line" class="play" />
          </button>
          <button
            type="button"
            class="icon-btn"
            title="加入播放列表"
            @click.stop="emit('add', it)"
          >
            <QIcon name="ri-add-circle-line" class="add" />
          </button>
          <a
            class="icon-btn"
            title="下载"
            :href="it.url"
            :download="`${it.name}.mp3`"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            <QIcon name="ri-download-2-line" class="dl" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  overflow: hidden;
}

.thead {
  display: grid;
  grid-template-columns: 60px minmax(260px, 2fr) 1fr 1.2fr 80px 120px;
  gap: 0;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
}

.tbody {
  display: grid;
  gap: 0;
  padding: 0;
}

.tr {
  display: grid;
  grid-template-columns: 60px minmax(260px, 2fr) 1fr 1.2fr 80px 120px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.14);
  background: transparent;
}

.tr:last-child {
  border-bottom: 0;
}

.tr:hover {
  background: rgba(15, 23, 42, 0.03);
}

.c {
  min-width: 0;
}

.idx {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.songcell {
  color: rgba(0, 0, 0, 0.86);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  text-align: left;
}

.play {
  font-size: 20px !important;
  color: rgba(13, 110, 253, 0.95) !important;
}

.name {
  font-weight: 400;
}

.tag {
  font-size: 11px;
  font-weight: 400;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.85);
  color: rgba(0, 0, 0, 0.7);
}

.tag.sq {
  border-color: rgba(220, 53, 69, 0.22);
  background: rgba(220, 53, 69, 0.1);
  color: rgba(220, 53, 69, 0.92);
}

.tag.hq {
  border-color: rgba(25, 135, 84, 0.22);
  background: rgba(25, 135, 84, 0.1);
  color: rgba(25, 135, 84, 0.92);
}

.artist,
.album {
  color: rgba(0, 0, 0, 0.6);
  font-size: 13px;
}

.dur {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.vip {
  font-size: 11px;
  font-weight: 400;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(25, 135, 84, 0.14);
  border: 1px solid rgba(25, 135, 84, 0.22);
  color: rgba(130, 230, 190, 0.95);
}

.icon-btn {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 1);
}

.icon-btn:hover {
  background: rgba(15, 23, 42, 0.05);
}

.dl {
  font-size: 18px !important;
  color: rgba(25, 135, 84, 0.95) !important;
}

.add {
  font-size: 18px !important;
  color: rgba(13, 110, 253, 0.95) !important;
}

.empty {
  padding: 18px 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

:global([data-bs-theme="light"]) .empty {
  color: rgba(0, 0, 0, 0.55);
}

@media (max-width: 992px) {
  .thead,
  .tr {
    grid-template-columns: 46px minmax(160px, 2fr) 1fr 80px 120px;
  }
  .album {
    display: none;
  }
}

@media (max-width: 640px) {
  .thead,
  .tr {
    grid-template-columns: 46px minmax(160px, 1fr) 80px 120px;
  }
  .artist {
    display: none;
  }
}
</style>
