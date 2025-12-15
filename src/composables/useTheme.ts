import { computed, ref } from "vue";

type Theme = "light" | "dark";

const themeRef = ref<Theme>("light");

const applyTheme = (theme: Theme) => {
  document.body.setAttribute("data-theme", theme);
  document.body.setAttribute("data-bs-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
};

export const useTheme = () => {
  const theme = computed(() => themeRef.value);

  const setTheme = (t: Theme) => {
    themeRef.value = t;
    applyTheme(t);
    localStorage.setItem("app_theme", t);
  };

  const toggleTheme = () => {
    setTheme(themeRef.value === "light" ? "dark" : "light");
  };

  const initTheme = () => {
    setTheme("light");
  };

  return { theme, setTheme, toggleTheme, initTheme };
};
