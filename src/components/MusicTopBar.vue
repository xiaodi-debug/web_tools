<script setup lang="ts">
import QIcon from "./QIcon.vue";

defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "search"): void;
}>();

function onSubmit() {
  emit("search");
}
</script>

<template>
  <div class="music-topbar">
    <div class="left">
      <div class="page-title">
        <span class="title-ico">
          <QIcon name="ri-music-2-line" :size="18" />
        </span>
        <span>听歌模式</span>
      </div>
      <div class="page-subtitle">常用模式</div>
    </div>

    <form class="search" @submit.prevent="onSubmit">
      <div class="search-pill">
        <QIcon name="ri-search-line" class="search-ico" />
        <input
          class="search-input"
          :value="modelValue"
          :placeholder="placeholder || '搜索歌手、歌曲或专辑名'"
          @input="
            emit('update:modelValue', ($event.target as HTMLInputElement).value)
          "
        />
        <button class="search-btn" type="submit">
          <QIcon name="ri-search-line" :size="16" />
          搜索
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.music-topbar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: start;
}

.left {
  min-width: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
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

.page-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
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
  grid-template-columns: 24px 1fr auto;
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

.search-ico {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.45);
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.search-input {
  width: 100%;
  height: 44px;
  border-radius: 0;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.86);
  outline: 0;
  padding: 0 6px;
}

.search-btn {
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

@media (max-width: 768px) {
  .music-topbar {
    grid-template-columns: 1fr;
  }
  .search {
    width: 100%;
  }
}
</style>
