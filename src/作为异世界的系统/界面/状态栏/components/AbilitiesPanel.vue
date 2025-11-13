<template>
  <div class="abilities-panel">
    <div
      v-for="ability in abilities"
      :key="ability.key"
      class="ability-item"
      :class="{ active: activeBubble === ability.key }"
      @click="toggleBubble(ability.key)"
    >
      <div class="ability-item__name">{{ ability.key }}</div>
      <div class="ability-item__value">{{ ability.数值 }}</div>
      <div class="ability-item__desc">{{ descriptions[ability.key] }}</div>
      <div v-if="activeBubble === ability.key" class="ability-bubble">
        {{ ability.主角评价 }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AbilityData, AbilityKey } from '../types';
import { useBubble } from '../composables/useBubble';

const props = defineProps<{
  abilities: AbilityData[];
  descriptions: Record<AbilityKey, string>;
}>();

const { activeBubble, toggleBubble } = useBubble<AbilityKey>();
</script>

<style lang="scss" scoped>
.abilities-panel {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, minmax(60px, auto));
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
