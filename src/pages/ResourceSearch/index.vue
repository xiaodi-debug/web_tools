<script setup lang="ts">
import ResourceResultList from "../../components/ResourceResultList.vue";
import ResourcePagination from "../../components/ResourcePagination.vue";
import ResourceSearchHero from "../../components/ResourceSearchHero.vue";
import { useResourceSearch } from "../../composables/useResourceSearch";
import { computed, ref } from "vue";

const vm = useResourceSearch();

const viewMode = ref<"grid" | "list">("grid");

const summaryText = computed(() => {
  const total = vm.total.value;
  return `找到 ${total.toLocaleString()} 条结果`;
});
</script>

<template>
  <div class="container-fluid py-3 portal-page">
    <div class="hero-wrap">
      <ResourceSearchHero
        :keyword="vm.keyword.value"
        :loading="vm.loading.value"
        :categories="vm.categories.value"
        :activeCategory="vm.category.value"
        :sort="vm.sort.value"
        :viewMode="viewMode"
        @update:keyword="(v) => (vm.keyword.value = v)"
        @search="vm.onSearch()"
        @changeCategory="vm.onChangeCategory"
        @changeSort="vm.onChangeSort"
        @toggleView="(v) => (viewMode = v)"
      />
    </div>

    <div class="divider" />

    <div class="summary-row">
      <div class="summary-left">{{ summaryText }}</div>
      <div class="summary-right">
        <span v-if="vm.loading.value" class="text-secondary small"
          >加载中...</span
        >
      </div>
    </div>

    <ResourceResultList
      :list="vm.list.value"
      :loading="vm.loading.value"
      :loadingMore="vm.loadingMore.value"
      :hasMore="vm.hasMore.value"
      :errorMsg="vm.errorMsg.value || ''"
      :sort="vm.sort.value"
      :viewMode="viewMode"
      @changeSort="vm.onChangeSort"
      @loadMore="vm.onLoadMore"
    />

    <ResourcePagination
      :page="vm.page.value"
      :pageSize="vm.pageSize.value"
      :total="vm.total.value"
      @change="vm.goPage"
      @changePageSize="vm.setPageSize"
    />
  </div>
</template>

<style scoped>
.hero-wrap {
  padding: 0;
  border-radius: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.divider {
  height: 1px;
  margin: 12px 0 8px;
  background: rgba(15, 23, 42, 0.12);
}

.summary-row {
  margin-top: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
}

:global([data-bs-theme="light"]) .summary-row {
  color: rgba(0, 0, 0, 0.6);
}
</style>
