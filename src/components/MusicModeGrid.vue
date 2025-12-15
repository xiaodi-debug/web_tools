<script setup lang="ts">
export type MusicModeCard = {
  key: string;
  title: string;
  subtitle: string;
  cover: string;
  query?: string;
};

defineProps<{
  title: string;
  items: MusicModeCard[];
}>();

const emit = defineEmits<{
  (e: "select", it: MusicModeCard): void;
}>();

const gradients = [
  "linear-gradient(135deg, rgba(90,80,210,0.95), rgba(13,110,253,0.75))",
  "linear-gradient(135deg, rgba(25,135,84,0.9), rgba(130,230,190,0.75))",
  "linear-gradient(135deg, rgba(220,53,69,0.9), rgba(253,126,20,0.75))",
  "linear-gradient(135deg, rgba(111,66,193,0.9), rgba(232,62,140,0.72))",
  "linear-gradient(135deg, rgba(0,180,216,0.9), rgba(0,119,182,0.78))",
  "linear-gradient(135deg, rgba(255,193,7,0.92), rgba(253,126,20,0.78))",
];

function hashKey(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function cardStyle(it: MusicModeCard, idx: number) {
  const i = (hashKey(it.key) + idx) % gradients.length;
  return {
    "--card-glow": gradients[i],
  } as Record<string, string>;
}
</script>

<template>
  <div class="grid-wrap">
    <div class="grid-title">{{ title }}</div>
    <div class="grid">
      <button
        v-for="(it, idx) in items"
        :key="it.key"
        type="button"
        class="card"
        :style="cardStyle(it, idx)"
        @click="emit('select', it)"
      >
        <div
          class="cover"
          :style="{ backgroundImage: `url(${it.cover})` }"
        ></div>
        <div class="mask"></div>
        <div class="meta">
          <div class="t">{{ it.title }}</div>
          <div class="s">{{ it.subtitle }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.grid-wrap {
  margin-top: 16px;
}

.grid-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.card {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0;
  border-radius: 14px;
  overflow: hidden;
  height: 120px;
  text-align: left;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
  transition: transform 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 14px;
  background: var(--card-glow);
  opacity: 0.22;
  filter: blur(14px);
  transform: translateZ(0);
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 14px;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.cover {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1);
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.62));
}

.meta {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  z-index: 2;
}

.t {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.92);
}

.s {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card:hover .cover {
  transform: scale(1.08);
}

.card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.22);
}

@media (max-width: 1400px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
