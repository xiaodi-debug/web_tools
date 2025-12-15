<script setup lang="ts">
import { computed } from "vue";
import PortalDropdown from "./PortalDropdown.vue";
import type { PortalDropdownOption } from "./PortalDropdown.vue";

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: "change", page: number): void;
  (e: "changePageSize", pageSize: number): void;
}>();

const pageSizeOptions = [10, 20, 50, 100] as const;

const totalPages = computed(() => {
  const size = Math.max(1, props.pageSize || 1);
  const t = Math.max(0, props.total || 0);
  return Math.max(1, Math.ceil(t / size));
});

const pages = computed<Array<number | "…">>(() => {
  const tp = totalPages.value;
  const p = Math.min(Math.max(1, props.page || 1), tp);

  if (tp <= 10) return Array.from({ length: tp }, (_, i) => i + 1);

  const out: Array<number | "…"> = [];
  const add = (v: number | "…") => {
    if (out.length && out[out.length - 1] === "…" && v === "…") return;
    out.push(v);
  };

  add(1);

  const left = Math.max(2, p - 2);
  const right = Math.min(tp - 1, p + 2);

  if (left > 2) add("…");
  for (let i = left; i <= right; i++) add(i);
  if (right < tp - 1) add("…");

  add(tp);
  return out;
});

const canPrev = computed(() => (props.page || 1) > 1);
const canNext = computed(() => (props.page || 1) < totalPages.value);

const go = (p: number) => {
  const tp = totalPages.value;
  const next = Math.min(Math.max(1, p), tp);
  if (next === props.page) return;
  emit("change", next);
};

const pageSizeOptionsForDropdown = computed<PortalDropdownOption<string>[]>(
  () => pageSizeOptions.map((n) => ({ value: String(n), label: `${n}/页` }))
);

const pageSizeModel = computed(() =>
  String(props.pageSize || pageSizeOptions[0])
);

const onChangePageSize = (v: string) => {
  const next = Number(v);
  if (!Number.isFinite(next) || next <= 0) return;
  if (next === props.pageSize) return;
  emit("changePageSize", next);
};
</script>

<template>
  <div class="pager" role="navigation" aria-label="分页">
    <div class="pager-left">
      <button
        class="nav"
        type="button"
        :disabled="!canPrev"
        @click="go(page - 1)"
      >
        ‹
      </button>

      <button
        v-for="it in pages"
        :key="String(it)"
        class="p"
        type="button"
        :disabled="it === '…'"
        :class="{ active: it === page }"
        @click="typeof it === 'number' && go(it)"
      >
        {{ it }}
      </button>

      <button
        class="nav"
        type="button"
        :disabled="!canNext"
        @click="go(page + 1)"
      >
        ›
      </button>

      <div class="ps">
        <PortalDropdown
          :modelValue="pageSizeModel"
          :options="pageSizeOptionsForDropdown"
          :minWidth="86"
          @update:modelValue="onChangePageSize"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0 6px;
}

.pager-left {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.p,
.nav {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.72);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 160ms ease, border-color 160ms ease,
    box-shadow 160ms ease;
}

.ps {
  display: inline-flex;
  align-items: center;
}

.ps :global(.pd-btn) {
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  color: rgba(0, 0, 0, 0.72);
  box-shadow: none;
}

.ps :global(.pd-caret) {
  color: rgba(0, 0, 0, 0.55);
}

.ps :global(.pd-btn:hover) {
  background: #f3f4f6;
  border-color: rgba(15, 23, 42, 0.16);
  color: rgba(0, 0, 0, 0.78);
}

.p:hover,
.nav:hover {
  background: #f3f4f6;
  border-color: rgba(15, 23, 42, 0.16);
}

.p.active {
  border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.28);
  background: #1941c5;
  color: rgba(236, 231, 231, 0.86);
  box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb, 13, 110, 253), 0.12);
}

.p:disabled,
.nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
