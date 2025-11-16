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
      <template v-if="activeTab === '增益'">
        <p v-if="!buffList.length" class="status-effects-empty">暂无增益状态</p>
        <ul v-else class="status-effects-list">
          <li
            v-for="buff in buffList"
            :key="buff.id"
            class="status-effect-item"
            @pointerdown="statusPress.onPointerDown(buff, $event)"
            @pointerup="statusPress.onPointerUp(buff, $event)"
            @pointerleave="statusPress.onPointerCancel($event)"
            @pointercancel="statusPress.onPointerCancel($event)"
            @contextmenu.prevent
          >
            <div class="status-effect-name">{{ buff.name }}</div>
            <p class="status-effect-desc">{{ buff.描述 }}</p>
            <p v-if="buff.主角评价" class="status-effect-eval">「{{ buff.主角评价 }}」</p>
            <div class="status-effect-meta">
              <span v-if="buff.持续时间">持续时间: {{ buff.持续时间 }}</span>
              <span v-if="buff.触发条件">触发条件: {{ buff.触发条件 }}</span>
            </div>
          </li>
        </ul>
      </template>

      <template v-else>
        <p v-if="!debuffList.length" class="status-effects-empty">暂无减益状态</p>
        <ul v-else class="status-effects-list">
          <li
            v-for="debuff in debuffList"
            :key="debuff.id"
            class="status-effect-item"
            @pointerdown="statusPress.onPointerDown(debuff, $event)"
            @pointerup="statusPress.onPointerUp(debuff, $event)"
            @pointerleave="statusPress.onPointerCancel($event)"
            @pointercancel="statusPress.onPointerCancel($event)"
            @contextmenu.prevent
          >
            <div class="status-effect-name">{{ debuff.name }}</div>
            <p class="status-effect-desc">{{ debuff.描述 }}</p>
            <p v-if="debuff.主角评价" class="status-effect-eval">「{{ debuff.主角评价 }}」</p>
            <div class="status-effect-meta">
              <span v-if="debuff.持续时间">持续时间: {{ debuff.持续时间 }}</span>
              <span v-if="debuff.触发条件">触发条件: {{ debuff.触发条件 }}</span>
            </div>
          </li>
        </ul>
      </template>
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
import { useLongPress } from '../composables/useLongPress';
import type { StatusEffectEntry, StatusTab } from '../types';
import { useDataStore } from '../store';

defineProps<{
  buffList: StatusEffectEntry[];
  debuffList: StatusEffectEntry[];
}>();

const activeTab = ref<StatusTab>('增益');
const store = useDataStore();

const showStatusActionModal = ref(false);
const pendingStatus = ref<StatusEffectEntry | null>(null);
const selectedStatusName = computed(() => pendingStatus.value?.name ?? '未知状态');

const statusPress = useLongPress<StatusEffectEntry>({
  onLongPress: status => openStatusActionModal(status),
});

function openStatusActionModal(status: StatusEffectEntry) {
  pendingStatus.value = status;
  showStatusActionModal.value = true;
}

function closeStatusActionModal() {
  showStatusActionModal.value = false;
  pendingStatus.value = null;
}

function ensureStatusRecord(): Record<string, any> | null {
  const hero = store.data.主角;
  if (!hero || typeof hero !== 'object') {
    return null;
  }
  if (!hero.当前状态 || typeof hero.当前状态 !== 'object') {
    hero.当前状态 = {};
  }
  return hero.当前状态 as Record<string, any>;
}

function removeStatusEntry(key: string | undefined) {
  if (!key) return false;
  const statusRecord = ensureStatusRecord();
  if (!statusRecord) return false;
  if (Object.prototype.hasOwnProperty.call(statusRecord, key)) {
    delete statusRecord[key];
    return true;
  }
  return false;
}

function handleStatusBugDelete() {
  if (!pendingStatus.value) return;
  const success = removeStatusEntry(pendingStatus.value.key);
  if (success) {
    toastr.success(`已删除状态「${selectedStatusName.value}」`);
  } else {
    toastr.warning('未找到要删除的状态');
  }
  closeStatusActionModal();
}

function handleStatusDestroy() {
  if (!pendingStatus.value) return;
  const success = removeStatusEntry(pendingStatus.value.key);
  if (success) {
    store.log(`系统销毁了状态'${selectedStatusName.value}'`);
    toastr.success(`已销毁状态「${selectedStatusName.value}」`);
  } else {
    toastr.warning('未找到要销毁的状态');
  }
  closeStatusActionModal();
}
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

.status-effects-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-effect-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 6px;
  font-size: 8px;
  text-align: left;
  line-height: 1.3;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  position: relative;
}

.status-effect-name {
  font-weight: bold;
  font-size: 9px;
  margin-bottom: 2px;
  color: #000;
}

.status-effect-desc {
  font-size: 8px;
  color: #111;
  margin-bottom: 3px;
}

.status-effect-eval {
  font-size: 8px;
  color: #222;
  margin-bottom: 3px;
}

.status-effect-meta {
  font-size: 7px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-effects-empty {
  font-size: 9px;
  color: #666;
  text-align: center;
  padding: 10px;
}
</style>
