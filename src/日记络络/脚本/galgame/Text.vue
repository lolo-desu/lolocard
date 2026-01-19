<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="transformed_message" v-html="html"></div>
</template>

<script setup lang="ts">
import { injectStreamingMessageContext } from '@util/streaming';

const props = defineProps<{ transformer: (message: string) => string }>();

const context = injectStreamingMessageContext();
const transformed_message = computed(() => props.transformer(context.message));
const html = computed(() =>
  formatAsDisplayedMessage(transformed_message.value, { message_id: context.message_id }).replaceAll(
    'mes_text',
    'mes_streaming',
  ),
);
</script>
