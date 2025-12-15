<script setup lang="ts">
import QIcon from "./QIcon.vue";

export type MusicSearchTab = {
  key: string;
  label: string;
  disabled?: boolean;
};

defineProps<{
  query: string;
  modelValue: string;
  activeTab: string;
  tabs: MusicSearchTab[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "search"): void;
  (e: "changeTab", key: string): void;
}>();

function onSubmit() {
  emit("search");
}
</script>

<template>
  <div class="header">
    <div class="row1">
      <div class="title">
        <span class="title-ico">
          <QIcon name="ri-music-2-line" :size="18" />
        </span>
        <span class="t">音乐搜索</span>
        <span class="q">{{ query || modelValue }}</span>
      </div>

      <form class="search" @submit.prevent="onSubmit">
        <div class="search-pill">
          <QIcon name="ri-search-line" class="ico" />
          <input
            class="ipt"
            :value="modelValue"
            :placeholder="placeholder || '搜索歌手、歌曲或专辑名'"
            @input="
              emit(
                'update:modelValue',
                ($event.target as HTMLInputElement).value
              )
            "
          />
          <button class="btn" type="submit">
            <QIcon name="ri-search-line" :size="16" />
            搜索
          </button>
        </div>
      </form>
    </div>

    <div class="tabs seg" role="tablist" aria-label="搜索分类">
      <button
        v-for="it in tabs"
        :key="it.key"
        class="tab seg-btn"
        type="button"
        role="tab"
        :disabled="it.disabled"
        :class="{ active: it.key === activeTab }"
        @click="emit('changeTab', it.key)"
      >
        {{ it.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: grid;
  gap: 10px;
}

.row1 {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14px;
}

.title {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.title-ico {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.72);
  flex: 0 0 auto;
}

.t {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.q {
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.86);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search {
  position: relative;
  width: min(520px, 56vw);
}

.search-pill {
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 0 6px 0 10px;
  gap: 8px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background 0.18s ease;
}

.search-pill:hover {
  border-color: rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 1);
}

.search-pill:focus-within {
  border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.55);
  box-shadow: 0 0 0 0.22rem rgba(var(--bs-primary-rgb, 13, 110, 253), 0.18);
}

.ico {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.45);
}

.ipt {
  width: 100%;
  height: 44px;
  border-radius: 0;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.86);
  outline: 0;
  padding: 0 6px;
}

.btn {
  height: 34px;
  border-radius: 12px;
  border: 0;
  padding: 0 12px;
  background: rgba(90, 80, 210, 0.9);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tabs {
  padding-top: 2px;
}

.seg {
  display: inline-flex;
  gap: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.seg-btn {
  border: 0;
  border-radius: 0;
  height: 34px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 0.72);
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

.seg-btn + .seg-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.seg-btn:hover {
  background: rgba(15, 23, 42, 0.06);
}

.seg-btn.active {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.92);
  color: #fff;
}

.seg-btn.active:hover {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.96);
}

.seg-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .row1 {
    grid-template-columns: 1fr;
  }
  .search {
    width: 100%;
  }
  .tabs {
    flex-wrap: wrap;
  }
}
</style>
