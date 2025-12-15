<script setup lang="ts">
import { useRoute } from "vue-router";
import { useTheme } from "../composables/useTheme";
import QIcon from "./QIcon.vue";
import IconSymbol from "./IconSymbol.vue";

const route = useRoute();
const { theme, toggleTheme } = useTheme();

const navItems = [
  {
    to: "/",
    label: "首页",
    iconName: "shouye",
  },
  {
    to: "/resources",
    label: "资源搜索",
    iconName: "sousuo_huaban1",
  },
  {
    to: "/wallpapers",
    label: "壁纸搜索",
    iconName: "wallpaper",
  },
  {
    to: "/music",
    label: "音乐搜索",
    iconName: "yinle",
  },
  {
    to: "/video",
    label: "视频解析",
    iconName: "shipinjiexi",
  },
];
</script>

<template>
  <aside class="side-nav" aria-label="Main Navigation">
    <div class="side-trigger" aria-hidden="true"></div>
    <div class="side-top">
      <RouterLink class="side-brand" to="/" title="Cloud Tools">
        <span class="brand-mark">
          <IconSymbol name="shouye" :size="18" />
        </span>
      </RouterLink>
    </div>

    <div class="side-menu">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        class="side-item"
        :class="{ active: route.path === item.to }"
        :to="item.to"
        :title="item.label"
      >
        <span class="side-ico">
          <IconSymbol :name="item.iconName" :size="18" />
        </span>
      </RouterLink>
    </div>

    <div class="side-bottom">
      <button
        type="button"
        class="side-item side-action"
        :title="theme === 'light' ? '切换到深色' : '切换到浅色'"
        @click="toggleTheme"
      >
        <span class="side-ico">
          <QIcon
            :name="theme === 'light' ? 'ri-moon-line' : 'ri-sun-line'"
            :size="18"
          />
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

:global([data-bs-theme="light"]) .side-item {
  color: rgba(0, 0, 0, 0.72);
}

:global(body[data-theme="dark"]) .brand-mark {
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
}

.side-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-right: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  z-index: 1040;
  transform: translateX(0);
  opacity: 1;
  transition: background 180ms ease, box-shadow 180ms ease;
  overflow: hidden;
}

.side-nav:hover {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

:global([data-bs-theme="light"]) .side-nav:hover {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
}

.side-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 10px;
}

.side-top {
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-brand {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-radius: 0;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.92);
  justify-content: center;
}

:global([data-bs-theme="light"]) .side-brand {
  color: rgba(0, 0, 0, 0.82);
}

.side-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 0;
}

.side-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-radius: 0;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.86);
  text-decoration: none;
  transition: background 160ms ease, border-color 160ms ease,
    transform 160ms ease, color 160ms ease;
  justify-content: center;
}

.side-ico {
  width: 30px;
  height: 30px;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  flex: 0 0 auto;
}

.side-item:hover,
.side-brand:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: transparent;
  color: rgba(255, 255, 255, 0.92);
}

:global([data-bs-theme="light"]) .side-item:hover,
:global([data-bs-theme="light"]) .side-brand:hover {
  background: rgba(15, 23, 42, 0.06);
  color: rgba(0, 0, 0, 0.86);
}

.side-item.active {
  background: rgba(80, 170, 255, 0.18);
  border-color: transparent;
  color: rgba(255, 255, 255, 0.92);
}

:global([data-bs-theme="light"]) .side-item.active {
  background: rgba(13, 110, 253, 0.12);
  color: rgba(0, 0, 0, 0.9);
}

.side-item.active .side-ico {
  background: transparent;
  border-color: transparent;
}

.side-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 4px;
}

.side-action {
  border: 1px solid transparent;
}

button.side-item {
  cursor: pointer;
}

@media (max-width: 768px) {
  .side-nav {
    width: 40px;
    padding: 0;
    transform: translateX(0);
    opacity: 1;
  }
  .side-trigger {
    display: none;
  }
}
</style>
