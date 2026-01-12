<template>
  <template v-for="character in rendered_characters" :key="character.id">
    <img
      class="absolute bottom-0 h-[95%] max-h-[95%] w-auto -translate-x-1/2 object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.2)] transition-[opacity,transform,filter,left,right] duration-500 ease-out"
      :class="[{ 'brightness-[0.85] contrast-[0.95]': !character.is_speaking }, `left-[${character.position}]`]"
      :src="character.url"
    />
  </template>
</template>

<script setup lang="ts">
import { getImageUrl } from '@/日记络络/image';
import { useGalgameStore } from '../store';

const store = useGalgameStore();

type RenderedCharacter = {
  id: string;
  url: string;
  position: string;
  is_speaking: boolean;
};

const rendered_characters = computed<RenderedCharacter[]>(() => {
  const characters = store.current_dialog.characters;
  // TODO: 处理立绘不存在的情况
  return characters
    .map((character, index) => ({
      id: character.id,
      url: getImageUrl(character.tachie) ?? '',
      is_speaking: store.current_dialog.speaker === character.id,
      position: `${Math.round(((index + 1) / (characters.length + 1)) * 100)}%`,
    }))
    .filter(character => character.url);
});
</script>
