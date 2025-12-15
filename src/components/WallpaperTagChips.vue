<script setup lang="ts">
export type WallpaperChip = {
  key: string;
  label: string;
};

defineProps<{
  items: WallpaperChip[];
  activeKey: string;
}>();

const emit = defineEmits<{
  (e: "select", it: WallpaperChip): void;
}>();
</script>

<template>
  <div class="chips" role="list">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="chip"
      role="listitem"
      :class="{ active: it.key === activeKey }"
      @click="emit('select', it)"
    >
      {{ it.label }}
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px;
  scrollbar-width: thin;
}

.chips::-webkit-scrollbar {
  height: 6px;
}

.chips::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

:global([data-bs-theme="light"]) .chips::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.16);
}

.chip {
  flex: 0 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.82);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chip.active {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  border-color: rgba(255, 255, 255, 0.22);
}

:global([data-bs-theme="light"]) .chip {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.75);
  color: rgba(0, 0, 0, 0.65);
}

:global([data-bs-theme="light"]) .chip.active {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.85);
  border-color: rgba(0, 0, 0, 0.16);
}
</style>
