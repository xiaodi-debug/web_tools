import { onMounted, ref, type Ref } from "vue";

export type LocalHistoryOptions<T> = {
  key: string;
  limit?: number;
  isValid?: (v: unknown) => v is T[];
};

export function useLocalHistory<T>(options: LocalHistoryOptions<T>) {
  const history = ref<T[]>([]) as Ref<T[]>;

  const load = () => {
    try {
      const raw = localStorage.getItem(options.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (options.isValid) return options.isValid(parsed) ? parsed : [];
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const save = (next: T[]) => {
    const limit = options.limit ?? 20;
    history.value = next.slice(0, limit);
    try {
      localStorage.setItem(options.key, JSON.stringify(history.value));
    } catch {
      return;
    }
  };

  const clear = () => {
    save([]);
  };

  onMounted(() => {
    history.value = load();
  });

  return {
    history,
    load,
    save,
    clear,
  };
}
