<script setup lang="ts">
withDefaults(
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
</script>

<template>
  <i
    :class="name"
    aria-hidden="true"
    :style="{
      fontSize: typeof size === 'number' ? `${size}px` : size,
      color,
      lineHeight: 1,
      display: 'inline-block',
    }"
  ></i>
</template>
