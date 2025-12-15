/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "mockjs";

declare module "vue3-waterfall-plugin";

declare module "vue3-aplayer";

declare module "aplayer";

declare module "overlayscrollbars";
