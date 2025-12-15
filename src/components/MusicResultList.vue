<script setup lang="ts">
import QIcon from "./QIcon.vue";
import type { MusicItem } from "../api/music";

function getQualityTags(it: MusicItem): Array<"SQ" | "HQ"> {
  const tags: Array<"SQ" | "HQ"> = [];
  if (it.sq) tags.push("SQ");
  if (it.hq) tags.push("HQ");
  if (tags.length) return tags;
  return (it.qualities || []) as Array<"SQ" | "HQ">;
}

defineProps<{
  list: MusicItem[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  errorMsg?: string | null;
}>();

const emit = defineEmits<{
  (e: "play", it: MusicItem): void;
  (e: "loadMore"): void;
}>();
</script>

<template>
  <div class="list-shell">
    <div class="list-head">
      <div class="title">搜索结果</div>
      <span v-if="loading" class="text-secondary small">加载中...</span>
    </div>

    <div v-if="errorMsg" class="alert alert-danger mb-0" role="alert">
      {{ errorMsg }}
    </div>

    <div v-else class="list-body">
      <div v-if="!list.length && !loading" class="empty text-secondary">
        暂无数据
      </div>

      <button
        v-for="it in list"
        :key="it.id"
        type="button"
        class="song"
        @click="emit('play', it)"
      >
        <img class="cover" :src="it.cover" :alt="it.name" />
        <div class="meta">
          <div class="line1">
            <div class="name text-truncate">{{ it.name }}</div>
            <div class="badges" v-if="getQualityTags(it).length">
              <span
                v-for="q in getQualityTags(it)"
                :key="q"
                class="badge"
                :class="q.toLowerCase()"
              >
                {{ q }}
              </span>
            </div>
          </div>
          <div class="sub text-truncate">
            {{ it.artist }}
            <span v-if="it.album">· {{ it.album }}</span>
          </div>
        </div>
        <div class="right">
          <QIcon name="ri-play-circle-fill" class="play-ico" />
          <a
            class="icon-btn"
            title="下载"
            :href="it.url"
            :download="`${it.name}.mp3`"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            <QIcon name="ri-download-2-line" class="action-ico dl" />
          </a>
        </div>
      </button>

      <div class="more">
        <button
          v-if="hasMore"
          class="btn btn-outline-secondary"
          type="button"
          :disabled="loadingMore"
          @click="emit('loadMore')"
        >
          {{ loadingMore ? "加载中..." : "加载更多" }}
        </button>
        <span v-else class="text-secondary small">没有更多了</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-shell {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

:global([data-bs-theme="light"]) .list-shell {
  border-color: rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.65);
}

.list-head {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

:global([data-bs-theme="light"]) .list-head {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.title {
  font-weight: 400;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

:global([data-bs-theme="light"]) .title {
  color: rgba(0, 0, 0, 0.72);
}

.list-body {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.song {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 14px;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 14px;
  align-items: center;
  text-align: left;
}

:global([data-bs-theme="light"]) .song {
  border-color: rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.82);
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.05);
}

.meta {
  min-width: 0;
}

.name {
  font-weight: 400;
}

.line1 {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.badges {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 6px;
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  border: 0;
  color: #fff;
}

.badge.sq {
  background: rgba(220, 53, 69, 0.95);
}

.badge.hq {
  background: rgba(25, 135, 84, 0.95);
}

.sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

:global([data-bs-theme="light"]) .sub {
  color: rgba(0, 0, 0, 0.55);
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.play-ico {
  font-size: 24px !important;
  color: rgba(13, 110, 253, 0.95) !important;
}

.icon-btn {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  opacity: 0.95;
}

.icon-btn:hover {
  opacity: 1;
}

.action-ico.dl {
  font-size: 24px !important;
  color: rgba(25, 135, 84, 0.95) !important;
}

.more {
  padding: 10px 0 2px;
  display: flex;
  justify-content: center;
}

.empty {
  padding: 16px;
}
</style>
