import { computed, onMounted, ref, watch } from "vue";
import {
  fetchDailyHot,
  fetchRecommendHot,
  fetchResourceCategories,
  searchResources,
  type HotItem,
  type ResourceCategory,
  type ResourceSearchItem,
  type ResourceSort,
} from "../api/resource";

export function useResourceSearch() {
  const keyword = ref("");
  const category = ref<string>("all");
  const sort = ref<ResourceSort>("latest");

  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const list = ref<ResourceSearchItem[]>([]);

  const categories = ref<ResourceCategory[]>([]);
  const hotDaily = ref<HotItem[]>([]);
  const hotRecommend = ref<HotItem[]>([]);

  const loading = ref(false);
  const loadingMore = ref(false);
  const errorMsg = ref<string | null>(null);

  const seq = ref(0);

  const hasMore = computed(() => list.value.length < total.value);

  const totalPages = computed(() => {
    const size = Math.max(1, pageSize.value || 1);
    const t = Math.max(0, total.value || 0);
    return Math.max(1, Math.ceil(t / size));
  });

  const loadCategories = async () => {
    const res = await fetchResourceCategories();
    categories.value = res.data.list;
  };

  const loadHot = async () => {
    const [d, r] = await Promise.all([fetchDailyHot(), fetchRecommendHot()]);
    hotDaily.value = d.data.list;
    hotRecommend.value = r.data.list;
  };

  const load = async (reset = false) => {
    if (loading.value) return;
    if (!reset && !hasMore.value && list.value.length > 0) return;

    const s = ++seq.value;
    errorMsg.value = null;

    if (reset) {
      loading.value = true;
    } else {
      loadingMore.value = true;
      page.value += 1;
    }

    try {
      const res = await searchResources({
        keyword: keyword.value.trim() || undefined,
        category: category.value,
        sort: sort.value,
        page: page.value,
        pageSize: pageSize.value,
      });

      if (s !== seq.value) return;

      total.value = res.data.total;
      page.value = res.data.page;
      pageSize.value = res.data.pageSize;

      if (reset) list.value = res.data.list;
      else list.value = [...list.value, ...res.data.list];
    } catch {
      if (s === seq.value) {
        errorMsg.value = "加载失败，请稍后重试";
      }
    } finally {
      if (s === seq.value) {
        loading.value = false;
        loadingMore.value = false;
      }
    }
  };

  const onSearch = async (nextKeyword?: string) => {
    if (typeof nextKeyword === "string") keyword.value = nextKeyword;
    page.value = 1;
    await load(true);
  };

  const goPage = async (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages.value);
    if (next === page.value) return;
    if (loading.value) return;
    page.value = next;
    loading.value = true;
    const s = ++seq.value;
    errorMsg.value = null;
    try {
      const res = await searchResources({
        keyword: keyword.value.trim() || undefined,
        category: category.value,
        sort: sort.value,
        page: page.value,
        pageSize: pageSize.value,
      });
      if (s !== seq.value) return;
      total.value = res.data.total;
      page.value = res.data.page;
      pageSize.value = res.data.pageSize;
      list.value = res.data.list;
    } catch {
      if (s === seq.value) errorMsg.value = "加载失败，请稍后重试";
    } finally {
      if (s === seq.value) loading.value = false;
    }
  };

  const onChangeCategory = async (k: string) => {
    category.value = k;
  };

  const onChangeSort = async (s: ResourceSort) => {
    sort.value = s;
  };

  const onLoadMore = async () => {
    await load(false);
  };

  const setPageSize = async (size: number) => {
    const next = Math.max(1, Math.floor(size || 1));
    if (next === pageSize.value) return;
    pageSize.value = next;
    page.value = 1;
    await load(true);
  };

  watch(
    () => [category.value, sort.value] as const,
    async () => {
      page.value = 1;
      await load(true);
    }
  );

  onMounted(async () => {
    await Promise.all([loadCategories(), loadHot()]);
    await load(true);
  });

  return {
    keyword,
    category,
    sort,
    page,
    pageSize,
    total,
    list,
    categories,
    hotDaily,
    hotRecommend,
    loading,
    loadingMore,
    errorMsg,
    hasMore,
    totalPages,
    onSearch,
    onChangeCategory,
    onChangeSort,
    onLoadMore,
    goPage,
    setPageSize,
  };
}
