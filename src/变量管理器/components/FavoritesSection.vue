<template>
  <div v-if="store.favorites.length > 0" class="favorites-section">
    <div class="section-header" @click="expanded = !expanded">
      <div class="section-title">
        <i
          class="fa-solid toggle-icon"
          :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"
        ></i>
        <i class="fa-solid fa-star"></i>
        <span>收藏夹</span>
        <span class="count-badge">{{ store.favorites.length }}</span>
      </div>
      <button
        v-if="store.favorites.length > 0"
        class="clear-btn"
        type="button"
        title="清空收藏"
        @click.stop="clearAllFavorites"
      >
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>

    <Transition name="expand">
      <div v-if="expanded" class="favorites-list">
      <div
        v-for="favorite in store.favorites"
        :key="favorite.path"
        class="favorite-item"
        :class="{
          'favorite-item--changed': store.isPathChanged(favorite.path),
          'favorite-item--editing': editingPath === favorite.path
        }"
      >
        <!-- 显示模式 -->
        <template v-if="editingPath !== favorite.path">
          <div class="favorite-info">
            <span class="favorite-path">{{ favorite.label }}</span>
            <span class="favorite-value">{{ getValueDisplay(favorite.path) }}</span>
          </div>
          <div class="favorite-actions">
            <button
              class="action-icon-btn edit-btn"
              type="button"
              title="编辑"
              @click="startEdit(favorite.path)"
            >
              <i class="fa-solid fa-pen"></i>
            </button>
            <button
              class="action-icon-btn remove-btn"
              type="button"
              title="取消收藏"
              @click="store.removeFavorite(favorite.path)"
            >
              <i class="fa-solid fa-star"></i>
            </button>
          </div>
        </template>

        <!-- 编辑模式 -->
        <template v-else>
          <div class="favorite-edit">
            <span class="edit-path">{{ favorite.label }}</span>
            <ValueControls
              :path="favorite.path"
              :value="getFavoriteValue(favorite.path)"
              :is-mobile="false"
              @close="stopEdit"
            />
          </div>
        </template>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useVariableManagerStore } from '../store';
import ValueControls from './ValueControls.vue';

const store = useVariableManagerStore();
const editingPath = ref<string | null>(null);
const expanded = ref(true); // 默认展开

function getValueDisplay(path: string): string {
  const value = _.get(store.statData, path);

  if (_.isString(value)) {
    return value || '""';
  }
  if (_.isNumber(value) || _.isBoolean(value)) {
    return String(value);
  }
  if (value === null || value === undefined) {
    return 'null';
  }
  return String(value);
}

function startEdit(path: string) {
  editingPath.value = path;
}

function getFavoriteValue(path: string) {
  return _.get(store.statData, path);
}

function stopEdit() {
  editingPath.value = null;
}

function clearAllFavorites() {
  const confirmed = confirm(`确定要清空所有 ${store.favorites.length} 个收藏吗？`);
  if (confirmed) {
    // 清空所有收藏
    const favoritesToRemove = [...store.favorites];
    favoritesToRemove.forEach(fav => {
      store.removeFavorite(fav.path);
    });
    toastr?.success?.('已清空收藏夹', '变量管理器');
  }
}
</script>

<style scoped lang="scss">
$border-color: var(--SmartThemeBorderColor);
$text-color: var(--SmartThemeBodyColor);
$em-color: var(--SmartThemeEmColor);
$text-muted: var(--SmartThemeQuoteColor);
$bg-hover: var(--SmartThemeBlurTintColor);
$border-radius: 5px;
$star-color: #ffc107;

.favorites-section {
  margin-bottom: 16px;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: rgba(255, 193, 7, 0.03);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 193, 7, 0.08);
  border-bottom: 1px solid rgba(255, 193, 7, 0.2);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 193, 7, 0.12);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $text-color;

  .toggle-icon {
    font-size: 10px;
    color: $text-color;
    transition: transform 0.2s ease;
  }

  .fa-star {
    color: $star-color;
    font-size: 13px;
  }
}

.count-badge {
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(255, 193, 7, 0.2);
  color: $star-color;
  font-size: 10px;
  font-weight: 600;
}

.clear-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 100, 100, 0.15);
    color: rgba(255, 150, 150, 0.9);
  }

  i {
    font-size: 11px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}

.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: $border-radius;
  border: 1.5px solid $border-color;
  background: transparent;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 193, 7, 0.5);
    background: $bg-hover;

    .favorite-actions {
      opacity: 1;
    }
  }

  &--editing {
    border-color: $em-color;
    background: $bg-hover;
    padding: 8px 12px;
  }

  &--changed {
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 150%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(80, 220, 120, 0.08) 15%,
        rgba(70, 210, 110, 0.18) 25%,
        rgba(60, 200, 100, 0.28) 35%,
        rgba(50, 190, 90, 0.35) 45%,
        rgba(60, 200, 100, 0.28) 55%,
        rgba(70, 210, 110, 0.18) 65%,
        rgba(80, 220, 120, 0.08) 75%,
        transparent 85%
      );
      filter: blur(12px);
      animation: favorite_update_completion 1.4s cubic-bezier(0.3, 0.0, 0.3, 1) forwards;
      pointer-events: none;
      z-index: 5;
    }
  }
}

@keyframes favorite_update_completion {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
  }
  30% {
    opacity: 0.8;
  }
  70% {
    opacity: 0.8;
  }
  95% {
    opacity: 0.4;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.favorite-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.favorite-path {
  font-size: 12px;
  font-weight: 600;
  color: $text-color;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-value {
  font-size: 12px;
  color: $text-muted;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 4px 8px;
  background: var(--SmartThemeBlurTintColor);
  border-radius: 3px;
  border: 1px solid $border-color;
  max-width: 100%;
  word-break: break-all;
}

.favorite-actions {
  display: flex;
  gap: 6px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.action-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid $border-color;
  background: transparent;
  color: $text-color;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-hover;
  }

  i {
    font-size: 11px;
  }
}

.edit-btn {
  &:hover {
    border-color: rgba(100, 180, 255, 0.6);
    color: rgba(100, 200, 255, 0.9);
  }
}

.remove-btn {
  i {
    color: $star-color;
  }

  &:hover {
    border-color: rgba(255, 193, 7, 0.6);
    background: rgba(255, 193, 7, 0.1);
  }
}

.favorite-edit {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.edit-path {
  font-size: 11px;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  color: $em-color;
  font-weight: 600;
  flex-shrink: 0;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-edit :deep(.value-controls) {
  flex: 1;
  min-width: 0;
}
</style>