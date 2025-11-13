<template>
  <div class="status-effects-trigger">
    <button
      class="status-button"
      type="button"
      :class="{ active: show }"
      @click="toggle"
    >
      <span class="button-icon">⚡</span>
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
          <template v-if="tab === '增益'">
            <p v-if="!buffList.length" class="status-effects-empty popover-empty">暂无增益状态</p>
            <ul v-else class="status-effects-list">
              <li
                v-for="(buff, index) in buffList"
                :key="buff.id"
                class="status-effect-item status-effect-buff"
                :class="{ active: activeBubble === buff.id, 'bubble-top': shouldShowBubbleOnTop(index, buffList.length) }"
                @click="toggleBubble(buff.id)"
              >
                <div class="status-effect-name">{{ buff.name }}</div>
                <p class="status-effect-desc">{{ buff.描述 }}</p>
                <div v-if="buff.持续时间 || buff.触发条件" class="status-effect-meta">
                  <span v-if="buff.持续时间">持续时间: {{ buff.持续时间 }}</span>
                  <span v-if="buff.触发条件">触发条件: {{ buff.触发条件 }}</span>
                </div>
                <div v-if="activeBubble === buff.id && buff.主角评价" class="status-bubble">
                  {{ buff.主角评价 }}
                </div>
              </li>
            </ul>
          </template>
          <template v-else>
            <p v-if="!debuffList.length" class="status-effects-empty popover-empty">暂无减益状态</p>
            <ul v-else class="status-effects-list">
              <li
                v-for="(debuff, index) in debuffList"
                :key="debuff.id"
                class="status-effect-item status-effect-debuff"
                :class="{ active: activeBubble === debuff.id, 'bubble-top': shouldShowBubbleOnTop(index, debuffList.length) }"
                @click="toggleBubble(debuff.id)"
              >
                <div class="status-effect-name">{{ debuff.name }}</div>
                <p class="status-effect-desc">{{ debuff.描述 }}</p>
                <div v-if="debuff.持续时间 || debuff.触发条件" class="status-effect-meta">
                  <span v-if="debuff.持续时间">持续时间: {{ debuff.持续时间 }}</span>
                  <span v-if="debuff.触发条件">触发条件: {{ debuff.触发条件 }}</span>
                </div>
                <div v-if="activeBubble === debuff.id && debuff.主角评价" class="status-bubble">
                  {{ debuff.主角评价 }}
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatusEffectEntry, StatusTab } from '../types';
import { useBubble } from '../composables/useBubble';

defineProps<{
  buffList: StatusEffectEntry[];
  debuffList: StatusEffectEntry[];
  buffCount: number;
  debuffCount: number;
}>();

const show = defineModel<boolean>('show', { default: false });
const tab = defineModel<StatusTab>('tab', { default: '增益' });

const { activeBubble, toggleBubble } = useBubble<string>();

function toggle() {
  show.value = !show.value;
}

function close() {
  show.value = false;
}

// 判断气泡应该显示在上方还是下方
// 列表后半部分的元素,气泡显示在上方
function shouldShowBubbleOnTop(index: number, total: number): boolean {
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
  gap: 4px;
  margin-bottom: 8px;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 2px;
}

.status-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 2px;
  font-family: var(--pixel-font);
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.5;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000;
  }

  &.active {
    background: var(--bg-input);
    border-color: var(--border-color);
    color: #1976d2;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

    &::before {
      opacity: 1;
    }
  }
}

.status-list-content {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;

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

.popover-empty {
  margin: 0;
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 10px;
}

.status-effects-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-effect-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px;
  font-size: 9px;
  text-align: left;
  line-height: 1.5;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;

  &:hover {
    background: var(--bg-card-hover);
    border-color: #666;
  }

  &.active {
    background: #e3f2fd;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
  }
}

.status-effect-name {
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 6px;
  color: #000;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-color);
}

.status-effect-desc {
  font-size: 10px;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.5;
}

.status-effect-meta {
  font-size: 9px;
  color: #888;
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--border-color);

  span {
    display: flex;
    align-items: center;
    gap: 4px;

    &::before {
      content: '•';
      color: #aaa;
    }
  }
}

.status-bubble {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #f5f5f5;
  border: 2px solid var(--border-color);
  padding: 8px 10px;
  font-size: 9px;
  color: #000;
  white-space: normal;
  z-index: 100;
  animation: bubblePop 0.2s ease-out;
  max-width: 200px;
  min-width: 120px;
  text-align: left;
  line-height: 1.4;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent var(--border-color) transparent;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 5px 5px 5px;
    border-color: transparent transparent #f5f5f5 transparent;
    margin-bottom: -1px;
  }
}

// 后半部分的元素,气泡显示在上方
.status-effect-item.bubble-top .status-bubble {
  top: auto;
  bottom: calc(100% + 8px);

  &::before {
    bottom: auto;
    top: 100%;
    border-width: 6px 6px 0 6px;
    border-color: var(--border-color) transparent transparent transparent;
  }

  &::after {
    bottom: auto;
    top: 100%;
    border-width: 5px 5px 0 5px;
    border-color: #f5f5f5 transparent transparent transparent;
    margin-bottom: 0;
    margin-top: -1px;
  }
}

@keyframes bubblePop {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.status-effects-empty {
  font-size: 10px;
  color: #999;
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .status-effects-trigger {
    display: none;
  }
}
</style>
