<template>
  <div class="bottom-bar">
    <div class="bottom-left">
      <slot name="left"></slot>
    </div>
    <div class="bottom-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.bottom-bar {
  background: #333;
  color: var(--text-primary);
  padding: 4px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  position: relative;
  z-index: 2;
  border-top: 3px solid var(--border-color);
  flex-shrink: 0;
}

.bottom-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.bottom-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

@media (max-width: 768px) {
  .bottom-bar {
    flex-shrink: 0;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
  }

  .bottom-left {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 9px;
    width: 100%;
    justify-content: space-between;
  }

  .bottom-right {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
    width: 100%;
  }
}
</style>
