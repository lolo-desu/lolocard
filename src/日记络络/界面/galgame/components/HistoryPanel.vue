<template>
  <div
    class="fixed top-[5%] left-[5%] z-1000 flex h-[90%] w-[90%] flex-col overflow-hidden rounded-[15px] border border-white/80 bg-linear-to-br from-rose-50/95 to-rose-100/95 shadow-[0_8px_30px_rgba(145,125,138,0.25),0_0_0_1px_rgba(255,255,255,0.6)_inset] backdrop-blur-lg"
    @click.stop
  >
    <div
      class="flex items-center justify-between border-b border-white/50 bg-linear-to-r from-[#ffd0d8]/80 to-[#ffbbc8]/80 px-5 py-3 font-bold text-[#7d5b65] [text-shadow:0_1px_1px_rgba(255,255,255,0.6)]"
    >
      <h3 class="m-0 text-base">𝕃𝕆𝔾</h3>
      <button
        type="button"
        class="text-2xl text-[#c18e98] transition-transform hover:scale-110 hover:text-[#a16e78]"
        @click.stop="store.history_opened = false"
      >
        ⊗
      </button>
    </div>

    <div ref="content" class="flex-1 overflow-y-auto p-5 text-[#4d2b35]">
      <div v-if="store.history_dialogs.length === 0" class="py-5 text-center text-[#7d5b65]">暂无对话历史</div>

      <div
        v-for="(dialog, index) in store.history_dialogs"
        :key="index"
        class="mb-4 rounded-xl bg-white/60 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.7)_inset] transition-transform duration-200 hover:-translate-y-0.5"
      >
        <div v-if="dialog.speaker" class="mb-2 inline-flex items-center gap-1 font-bold text-[#c18e98]">
          <span class="text-sm text-[#ffb0c0]">❀</span>
          <span class="text-[18px]">{{ dialog.speaker }}</span>
        </div>
        <div class="text-[16px] leading-6 tracking-[0.3px] wrap-anywhere text-[#4d2b35]">
          {{ dialog.speech }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGalgameStore } from '../store';

const store = useGalgameStore();

const content_ref = useTemplateRef('content');

onMounted(() => {
  if (!content_ref.value) {
    return;
  }
  $(content_ref.value).scrollTop($(content_ref.value).prop('scrollHeight'));
});
</script>
