<template>
  <div class="status-effects-panel">
    <div class="status-tabs">
      <button
        class="status-tab"
        :class="{ active: activeTab === '增益' }"
        type="button"
        @click="activeTab = '增益'"
      >
        增益 ({{ buffList.length }})
      </button>
      <button
        class="status-tab"
        :class="{ active: activeTab === '减益' }"
        type="button"
        @click="activeTab = '减益'"
      >
        减益 ({{ debuffList.length }})
      </button>
    </div>

    <div class="status-content">
      <StatusList
        v-if="activeTab === '增益'"
        :entries="buffList"
        empty-text="暂无增益状态"
        :min-rows="2"
        compact
        @pointerdown="(entry, event) => statusPress.onPointerDown(entry, event)"
        @pointerup="(entry, event) => statusPress.onPointerUp(entry, event)"
        @pointerleave="(_, event) => statusPress.onPointerCancel(event)"
        @pointercancel="(_, event) => statusPress.onPointerCancel(event)"
      />
      <StatusList
        v-else
        :entries="debuffList"
        empty-text="暂无减益状态"
        :min-rows="2"
        compact
        @pointerdown="(entry, event) => statusPress.onPointerDown(entry, event)"
        @pointerup="(entry, event) => statusPress.onPointerUp(entry, event)"
        @pointerleave="(_, event) => statusPress.onPointerCancel(event)"
        @pointercancel="(_, event) => statusPress.onPointerCancel(event)"
      />
    </div>
  </div>
  <Confirm
    v-if="showStatusActionModal"
    :title="`处理状态：${selectedStatusName}`"
    :question="`请选择要对「${selectedStatusName}」执行的操作。`"
    @cancel="closeStatusActionModal"
  >
    <template #hint>
      <span>删除是指出现bug强行将条目删除、销毁是指玩家主动删除。注意：删除不会记录日志，销毁会以系统行为记录日志。</span>
    </template>
    <template #actions>
      <button type="button" class="confirm-button ghost" @click="handleStatusBugDelete">删除</button>
      <button type="button" class="confirm-button ghost" @click="handleStatusDestroy">销毁</button>
      <button type="button" class="confirm-button ghost" @click="closeStatusActionModal">取消</button>
    </template>
  </Confirm>
</template>

<script setup lang="ts">
import Confirm from './Confirm.vue';
import StatusList from './StatusList.vue';
import { useEntryRemoval } from '../composables/useEntryRemoval';
import { useLongPress } from '../composables/useLongPress';
import { removeHeroRecordEntry } from '../utils/heroRecords';
import type { StatusEffectEntry, StatusTab } from '../types';
import { useDataStore } from '../store';

defineProps<{
  buffList: StatusEffectEntry[];
  debuffList: StatusEffectEntry[];
}>();

const activeTab = ref<StatusTab>('增益');
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
  onLongPress: status => openStatusActionModal(status),
});
</script>

<style lang="scss" scoped>
.status-effects-panel {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.status-tabs {
  display: flex;
  background: #fff;
  border-top: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
}

.status-tab {
  flex: 1;
  padding: 8px 0;
  text-align: center;
  background: #fff;
  border: none;
  border-right: 2px solid var(--border-color);
  font-family: var(--pixel-font);
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  color: #000;
}

.status-tab:last-child {
  border-right: none;
}

.status-tab:hover {
  background: #f5f5f5;
}

.status-tab.active {
  color: #1976d2;
}

.status-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

</style>
