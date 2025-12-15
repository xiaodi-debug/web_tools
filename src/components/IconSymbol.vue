<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
    color?: string;
  }>(),
  {
    size: 16,
    color: "currentColor",
  }
);

const href = computed(() => {
  const n = (props.name || "").trim();
  if (!n) return "";
  if (n.startsWith("#")) return n;
  if (n.startsWith("icon-")) return `#${n}`;
  return `#icon-${n}`;
});
</script>

<template>
  <svg
    class="icon-symbol"
    aria-hidden="true"
    :style="{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      color,
    }"
  >
    <use :xlink:href="href"></use>
  </svg>
</template>

<style scoped>
.icon-symbol {
  display: inline-block;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
