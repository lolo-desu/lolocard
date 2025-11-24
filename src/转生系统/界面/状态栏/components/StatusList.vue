<template>
  <p v-if="!displayEntries.length" :class="['status-effects-empty', { compact: isCompact }]">
    {{ emptyText }}
  </p>
  <ul v-else :class="['status-effects-list', { compact: isCompact }]">
    <li
      v-for="(entry, index) in displayEntries"
      :key="entry.id"
      :class="[
        'status-effect-item',
        getAdditionalClass(entry, index),
        {
          compact: isCompact,
          placeholder: entry.__placeholder,
          active: activeId === entry.id,
          'bubble-top': useBubble && !entry.__placeholder && bubbleShouldShowOnTop?.(index, displayEntries.length),
        },
      ]"
      @pointerdown="$emit('pointerdown', entry, $event)"
      @pointerup="$emit('pointerup', entry, $event)"
      @pointerleave="$emit('pointerleave', entry, $event)"
      @pointercancel="$emit('pointercancel', entry, $event)"
      @contextmenu.prevent
    >
      <div :class="['status-effect-name', { compact: isCompact }]">{{ entry.name }}</div>
      <p :class="['status-effect-desc', { compact: isCompact }]">{{ entry.描述 }}</p>
      <div :class="['status-effect-meta', { compact: isCompact }]">
        <span v-if="entry.持续时间">持续时间: {{ entry.持续时间 }}</span>
        <span v-if="entry.触发条件">触发条件: {{ entry.触发条件 }}</span>
      </div>
      <div v-if="useBubble && !entry.__placeholder && activeId === entry.id && entry.主角评价" class="status-bubble">
        {{ entry.主角评价 }}
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StatusEffectEntry } from '../types';

type StatusListEntry = StatusEffectEntry & { __placeholder?: boolean };

const props = defineProps<{
  entries: StatusEffectEntry[];
  emptyText: string;
  activeId?: string | null;
  useBubble?: boolean;
  bubbleShouldShowOnTop?: (index: number, total: number) => boolean;
  getItemClass?: (entry: StatusEffectEntry, index: number) => string | Record<string, boolean> | undefined;
  compact?: boolean;
  minRows?: number;
}>();

defineEmits<{
  pointerdown: [entry: StatusEffectEntry, event: PointerEvent];
  pointerup: [entry: StatusEffectEntry, event: PointerEvent];
  pointerleave: [entry: StatusEffectEntry, event: PointerEvent];
  pointercancel: [entry: StatusEffectEntry, event: PointerEvent];
}>();

const useBubble = computed(() => props.useBubble ?? false);

const displayEntries = computed<StatusListEntry[]>(() => {
  const items: StatusListEntry[] = [...props.entries];
  const minRows = props.minRows ?? 0;
  if (minRows > 0 && items.length < minRows) {
    const placeholders = minRows - items.length;
    for (let i = 0; i < placeholders; i += 1) {
      items.push({
        id: `placeholder-${i}`,
        key: `placeholder-${i}`,
        name: '空槽位',
        类型: '增益',
        描述: '',
        主角评价: '',
        持续时间: '',
        触发条件: '',
        __placeholder: true,
      });
    }
  }
  return items;
});

const bubbleShouldShowOnTop = computed(() => props.bubbleShouldShowOnTop);
const activeId = computed(() => props.activeId ?? null);

const isCompact = computed(() => props.compact ?? false);

function getAdditionalClass(entry: StatusListEntry, index: number) {
  if (typeof props.getItemClass === 'function') {
    return props.getItemClass(entry, index) ?? '';
  }
  if (props.getItemClass) {
    return props.getItemClass;
  }
  return '';
}
</script>

<style scoped lang="scss">
.status-effects-empty {
  font-size: 10px;
  color: #999;
  text-align: center;
  padding: 20px;

  &.compact {
    font-size: 9px;
    color: #666;
    padding: 10px;
  }
}

.status-effects-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.compact {
    gap: 6px;
  }
}

.status-effect-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px;
  font-size: 9px;
  text-align: left;
  line-height: 1.5;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  color: #000;

  &.active {
    background: #e3f2fd;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
  }

  &.compact {
    padding: 6px;
    font-size: 8px;
    line-height: 1.3;
  }

  &.placeholder {
    border-style: dashed;
    color: #888;
    background: #fafafa;
    pointer-events: none;
  }
}

.status-effect-name {
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 6px;
  color: #000;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-color);

  &.compact {
    font-size: 9px;
    margin-bottom: 2px;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.status-effect-desc {
  font-size: 10px;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.5;

  &.compact {
    font-size: 8px;
    color: #111;
    margin-bottom: 3px;
    line-height: 1.3;
  }
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

  &.compact {
    font-size: 7px;
    color: #666;
    gap: 2px;
    margin-top: 0;
    padding-top: 0;
    border-top: none;

    span {
      &::before {
        content: '';
      }
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
  z-index: 9999;
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
</style>
