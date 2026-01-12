<template>
  <div class="absolute top-4 right-4 z-40 flex items-center gap-2" @click.stop>
    <DefineButton v-slot="{ text }">
      <button
        type="button"
        class="text-16px rounded-lg border border-white/70 bg-white/85 px-3 py-1.5 font-bold tracking-[0.15em] text-[#7d5b65] shadow-[0_6px_16px_rgba(0,0,0,0.10)] transition-[transform,opacity,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/95 active:translate-y-0"
      >
        {{ text }}
      </button>
    </DefineButton>
    <Button
      :text="
        store.has_ended
          ? '重播'
          : `${store.current_index + 1}/${store.dialogs.length}${store.during_streaming ? '?' : ''}`
      "
      @click.stop="store.restart()"
    />
    <Button text="日志" @click.stop="store.history_opened = true" />
    <Button
      :text="store.dialog_opened ? '隐藏UI' : '显示UI'"
      @click.stop="store.dialog_opened = !store.dialog_opened"
    />
  </div>
</template>

<script setup lang="ts">
import { useGalgameStore } from '../store';

const [DefineButton, Button] = createReusableTemplate<{
  text: string;
}>();

const store = useGalgameStore();
</script>
