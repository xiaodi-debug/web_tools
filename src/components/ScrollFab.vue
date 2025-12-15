<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import QIcon from "./QIcon.vue";

const scrollEl = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const maxScroll = ref(0);

let cleanupScroll: (() => void) | null = null;
let cleanupWindow: (() => void) | null = null;

const updateMetrics = () => {
  const el = scrollEl.value;
  if (!el) {
    scrollTop.value = 0;
    maxScroll.value = 0;
    return;
  }
  scrollTop.value = el.scrollTop || 0;
  maxScroll.value = Math.max(
    0,
    (el.scrollHeight || 0) - (el.clientHeight || 0)
  );
};

const canGoTop = computed(() => scrollTop.value > 240);
const canGoBottom = computed(() => {
  const el = scrollEl.value;
  if (!el) return false;
  const max = maxScroll.value;
  return max > 240 && scrollTop.value < max - 240;
});

onMounted(() => {
  const bind = (el: HTMLElement | null) => {
    if (!el) return;
    if (scrollEl.value === el) return;

    cleanupScroll?.();
    cleanupScroll = null;

    scrollEl.value = el;
    updateMetrics();

    const onScroll = () => updateMetrics();
    el.addEventListener("scroll", onScroll, { passive: true });
    cleanupScroll = () => {
      el.removeEventListener("scroll", onScroll);
    };
  };

  const onReady = (e: Event) => {
    const ce = e as CustomEvent;
    bind((ce.detail as HTMLElement | undefined) || null);
  };

  window.addEventListener("app-scroll-ready", onReady as EventListener);
  cleanupWindow = () =>
    window.removeEventListener("app-scroll-ready", onReady as EventListener);

  const w = window as any;
  bind((w.__appScrollViewport as HTMLElement | undefined) || null);
  if (!scrollEl.value) {
    bind(document.querySelector(".app-scroll") as HTMLElement | null);
  }

  window.setTimeout(() => {
    const w2 = window as any;
    const el = scrollEl.value;
    const max = el ? (el.scrollHeight || 0) - (el.clientHeight || 0) : 0;
    if (max <= 2)
      bind((w2.__appScrollViewport as HTMLElement | undefined) || null);
  }, 300);
});

onUnmounted(() => {
  cleanupScroll?.();
  cleanupScroll = null;
  cleanupWindow?.();
  cleanupWindow = null;
});

const scrollToTop = () => {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollTo({ top: 0, behavior: "smooth" });
};

const scrollToBottom = () => {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
};
</script>

<template>
  <div class="scroll-fab">
    <button
      v-show="canGoTop"
      type="button"
      class="fab-btn"
      title="返回顶部"
      @click="scrollToTop"
    >
      <QIcon name="ri-arrow-up-line" :size="18" />
    </button>
    <button
      v-show="canGoBottom"
      type="button"
      class="fab-btn"
      title="返回底部"
      @click="scrollToBottom"
    >
      <QIcon name="ri-arrow-down-line" :size="18" />
    </button>
  </div>
</template>

<style scoped>
.scroll-fab {
  position: fixed;
  right: 18px;
  bottom: 16px;
  z-index: 1040;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fab-btn {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(var(--bs-primary-rgb), 0.92);
  color: rgba(255, 255, 255, 0.96);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22),
    0 8px 18px rgba(var(--bs-primary-rgb), 0.26);
  transition: transform 0.18s ease, filter 0.18s ease;
}

.fab-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

:global([data-bs-theme="light"]) .fab-btn {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(var(--bs-primary-rgb), 0.92);
  color: rgba(255, 255, 255, 0.96);
}

:global([data-bs-theme="light"]) .fab-btn:hover {
  filter: brightness(1.05);
}
</style>
