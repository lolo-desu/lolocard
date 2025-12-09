<template>
  <div class="th-toolbar-root">
    <div class="button-grid">
      <button class="th-toolbar-btn" type="button" @click="$emit('expand-all')">
        <i class="fa-solid fa-chevron-down"></i>
        <span>全部展开</span>
      </button>
      <button class="th-toolbar-btn" type="button" @click="$emit('collapse-all')">
        <i class="fa-solid fa-chevron-up"></i>
        <span>全部折叠</span>
      </button>
      <button class="th-toolbar-btn" type="button" :disabled="!canUndo" @click="$emit('undo')">
        <i class="fa-solid fa-arrow-rotate-left"></i>
        <span>撤销</span>
      </button>
      <button class="th-toolbar-btn" type="button" :disabled="!canRedo" @click="$emit('redo')">
        <i class="fa-solid fa-arrow-rotate-right"></i>
        <span>重做</span>
      </button>
      <button class="th-toolbar-btn" type="button" @click="$emit('refresh')">
        <i class="fa-solid fa-rotate"></i>
        <span>刷新</span>
      </button>
      <button class="th-toolbar-btn" type="button" @click="$emit('toggle-history')">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>修改记录</span>
      </button>
    </div>
    <label class="search-field">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        :value="search"
        class="search-input"
        type="text"
        placeholder="搜索变量..."
        @input="$emit('search', ($event.target as HTMLInputElement).value)"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import './Toolbar.scss';

defineProps<{
  search: string;
  canUndo: boolean;
  canRedo: boolean;
}>();

defineEmits<{
  search: [value: string];
  'expand-all': [];
  'collapse-all': [];
  undo: [];
  redo: [];
  refresh: [];
  'toggle-history': [];
}>();
</script>
