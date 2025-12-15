import { createApp } from "vue";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "remixicon/fonts/remixicon.css";
import "aplayer/dist/APlayer.min.css";
import "overlayscrollbars/overlayscrollbars.css";
import "./assets/font/iconfont.js";
import "./styles/main.scss";
import App from "./App.vue";
import router from "./router";
import { setupMock } from "./mock";
import { useTheme } from "./composables/useTheme";

const injectIconfontSymbols = () => {
  const id = "__iconfont_svg__";
  if (document.getElementById(id)) return;

  const w = window as any;
  const key = Object.keys(w).find((k) => k.startsWith("_iconfont_svg_string_"));
  const svgString = (key ? (w[key] as string | undefined) : undefined) as
    | string
    | undefined;
  if (!svgString) return;

  const container = document.createElement("div");
  container.innerHTML = svgString;
  const svg = container.firstElementChild as SVGSVGElement | null;
  if (!svg) return;

  svg.setAttribute("id", id);
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.style.overflow = "hidden";

  document.body.prepend(svg);
};

setupMock();

const app = createApp(App);
app.use(router);
app.mount("#app");

injectIconfontSymbols();

useTheme().initTheme();
