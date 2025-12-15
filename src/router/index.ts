import { createRouter, createWebHashHistory } from "vue-router";

const routerBase = "/cloud-tools/";

const router = createRouter({
  history: createWebHashHistory(routerBase),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../pages/HomeChat/index.vue"),
    },
    {
      path: "/resources",
      name: "resources",
      component: () => import("../pages/ResourceSearch/index.vue"),
    },
    {
      path: "/wallpapers",
      name: "wallpapers",
      component: () => import("../pages/WallpaperSearch/index.vue"),
    },
    {
      path: "/wallpapers/:id",
      name: "wallpaper-detail",
      component: () => import("../pages/WallpaperDetail/index.vue"),
    },
    {
      path: "/music",
      name: "music",
      component: () => import("../pages/Music/index.vue"),
    },
    {
      path: "/music/search",
      name: "music-search",
      component: () => import("../pages/MusicSearch/index.vue"),
    },
    {
      path: "/video",
      name: "video",
      component: () => import("../pages/VideoParser/index.vue"),
    },
  ],
});

export default router;
