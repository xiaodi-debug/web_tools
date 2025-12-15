<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MusicSearchPageHeader, {
  type MusicSearchTab,
} from "../../components/MusicSearchPageHeader.vue";
import MusicSongTable from "../../components/MusicSongTable.vue";
import { useMusicSearch } from "../../composables/useMusicSearch";

const vm = useMusicSearch();

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  const raw = route.query.tab;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return "song";
});

const tabs: MusicSearchTab[] = [
  { key: "all", label: "综合", disabled: true },
  { key: "song", label: "歌曲" },
  { key: "artist", label: "音乐人", disabled: true },
  { key: "album", label: "专辑", disabled: true },
  { key: "playlist", label: "歌单", disabled: true },
];

const summaryText = computed(() => {
  const total = vm.total.value;
  return `找到 ${total.toLocaleString()} 条结果`;
});

const q = computed(() => {
  const raw = route.query.q;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return "";
});

const applyQueryAndSearch = async () => {
  const next = q.value.trim();
  if (next && next !== vm.keyword.value) {
    await vm.onSearch(next);
  }
};

const onSearch = async () => {
  const next = vm.keyword.value.trim();
  router.replace({
    path: "/music/search",
    query: {
      ...(next ? { q: next } : undefined),
      ...(activeTab.value ? { tab: activeTab.value } : undefined),
    },
  });
  await vm.onSearch(next);
};

const onChangeTab = async (tab: string) => {
  const next = vm.keyword.value.trim();
  router.replace({
    path: "/music/search",
    query: {
      ...(next ? { q: next } : undefined),
      ...(tab ? { tab } : undefined),
    },
  });
};

watch(
  () => q.value,
  async () => {
    await applyQueryAndSearch();
  }
);

onMounted(async () => {
  await applyQueryAndSearch();
});
</script>

<template>
  <div class="container-fluid py-3 portal-page">
    <div class="top-card">
      <MusicSearchPageHeader
        :query="q"
        v-model="vm.keyword.value"
        :activeTab="activeTab"
        :tabs="tabs"
        @search="onSearch"
        @changeTab="onChangeTab"
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

    <div class="row g-3 mt-1 pb-player">
      <div class="col-12">
        <MusicSongTable
          :list="vm.list.value"
          :loading="vm.loading.value"
          :errorMsg="vm.errorMsg.value"
          @play="vm.playItem"
          @add="vm.addToPlaylist"
        />

        <div class="load-more">
          <button
            v-if="vm.hasMore.value"
            class="btn btn-outline-secondary"
            type="button"
            :disabled="vm.loading.value || vm.loadingMore.value"
            @click="vm.onLoadMore"
          >
            {{ vm.loadingMore.value ? "加载中..." : "加载更多" }}
          </button>
          <span v-else class="text-secondary small">没有更多了</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}

.load-more {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.player-wrap {
  position: sticky;
  bottom: 12px;
}

.pb-player {
  padding-bottom: 2px;
}
</style>
