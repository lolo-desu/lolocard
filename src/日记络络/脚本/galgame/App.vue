<template>
  <div class="mx-auto aspect-video w-full max-w-[1200px] select-none max-md:aspect-3/4" @click="handleAdvance">
    <div class="relative flex h-full w-full flex-col overflow-hidden rounded-xl">
      <div class="relative flex flex-1 flex-col overflow-hidden rounded-lg bg-white">
        <div
          class="relative flex h-[5.5%] items-center justify-center rounded-t-lg bg-linear-to-r from-[#ffd0d8] to-[#ffbbc8] text-[12px] font-bold text-[#7d6b6e] [text-shadow:0px_1px_1px_rgba(255,255,255,0.5)] max-md:h-5"
        >
          <span class="absolute left-4 text-[18px] text-[#c18e98]">❀</span>
          『⁺⊹𝒞𝒢𝒯𝒾𝓂ℯʚෆɞ₊』
          <span class="absolute right-4 text-[14px] text-[#c18e98]">✧*:･ﾟ✧</span>
        </div>

        <div class="relative flex-1 overflow-hidden bg-black">
          <SceneStage />

          <div
            class="pointer-events-none absolute top-4 right-4 z-20 hidden h-12 w-12 items-center justify-center text-2xl text-[#ffb0c0] opacity-80 md:flex"
          >
            ♡
          </div>
          <div
            class="pointer-events-none absolute bottom-20 left-4 z-20 hidden h-12 w-12 items-center justify-center text-2xl text-[#ffb0c0] opacity-80 md:flex"
          >
            ✿
          </div>

          <ChoiceBox v-if="store.has_ended" />

          <DialogBox v-show="store.dialog_opened" ref="dialog_box" />

          <template v-if="store.history_opened">
            <div class="fixed inset-0 z-900 bg-black/35 transition-opacity duration-200" @click.stop />
            <HistoryPanel />
          </template>

          <ControlBar />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { injectStreamingMessageContext } from '@util/streaming';
import ChoiceBox from './components/ChoiceBox.vue';
import ControlBar from './components/ControlBar.vue';
import DialogBox from './components/DialogBox.vue';
import HistoryPanel from './components/HistoryPanel.vue';
import SceneStage from './components/SceneStage.vue';
import { useGalgameStore } from './store';

const context = injectStreamingMessageContext();

const dialog_box_ref = useTemplateRef('dialog_box');

const store = useGalgameStore();

watchImmediate(
  () => context.during_streaming,
  new_during_streaming => {
    store.during_streaming = new_during_streaming;
  },
);
watchImmediate(
  () => context.message,
  new_message => {
    store.loadMessage(new_message);
  },
);

function handleAdvance() {
  if (store.history_opened || store.has_ended) {
    return;
  }

  if (dialog_box_ref.value?.is_typing) {
    dialog_box_ref.value.stopTyping();
    return;
  }

  store.advance();
}
</script>
