<template>
  <div class="absolute inset-x-0 bottom-0 z-30 w-full">
    <div ref="box" class="relative w-full" :style="{ '--dialog-fade-end': `${fade_end_px}px` }">
      <div
        class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,240,245,0)_0px,rgba(255,240,245,0.93)_var(--dialog-fade-end,38px),rgba(255,240,245,0.93)_100%)]"
      />
      <div class="relative px-[6%] pt-[44px] pb-[4%]">
        <div class="flex items-end justify-between">
          <div
            class="min-h-[33px] text-[22px] font-extrabold tracking-[0.08em] text-[#4d2b35] [text-shadow:0_1px_1px_rgba(255,255,255,0.92),0_3px_10px_rgba(0,0,0,0.08)]"
          >
            {{ store.current_dialog.speaker }}
          </div>
        </div>
        <div class="mt-2 mb-3 h-px w-full bg-[#c18e98]/70" />

        <div
          ref="content"
          class="relative min-h-[3.5em] text-[16px] leading-[1.65] tracking-[0.25px] text-[#4d2b35] [text-shadow:0_1px_1px_rgba(255,255,255,0.92)]"
        >
          {{ store.current_dialog.speech }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGalgameStore } from '../store';

const store = useGalgameStore();

const box_ref = useTemplateRef('box');
const content_ref = useTemplateRef('content');
const fade_end_px = ref(38);
function updateFadeEnd() {
  if (!box_ref.value || !content_ref.value) {
    return;
  }
  const boxRect = box_ref.value.getBoundingClientRect();
  const contentRect = content_ref.value.getBoundingClientRect();
  fade_end_px.value = Math.max(0, Math.round(contentRect.top - boxRect.top));
}
watch(() => store.current_index, updateFadeEnd);
const fade_observer = new ResizeObserver(updateFadeEnd);
onMounted(() => {
  updateFadeEnd();

  if (box_ref.value) {
    fade_observer.observe(box_ref.value);
  }
  if (content_ref.value) {
    fade_observer.observe(content_ref.value);
  }
});
onBeforeUnmount(() => {
  fade_observer.disconnect();
});

const is_typing = ref(false);
gsap.registerPlugin(SplitText);
let split: SplitText;
let animation: gsap.core.Tween;
async function startTyping() {
  stopTyping();

  await nextTick();

  is_typing.value = true;
  split = SplitText.create(content_ref.value, { type: 'chars' });
  animation = gsap.from(split.chars, {
    opacity: 0,
    duration: 0.1,
    ease: 'power4',
    stagger: 0.04,
    onComplete: () => {
      is_typing.value = false;
    },
  });
}
function stopTyping() {
  is_typing.value = false;
  split?.revert();
  split?.kill();
  animation?.revert();
  animation?.kill();
}
watch(() => store.current_index, startTyping);
onMounted(() => {
  startTyping();
});

defineExpose({
  is_typing,
  stopTyping,
});
</script>
