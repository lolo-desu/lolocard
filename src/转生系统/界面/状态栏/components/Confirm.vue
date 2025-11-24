<template>
  <ActionModal :title="title" @close="emit('cancel')">
    <div class="confirm-modal">
      <p v-if="question" class="confirm-modal__question">{{ question }}</p>

      <div v-if="$slots.hint" class="confirm-modal__hint">
        <slot name="hint" />
      </div>

      <div v-if="$slots.default" class="confirm-modal__body">
        <slot />
      </div>

      <div class="confirm-modal__actions">
        <slot name="actions">
          <button type="button" class="confirm-button ghost" @click="emit('cancel')">取消</button>
          <button type="submit" class="confirm-button primary" @click="emit('confirm')">确认</button>
        </slot>
      </div>
    </div>
  </ActionModal>
</template>

<script setup lang="ts">
import ActionModal from './ActionModal.vue';

defineProps<{ title: string; question: string }>();

const emit = defineEmits<{
  cancel: [void];
  confirm: [void];
}>();
</script>

<style scoped lang="scss">
.confirm-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 10px;
  line-height: 1.4;
  color: #000;
}

.confirm-modal__question {
  font-weight: bold;
  margin: 0;
}

.confirm-modal__hint {
  background: #fffbcc;
  border: 2px solid #ffb74d;
  padding: 6px;
}

.confirm-modal__body {
  color: #333;
}

.confirm-modal__actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

:deep(.confirm-button) {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 2px solid #000;
  background: #fff;
  color: #000;
  cursor: pointer;
  font-size: 10px;
  font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
  transition: background 0.1s;
}

:deep(.confirm-button.primary) {
  background: #000;
  color: #fff;
}

:deep(.confirm-button.ghost) {
  background: #fff;
  color: #000;
}

:deep(.confirm-button:hover) {
  background: rgba(0, 0, 0, 0.08);
}
</style>
