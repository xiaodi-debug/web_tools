<script setup lang="ts">
import type { PlatformCard } from "../services/videoParser";
import IconSymbol from "./IconSymbol.vue";

defineProps<{ cards: PlatformCard[] }>();
</script>

<template>
  <div class="platform-grid" aria-label="支持平台">
    <div v-for="p in cards" :key="p.key" class="platform-item">
      <IconSymbol class="platform-icon" :name="p.iconName" :size="18" />
      <div class="platform-name">{{ p.name }}</div>
    </div>
  </div>
</template>

<style scoped>
.platform-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 992px) {
  .platform-grid {
    gap: 8px;
  }
}

.platform-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.7);
  user-select: none;
}

.platform-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: rgba(0, 0, 0, 0.72);
}

.platform-name {
  font-weight: 800;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.78);
  letter-spacing: 0.2px;
}
</style>
