<template>
  <div class="change-history">
    <div class="history-header">
      <div class="header-title">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>修改记录</span>
        <span class="count-badge">{{ store.changeRecords.length }}</span>
      </div>
      <button
        v-if="store.changeRecords.length > 0"
        class="clear-btn"
        type="button"
        title="清空记录"
        @click="clearHistory"
      >
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <div v-if="store.changeRecords.length === 0" class="empty-state">
      <i class="fa-solid fa-inbox"></i>
      <p>暂无修改记录</p>
    </div>

    <div v-else class="history-content">
      <div class="records-list">
        <div
          v-for="(record, index) in paginatedManagerChanges"
          :key="index"
          class="record-item"
        >
          <div class="record-header">
            <span class="record-path">{{ record.path }}</span>
            <span class="record-time">{{ formatTime(record.timestamp) }}</span>
          </div>
          <div class="record-changes">
            <div class="value-change old-value">
              <span class="label">旧值:</span>
              <span class="value">{{ formatValue(record.oldValue) }}</span>
            </div>
            <i class="fa-solid fa-arrow-right arrow-icon"></i>
            <div class="value-change new-value">
              <span class="label">新值:</span>
              <span class="value">{{ formatValue(record.newValue) }}</span>
            </div>
          </div>
        </div>

        <div v-if="managerChanges.length === 0" class="no-records">
          暂无修改记录
        </div>
      </div>

      <div v-if="managerChanges.length > RECORDS_PER_PAGE" class="pagination">
        <button
          class="page-btn"
          type="button"
          :disabled="managerPage === 0"
          @click="managerPage--"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="page-info">
          {{ managerPage + 1 }} / {{ Math.ceil(managerChanges.length / RECORDS_PER_PAGE) }}
        </span>
        <button
          class="page-btn"
          type="button"
          :disabled="managerPage >= Math.ceil(managerChanges.length / RECORDS_PER_PAGE) - 1"
          @click="managerPage++"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVariableManagerStore } from '../store';

const store = useVariableManagerStore();

const RECORDS_PER_PAGE = 10;
const managerPage = ref(0);

// 获取当前聊天ID
const currentChatId = computed(() => store.getCurrentChatId());

// 过滤当前聊天的记录（只显示变量管理器的修改）
const managerChanges = computed(() =>
  store.changeRecords.filter(r => r.byManager && r.chatId === currentChatId.value)
);

const paginatedManagerChanges = computed(() => {
  const start = managerPage.value * RECORDS_PER_PAGE;
  const end = start + RECORDS_PER_PAGE;
  return managerChanges.value.slice(start, end);
});

// 监听变更，重置页码
watch(managerChanges, () => {
  if (managerPage.value >= Math.ceil(managerChanges.value.length / RECORDS_PER_PAGE)) {
    managerPage.value = Math.max(0, Math.ceil(managerChanges.value.length / RECORDS_PER_PAGE) - 1);
  }
});

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 超过1天，显示具体时间
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

function formatValue(value: any): string {
  if (value === undefined) {
    return '已删除';
  }
  if (value === null) {
    return 'null';
  }
  if (_.isString(value)) {
    return value || '""';
  }
  if (_.isNumber(value) || _.isBoolean(value)) {
    return String(value);
  }
  if (_.isArray(value)) {
    return `Array(${value.length})`;
  }
  if (_.isObject(value)) {
    return 'Object';
  }
  return String(value);
}

function clearHistory() {
  const confirmed = confirm('确定要清空所有修改记录吗？');
  if (confirmed) {
    store.clearChangeRecords();
    toastr?.success?.('已清空修改记录', '变量管理器');
  }
}
</script>

<style scoped lang="scss">
$border-color: var(--SmartThemeBorderColor);
$text-color: var(--SmartThemeBodyColor);
$em-color: var(--SmartThemeEmColor);
$text-muted: var(--SmartThemeQuoteColor);
$bg-hover: var(--SmartThemeBlurTintColor);
$border-radius: 5px;

.change-history {
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: transparent;
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: $bg-hover;
  border-bottom: 1px solid $border-color;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: $text-color;

  i {
    color: $em-color;
    font-size: 14px;
  }
}

.count-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(100, 180, 255, 0.15);
  color: rgba(100, 200, 255, 0.95);
  font-size: 11px;
  font-weight: 600;
}

.clear-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 100, 100, 0.15);
    color: rgba(255, 150, 150, 0.9);
  }

  i {
    font-size: 12px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: $text-muted;

  i {
    font-size: 36px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.history-content {
  display: flex;
  flex-direction: column;
}

.record-section {
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.section-header {
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;

  &:hover {
    background: $bg-hover;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: $text-color;

  i {
    font-size: 11px;
    transition: transform 0.2s ease;
  }
}

.section-count {
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(100, 180, 255, 0.12);
  color: rgba(100, 200, 255, 0.9);
  font-size: 10px;
  font-weight: 600;
}

.records-container {
  display: flex;
  flex-direction: column;
}

.records-list {
  min-height: 100px;
}

.record-item {
  padding: 12px 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: $bg-hover;
  }
}

.manager-record {
  border-left: 3px solid rgba(100, 180, 255, 0.5);
}

.external-record {
  border-left: 3px solid rgba(255, 193, 7, 0.5);
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.record-path {
  font-size: 11px;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  color: $em-color;
  font-weight: 600;
}

.record-time {
  font-size: 10px;
  color: $text-muted;
}

.record-changes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-change {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;

  .label {
    color: $text-muted;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .value {
    font-family: var(--monoFontFamily, 'Consolas', monospace);
    color: $text-color;
    word-break: break-all;
  }
}

.old-value {
  background: rgba(255, 100, 100, 0.08);
  border: 1px solid rgba(255, 100, 100, 0.2);
}

.new-value {
  background: rgba(100, 220, 120, 0.08);
  border: 1px solid rgba(100, 220, 120, 0.2);
}

.arrow-icon {
  font-size: 10px;
  color: $text-muted;
  flex-shrink: 0;
}

.no-records {
  padding: 20px;
  text-align: center;
  color: $text-muted;
  font-size: 12px;
}
.floor-groups {
  display: flex;
  flex-direction: column;
}

.floor-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.floor-header {
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 193, 7, 0.05);
  border-left: 3px solid rgba(255, 193, 7, 0.5);

  &:hover {
    background: rgba(255, 193, 7, 0.12);
  }
}

.floor-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: $text-color;

  i {
    font-size: 10px;
    transition: transform 0.2s ease;
  }
}

.floor-label {
  font-weight: 600;
  color: rgba(255, 193, 7, 0.95);
}

.changes-count {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 193, 7, 0.15);
  color: rgba(255, 193, 7, 0.95);
  font-size: 10px;
  font-weight: 600;
}

.floor-time {
  font-size: 10px;
  color: $text-muted;
}

.floor-records {
  background: rgba(0, 0, 0, 0.1);
}


.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1.5px solid $border-color;
  background: transparent;
  color: $text-color;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: $bg-hover;
    border-color: $em-color;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  i {
    font-size: 12px;
  }
}

.page-info {
  font-size: 12px;
  color: $text-muted;
  min-width: 60px;
  text-align: center;
}
</style>