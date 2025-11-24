<template>
  <div class="equipment-section">
    <div class="section-title">装备栏</div>
    <div class="equipment-grid">
      <div
        v-for="slot in slots"
        :key="slot.label"
        class="equipment-slot"
        :class="{ active: activeBubble === slot.label }"
        @click="toggleBubble(slot.label)"
      >
        <div class="slot-name">{{ slot.label }}</div>
        <div class="slot-item">{{ slot.item || '空置' }}</div>
        <div v-if="activeBubble === slot.label" class="info-bubble equipment-bubble">
          {{ slot.evaluation || '暂无评价' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EquipmentSlot } from '../types';
import { useBubble } from '../composables/useBubble';

defineProps<{
  slots: EquipmentSlot[];
}>();

const { activeBubble, toggleBubble } = useBubble<string>();
</script>

<style lang="scss" scoped>
.equipment-section {
  flex: 1;
  padding: 10px;
  background: var(--bg-card);
  border-bottom: 2px solid var(--border-color);
  overflow: visible;
}

.section-title {
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 6px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  grid-auto-rows: 60px;
  overflow: visible;
}

.equipment-slot {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 6px 8px;
  font-size: 9px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: visible;
}

.equipment-slot.active {
  background: #e3f2fd;
  border-color: #1976d2;
}

.slot-name {
  color: #000;
  font-weight: bold;
  margin-bottom: 2px;
  font-size: 8px;
}

.slot-item {
  color: #000;
  font-size: 9px;
  word-break: break-word;
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
  max-width: 180px;
  min-width: 120px;
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
  .equipment-section {
    padding: 10px;
    border-bottom: none;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
