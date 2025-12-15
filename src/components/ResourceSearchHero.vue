<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import PortalDropdown, {
  type PortalDropdownOption,
} from "./PortalDropdown.vue";
import QIcon from "./QIcon.vue";
import type { ResourceCategory, ResourceSort } from "../api/resource";

type ViewMode = "grid" | "list";

const props = defineProps<{
  keyword: string;
  loading?: boolean;
  categories: ResourceCategory[];
  activeCategory: string;
  sort: ResourceSort;
  viewMode: ViewMode;
}>();

const emit = defineEmits<{
  (e: "update:keyword", v: string): void;
  (e: "search"): void;
  (e: "changeCategory", v: string): void;
  (e: "changeSort", v: ResourceSort): void;
  (e: "toggleView", v: ViewMode): void;
}>();

function onSubmit() {
  emit("search");
}

const extraOpen = ref(false);
const extraRef = ref<HTMLElement | null>(null);

const onGlobalClick = (e: MouseEvent) => {
  if (!extraOpen.value) return;
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (extraRef.value && extraRef.value.contains(t)) return;
  extraOpen.value = false;
};

onMounted(() => {
  window.addEventListener("click", onGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("click", onGlobalClick);
});

const categoryOptions = computed(() => {
  const base = props.categories || [];
  return base.length ? base : [{ key: "all", name: "全部" }];
});

const categoryDropdownOptions = computed<PortalDropdownOption<string>[]>(() =>
  categoryOptions.value.map((c) => ({ value: c.key, label: c.name }))
);

const sortOptions: Array<PortalDropdownOption<ResourceSort>> = [
  { value: "latest", label: "全部时间" },
  { value: "hot", label: "相关度" },
  { value: "all", label: "全网搜" },
];

const sizeOptions: Array<PortalDropdownOption<string>> = [
  { value: "all", label: "全部大小" },
];
</script>

<template>
  <div class="hero">
    <div class="hero-title">
      <span class="hero-ico">
        <QIcon name="ri-search-2-line" :size="18" />
      </span>
      <span>资源搜索</span>
    </div>

    <form class="search-row" @submit.prevent="onSubmit">
      <div class="search-pill">
        <input
          class="ipt"
          :value="keyword"
          :disabled="loading"
          placeholder="搜索电影、音乐、软件、文档等资源..."
          @input="
            emit('update:keyword', ($event.target as HTMLInputElement).value)
          "
        />
        <button class="search-btn" type="submit" :disabled="loading">
          <QIcon name="ri-search-line" :size="16" />
          搜索资源
        </button>
      </div>
    </form>

    <div class="filters-row">
      <div class="filters-left">
        <PortalDropdown
          :modelValue="activeCategory"
          :options="categoryDropdownOptions"
          :disabled="!!loading"
          :minWidth="96"
          @update:modelValue="(v) => emit('changeCategory', v)"
        />

        <PortalDropdown
          :modelValue="sort"
          :options="sortOptions as any"
          :disabled="!!loading"
          :minWidth="96"
          @update:modelValue="(v) => emit('changeSort', v as any)"
        />

        <PortalDropdown
          modelValue="all"
          :options="sizeOptions"
          disabled
          :minWidth="96"
          @update:modelValue="() => {}"
        />
      </div>

      <div class="filters-right">
        <div ref="extraRef" class="extra">
          <button
            type="button"
            class="extra-btn"
            @click.stop="extraOpen = !extraOpen"
          >
            <QIcon name="ri-filter-3-line" :size="16" />
            高级筛选
          </button>

          <div v-if="extraOpen" class="extra-pop" @click.stop>
            <div class="extra-item">暂未接入更多筛选条件</div>
          </div>
        </div>

        <div class="view seg" role="group" aria-label="视图切换">
          <button
            type="button"
            class="view-btn seg-btn"
            :class="{ active: viewMode === 'grid' }"
            @click="emit('toggleView', 'grid')"
            title="网格"
          >
            <QIcon name="ri-grid-fill" :size="16" />
          </button>
          <button
            type="button"
            class="view-btn seg-btn"
            :class="{ active: viewMode === 'list' }"
            @click="emit('toggleView', 'list')"
            title="列表"
          >
            <QIcon name="ri-list-check" :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 16px;
}

.hero-title {
  font-size: 18px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.hero-ico {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.72);
}

.search-row {
  margin-top: 12px;
}

.search-pill {
  position: relative;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: stretch;
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

.ipt {
  height: 100%;
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.86);
  padding: 0 14px;
  padding-right: 14px;
}

.search-btn {
  height: 100%;
  border: 0;
  border-radius: 0 14px 14px 0;
  margin: 0;
  padding: 0 16px;
  background: rgba(90, 80, 210, 0.9);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.search-btn:disabled {
  opacity: 0.7;
}

.filters-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filters-left {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* PortalDropdown overrides (only inside ResourceSearchHero) */
:deep(.pd-btn) {
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.76);
}

:deep(.pd-pop) {
  border-color: rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

:deep(.pd-opt) {
  color: rgba(0, 0, 0, 0.78);
}

:deep(.pd-opt:hover) {
  background: rgba(15, 23, 42, 0.05);
}

:deep(.pd-opt.active) {
  background: rgba(15, 23, 42, 0.07);
}

.filters-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.extra {
  position: relative;
}

.extra-btn {
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.76);
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.extra-pop {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 220px;
  padding: 8px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  z-index: 20;
}

.extra-item {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.view {
  display: inline-flex;
  gap: 8px;
}

.seg {
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
  width: 36px;
  height: 34px;
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 0.72);
  box-shadow: none;
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

.view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .search-pill {
    height: auto;
    flex-direction: column;
  }
  .ipt {
    padding-right: 14px;
  }
  .search-btn {
    width: 100%;
    justify-content: center;
    border-radius: 0 0 14px 14px;
  }
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  .filters-right {
    justify-content: space-between;
  }
}
</style>
