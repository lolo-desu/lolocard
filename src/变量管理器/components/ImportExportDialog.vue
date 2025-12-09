<template>
  <div class="import-export-dialog">
    <div class="dialog-overlay" @click="$emit('close')"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>{{ mode === 'export' ? '导出变量' : '导入变量' }}</h3>
        <button class="close-btn" type="button" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="dialog-body">
        <div v-if="mode === 'export'" class="export-section">
          <div class="format-selector">
            <label>
              <input v-model="exportFormat" type="radio" value="yaml" />
              <span>YAML</span>
            </label>
            <label>
              <input v-model="exportFormat" type="radio" value="json" />
              <span>JSON</span>
            </label>
          </div>

          <div class="code-block">
            <pre><code>{{ exportedContent }}</code></pre>
          </div>

          <button class="action-btn primary-btn" type="button" @click="copyToClipboard">
            <i class="fa-solid fa-copy"></i>
            <span>{{ copied ? '已复制！' : '复制到剪贴板' }}</span>
          </button>
        </div>

        <div v-else class="import-section">
          <div class="format-info">
            <i class="fa-solid fa-info-circle"></i>
            <span>支持导入 JSON 或 YAML 格式的数据</span>
          </div>

          <textarea
            v-model="importContent"
            class="import-textarea"
            placeholder="粘贴 JSON 或 YAML 内容..."
          ></textarea>

          <div v-if="importError" class="error-message">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <span>{{ importError }}</span>
          </div>

          <button
            class="action-btn primary-btn"
            type="button"
            :disabled="!importContent.trim()"
            @click="handleImport"
          >
            <i class="fa-solid fa-file-import"></i>
            <span>导入</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parse, stringify } from 'yaml';
import { useVariableManagerStore } from '../store';
import { isDebugMode } from '../util';

const props = defineProps<{
  mode: 'import' | 'export';
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useVariableManagerStore();

const exportFormat = ref<'yaml' | 'json'>('yaml');
const importContent = ref('');
const importError = ref('');
const copied = ref(false);

const exportedContent = computed(() => {
  const data = store.statData;
  if (exportFormat.value === 'yaml') {
    return stringify(data, { indent: 2 });
  }
  return JSON.stringify(data, null, 2);
});

function copyToClipboard() {
  navigator.clipboard.writeText(exportedContent.value).then(() => {
    copied.value = true;
    toastr?.success?.('已复制到剪贴板', '变量管理器');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }).catch((error) => {
    if (isDebugMode()) {
      console.error('复制失败', error);
    }
    toastr?.error?.('复制失败，请手动选择复制', '变量管理器');
  });
}

async function handleImport() {
  importError.value = '';
  const content = importContent.value.trim();

  if (!content) {
    return;
  }

  try {
    let parsedData: any;

    // 尝试解析为 JSON
    try {
      parsedData = JSON.parse(content);
    } catch {
      // 如果 JSON 解析失败，尝试 YAML
      try {
        parsedData = parse(content);
      } catch (yamlError) {
        throw new Error('无法解析为 JSON 或 YAML 格式');
      }
    }

    // 验证数据类型
    if (!_.isPlainObject(parsedData)) {
      throw new Error('导入的数据必须是对象类型');
    }

    // 确认导入
    const confirmed = confirm('确定要导入这些数据吗？这将覆盖当前的 stat_data。');
    if (!confirmed) {
      return;
    }

    // 执行导入 - 直接替换整个 stat_data
    const win = window as any;
    await Promise.resolve(
      updateVariablesWith((current: any) => {
        _.set(current, 'stat_data', parsedData);
        return current;
      }, { type: 'message', message_id: 'latest' } as const)
    );

    // 刷新数据
    await store.refreshFromSource({ force: true });
    toastr?.success?.('导入成功', '变量管理器');
    emit('close');
  } catch (error: any) {
    importError.value = error.message || '导入失败';
    toastr?.error?.(importError.value, '变量管理器');
  }
}
</script>

<style scoped lang="scss">
$border-color: var(--SmartThemeBorderColor);
$text-color: var(--SmartThemeBodyColor);
$em-color: var(--SmartThemeEmColor);
$text-muted: var(--SmartThemeQuoteColor);
$bg-hover: var(--SmartThemeBlurTintColor);
$bg-main: var(--SmartThemeBlurTintColor);
$border-radius: 8px;

.import-export-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.dialog-content {
  position: relative;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  background: #2d2d2d;
  border-radius: $border-radius;
  border: 1.5px solid $border-color;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1.5px solid $border-color;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-color;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: $text-color;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-hover;
    color: $em-color;
  }

  i {
    font-size: 16px;
  }
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.export-section,
.import-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.format-selector {
  display: flex;
  gap: 16px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: $text-color;
    font-size: 14px;

    input[type='radio'] {
      cursor: pointer;
    }

    &:hover span {
      color: $em-color;
    }
  }
}

.code-block {
  background: #1e1e1e;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  padding: 16px;
  max-height: 400px;
  overflow: auto;

  pre {
    margin: 0;
    font-family: var(--monoFontFamily, 'Consolas', monospace);
    font-size: 13px;
    line-height: 1.6;
    color: #d4d4d4;

    code {
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(80, 80, 80, 0.6);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.format-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(100, 180, 255, 0.1);
  border: 1px solid rgba(100, 180, 255, 0.3);
  border-radius: $border-radius;
  color: rgba(100, 180, 255, 0.9);
  font-size: 13px;

  i {
    font-size: 14px;
  }
}

.import-textarea {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  background: #1e1e1e;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  color: #d4d4d4;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &:focus {
    outline: none;
    border-color: $em-color;
  }

  &::placeholder {
    color: $text-muted;
    opacity: 0.6;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: $border-radius;
  color: rgba(255, 150, 150, 0.9);
  font-size: 13px;

  i {
    font-size: 14px;
  }
}

.action-btn {
  padding: 12px 24px;
  border-radius: $border-radius;
  border: 1.5px solid $border-color;
  background: transparent;
  color: $text-color;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: $bg-hover;
    border-color: $em-color;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.primary-btn {
    background: rgba(100, 180, 255, 0.15);
    border-color: rgba(100, 180, 255, 0.5);
    color: rgba(100, 200, 255, 0.95);

    &:hover:not(:disabled) {
      background: rgba(100, 180, 255, 0.25);
      border-color: rgba(100, 180, 255, 0.8);
    }
  }

  i {
    font-size: 14px;
  }
}
</style>
