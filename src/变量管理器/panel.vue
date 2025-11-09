<template>
  <div class="inline-drawer th-variable-manager">
    <div class="inline-drawer-toggle inline-drawer-header">
      <div class="title">
        <b>MVU 变量管理器</b>
      </div>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down interactable"></div>
    </div>

    <div class="inline-drawer-content">
      <Toolbar
        class="th-toolbar"
        :search="store.searchKeyword"
        :can-undo="store.canUndo"
        :can-redo="store.canRedo"
        @search="store.setSearchKeyword"
        @expand-all="store.expandAll"
        @collapse-all="store.collapseAll"
        @undo="store.undo"
        @redo="store.redo"
        @refresh="() => store.refreshFromSource({ force: true })"
        @toggle-history="showHistory = !showHistory"
      />

      <!-- 收藏区域 -->
      <FavoritesSection />

      <!-- 修改记录 -->
      <Transition name="expand">
        <ChangeHistory v-if="showHistory" />
      </Transition>

      <div v-if="store.initialized" class="th-tree">
        <TreeNode
          v-for="[key, value] in rootEntries"
          :key="key"
          :label="key"
          :path="key"
          :value="value"
          :depth="0"
          :search-keyword="store.searchKeyword"
        />
        <div v-if="rootEntries.length === 0" class="th-empty">
          <i class="fa-solid fa-box-open"></i>
          <p>当前楼层的 stat_data 为空或尚未定义。</p>
        </div>
      </div>
      <div v-else class="th-tree th-tree--placeholder">
        <div class="placeholder-line"></div>
        <div class="placeholder-line short"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Toolbar from './components/Toolbar.vue';
import TreeNode from './components/TreeNode.vue';
import FavoritesSection from './components/FavoritesSection.vue';
import ChangeHistory from './components/ChangeHistory.vue';
import { useVariableManagerStore } from './store';

const store = useVariableManagerStore();
const { statData } = storeToRefs(store);
const rootEntries = computed(() => Object.entries(statData.value ?? {}));

const showHistory = ref(false);
</script>

<style lang="scss" scoped>
$border-color: var(--SmartThemeBorderColor);
$bg-tint: var(--SmartThemeBlurTintColor);
$text-color: var(--SmartThemeBodyColor);
$em-color: var(--SmartThemeEmColor);
$text-muted: var(--SmartThemeQuoteColor);
$bg-hover: var(--SmartThemeBlurTintColor);

.th-variable-manager {
  .th-tree {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
    padding: 4px;
  }

  .th-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: $text-muted;
    text-align: center;

    i {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .th-tree--placeholder {
    padding: 20px;

    .placeholder-line {
      height: 48px;
      background: $bg-hover;
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 8px;
      margin-bottom: 12px;
      border: 1px solid $border-color;

      &.short {
        width: 70%;
        margin-left: 20px;
      }
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  // 展开折叠过渡动画
  :deep(.expand-enter-active),
  :deep(.expand-leave-active) {
    transition: all 0.3s ease;
    overflow: hidden;
  }

  :deep(.expand-enter-from),
  :deep(.expand-leave-to) {
    opacity: 0;
    max-height: 0;
    margin-bottom: 0;
  }

  :deep(.expand-enter-to),
  :deep(.expand-leave-from) {
    opacity: 1;
    max-height: 500px;
    margin-bottom: 16px;
  }
}
</style>

