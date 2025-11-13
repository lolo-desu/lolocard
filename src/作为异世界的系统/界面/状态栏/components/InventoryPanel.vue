<template>
  <div class="inventory-section">
    <div class="inventory-title">物品栏</div>
    <div class="inventory-grid">
      <div
        v-for="(item, index) in inventory"
        :key="item.id"
        class="inventory-item"
        :class="{
          placeholder: item.placeholder,
          active: activeBubble === item.id,
          'bubble-top': shouldShowBubbleOnTop(index, inventory.length),
        }"
        @click="!item.placeholder && toggleBubble(item.id)"
      >
        <div class="item-name">{{ item.名称 }}</div>
        <div class="item-description">{{ item.描述 || item.主角评价 || '空槽位' }}</div>
        <div v-if="!item.placeholder && activeBubble === item.id" class="info-bubble inventory-bubble">
          {{ item.主角评价 || item.描述 || '暂无评价' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBubble } from '../composables/useBubble';
import type { InventoryItem } from '../types';

defineProps<{
  inventory: InventoryItem[];
}>();

const { activeBubble, toggleBubble } = useBubble<string>();

// 判断气泡应该显示在上方还是下方
// 列表后半部分的元素,气泡显示在上方
function shouldShowBubbleOnTop(index: number, total: number): boolean {
  return index < Math.floor(total / 2);
}
</script>

<style lang="scss" scoped>
.inventory-section {
  padding: 10px;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.inventory-title {
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.inventory-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;

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
  min-height: 40px;
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
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }
}
</style>
