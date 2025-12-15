import Player from "xgplayer";
import "xgplayer/dist/index.min.css";
import { onUnmounted, ref, watch, type Ref } from "vue";

export type UseXgplayerOptions = {
  url: Ref<string | undefined>;
  poster?: Ref<string | undefined>;
};

export function useXgplayer(
  el: Ref<HTMLElement | null>,
  options: UseXgplayerOptions
) {
  const instance = ref<Player | null>(null);

  const destroy = () => {
    if (!instance.value) return;
    try {
      instance.value.destroy();
    } catch {
      return;
    } finally {
      instance.value = null;
    }
  };

  watch(
    () => [el.value, options.url.value, options.poster?.value] as const,
    ([mount, url, poster]) => {
      if (!mount || !url) {
        destroy();
        return;
      }

      destroy();
      instance.value = new Player({
        el: mount,
        url,
        poster,
        autoplay: false,
        playsinline: true,
        fluid: true,
        lang: "zh-cn",
      });
    },
    { flush: "post" }
  );

  onUnmounted(() => {
    destroy();
  });

  return {
    instance,
    destroy,
  };
}
