<template>
  <div class="ability-popover-trigger">
    <button
      class="ability-button"
      type="button"
      :class="{ active: show }"
      @click="toggle"
    >
      <span class="button-icon">✦</span>
      能力 ({{ abilities.length }})
    </button>
    <div v-if="show" class="ability-popover">
      <div class="popover-header">
        <span>持有能力</span>
        <button class="popover-close" type="button" aria-label="关闭能力列表" @click="close">×</button>
      </div>
      <div class="ability-content">
        <div class="ability-scroll">
          <p v-if="!abilities.length" class="ability-empty">暂无持有能力</p>
          <ul class="ability-list">
            <li
              v-for="(ability, index) in displayAbilities"
              :key="ability.id"
              class="ability-item"
              :class="{
                active: !ability.__placeholder && activeBubble === ability.id,
                'bubble-top': !ability.__placeholder && shouldShowBubbleOnTop(index, displayAbilities.length),
                placeholder: ability.__placeholder,
              }"
              @pointerdown="abilityPress.onPointerDown(ability, $event)"
              @pointerup="abilityPress.onPointerUp(ability, $event)"
              @pointerleave="abilityPress.onPointerCancel($event)"
              @pointercancel="abilityPress.onPointerCancel($event)"
              @contextmenu.prevent
            >
              <div class="ability-name">{{ ability.name }}</div>
              <p class="ability-desc">{{ ability.描述 }}</p>
              <div v-if="activeBubble === ability.id && ability.主角评价 && !ability.__placeholder" class="ability-bubble">
                {{ ability.主角评价 }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <Confirm
    v-if="showAbilityActionModal"
    :title="`处理能力：${selectedAbilityName}`"
    :question="`请选择要对「${selectedAbilityName}」执行的操作。`"
    @cancel="closeAbilityActionModal"
  >
    <template #hint>
      <span>删除是指出现bug强行将条目删除、销毁是指玩家主动删除。删除不写日志，销毁会记录“系统销毁了能力”。</span>
    </template>
    <template #actions>
      <button type="button" class="confirm-button ghost" @click="handleAbilityBugDelete">删除</button>
      <button type="button" class="confirm-button ghost" @click="handleAbilityDestroy">销毁</button>
      <button type="button" class="confirm-button ghost" @click="closeAbilityActionModal">取消</button>
    </template>
  </Confirm>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import Confirm from './Confirm.vue';
import { useBubble } from '../composables/useBubble';
import { useEntryRemoval } from '../composables/useEntryRemoval';
import { useLongPress } from '../composables/useLongPress';
import { removeHeroRecordEntry } from '../utils/heroRecords';
import { useDataStore } from '../store';

type AbilityEntry = {
  id: string;
  key: string;
  name: string;
  描述: string;
  主角评价: string;
};

type AbilityDisplay = AbilityEntry & { __placeholder?: boolean };

const props = defineProps<{
  abilities: AbilityEntry[];
}>();

const abilities = toRef(props, 'abilities');

const displayAbilities = computed<AbilityDisplay[]>(() => {
  const list = abilities.value.map(ability => ({ ...ability }));
  while (list.length < 2) {
    const index = list.length;
    list.push({
      id: `placeholder-${index}`,
      key: `placeholder-${index}`,
      name: '空槽位',
      描述: '暂无能力',
      主角评价: '',
      __placeholder: true,
    } as AbilityDisplay);
  }
  return list;
});

const show = defineModel<boolean>('show', { default: false });

const { activeBubble, toggleBubble } = useBubble<string>();
const store = useDataStore();

const {
  showRemovalModal: showAbilityActionModal,
  selectedName: selectedAbilityName,
  openRemovalModal: openAbilityActionModal,
  closeRemovalModal: closeAbilityActionModal,
  handleBugDelete: handleAbilityBugDelete,
  handleDestroy: handleAbilityDestroy,
} = useEntryRemoval<AbilityDisplay>({
  getName: ability => ability?.name ?? '未知能力',
  getKey: ability => ability?.key ?? ability?.name,
  removeByKey: key => removeHeroRecordEntry(store.data.主角, '持有能力', key),
  deleteSuccessMessage: name => `已删除能力「${name}」`,
  destroySuccessMessage: name => `已销毁能力「${name}」`,
  deleteFailureMessage: '未找到要删除的能力',
  destroyFailureMessage: '未找到要销毁的能力',
  logDestroy: name => store.log(`系统销毁了能力'${name}'`),
});

const abilityPress = useLongPress<AbilityDisplay>({
  onTap: ability => toggleBubble(ability.id),
  onLongPress: ability => openAbilityActionModal(ability),
  shouldHandle: ability => !ability.__placeholder,
});

function toggle() {
  show.value = !show.value;
}

function close() {
  show.value = false;
}

function shouldShowBubbleOnTop(index: number, total: number): boolean {
  return index >= Math.floor(total / 2);
}
</script>

<style lang="scss" scoped>
.ability-popover-trigger {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  position: relative;
}

.ability-button {
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

.ability-button.active {
  color: #1976d2;
  text-decoration: underline;
}

.button-icon {
  font-size: 12px;
}

.ability-popover {
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

.ability-content {
  padding: 8px;
  padding-right: 4px;
  position: relative;
}

.ability-scroll {
  max-height: 320px;
  overflow-y: auto;

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

  scrollbar-width: thin;
  scrollbar-color: #999 var(--bg-card);
}

.ability-empty {
  font-size: 10px;
  color: #999;
  text-align: center;
  padding: 20px;
  margin: 0;
}

.ability-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ability-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px;
  font-size: 9px;
  text-align: left;
  line-height: 1.5;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  user-select: none;

  &:hover {
    background: var(--bg-card-hover);
    border-color: #666;
  }

  &.active {
    background: #e3f2fd;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
  }

  &.placeholder {
    border-style: dashed;
    color: #888;
    background: #fafafa;
    pointer-events: none;
  }
}

.ability-name {
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 6px;
  color: #000;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-color);
}

.ability-desc {
  font-size: 10px;
  color: #333;
  line-height: 1.5;
}

.ability-bubble {
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

.ability-item.bubble-top .ability-bubble {
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

@media (max-width: 768px) {
  .ability-popover-trigger {
    display: none;
  }
}
</style>
