<template>
  <div class="absolute inset-0">
    <Transition :name="store.current_index > 0 ? 'bg-fade' : 'bg-instant'">
      <img
        v-if="background_url"
        :key="background_id"
        :src="background_url"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </Transition>

    <div class="pointer-events-none absolute inset-0">
      <CharacterLayer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl } from '../../../image';
import { useGalgameStore } from '../store';
import CharacterLayer from './CharacterLayer.vue';

const store = useGalgameStore();

const background_id = computed(() => store.current_dialog.background);
const background_url = computed(() => getImageUrl(background_id.value) ?? '');
</script>

<style scoped>
.bg-instant-enter-active,
.bg-instant-leave-active {
  transition: none;
}

.bg-instant-enter-from,
.bg-instant-enter-to,
.bg-instant-leave-from,
.bg-instant-leave-to {
  opacity: 1;
}

.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 1.2s ease-in-out;
}

.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

.bg-fade-enter-to,
.bg-fade-leave-from {
  opacity: 1;
}
</style>
