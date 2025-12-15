<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { createPopper, type Instance } from "@popperjs/core";
import QIcon from "./QIcon.vue";

export type PortalDropdownOption<T extends string> = {
  value: T;
  label: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: Array<PortalDropdownOption<string>>;
    disabled?: boolean;
    minWidth?: number;
  }>(),
  {
    disabled: false,
    minWidth: 0,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
}>();

const open = ref(false);
const anchorRef = ref<HTMLElement | null>(null);
const popRef = ref<HTMLElement | null>(null);
let popper: Instance | null = null;

const label = computed(() => {
  return props.options.find((x) => x.value === props.modelValue)?.label ?? "";
});

const styleVars = computed(() => {
  const w = props.minWidth || 0;
  return w > 0
    ? ({ "--pd-minw": `${w}px` } as Record<string, string>)
    : undefined;
});

const toggle = () => {
  if (props.disabled) return;
  open.value = !open.value;
};

const close = () => {
  open.value = false;
};

const select = (v: string) => {
  emit("update:modelValue", v);
  close();
};

const onGlobalClick = (e: MouseEvent) => {
  if (!open.value) return;
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (anchorRef.value && anchorRef.value.contains(t)) return;
  if (popRef.value && popRef.value.contains(t)) return;
  close();
};

const onKeydown = (e: KeyboardEvent) => {
  if (!open.value) return;
  if (e.key === "Escape") close();
};

const ensurePopper = async () => {
  await nextTick();
  if (!open.value) return;
  const anchor = anchorRef.value;
  const popEl = popRef.value;
  if (!anchor || !popEl) return;

  if (!popper) {
    popper = createPopper(anchor, popEl, {
      placement: "bottom-start",
      strategy: "fixed",
      modifiers: [
        { name: "offset", options: { offset: [0, 8] } },
        {
          name: "flip",
          options: {
            fallbackPlacements: ["top-start", "bottom-end", "top-end"],
          },
        },
        { name: "preventOverflow", options: { padding: 8 } },
      ],
    });
  } else {
    popper.update();
  }
};

const destroyPopper = () => {
  try {
    popper?.destroy();
  } catch {
    // ignore
  }
  popper = null;
};

watch(
  () => open.value,
  async (v) => {
    if (v) await ensurePopper();
    else destroyPopper();
  }
);

onMounted(() => {
  window.addEventListener("click", onGlobalClick);
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("click", onGlobalClick);
  window.removeEventListener("keydown", onKeydown);
  destroyPopper();
});
</script>

<template>
  <div ref="anchorRef" class="pd" :style="styleVars">
    <button
      type="button"
      class="pd-btn"
      :disabled="disabled"
      @click.stop="toggle"
    >
      <span class="pd-text">{{ label }}</span>
      <QIcon name="ri-arrow-down-s-line" class="pd-caret" />
    </button>

    <Teleport to="body">
      <div v-if="open" ref="popRef" class="pd-pop" role="menu" @click.stop>
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="pd-opt"
          :class="{ active: opt.value === modelValue }"
          role="menuitem"
          @click="select(opt.value)"
        >
          <span class="pd-opt-text">{{ opt.label }}</span>
          <QIcon
            v-if="opt.value === modelValue"
            name="ri-check-line"
            class="pd-check"
          />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pd {
  position: relative;
  min-width: var(--pd-minw, auto);
  z-index: 1;
}

.pd-btn {
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.16);
  color: rgba(255, 255, 255, 0.86);
  padding: 0 26px 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 100%;
}

.pd-btn:hover {
  background: rgba(0, 0, 0, 0.22);
  border-color: rgba(255, 255, 255, 0.18);
}

:global([data-bs-theme="light"]) .pd-btn {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.76);
}

:global([data-bs-theme="light"]) .pd-btn:hover {
  background: #f3f4f6;
  border-color: rgba(15, 23, 42, 0.16);
  color: rgba(0, 0, 0, 0.78);
}

.pd-text {
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  line-height: 1;
}

.pd-caret {
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.72);
  pointer-events: none;
}

:global([data-bs-theme="light"]) .pd-caret {
  color: rgba(0, 0, 0, 0.55);
}

.pd-pop {
  position: fixed;
  min-width: var(--pd-minw, 120px);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 18, 28, 0.92);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  z-index: 2000;
}

:global([data-bs-theme="light"]) .pd-pop {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.16);
}

.pd-opt {
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.88);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.pd-opt + .pd-opt {
  margin-top: 4px;
}

.pd-opt:hover {
  background: rgba(255, 255, 255, 0.1);
}

.pd-opt.active {
  background: rgba(255, 255, 255, 0.14);
}

:global([data-bs-theme="light"]) .pd-opt {
  color: rgba(0, 0, 0, 0.78);
}

:global([data-bs-theme="light"]) .pd-opt:hover {
  background: #f3f4f6;
}

:global([data-bs-theme="light"]) .pd-opt.active {
  background: #eef2ff;
}

.pd-opt-text {
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  line-height: 1.2;
}

.pd-check {
  font-size: 16px;
  color: rgba(130, 230, 190, 0.95);
}

:global([data-bs-theme="light"]) .pd-check {
  color: rgba(25, 135, 84, 0.95);
}
</style>
