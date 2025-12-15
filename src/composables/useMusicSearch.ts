import { computed, onMounted, ref } from "vue";
import {
  fetchMusicHot,
  searchMusic,
  type MusicHotItem,
  type MusicItem,
} from "../api/music";

export type APlayerMusic = {
  title: string;
  artist: string;
  src: string;
  pic?: string;
};

type MiniPlayerTrack = {
  title: string;
  artist: string;
  url: string;
  cover?: string;
};

const toAPlayerMusic = (it: MusicItem): APlayerMusic => ({
  title: it.name,
  artist: it.artist,
  src: it.url,
  pic: it.cover,
});

const toMiniPlayerTrack = (it: MusicItem): MiniPlayerTrack => ({
  title: it.name,
  artist: it.artist,
  url: it.url,
  cover: it.cover,
});

export function useMusicSearch() {
  const keyword = ref("");

  const page = ref(1);
  const pageSize = ref(15);
  const total = ref(0);
  const list = ref<MusicItem[]>([]);

  const hotList = ref<MusicHotItem[]>([]);

  const loading = ref(false);
  const loadingMore = ref(false);
  const errorMsg = ref<string | null>(null);

  const seq = ref(0);
  const hasMore = computed(() => list.value.length < total.value);

  const playlist = ref<APlayerMusic[]>([]);
  const currentMusic = ref<APlayerMusic | null>(null);

  const ensureInPlaylist = (m: APlayerMusic) => {
    const exists = playlist.value.some(
      (x) => x.src === m.src && x.title === m.title && x.artist === m.artist
    );
    if (!exists) playlist.value = [...playlist.value, m];
  };

  const playItem = (it: MusicItem) => {
    const m = toAPlayerMusic(it);
    ensureInPlaylist(m);
    currentMusic.value = m;

    try {
      window.$miniPlayer?.play(toMiniPlayerTrack(it));
      window.$miniPlayer?.show();
    } catch {
      // ignore
    }
  };

  const addToPlaylist = (it: MusicItem) => {
    const m = toAPlayerMusic(it);
    ensureInPlaylist(m);

    try {
      window.$miniPlayer?.add(toMiniPlayerTrack(it), false);
      window.$miniPlayer?.show();
    } catch {
      // ignore
    }
  };

  const playHot = (it: MusicHotItem) => {
    const m = toAPlayerMusic(it);
    ensureInPlaylist(m);
    currentMusic.value = m;
  };

  const clearPlaylist = () => {
    playlist.value = [];
    currentMusic.value = null;
  };

  const load = async (reset = false) => {
    if (loading.value) return;
    if (!reset && !hasMore.value && list.value.length > 0) return;

    const s = ++seq.value;
    errorMsg.value = null;

    if (reset) {
      loading.value = true;
      page.value = 1;
    } else {
      loadingMore.value = true;
      page.value += 1;
    }

    try {
      const res = await searchMusic({
        keyword: keyword.value.trim() || undefined,
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
      if (s === seq.value) errorMsg.value = "加载失败，请稍后重试";
    } finally {
      if (s === seq.value) {
        loading.value = false;
        loadingMore.value = false;
      }
    }
  };

  const onSearch = async (nextKeyword?: string) => {
    if (typeof nextKeyword === "string") keyword.value = nextKeyword;
    await load(true);
  };

  const onLoadMore = async () => {
    await load(false);
  };

  const loadHot = async () => {
    const res = await fetchMusicHot();
    hotList.value = res.data.list;
  };

  onMounted(async () => {
    await Promise.all([loadHot(), load(true)]);
  });

  return {
    keyword,
    list,
    hotList,
    total,
    loading,
    loadingMore,
    errorMsg,
    hasMore,
    playlist,
    currentMusic,
    onSearch,
    onLoadMore,
    playItem,
    addToPlaylist,
    playHot,
    clearPlaylist,
  };
}
