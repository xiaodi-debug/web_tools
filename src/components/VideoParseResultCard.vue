<script setup lang="ts">
import { computed, ref } from "vue";
import { useXgplayer } from "../composables/useXgplayer";
import type { ParseResult } from "../services/videoParser";

const props = defineProps<{ result: ParseResult }>();

const playerEl = ref<HTMLElement | null>(null);
const url = computed(() => props.result.videoUrl);
const poster = computed(() => props.result.coverUrl);
useXgplayer(playerEl, { url, poster });

const formatDuration = (sec?: number) => {
  if (!sec || sec <= 0) return "-";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const platformName = computed(() => props.result.platform);

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }
}
</script>

<template>
  <div class="result-shell">
    <div class="row g-3">
      <div class="col-12 col-lg-7">
        <div class="result-card">
          <div class="result-media">
            <div v-if="result.videoUrl" class="xgplayer-wrap">
              <div ref="playerEl" class="xgplayer-mount"></div>
            </div>
            <div v-else class="result-placeholder">暂无可播放资源</div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-5">
        <div class="result-card">
          <div class="result-header">
            <div class="result-cover" v-if="result.coverUrl">
              <img :src="result.coverUrl" alt="cover" />
            </div>
            <div class="result-meta">
              <div class="result-title">{{ result.title }}</div>
              <div class="result-sub">
                <span>平台：{{ platformName }}</span>
                <span>时长：{{ formatDuration(result.durationSeconds) }}</span>
              </div>
              <div class="result-sub" v-if="result.author">
                作者：{{ result.author }}
              </div>
            </div>
          </div>

          <div class="result-actions">
            <div class="action-row" v-if="result.downloadUrl">
              <a
                class="btn btn-sm btn-success"
                :href="result.downloadUrl"
                target="_blank"
                rel="noreferrer"
              >
                下载
              </a>
              <button
                type="button"
                class="btn btn-sm btn-outline-success"
                @click="copyText(result.downloadUrl)"
              >
                复制下载
              </button>
            </div>

            <div class="kv">
              <div class="k">原始链接</div>
              <div class="v">
                <div class="text-truncate">{{ result.extractedUrl }}</div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="copyText(result.extractedUrl)"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-shell {
  margin-top: 12px;
}

.result-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.result-media {
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
}

.xgplayer-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.04);
}

.xgplayer-mount {
  width: 100%;
  height: 100%;
}

.result-placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.55);
}

.result-header {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.result-cover {
  width: 86px;
  height: 86px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
}

.result-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.result-title {
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 6px;
}

.result-sub {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: rgba(0, 0, 0, 0.6);
  font-size: 13px;
}

.result-actions {
  padding: 14px;
  display: grid;
  gap: 12px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.kv {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 10px;
  align-items: center;
}

.k {
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
}

.v {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}
</style>
