<template>
  <div class="top-info-bar">
    <div class="info-left">
      <span class="status-indicator online" aria-hidden="true"></span>
      <span>{{ currentTimeLabel }}</span>
    </div>
    <div class="info-right">
      <div class="status-badge">{{ location }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentTimeLabel: string;
  location: string;
}>();
</script>

<style lang="scss" scoped>
.top-info-bar {
  background: #333;
  color: var(--text-primary);
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  position: relative;
  z-index: 2;
  border-bottom: 3px solid var(--border-color);
}

.info-left {
  display: flex;
  gap: 20px;
  align-items: center;
}

.info-right {
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.status-badge {
  background: var(--bg-input);
  color: #000;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  font-size: 10px;
  min-width: 240px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: var(--bg-success);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}

.status-indicator.offline {
  background: var(--bg-error);
}

.status-indicator.warning {
  background: var(--bg-warning);
}

@media (max-width: 768px) {
  .top-info-bar {
    padding: 6px 12px;
    font-size: 10px;
  }

  .info-right {
    flex: none;
  }

  .status-badge {
    min-width: auto;
    max-width: 180px;
    font-size: 9px;
  }
}
</style>
