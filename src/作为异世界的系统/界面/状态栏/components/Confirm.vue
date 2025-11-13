<template>
  <ActionModal :title="title" @close="emit('cancel')">
    <div>
      {{ question }}
      <div>
        <button type="button" class="ghost" @click="emit('cancel')">取消</button>
        <button type="submit" class="primary" @click="emit('confirm')">确认</button>
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
