<script setup lang="ts">
import QIcon from "./QIcon.vue";
import type { MusicHotItem } from "../api/music";

function getQualityTags(it: MusicHotItem): Array<"SQ" | "HQ"> {
  const tags: Array<"SQ" | "HQ"> = [];
  if (it.sq) tags.push("SQ");
  if (it.hq) tags.push("HQ");
  if (tags.length) return tags;
  return (it.qualities || []) as Array<"SQ" | "HQ">;
}

defineProps<{
  title: string;
  list: MusicHotItem[];
}>();

const emit = defineEmits<{
  (e: "play", it: MusicHotItem): void;
}>();
</script>

<template>
  <div class="hot-card">
    <div class="hot-head">
      <div class="hot-title">{{ title }}</div>
    </div>

    <div class="hot-list">
      <div
        v-for="it in list"
        :key="it.id"
        class="hot-item"
        @click="emit('play', it)"
      >
        <div class="rank">{{ it.rank }}</div>
        <img class="cover" :src="it.cover" :alt="it.name" />
        <div class="text">
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
          <div class="sub text-truncate">{{ it.artist }}</div>
        </div>
        <div class="actions">
          <QIcon name="ri-play-circle-fill" class="action-ico play" />
          <a
            class="icon-btn"
            title="下载"
            :href="it.url"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            <QIcon name="ri-download-2-line" class="action-ico dl" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hot-card {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

:global([data-bs-theme="light"]) .hot-card {
  border-color: rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.65);
}

.hot-head {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

:global([data-bs-theme="light"]) .hot-head {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.hot-title {
  font-weight: 400;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

:global([data-bs-theme="light"]) .hot-title {
  color: rgba(0, 0, 0, 0.72);
}

.hot-list {
  padding: 10px;
  display: grid;
  gap: 8px;
}

.hot-item {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 8px;
  display: grid;
  grid-template-columns: 18px 36px 1fr auto;
  gap: 8px;
  align-items: center;
  text-align: left;
  cursor: pointer;
}

:global([data-bs-theme="light"]) .hot-item {
  border-color: rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.82);
}

.rank {
  font-weight: 400;
  font-size: 12px;
  color: rgba(220, 53, 69, 0.85);
}

.cover {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.05);
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
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
}

.badge.sq {
  color: rgba(220, 53, 69, 0.95);
  border-color: rgba(220, 53, 69, 0.25);
  background: rgba(220, 53, 69, 0.08);
}

.badge.hq {
  color: rgba(25, 135, 84, 0.95);
  border-color: rgba(25, 135, 84, 0.25);
  background: rgba(25, 135, 84, 0.08);
}

.sub {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

:global([data-bs-theme="light"]) .sub {
  color: rgba(0, 0, 0, 0.55);
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.action-ico {
  font-size: 20px;
}

.action-ico.play {
  color: rgba(13, 110, 253, 0.95);
}

.action-ico.dl {
  color: rgba(25, 135, 84, 0.95);
}
</style>
