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
          <li v-for="buff in buffList" :key="buff.id" class="status-effect-item">
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
          <li v-for="debuff in debuffList" :key="debuff.id" class="status-effect-item">
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
</template>

<script setup lang="ts">
import type { StatusEffectEntry, StatusTab } from '../types';

defineProps<{
  buffList: StatusEffectEntry[];
  debuffList: StatusEffectEntry[];
}>();

const activeTab = ref<StatusTab>('增益');
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
  border-bottom: 2px solid var(--border-color);
}

.status-tab {
  flex: 1;
  padding: 8px;
  background: var(--bg-card);
  border: none;
  border-right: 1px solid var(--border-color);
  font-family: var(--pixel-font);
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #000;
}

.status-tab:last-child {
  border-right: none;
}

.status-tab:hover {
  background: var(--bg-card-hover);
}

.status-tab.active {
  background: var(--bg-input);
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
