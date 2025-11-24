<template>
  <div class="abilities-panel">
    <div
      v-for="ability in abilities"
      :key="ability.key"
      class="ability-item"
      :class="{ active: activeBubble === ability.key }"
      @pointerdown="abilityPress.onPointerDown(ability, $event)"
      @pointerup="abilityPress.onPointerUp(ability, $event)"
      @pointerleave="abilityPress.onPointerCancel($event)"
      @pointercancel="abilityPress.onPointerCancel($event)"
      @contextmenu.prevent
    >
      <div class="ability-item__name">{{ ability.key }}</div>
      <div class="ability-item__value">{{ ability.数值 }}</div>
      <div class="ability-item__desc">{{ descriptions[ability.key] }}</div>
      <div v-if="activeBubble === ability.key" class="ability-bubble">
        {{ ability.主角评价 }}
      </div>
    </div>
  </div>

  <Confirm
    v-if="showAbilityModal"
    :title="`调整能力：${selectedAbilityName}`"
    :question="`请输入要设置的「${selectedAbilityName}」数值：`"
    @cancel="closeAbilityModal"
  >
    <template #hint>
      <span>输入数字后，会通过记录日志告知AI。</span>
    </template>
    <template #default>
      <label class="ability-edit-field">
        <span>新的数值</span>
        <input
          ref="abilityInputRef"
          type="number"
          step="1"
          v-model="abilityInputValue"
          @keyup.enter.prevent="handleAbilityConfirm"
        />
      </label>
    </template>
    <template #actions>
      <button type="button" class="confirm-button ghost" @click="closeAbilityModal">取消</button>
      <button type="button" class="confirm-button primary" @click="handleAbilityConfirm">确认</button>
    </template>
  </Confirm>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import Confirm from './Confirm.vue';
import { useBubble } from '../composables/useBubble';
import { useLongPress } from '../composables/useLongPress';
import { useDataStore } from '../store';
import type { Schema } from '../../../schema';
import type { AbilityData, AbilityKey } from '../types';

type AbilityPanel = Schema['主角']['能力面板'];

defineProps<{
  abilities: AbilityData[];
  descriptions: Record<AbilityKey, string>;
}>();

const store = useDataStore();
const { activeBubble, toggleBubble, closeBubble } = useBubble<AbilityKey>();

const showAbilityModal = ref(false);
const pendingAbilityKey = ref<AbilityKey | null>(null);
const abilityInputValue = ref<string>('');
const abilityInputRef = ref<HTMLInputElement | null>(null);

const selectedAbilityName = computed(() => pendingAbilityKey.value ?? '未知能力');

const abilityPress = useLongPress<AbilityData>({
  onTap: ability => toggleBubble(ability.key),
  onLongPress: ability => openAbilityModal(ability),
});

function openAbilityModal(ability: AbilityData) {
  pendingAbilityKey.value = ability.key;
  abilityInputValue.value = ability.数值?.toString() ?? '';
  showAbilityModal.value = true;
  closeBubble();
  nextTick(() => abilityInputRef.value?.focus());
}

function closeAbilityModal() {
  showAbilityModal.value = false;
  pendingAbilityKey.value = null;
  abilityInputValue.value = '';
}

function ensureAbilityPanel(): AbilityPanel | null {
  const hero = store.data.主角;
  if (!hero || typeof hero !== 'object') {
    return null;
  }
  if (!hero.能力面板 || typeof hero.能力面板 !== 'object') {
    hero.能力面板 = {} as AbilityPanel;
  }
  return hero.能力面板 as AbilityPanel;
}

function handleAbilityConfirm() {
  if (!pendingAbilityKey.value) {
    return;
  }
  const trimmed = String(abilityInputValue.value ?? '').trim();
  if (trimmed === '') {
    toastr.error('请输入数值');
    return;
  }
  const nextValue = Number(trimmed);
  if (Number.isNaN(nextValue)) {
    toastr.error('请输入有效的数字');
    return;
  }
  const abilityPanel = ensureAbilityPanel();
  if (!abilityPanel) {
    toastr.error('未找到主角能力数据');
    return;
  }
const target = abilityPanel[pendingAbilityKey.value] ?? (abilityPanel[pendingAbilityKey.value] = {
  数值: nextValue,
  主角评价: '待评价，需要立即更新',
} as AbilityPanel[AbilityKey]);
target.数值 = nextValue;
  store.log(`能力'${pendingAbilityKey.value}'已更新为${nextValue}|立即更新全部自我评价变量`);
  toastr.success('能力数值已更新');
  closeAbilityModal();
}
</script>

<style lang="scss" scoped>
.abilities-panel {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, minmax(70px, auto));
  gap: 6px;
  flex: 1;
  min-height: 0;
  align-content: start;
  position: relative;
  overflow: visible;
}

.ability-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 5px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
  touch-action: none;
  position: relative;
}

.ability-item:hover {
  background: var(--bg-card-hover);
  border-color: #666;
}

.ability-item.active {
  background: #e3f2fd;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.ability-item__name {
  font-size: 10px;
  font-weight: bold;
  color: #000;
  margin-bottom: 3px;
}

.ability-item__value {
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 2px;
}

.ability-item__desc {
  font-size: 7px;
  color: #666;
  line-height: 1.1;
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
  z-index: 20;
  animation: bubblePop 0.2s ease-out;
  max-width: 200px;
  min-width: 120px;
  text-align: left;
  line-height: 1.4;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.ability-bubble::before {
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

.ability-bubble::after {
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

@media (min-width: 769px) {
  .abilities-panel .ability-item:nth-last-child(-n + 3) .ability-bubble {
    top: auto;
    bottom: calc(100% + 8px);
  }

  .abilities-panel .ability-item:nth-last-child(-n + 3) .ability-bubble::before {
    bottom: auto;
    top: 100%;
    border-width: 6px 6px 0 6px;
    border-color: var(--border-color) transparent transparent transparent;
  }

  .abilities-panel .ability-item:nth-last-child(-n + 3) .ability-bubble::after {
    bottom: auto;
    top: 100%;
    border-width: 5px 5px 0 5px;
    border-color: #f5f5f5 transparent transparent transparent;
    margin-bottom: 0;
    margin-top: -1px;
  }
}

@media (max-width: 768px) {
  .abilities-panel {
    grid-template-columns: repeat(2, 1fr);
    overflow: visible;
  }

  .abilities-panel .ability-item:nth-last-child(-n + 2) .ability-bubble {
    top: auto;
    bottom: calc(100% + 8px);
  }

  .abilities-panel .ability-item:nth-last-child(-n + 2) .ability-bubble::before {
    bottom: auto;
    top: 100%;
    border-width: 6px 6px 0 6px;
    border-color: var(--border-color) transparent transparent transparent;
  }

  .abilities-panel .ability-item:nth-last-child(-n + 2) .ability-bubble::after {
    bottom: auto;
    top: 100%;
    border-width: 5px 5px 0 5px;
    border-color: #f5f5f5 transparent transparent transparent;
    margin-bottom: 0;
    margin-top: -1px;
  }
}

.ability-edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
  color: #000;

  input {
    border: 2px solid #000;
    padding: 6px;
    font-size: 12px;
    font-family: inherit;
    background: #fff;
    color: #000;
    width: 100%;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
    }
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
</style>
