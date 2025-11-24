<template>
  <div class="status-effects-trigger">
    <button
      class="status-button"
      type="button"
      :class="{ active: show }"
      @click="toggle"
    >
      <span class="button-icon">✤</span>
      状态 ({{ buffCount + debuffCount }})
    </button>
    <div v-if="show" class="status-effects-popover">
      <div class="popover-header">
        <span>状态概览</span>
        <button class="popover-close" type="button" aria-label="关闭状态概览" @click="close">×</button>
      </div>
      <div class="status-effects-content">
        <div class="status-tabs">
          <button
            class="status-tab"
            :class="{ active: tab === '增益' }"
            type="button"
            @click="tab = '增益'"
          >
            增益 ({{ buffCount }})
          </button>
          <button
            class="status-tab"
            :class="{ active: tab === '减益' }"
            type="button"
            @click="tab = '减益'"
          >
            减益 ({{ debuffCount }})
          </button>
        </div>

        <div class="status-list-content">
          <StatusList
            v-if="tab === '增益'"
            :entries="buffList"
            empty-text="暂无增益状态"
            :use-bubble="true"
            :active-id="activeBubble"
            :bubble-should-show-on-top="shouldShowBubbleOnTop"
            :get-item-class="getBuffItemClass"
            :min-rows="2"
            @pointerdown="(entry, event) => statusPress.onPointerDown(entry, event)"
            @pointerup="(entry, event) => statusPress.onPointerUp(entry, event)"
            @pointerleave="(_, event) => statusPress.onPointerCancel(event)"
            @pointercancel="(_, event) => statusPress.onPointerCancel(event)"
          />
          <StatusList
            v-else
            :entries="debuffList"
            empty-text="暂无减益状态"
            :use-bubble="true"
            :active-id="activeBubble"
            :bubble-should-show-on-top="shouldShowBubbleOnTop"
            :get-item-class="getDebuffItemClass"
            :min-rows="2"
            @pointerdown="(entry, event) => statusPress.onPointerDown(entry, event)"
            @pointerup="(entry, event) => statusPress.onPointerUp(entry, event)"
            @pointerleave="(_, event) => statusPress.onPointerCancel(event)"
            @pointercancel="(_, event) => statusPress.onPointerCancel(event)"
          />
        </div>
      </div>
    </div>
  </div>

  <Confirm
    v-if="showStatusActionModal"
    :title="`处理状态：${selectedStatusName}`"
    :question="`请选择要对「${selectedStatusName}」执行的操作。`"
    @cancel="closeStatusActionModal"
  >
    <template #hint>
      <span>删除是指出现bug强行将条目删除、销毁是指玩家主动删除。删除不写日志，销毁会记录“系统销毁了状态”。</span>
    </template>
    <template #actions>
      <button type="button" class="confirm-button ghost" @click="handleStatusBugDelete">删除</button>
      <button type="button" class="confirm-button ghost" @click="handleStatusDestroy">销毁</button>
      <button type="button" class="confirm-button ghost" @click="closeStatusActionModal">取消</button>
    </template>
  </Confirm>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Confirm from './Confirm.vue';
import StatusList from './StatusList.vue';
import type { StatusEffectEntry, StatusTab } from '../types';
import { useBubble } from '../composables/useBubble';
import { useEntryRemoval } from '../composables/useEntryRemoval';
import { useLongPress } from '../composables/useLongPress';
import { removeHeroRecordEntry } from '../utils/heroRecords';
import { useDataStore } from '../store';

defineProps<{
  buffList: StatusEffectEntry[];
  debuffList: StatusEffectEntry[];
  buffCount: number;
  debuffCount: number;
}>();

const show = defineModel<boolean>('show', { default: false });
const tab = defineModel<StatusTab>('tab', { default: '增益' });

const { activeBubble, toggleBubble } = useBubble<string>();
const store = useDataStore();

const {
  showRemovalModal: showStatusActionModal,
  selectedName: selectedStatusName,
  openRemovalModal: openStatusActionModal,
  closeRemovalModal: closeStatusActionModal,
  handleBugDelete: handleStatusBugDelete,
  handleDestroy: handleStatusDestroy,
} = useEntryRemoval<StatusEffectEntry>({
  getName: status => status?.name ?? '未知状态',
  getKey: status => status?.key ?? status?.name,
  removeByKey: key => removeHeroRecordEntry(store.data.主角, '当前状态', key),
  deleteSuccessMessage: name => `已删除状态「${name}」`,
  destroySuccessMessage: name => `已销毁状态「${name}」`,
  deleteFailureMessage: '未找到要删除的状态',
  destroyFailureMessage: '未找到要销毁的状态',
  logDestroy: name => store.log(`系统销毁了状态'${name}'`),
});

const statusPress = useLongPress<StatusEffectEntry>({
  onTap: status => toggleBubble(status.id),
  onLongPress: status => openStatusActionModal(status),
});

const getBuffItemClass = () => 'status-effect-buff';
const getDebuffItemClass = () => 'status-effect-debuff';

function toggle() {
  show.value = !show.value;
}

function close() {
  show.value = false;
}

// 判断气泡应该显示在上方还是下方
// 列表后半部分的元素,气泡显示在上方
function shouldShowBubbleOnTop(index: number, total: number): boolean {
  if (total <= 1) {
    return false;
  }
  return index >= Math.floor(total / 2);
}
</script>

<style lang="scss" scoped>
.status-effects-trigger {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  position: relative;
}

.status-button {
  background: transparent;
  border: none;
  font-family: var(--pixel-font);
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-button.active {
  color: #1976d2;
  text-decoration: underline;
}

.button-icon {
  font-size: 12px;
}

.status-effects-popover {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  width: 320px;
  background: var(--bg-input);
  border: 3px solid var(--border-color);
  border-radius: 4px;
  padding: 0;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
  z-index: 30;
  animation: popoverFadeIn 0.2s ease-out;
}

@keyframes popoverFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 11px;
  padding: 10px 12px;
  background: var(--bg-card);
  border-bottom: 2px solid var(--border-color);
  color: #000;
}

.popover-close {
  background: transparent;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
  padding: 0 4px;

  &:hover {
    color: #000;
  }
}

.status-effects-content {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.status-tabs {
  display: flex;
  border: 2px solid var(--border-color);
  border-bottom: none;
  background: #fff;
  margin-bottom: 0;
  overflow: hidden;
}

.status-tab {
  flex: 1;
  padding: 8px 0;
  background: #fff;
  border: none;
  font-family: var(--pixel-font);
 	font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  color: #000;
  position: relative;
}

.status-tab + .status-tab::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  border-left: 2px solid var(--border-color);
}

.status-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-bottom: 2px solid black;
}

.status-tab:hover {
  background: #f5f5f5;
}

.status-tab.active {
  color: #1976d2;
}

.status-list-content {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
  border: 2px solid var(--border-color);
  border-top: none;
  padding: 12px;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-card);
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }

  &::-webkit-scrollbar-thumb {
    background: #999;
    border-radius: 4px;
    border: 1px solid var(--border-color);

    &:hover {
      background: #777;
    }

    &:active {
      background: #555;
    }
  }

  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #999 var(--bg-card);
}


@media (max-width: 768px) {
  .status-effects-trigger {
    display: none;
  }
}
</style>
