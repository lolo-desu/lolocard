<template>
  <div class="ability-status-panel">
    <div v-if="abilities.length" class="ability-status-group">
      <div class="ability-status-title">持有能力 ({{ abilities.length }})</div>
      <ul class="ability-status-list">
        <li v-for="ability in abilities" :key="ability.id" class="ability-status-item">
          <div class="ability-status-name">{{ ability.name }}</div>
          <p class="ability-status-desc">{{ ability.描述 }}</p>
          <p v-if="ability.主角评价" class="ability-status-eval">「{{ ability.主角评价 }}」</p>
        </li>
      </ul>
    </div>
    <p v-if="!abilities.length" class="ability-status-empty">暂无持有能力</p>
  </div>
</template>

<script setup lang="ts">
type AbilityEntry = {
  id: string;
  name: string;
  描述: string;
  主角评价: string;
};

defineProps<{
  abilities: AbilityEntry[];
}>();
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
