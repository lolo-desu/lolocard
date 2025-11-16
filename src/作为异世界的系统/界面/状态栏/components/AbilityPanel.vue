<template>
  <div class="ability-status-panel">
    <div class="ability-status-group">
      <div class="ability-status-title">持有能力 ({{ abilities.length }})</div>
      <ul class="ability-status-list">
        <li
          v-for="ability in displayAbilities"
          :key="ability.id"
          class="ability-status-item"
          :class="{ placeholder: ability.__placeholder }"
          @pointerdown="abilityPress.onPointerDown(ability, $event)"
          @pointerup="abilityPress.onPointerUp(ability, $event)"
          @pointerleave="abilityPress.onPointerCancel($event)"
          @pointercancel="abilityPress.onPointerCancel($event)"
          @contextmenu.prevent
        >
          <div class="ability-status-name">{{ ability.name }}</div>
          <p class="ability-status-desc">{{ ability.描述 }}</p>
          <p v-if="ability.主角评价" class="ability-status-eval">{{ ability.主角评价 }}</p>
        </li>
      </ul>
    </div>
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
import { computed, toRef } from 'vue';
import Confirm from './Confirm.vue';
import { useEntryRemoval } from '../composables/useEntryRemoval';
import { useLongPress } from '../composables/useLongPress';
import { removeHeroRecordEntry } from '../utils/heroRecords';
import { useDataStore } from '../store';
import type { HeldAbility } from '../types';

type AbilityDisplay = HeldAbility & { __placeholder?: boolean };

const props = defineProps<{
  abilities: HeldAbility[];
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
  getKey: ability => ability?.key,
  removeByKey: key => removeHeroRecordEntry(store.data.主角, '持有能力', key),
  deleteSuccessMessage: name => `已删除能力「${name}」`,
  destroySuccessMessage: name => `已销毁能力「${name}」`,
  logDestroy: name => store.log(`系统销毁了能力'${name}'`),
  deleteFailureMessage: '未找到要删除的能力',
  destroyFailureMessage: '未找到要销毁的能力',
});

const abilityPress = useLongPress<AbilityDisplay>({
  onLongPress: ability => openAbilityActionModal(ability),
  shouldHandle: ability => !ability.__placeholder,
});
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

  &.placeholder {
    border-style: dashed;
    color: #888;
    background: #fafafa;
    pointer-events: none;
  }
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
