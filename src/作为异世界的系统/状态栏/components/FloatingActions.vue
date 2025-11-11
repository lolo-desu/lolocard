<template>
  <div class="isekai-fab">
    <button
      v-for="action in actions"
      :key="action.id"
      type="button"
      class="isekai-fab__button"
      :disabled="disabled"
      @click="emit('action', action.id)"
    >
      <span class="isekai-fab__icon">{{ action.icon }}</span>
      <span class="isekai-fab__label">
        <strong>{{ action.label }}</strong>
        <small>{{ action.hint }}</small>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
export type FloatingAction = 'task' | 'reward' | 'shop' | 'prompt';

interface Props {
  disabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'action', payload: FloatingAction): void;
}>();

const actions: Array<{ id: FloatingAction; label: string; hint: string; icon: string }> = [
  { id: 'task', label: '发布任务', hint: '主线/支线/日常/临危受命', icon: '📝' },
  { id: 'reward', label: '发布奖励', hint: '道具或积分', icon: '🎁' },
  { id: 'shop', label: '创建商城', hint: '上架商品', icon: '🏪' },
  { id: 'prompt', label: '直接沟通', hint: '更新提示', icon: '💬' },
];
</script>

<style scoped lang="scss">
.isekai-fab {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9998;

  &__button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(7, 7, 12, 0.8);
    backdrop-filter: blur(6px);
    color: #f8fafc;
    font-family: 'Fusion Pixel 12px M latin', 'IBM Plex Mono', 'Courier New', monospace;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: #7be0ff;
      background: rgba(10, 10, 18, 0.9);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__icon {
    font-size: 20px;
  }

  &__label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    strong {
      font-size: 15px;
      letter-spacing: 0.02em;
    }

    small {
      font-size: 11px;
      letter-spacing: 0.08em;
      color: #a5b4fc;
      text-transform: uppercase;
    }
  }
}
</style>
