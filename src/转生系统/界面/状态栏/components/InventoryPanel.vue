<template>
  <div class="inventory-section">
    <div class="inventory-title">物品栏</div>
    <div class="inventory-grid" @wheel.stop>
      <div
        v-for="(item, index) in displayedInventoryWithPad"
        :key="item.id"
        class="inventory-item"
        :class="{
          placeholder: item.placeholder,
          active: activeBubble === item.id,
          'bubble-top': shouldShowBubbleOnTop(index, displayedInventoryWithPad.length),
        }"
        @pointerdown="inventoryPress.onPointerDown(item, $event)"
        @pointerup="inventoryPress.onPointerUp(item, $event)"
        @pointerleave="inventoryPress.onPointerCancel()"
        @pointercancel="inventoryPress.onPointerCancel($event)"
        @contextmenu.prevent
      >
        <div class="item-name">{{ item.名称 }}</div>
        <div class="item-description">{{ item.描述 || item.主角评价 || '空槽位' }}</div>
        <div v-if="!item.placeholder && activeBubble === item.id" class="info-bubble inventory-bubble">
          {{ item.主角评价 || item.描述 || '暂无评价' }}
        </div>
      </div>
    </div>
  </div>

  <Confirm
    v-if="showInventoryActionModal"
    :title="actionModalTitle"
    :question="`请选择要对「${selectedItemName}」执行的操作。`"
    @cancel="closeActionModal"
  >
    <template #hint>
      <span>删除：强行将物品删除，通常用于出现bug时。</br>销毁：将物品删除并通知AI，作为剧情的一部分。</span>
    </template>
    <template #actions>
      <button type="button" class="confirm-button ghost" @click="handleBugDelete">删除</button>
      <button type="button" class="confirm-button ghost" @click="handleDestroy">销毁</button>
      <button type="button" class="confirm-button ghost" @click="closeActionModal">取消</button>
    </template>
  </Confirm>
</template>

<script setup lang="ts">
import Confirm from './Confirm.vue';
import { useBubble } from '../composables/useBubble';
import { useEntryRemoval } from '../composables/useEntryRemoval';
import { useLongPress } from '../composables/useLongPress';
import { removeHeroRecordEntry } from '../utils/heroRecords';
import { useDataStore } from '../store';
import { ITEMS_PER_PAGE } from '../constants';
import type { InventoryItem } from '../types';

const props = defineProps<{
  inventory: InventoryItem[];
  isMobile?: boolean;
}>();

const store = useDataStore();
const { activeBubble, toggleBubble, closeBubble } = useBubble<string>();
const displayedInventory = computed(() => props.inventory ?? []);
const displayedInventoryWithPad = computed(() => {
  const list = [...displayedInventory.value];
  if (props.isMobile) {
    return list;
  }
  if (list.length < ITEMS_PER_PAGE) {
    const placeholdersNeeded = ITEMS_PER_PAGE - list.length;
    for (let i = 0; i < placeholdersNeeded; i += 1) {
      list.push({
        id: `placeholder-${i}`,
        key: `placeholder-${i}`,
        名称: '—',
        描述: '空槽位',
        主角评价: '',
        placeholder: true,
      });
    }
  }
  return list;
});

const {
  showRemovalModal: showInventoryActionModal,
  selectedName: selectedItemName,
  openRemovalModal,
  closeRemovalModal: closeActionModal,
  handleBugDelete,
  handleDestroy,
} = useEntryRemoval<InventoryItem>({
  getName: item => item?.名称 || '未知物品',
  getKey: item => item?.key,
  removeByKey: key => removeHeroRecordEntry(store.data.主角, '物品栏', key),
  deleteSuccessMessage: name => `已删除物品「${name}」`,
  destroySuccessMessage: name => `已销毁物品「${name}」`,
  deleteFailureMessage: '未找到要删除的物品',
  destroyFailureMessage: '未找到要销毁的物品',
  logDestroy: name => store.log(`系统销毁了物品'${name}'`),
});
const actionModalTitle = computed(() => `处理物品：${selectedItemName.value}`);

const inventoryPress = useLongPress<InventoryItem>({
  onTap: item => toggleBubble(item.id),
  onLongPress: item => openActionModal(item),
  usePointerCapture: false,
  shouldHandle: item => !item.placeholder,
});

function openActionModal(item: InventoryItem) {
  closeBubble();
  openRemovalModal(item);
}


// 判断气泡应该显示在上方还是下方
// 列表后半部分的元素,气泡显示在上方
function shouldShowBubbleOnTop(index: number, total: number): boolean {
  return index < Math.floor(total / 2);
}
</script>

<style lang="scss" scoped>
.inventory-section {
  padding: 10px 10px 60px;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  flex: none;
  min-height: auto;
  width: 100%;
}

.inventory-title {
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.inventory-grid {
  flex: none;
  max-height: 185px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  grid-auto-rows: 75px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  margin-bottom: 6px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #000;
    border-radius: 0;
  }

  scrollbar-width: thin;
  scrollbar-color: #000 transparent;
}

.inventory-item {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
  height: 100%;
  position: relative;
  overflow: visible;
  z-index: 1;

  &.active {
    z-index: 100;
  }
}

.inventory-item:hover {
  background: var(--bg-card-hover);
}

.inventory-item.active {
  background: #e3f2fd;
  border-color: #1976d2;
}

.inventory-item.placeholder {
  opacity: 0.5;
  border-style: dashed;
  pointer-events: none;
  cursor: default;
}

.item-name {
  font-size: 9px;
  color: #000;
  font-weight: bold;
  margin-bottom: 2px;
  text-align: center;
}

.item-description {
  font-size: 7px;
  color: #666;
  line-height: 1.2;
  text-align: center;
  word-wrap: break-word;
}

.info-bubble {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #f5f5f5;
  border: 2px solid var(--border-color);
  padding: 6px 8px;
  font-size: 8px;
  color: #000;
  white-space: normal;
  z-index: 25;
  animation: bubblePop 0.2s ease-out;
  max-width: 130px;
  min-width: 100px;
  text-align: left;
  line-height: 1.3;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.info-bubble::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 6px 0 6px;
  border-color: var(--border-color) transparent transparent transparent;
}

.info-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 5px 5px 0 5px;
  border-color: #f5f5f5 transparent transparent transparent;
  margin-top: -1px;
}

// 后半部分的元素,气泡显示在上方
.inventory-item.bubble-top .info-bubble {
  bottom: auto;
  top: calc(100% + 6px);

  &::before {
    top: auto;
    bottom: 100%;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent var(--border-color) transparent;
  }

  &::after {
    top: auto;
    bottom: 100%;
    border-width: 0 5px 5px 5px;
    border-color: transparent transparent #f5f5f5 transparent;
    margin-top: 0;
    margin-bottom: -1px;
  }
}

@keyframes bubblePop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .inventory-section {
    border-bottom: none;
    padding-bottom: 20px;
  }

  .inventory-grid {
    min-height: auto;
    max-height: none;
    grid-template-columns: 1fr;
    grid-auto-rows: 72px;
    overflow: visible;
    padding-right: 0;
  }
}
</style>
