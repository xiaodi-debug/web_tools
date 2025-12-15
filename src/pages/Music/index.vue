<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import MusicModeGrid, {
  type MusicModeCard,
} from "../../components/MusicModeGrid.vue";
import MusicModeQuickBar, {
  type MusicQuickMode,
} from "../../components/MusicModeQuickBar.vue";
import MusicTopBar from "../../components/MusicTopBar.vue";

const router = useRouter();

const keyword = ref("");

const quickModes: MusicQuickMode[] = [
  { key: "hot", title: "热歌模式", iconName: "remen" },
  { key: "new", title: "新鲜模式", iconName: "remenhuodong" },
  { key: "library", title: "图书馆", iconName: "yunpan" },
  { key: "emo", title: "深夜EMO", iconName: "xihuan" },
  { key: "dj", title: "DJ模式", iconName: "yinle" },
  { key: "help", title: "助眠模式", iconName: "wangluo" },
  { key: "sport", title: "动感健身", iconName: "tiktok" },
  { key: "douyin", title: "抖音热歌", iconName: "douyin" },
];

const exploreCards: MusicModeCard[] = [
  {
    key: "dy_emo",
    title: "抖音爆火emo曲",
    subtitle: "emo天花板歌曲",
    cover:
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=60",
    query: "emo",
  },
  {
    key: "game",
    title: "打游戏必备",
    subtitle: "战歌燃起",
    cover:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=60",
    query: "游戏",
  },
  {
    key: "girl",
    title: "泰小慧",
    subtitle: "翻唱达人，氛围感女",
    cover:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60",
    query: "翻唱",
  },
  {
    key: "douyin_hot",
    title: "抖音爆火歌曲",
    subtitle: "让人沦陷的音乐",
    cover:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=60",
    query: "抖音",
  },
  {
    key: "bgm",
    title: "学习",
    subtitle: "高效率沉浸BGM",
    cover:
      "https://images.unsplash.com/photo-1489844097929-c8d5b91c456e?auto=format&fit=crop&w=800&q=60",
    query: "学习",
  },
  {
    key: "old",
    title: "热门DJ",
    subtitle: "DJ加持，开车带感",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=60",
    query: "DJ",
  },
  {
    key: "story",
    title: "怀旧老歌",
    subtitle: "一个故事一个故事",
    cover:
      "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=60",
    query: "怀旧",
  },
  {
    key: "workout",
    title: "Power Music Workout",
    subtitle: "健身时你的梦想在燃烧",
    cover:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60",
    query: "健身",
  },
  {
    key: "night",
    title: "晚月老歌",
    subtitle: "开始时总想逃几里",
    cover:
      "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=60",
    query: "夜晚",
  },
  {
    key: "chill",
    title: "程今",
    subtitle: "全能才女，创作歌手",
    cover:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=60",
    query: "治愈",
  },
  {
    key: "more_dy",
    title: "抖音爆火歌曲",
    subtitle: "最近抖音热的都在这",
    cover:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=60",
    query: "热歌",
  },
  {
    key: "chain",
    title: "The Chainsmokers",
    subtitle: "双人组合，旋律炸裂",
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60",
    query: "The Chainsmokers",
  },
];

function goSearch(q?: string) {
  const v = (typeof q === "string" ? q : keyword.value).trim();
  router.push({
    path: "/music/search",
    query: v ? { q: v } : undefined,
  });
}
</script>

<template>
  <div class="container-fluid py-3 portal-page">
    <div class="shell">
      <MusicTopBar v-model="keyword" @search="goSearch()" />

      <div class="divider" />

      <div class="quick-wrap">
        <MusicModeQuickBar
          :items="quickModes"
          @select="(it) => goSearch(it.title)"
        />
      </div>

      <MusicModeGrid
        title="探索更多新模式"
        :items="exploreCards"
        @select="(it) => goSearch(it.query || it.title)"
      />
    </div>
  </div>
</template>

<style scoped>
.shell {
  padding: 0;
}

.divider {
  height: 1px;
  margin: 12px 0 8px;
  background: rgba(15, 23, 42, 0.12);
}

.quick-wrap {
  margin-top: 12px;
}
</style>
