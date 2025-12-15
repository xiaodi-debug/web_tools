<script setup lang="ts">
import { computed, ref } from "vue";
import VideoParseResultCard from "../../components/VideoParseResultCard.vue";
import VideoPlatformGrid from "../../components/VideoPlatformGrid.vue";
import {
  extractUrl,
  extractUrls,
  parseVideo,
  platformCards,
  type ParseResult,
} from "../../services/videoParser";

const url = ref("");
const mode = ref<"single" | "batch">("single");
const batchText = ref("");
type BatchItem = {
  url: string;
  status: "pending" | "parsing" | "success" | "error";
  result?: ParseResult;
  errorMsg?: string;
};
const batchItems = ref<BatchItem[]>([]);
const batchParsing = ref(false);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const result = ref<ParseResult | null>(null);

const extractedUrl = computed(() => extractUrl(url.value));
const canParse = computed(() => !loading.value && !!extractedUrl.value);

const batchSuccessResults = computed(() =>
  batchItems.value
    .filter((x) => x.status === "success" && !!x.result)
    .map((x) => x.result as ParseResult)
);

const batchDownloadUrls = computed(() => {
  const urls = batchItems.value
    .filter((x) => x.status === "success" && !!x.result?.downloadUrl)
    .map((x) => (x.result as ParseResult).downloadUrl as string);
  return Array.from(new Set(urls));
});

async function readClipboard() {
  errorMsg.value = null;
  try {
    const text = await navigator.clipboard.readText();
    if (!text?.trim()) {
      errorMsg.value = "剪贴板为空";
      return;
    }
    if (mode.value === "single") url.value = text;
    else batchText.value = text;
  } catch {
    errorMsg.value = "无法读取剪贴板（请检查浏览器权限）";
  }
}

async function onParse() {
  errorMsg.value = null;
  result.value = null;

  const extracted = extractedUrl.value;
  if (!extracted) {
    errorMsg.value = "请输入正确的视频链接";
    return;
  }

  loading.value = true;
  try {
    const data = await parseVideo(url.value);
    result.value = data;
  } catch {
    errorMsg.value = "解析失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}

function switchMode(next: "single" | "batch") {
  mode.value = next;
  errorMsg.value = null;
  result.value = null;
}

function onBatchClear() {
  batchText.value = "";
  batchItems.value = [];
  errorMsg.value = null;
  result.value = null;
}

async function onBatchParse() {
  if (batchParsing.value) return;
  errorMsg.value = null;
  result.value = null;

  const urls = extractUrls(batchText.value);
  if (!urls.length) {
    errorMsg.value = "请在批量框中粘贴链接（每行一个）";
    return;
  }

  batchItems.value = urls.map((u) => ({ url: u, status: "pending" as const }));
  batchParsing.value = true;
  try {
    for (let i = 0; i < batchItems.value.length; i++) {
      const it = batchItems.value[i];
      if (!it) continue;
      it.status = "parsing";
      batchItems.value = batchItems.value.slice();
      try {
        const r = await parseVideo(it.url);
        it.status = "success";
        it.result = r;
      } catch {
        it.status = "error";
        it.errorMsg = "解析失败";
      } finally {
        batchItems.value = batchItems.value.slice();
      }
    }
  } finally {
    batchParsing.value = false;
  }
}

async function onBatchDownload() {
  const urls = batchDownloadUrls.value;
  if (!urls.length) {
    errorMsg.value = "暂无可批量下载的链接";
    return;
  }

  if (urls.length >= 8) {
    const ok = window.confirm(
      `即将打开 ${urls.length} 个下载链接，可能会被浏览器拦截，是否继续？`
    );
    if (!ok) return;
  }

  try {
    await navigator.clipboard.writeText(urls.join("\n"));
  } catch {
    // ignore
  }

  for (const u of urls) {
    try {
      window.open(u, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  }
}
</script>

<template>
  <div class="video-parser">
    <div class="container-fluid py-3 portal-page">
      <div class="hero-center">
        <div class="hero-main-title">视频链接解析</div>
        <div class="hero-sub">
          支持各大热门平台链接解析，输入视频链接即可在线预览/下载
        </div>
      </div>

      <div class="hero-card">
        <div class="hero-head">
          <div class="mode-tabs" role="tablist" aria-label="解析模式">
            <button
              type="button"
              class="tab-btn"
              :class="{ active: mode === 'single' }"
              @click="switchMode('single')"
            >
              单个解析
            </button>
            <button
              type="button"
              class="tab-btn"
              :class="{ active: mode === 'batch' }"
              @click="switchMode('batch')"
            >
              批量解析
            </button>
          </div>
        </div>

        <template v-if="mode === 'single'">
          <div class="hero-input">
            <div class="input-wrap">
              <input
                v-model="url"
                class="form-control input-pill"
                placeholder="请输入视频链接（支持 YouTube、B站、抖音等）"
                @keydown.enter.prevent="onParse"
              />
              <button
                class="btn btn-light btn-pill-left"
                type="button"
                :disabled="loading"
                @click="readClipboard"
              >
                粘贴
              </button>
            </div>
            <button
              class="btn btn-pill btn-parse"
              type="button"
              :disabled="!canParse"
              @click="onParse"
            >
              <span v-if="!loading">开始解析</span>
              <span v-else>解析中...</span>
            </button>
          </div>

          <div v-if="result" class="parse-result-inline">
            <VideoParseResultCard :result="result" />
          </div>
        </template>

        <template v-else>
          <div class="batch-wrap">
            <textarea
              v-model="batchText"
              class="form-control batch-textarea"
              rows="5"
              placeholder="批量解析：每行粘贴一个链接（也支持粘贴分享文本，系统会自动提取 URL）"
            ></textarea>
            <div class="batch-actions">
              <button
                class="btn btn-light"
                type="button"
                :disabled="batchParsing"
                @click="readClipboard"
              >
                从剪贴板粘贴
              </button>
              <button
                class="btn btn-outline-secondary"
                type="button"
                :disabled="batchParsing"
                @click="onBatchClear"
              >
                清空
              </button>
              <button
                class="btn btn-parse"
                type="button"
                :disabled="batchParsing"
                @click="onBatchParse"
              >
                <span v-if="!batchParsing">批量解析</span>
                <span v-else>解析中...</span>
              </button>

              <button
                class="btn btn-success"
                type="button"
                :disabled="batchParsing || !batchDownloadUrls.length"
                @click="onBatchDownload"
              >
                批量下载
              </button>
            </div>

            <div v-if="batchItems.length" class="batch-list-box">
              <div class="batch-list">
                <div v-for="it in batchItems" :key="it.url" class="batch-pill">
                  <span class="batch-tag" :class="it.status">
                    <span v-if="it.status === 'pending'">等待</span>
                    <span v-else-if="it.status === 'parsing'">解析中</span>
                    <span v-else-if="it.status === 'success'">成功</span>
                    <span v-else>失败</span>
                  </span>
                  <span class="batch-text" :title="it.url">
                    <span
                      v-if="it.status === 'success' && it.result"
                      class="batch-title"
                    >
                      {{ it.result.title }}
                    </span>
                    <span
                      v-if="it.status === 'success' && it.result"
                      class="batch-sep"
                    >
                      -
                    </span>
                    <span class="batch-url">{{ it.url }}</span>
                    <span
                      v-if="it.status === 'error' && it.errorMsg"
                      class="batch-sep"
                    >
                      -
                    </span>
                    <span
                      v-if="it.status === 'error' && it.errorMsg"
                      class="batch-err"
                    >
                      {{ it.errorMsg }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="batchSuccessResults.length" class="parse-result-inline">
            <VideoParseResultCard
              v-for="(r, idx) in batchSuccessResults"
              :key="`${r.extractedUrl}-${idx}`"
              :result="r"
            />
          </div>
        </template>

        <div class="platform-mini">
          <div class="platform-title">支持平台</div>
          <VideoPlatformGrid :cards="platformCards" />
        </div>
      </div>

      <div class="section">
        <div class="section-title">使用指南</div>
        <div class="section-panel">
          <div class="guide-grid">
            <div class="guide-card">
              <div class="guide-ico">1</div>
              <div class="guide-t">复制链接</div>
              <div class="guide-s">从视频平台复制视频链接或分享文本</div>
            </div>
            <div class="guide-card">
              <div class="guide-ico">2</div>
              <div class="guide-t">粘贴链接</div>
              <div class="guide-s">粘贴到输入框，自动识别平台</div>
            </div>
            <div class="guide-card">
              <div class="guide-ico">3</div>
              <div class="guide-t">开始解析</div>
              <div class="guide-s">点击开始解析，获取可播放/下载链接</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">常见问题</div>
        <div class="section-panel">
          <div class="faq">
            <details class="faq-item">
              <summary>支持哪些视频平台的解析？</summary>
              <div class="faq-body">
                支持 YouTube、B站、抖音等常见平台，具体以平台列表为准。
              </div>
            </details>
            <details class="faq-item">
              <summary>解析失败怎么办？</summary>
              <div class="faq-body">
                请确认链接有效、网络通畅，或稍后重试；部分平台可能会临时限制解析。
              </div>
            </details>
            <details class="faq-item">
              <summary>批量解析有数量限制吗？</summary>
              <div class="faq-body">
                建议每次批量解析不要太多（例如 20
                条以内），以免耗时过长或被浏览器限制。
              </div>
            </details>
          </div>
        </div>
      </div>

      <div v-if="errorMsg" class="alert alert-danger mt-3 mb-0" role="alert">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-parser {
  min-height: calc(100vh);
  background: transparent;
}

.hero-center {
  text-align: center;
  margin-top: 6px;
  margin-bottom: 14px;
}

.hero-main-title {
  font-size: 22px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.hero-sub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.hero-card {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

.hero-head {
  display: flex;
  justify-content: center;
}

.mode-tabs {
  display: inline-flex;
  gap: 0;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(15, 23, 42, 0.04);
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.tab-btn {
  border: 0;
  border-radius: 0;
  background: rgba(15, 23, 42, 0.02);
  padding: 0 12px;
  height: 34px;
  font-weight: 400;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.72);
}

.tab-btn + .tab-btn {
  border-left: 1px solid rgba(15, 23, 42, 0.12);
}

.tab-btn:hover {
  background: rgba(15, 23, 42, 0.06);
}

.tab-btn.active {
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.92);
  color: #fff;
}

.hero-input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.input-wrap {
  position: relative;
  display: flex;
}

.input-pill {
  border-radius: 14px;
  padding-right: 92px;
  height: 44px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: rgba(15, 23, 42, 0.04);
  color: rgba(0, 0, 0, 0.86);
}

.input-pill:focus {
  border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.55);
  box-shadow: 0 0 0 0.22rem rgba(var(--bs-primary-rgb, 13, 110, 253), 0.18);
}

.input-pill::placeholder {
  color: rgba(0, 0, 0, 0.45);
}

.btn-pill {
  border-radius: 12px;
  height: 44px;
  min-width: 108px;
}

.btn-primary-strong {
  box-shadow: 0 12px 30px rgba(13, 110, 253, 0.28);
}

.btn-parse {
  height: 44px;
  min-width: 108px;
  border-radius: 12px;
  border: 0;
  background: rgba(90, 80, 210, 0.9);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 12px 30px rgba(90, 80, 210, 0.22);
}

.btn-parse:hover {
  background: rgba(90, 80, 210, 0.98);
}

.btn-parse:disabled {
  opacity: 0.7;
}

.btn-pill-left {
  position: absolute;
  right: 6px;
  top: 6px;
  height: 32px;
  border-radius: 12px;
  padding: 0 14px;
}

.btn-pill-left.btn-light {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.96);
}

.parse-result-inline {
  margin-top: 12px;
}

.platform-mini {
  margin-top: 12px;
}

.platform-title {
  font-weight: 400;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 10px;
  text-align: center;
}

.section {
  margin-top: 18px;
}

.section-panel {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(15, 23, 42, 0.03);
}

.section-title {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.86);
  text-align: center;
  margin-bottom: 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.guide-card {
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 1);
  padding: 14px;
  text-align: center;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.guide-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.guide-ico {
  width: 34px;
  height: 34px;
  margin: 0 auto 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.18);
  color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.95);
  font-weight: 700;
}

.guide-t {
  color: rgba(0, 0, 0, 0.86);
  font-size: 13px;
}

.guide-s {
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}

.faq {
  display: grid;
  gap: 10px;
}

.faq-item {
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 1);
  padding: 10px 12px;
}

.faq-item[open] {
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
}

.faq-item > summary {
  cursor: pointer;
  color: rgba(0, 0, 0, 0.86);
  font-size: 13px;
}

.faq-body {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}

@media (max-width: 992px) {
  .guide-grid {
    grid-template-columns: 1fr;
  }
}

.batch-wrap {
  margin-top: 12px;
}

.batch-textarea {
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.batch-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.batch-list-box {
  margin-top: 10px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.55);
}

.batch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.batch-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.75);
}

.batch-tag {
  flex: 0 0 auto;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.7);
  color: rgba(0, 0, 0, 0.6);
}

.batch-tag.parsing {
  color: rgba(13, 110, 253, 0.95);
  border-color: rgba(13, 110, 253, 0.22);
  background: rgba(13, 110, 253, 0.08);
}

.batch-tag.success {
  color: rgba(25, 135, 84, 0.95);
  border-color: rgba(25, 135, 84, 0.22);
  background: rgba(25, 135, 84, 0.08);
}

.batch-tag.error {
  color: rgba(220, 53, 69, 0.95);
  border-color: rgba(220, 53, 69, 0.22);
  background: rgba(220, 53, 69, 0.08);
}

.batch-text {
  min-width: 0;
  max-width: 520px;
  display: inline-flex;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
}

.batch-title {
  flex: 0 1 auto;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
}

.batch-url {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(0, 0, 0, 0.62);
}

.batch-sep {
  flex: 0 0 auto;
  color: rgba(0, 0, 0, 0.35);
}

.batch-err {
  flex: 0 0 auto;
  color: rgba(220, 53, 69, 0.9);
  font-weight: 700;
}

.platform-title {
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

:global([data-bs-theme="light"]) .platform-title {
  color: rgba(0, 0, 0, 0.6);
}
</style>
