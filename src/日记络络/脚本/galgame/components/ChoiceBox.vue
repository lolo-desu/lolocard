<template>
  <Transition name="choice-fade" appear>
    <div
      v-if="store.options.length > 0"
      class="absolute inset-x-0 top-0 bottom-[80px] z-40 flex items-center justify-center px-[6%] max-md:bottom-[120px]"
      @click.stop
    >
      <div class="w-full max-w-[680px] space-y-3 max-md:space-y-2 md:space-y-4">
        <button
          v-for="(option, index) in store.options"
          :key="`${index}-${option}`"
          type="button"
          class="group relative w-full cursor-pointer overflow-hidden rounded-[14px] border border-white/85 bg-white/55 px-[16px] py-[10px] text-center backdrop-blur-md transition-[background-color,border-color,transform] duration-150 hover:border-white/95 hover:bg-white/70 active:scale-[0.99] active:border-white/95 active:bg-white/75 max-md:px-[16px] max-md:py-[6px]"
          @click.stop="() => onSelect(option)"
        >
          <div
            class="c absolute inset-0 bg-[linear-gradient(135deg,rgba(255,208,216,0.55)_0%,rgba(255,187,200,0.25)_40%,rgba(255,255,255,0.0)_100%)] opacity-70 transition-opacity duration-150 group-hover:opacity-90 group-active:opacity-100"
          />
          <div class="relative flex items-center justify-center">
            <div
              class="text-[18px] leading-tight font-bold tracking-[0.06em] text-[#4d2b35] [text-shadow:0_1px_1px_rgba(255,255,255,0.92),0_6px_18px_rgba(0,0,0,0.06)]"
            >
              {{ option }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { injectStreamingMessageContext } from '@util/streaming';
import { useGalgameStore } from '../store';

const context = injectStreamingMessageContext();
const input_method = inject<() => '直接发送' | '覆盖输入'>('input_method')!;
const store = useGalgameStore();

function onSelect(option: string) {
  if (context.message_id !== getLastMessageId()) {
    return;
  }
  switch (input_method()) {
    case '直接发送':
      triggerSlash(`/send ${option} || /trigger`);
      break;
    case '覆盖输入':
      triggerSlash(`/setinput ${option}`);
      break;
  }
}
</script>

<style scoped>
.choice-fade-enter-active,
.choice-fade-leave-active {
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.choice-fade-enter-from,
.choice-fade-leave-to {
  transform: translateY(10px) scale(0.985);
}

.choice-fade-enter-to,
.choice-fade-leave-from {
  transform: translateY(0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .choice-fade-enter-active,
  .choice-fade-leave-active {
    transition: none;
  }
}
</style>
