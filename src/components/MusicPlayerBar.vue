<script setup lang="ts">
import { computed } from "vue";
import type { APlayerMusic } from "../composables/useMusicSearch";
import Aplayer from "vue3-aplayer";

const props = defineProps<{
  current: APlayerMusic | null;
  list: APlayerMusic[];
}>();

const music = computed(() => {
  if (props.current) return props.current;
  return {
    title: "secret base~君がくれたもの~",
    artist: "Silent Siren",
    src: "https://ngx.moezx.cc/share/SamoyedPlayer/%E5%83%95%E3%82%89%E3%81%AE%E6%89%8B%E3%81%AB%E3%81%AF%E4%BD%95%E3%82%82%E3%81%AA%E3%81%84%E3%81%91%E3%81%A8%E3%82%99%E3%80%81%20-%20RAM%20WIRE.mp3",
    pic: "https://picsum.photos/seed/music--4-efdAe4F2-9F27-40fB-d1DF-E104ABFC8B9C/120/120.jpg",
  };
  if (props.list.length) return props.list[0];
  return null;
});
</script>

<template>
  <div class="player-bar" v-if="music">
    <Aplayer
      :music="music"
      :list="list"
      :autoplay="false"
      :mutex="true"
      :listFolded="true"
    />
  </div>
</template>

<style scoped>
.player-bar {
  position: sticky;
  bottom: 0;
  z-index: 20;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}
</style>
<style>
.aplayer .aplayer-info {
  margin-left: 0 !important;
}
.aplayer-time .aplayer-icon {
  width: 25px;
  height: 25px;
}
.aplayer-controller {
  font-size: 20px;
  .aplayer-time-inner {
    font-size: 16px;
  }
}
.aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap .aplayer-bar {
  height: 10px;
}
.aplayer
  .aplayer-info
  .aplayer-controller
  .aplayer-bar-wrap
  .aplayer-bar
  .aplayer-loaded {
  height: 10px;
}
.aplayer
  .aplayer-info
  .aplayer-controller
  .aplayer-bar-wrap
  .aplayer-bar
  .aplayer-played {
  height: 10px;
}
.aplayer
  .aplayer-info
  .aplayer-controller
  .aplayer-bar-wrap
  .aplayer-bar
  .aplayer-played
  .aplayer-thumb {
  height: 15px;
  width: 15px;
}
</style>
