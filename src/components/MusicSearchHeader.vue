<script setup lang="ts">
import QIcon from "./QIcon.vue";

defineProps<{
  keyword: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:keyword", v: string): void;
  (e: "search"): void;
}>();

function onSubmit() {
  emit("search");
}
</script>

<template>
  <div class="header-bar">
    <div class="brand">
      <QIcon name="ri-music-2-line" class="brand-icon" />
      <div class="brand-text">音乐搜</div>
    </div>

    <form class="search-wrap" @submit.prevent="onSubmit">
      <div class="search-inner">
        <QIcon name="ri-search-line" class="search-icon" />
        <input
          class="form-control search-input"
          :value="keyword"
          :disabled="loading"
          placeholder="输入歌名/歌手..."
          @input="
            emit('update:keyword', ($event.target as HTMLInputElement).value)
          "
        />
      </div>
      <button
        class="btn btn-primary search-btn"
        type="submit"
        :disabled="loading"
      >
        搜索
      </button>
    </form>
  </div>
</template>

<style scoped>
.header-bar {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
}

.brand-icon {
  font-size: 20px;
  color: rgba(13, 110, 253, 0.95);
}

.brand-text {
  font-weight: 900;
  letter-spacing: 0.2px;
}

.search-wrap {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.search-inner {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.4);
}

.search-input {
  height: 42px;
  border-radius: 999px;
  padding-left: 40px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
}

.search-btn {
  height: 42px;
  border-radius: 999px;
  padding: 0 18px;
  box-shadow: 0 12px 30px rgba(13, 110, 253, 0.22);
}

@media (max-width: 768px) {
  .header-bar {
    grid-template-columns: 1fr;
  }
  .search-wrap {
    grid-template-columns: 1fr;
  }
  .search-btn {
    width: 100%;
  }
}
</style>
