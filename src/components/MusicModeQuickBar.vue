<script setup lang="ts">
import IconSymbol from "./IconSymbol.vue";

export type MusicQuickMode = {
  key: string;
  title: string;
  iconName: string;
};

defineProps<{
  items: MusicQuickMode[];
}>();

const emit = defineEmits<{
  (e: "select", it: MusicQuickMode): void;
}>();

const gradients = [
  "linear-gradient(135deg, rgba(90,80,210,0.95), rgba(13,110,253,0.75))",
  "linear-gradient(135deg, rgba(25,135,84,0.9), rgba(130,230,190,0.75))",
  "linear-gradient(135deg, rgba(220,53,69,0.9), rgba(253,126,20,0.75))",
  "linear-gradient(135deg, rgba(111,66,193,0.9), rgba(232,62,140,0.72))",
  "linear-gradient(135deg, rgba(32,201,151,0.9), rgba(0,123,255,0.75))",
  "linear-gradient(135deg, rgba(255,193,7,0.92), rgba(253,126,20,0.78))",
  "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(90,80,210,0.72))",
  "linear-gradient(135deg, rgba(0,180,216,0.9), rgba(0,119,182,0.78))",
];

function hashKey(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function bgStyle(it: MusicQuickMode, idx: number) {
  const i = (hashKey(it.key) + idx) % gradients.length;
  return {
    backgroundImage: gradients[i],
  };
}
</script>

<template>
  <div class="quickbar" role="list">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="quick-item"
      role="listitem"
      :style="bgStyle(it, 0)"
      @click="emit('select', it)"
    >
      <IconSymbol :name="it.iconName" size="18px" />
      <span class="txt">{{ it.title }}</span>
    </button>
  </div>
</template>

<style scoped>
.quickbar {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.quick-item {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  text-align: left;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.quick-item:hover {
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}

.txt {
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1200px) {
  .quickbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
