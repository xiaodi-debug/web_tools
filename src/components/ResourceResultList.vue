<script setup lang="ts">
import QIcon from "./QIcon.vue";
import type { ResourceSearchItem, ResourceSort } from "../api/resource";

defineProps<{
  list: ResourceSearchItem[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  errorMsg?: string | null;
  sort: ResourceSort;
  viewMode?: "grid" | "list";
}>();

const emit = defineEmits<{
  (e: "changeSort", s: ResourceSort): void;
  (e: "loadMore"): void;
}>();

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }
}
</script>

<template>
  <div class="list-shell">
    <div v-if="errorMsg" class="alert alert-danger mb-0" role="alert">
      {{ errorMsg }}
    </div>

    <div
      v-else
      class="list-body"
      :class="viewMode === 'grid' ? 'grid' : 'list'"
    >
      <div v-if="!list.length && !loading" class="empty text-secondary">
        暂无数据
      </div>

      <template v-if="viewMode === 'grid'">
        <a
          v-for="it in list"
          :key="it.id"
          class="grid-card"
          :href="it.extractedUrl"
          target="_blank"
          rel="noreferrer"
        >
          <div class="grid-media">
            <img
              v-if="it.coverUrl"
              class="cover"
              :src="it.coverUrl"
              :alt="it.title"
              loading="lazy"
            />
            <div v-else class="cover cover-fallback"></div>

            <div class="badge badge-cat">{{ it.category }}</div>
            <div v-if="it.qualityTag" class="badge badge-q">
              {{ it.qualityTag }}
            </div>
          </div>
          <div class="grid-body">
            <div class="grid-title text-truncate">{{ it.title }}</div>
            <div class="grid-desc text-truncate">
              {{ it.source || "未知来源" }}
              <span v-if="it.updatedAt"> · {{ it.updatedAt }}</span>
            </div>
            <div class="grid-foot">
              <div class="grid-meta">
                <span class="m" v-if="it.views">
                  <QIcon name="ri-eye-line" :size="14" />
                  {{ it.views }}
                </span>
                <span class="m" v-if="typeof it.rating === 'number'">
                  <QIcon name="ri-star-fill" :size="14" />
                  {{ it.rating.toFixed(1) }}
                </span>
              </div>
              <div class="size" v-if="it.size">{{ it.size }}</div>
              <div class="grid-actions">
                <button
                  class="icon-btn"
                  type="button"
                  title="复制链接"
                  @click.prevent.stop="copyText(it.extractedUrl)"
                >
                  <QIcon name="ri-link" :size="16" />
                </button>
                <a
                  v-if="it.downloadUrl"
                  class="icon-btn"
                  title="下载"
                  :href="it.downloadUrl"
                  target="_blank"
                  rel="noreferrer"
                  @click.stop
                >
                  <QIcon name="ri-download-2-line" :size="16" />
                </a>
              </div>
            </div>
          </div>
        </a>
      </template>

      <template v-else>
        <a
          v-for="it in list"
          :key="it.id"
          class="row-card"
          :href="it.extractedUrl"
          target="_blank"
          rel="noreferrer"
        >
          <div class="row-cover">
            <img
              v-if="it.coverUrl"
              class="cover"
              :src="it.coverUrl"
              :alt="it.title"
              loading="lazy"
            />
            <div v-else class="cover cover-fallback"></div>
            <div class="badge badge-cat">{{ it.category }}</div>
          </div>
          <div class="row-body">
            <div class="row-title text-truncate">{{ it.title }}</div>
            <div class="row-desc text-truncate">
              {{ it.source || "未知来源" }}
              <span v-if="it.updatedAt"> · {{ it.updatedAt }}</span>
            </div>
            <div class="row-foot">
              <div class="row-meta">
                <span v-if="it.views"
                  ><QIcon name="ri-eye-line" :size="14" /> {{ it.views }}</span
                >
                <span v-if="typeof it.rating === 'number'"
                  ><QIcon name="ri-star-fill" :size="14" />
                  {{ it.rating.toFixed(1) }}</span
                >
                <span v-if="it.size">{{ it.size }}</span>
              </div>
              <div class="row-actions">
                <button
                  class="icon-btn"
                  type="button"
                  title="复制链接"
                  @click.prevent.stop="copyText(it.extractedUrl)"
                >
                  <QIcon name="ri-link" :size="16" />
                </button>
                <a
                  v-if="it.downloadUrl"
                  class="icon-btn"
                  title="下载"
                  :href="it.downloadUrl"
                  target="_blank"
                  rel="noreferrer"
                  @click.stop
                >
                  <QIcon name="ri-download-2-line" :size="16" />
                </a>
              </div>
            </div>
          </div>
        </a>
      </template>
    </div>
  </div>
</template>

<style scoped>
.list-shell {
  border: 0;
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  overflow: visible;
}

:global([data-bs-theme="light"]) .list-shell {
  border-color: transparent;
  background: transparent;
}

.list-body {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.list-body.grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 1400px) {
  .list-body.grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .list-body.grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .list-body.grid {
    grid-template-columns: 1fr;
  }
}

.grid-card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.86);
  text-decoration: none;
  display: grid;
  grid-template-rows: 140px auto;
  transition: transform 0.18s ease, background 0.18s ease;
}

.grid-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 1);
}

.grid-media {
  position: relative;
  overflow: hidden;
}

.cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      900px 320px at 20% 20%,
      rgba(90, 80, 210, 0.35),
      transparent 60%
    ),
    radial-gradient(
      800px 280px at 70% 40%,
      rgba(80, 170, 255, 0.25),
      transparent 60%
    ),
    linear-gradient(135deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.22));
}

.badge {
  position: absolute;
  top: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.78);
}

.badge-cat {
  left: 10px;
}

.badge-q {
  right: 10px;
}

.grid-body {
  padding: 12px;
  display: grid;
  gap: 8px;
}

.grid-title {
  font-weight: 400;
  font-size: 14px;
}

.grid-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.grid-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.size {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.75);
}

.grid-meta {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.m {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.grid-actions {
  display: inline-flex;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.78);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  text-decoration: none;
}

.icon-btn:hover {
  background: rgba(15, 23, 42, 0.05);
}

.row-card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.86);
  text-decoration: none;
  display: grid;
  grid-template-columns: 220px 1fr;
}

.row-cover {
  position: relative;
  overflow: hidden;
}

.row-body {
  padding: 12px;
  display: grid;
  gap: 8px;
}

.row-title {
  font-weight: 400;
  font-size: 14px;
}

.row-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.row-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.row-meta {
  display: inline-flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.row-actions {
  display: inline-flex;
  gap: 8px;
}

@media (max-width: 992px) {
  .row-card {
    grid-template-columns: 1fr;
  }
  .row-cover {
    height: 160px;
  }
}

.empty {
  padding: 16px;
}
</style>
