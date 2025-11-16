<template>
  <div class="ability-status-panel">
    <div v-if="abilities.length" class="ability-status-group">
      <div class="ability-status-title">持有能力 ({{ abilities.length }})</div>
      <ul class="ability-status-list">
        <li
          v-for="ability in abilities"
          :key="ability.id"
          class="ability-status-item"
          @pointerdown="abilityPress.onPointerDown(ability, $event)"
          @pointerup="abilityPress.onPointerUp(ability, $event)"
          @pointerleave="abilityPress.onPointerCancel($event)"
          @pointercancel="abilityPress.onPointerCancel($event)"
          @contextmenu.prevent
        >
          <div class="ability-status-name">{{ ability.name }}</div>
          <p class="ability-status-desc">{{ ability.描述 }}</p>
          <p v-if="ability.主角评价" class="ability-status-eval">「{{ ability.主角评价 }}」</p>
        </li>
      </ul>
    </div>
    <p v-if="!abilities.length" class="ability-status-empty">暂无持有能力</p>
  </div>
  <Confirm
    v-if="showAbilityActionModal"
    :title="`处理能力：${selectedAbilityName}`"
    :question="`请选择要对「${selectedAbilityName}」执行的操作。`"
    @cancel="closeAbilityActionModal"
  >
    <template #hint>
      <span>删除是指出现bug强行将条目删除、销毁是指玩家主动删除。注意：删除不会记录日志，销毁会以系统行为记录日志。</span>
    </template>
    <template #actions>
      <button type="button" class="confirm-button ghost" @click="handleAbilityBugDelete">删除</button>
      <button type="button" class="confirm-button ghost" @click="handleAbilityDestroy">销毁</button>
      <button type="button" class="confirm-button ghost" @click="closeAbilityActionModal">取消</button>
    </template>
  </Confirm>
</template>

<script setup lang="ts">
import Confirm from './Confirm.vue';
import { useLongPress } from '../composables/useLongPress';
import { useDataStore } from '../store';
import type { HeldAbility } from '../types';

defineProps<{
  abilities: HeldAbility[];
}>();

const store = useDataStore();
const showAbilityActionModal = ref(false);
const pendingAbility = ref<HeldAbility | null>(null);
const selectedAbilityName = computed(() => pendingAbility.value?.name ?? '未知能力');

const abilityPress = useLongPress<HeldAbility>({
  onLongPress: ability => openAbilityActionModal(ability),
});

function openAbilityActionModal(ability: HeldAbility) {
  pendingAbility.value = ability;
  showAbilityActionModal.value = true;
}

function closeAbilityActionModal() {
  showAbilityActionModal.value = false;
  pendingAbility.value = null;
}

function ensureHeldAbilities(): Record<string, any> | null {
  const hero = store.data.主角;
  if (!hero || typeof hero !== 'object') {
    return null;
  }
  if (!hero.持有能力 || typeof hero.持有能力 !== 'object') {
    hero.持有能力 = {};
  }
  return hero.持有能力 as Record<string, any>;
}

function removeHeldAbility(key: string | undefined) {
  if (!key) return false;
  const held = ensureHeldAbilities();
  if (!held) return false;
  if (Object.prototype.hasOwnProperty.call(held, key)) {
    delete held[key];
    return true;
  }
  return false;
}

function handleAbilityBugDelete() {
  if (!pendingAbility.value) return;
  const success = removeHeldAbility(pendingAbility.value.key);
  if (success) {
    toastr.success(`已删除能力「${selectedAbilityName.value}」`);
  } else {
    toastr.warning('未找到要删除的能力');
  }
  closeAbilityActionModal();
}

function handleAbilityDestroy() {
  if (!pendingAbility.value) return;
  const success = removeHeldAbility(pendingAbility.value.key);
  if (success) {
    store.log(`系统销毁了能力'${selectedAbilityName.value}'`);
    toastr.success(`已销毁能力「${selectedAbilityName.value}」`);
  } else {
    toastr.warning('未找到要销毁的能力');
  }
  closeAbilityActionModal();
}
</script>

<style lang="scss" scoped>
.ability-status-panel {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ability-status-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ability-status-title {
  font-weight: bold;
  font-size: 10px;
  color: #000;
}

.ability-status-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ability-status-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 6px;
  font-size: 8px;
  text-align: left;
  line-height: 1.3;
  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.ability-status-name {
  font-weight: bold;
  font-size: 9px;
  margin-bottom: 2px;
  color: #000;
}

.ability-status-desc {
  font-size: 8px;
  color: #111;
}

.ability-status-eval {
  font-size: 8px;
  color: #222;
  margin-top: 2px;
}

.ability-status-empty {
  font-size: 9px;
  color: #666;
  text-align: center;
}

</style>
