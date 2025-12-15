<script setup lang="ts">
import type { HotItem } from "../api/resource";

defineProps<{
  title: string;
  list: HotItem[];
}>();
</script>

<template>
  <div class="hot-card">
    <div class="hot-head">
      <div class="hot-title">{{ title }}</div>
      <a class="hot-more" href="javascript:void(0)">更多&gt;</a>
    </div>

    <div class="hot-list">
      <a
        v-for="it in list"
        :key="it.id"
        class="hot-item"
        :href="it.url"
        target="_blank"
        rel="noreferrer"
      >
        <div class="rank">{{ it.rank }}</div>
        <div class="text text-truncate">{{ it.title }}</div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.hot-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.hot-head {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hot-title {
  font-weight: 900;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.78);
}

.hot-more {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  text-decoration: none;
}

.hot-list {
  padding: 10px;
  display: grid;
  gap: 8px;
}

.hot-item {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  align-items: center;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.78);
}

.rank {
  font-weight: 900;
  font-size: 12px;
  color: rgba(220, 53, 69, 0.85);
}

.text {
  font-size: 13px;
}
</style>
