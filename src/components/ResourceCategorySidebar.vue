<script setup lang="ts">
import type { ResourceCategory } from "../api/resource";

defineProps<{
  categories: ResourceCategory[];
  active: string;
}>();

const emit = defineEmits<{
  (e: "change", key: string): void;
}>();
</script>

<template>
  <div class="side-card">
    <div class="side-title">分类</div>
    <div class="side-list">
      <button
        v-for="c in categories"
        :key="c.key"
        type="button"
        class="side-item"
        :class="{ active: c.key === active }"
        @click="emit('change', c.key)"
      >
        {{ c.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.side-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  padding: 12px;
}

.side-title {
  font-weight: 900;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 10px;
}

.side-list {
  display: grid;
  gap: 8px;
}

.side-item {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  padding: 8px 10px;
  text-align: left;
  font-weight: 800;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.side-item.active {
  border-color: rgba(13, 110, 253, 0.22);
  background: rgba(13, 110, 253, 0.08);
  color: rgba(13, 110, 253, 0.95);
}
</style>
