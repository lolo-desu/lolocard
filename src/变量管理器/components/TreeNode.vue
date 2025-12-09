<template>
  <div v-show="isVisible" class="tree-node" :class="{ 'tree-node--with-add': isBranch && isAddingItem }">
    <!-- 显示模式 -->
    <div
      v-if="!showControls"
      class="tree-node__row"
      :class="{
        'tree-node__row--object': isObject,
        'tree-node__row--adding': isBranch && isAddingItem,
        'tree-node__row--changed': isChanged
      }"
      :style="{ '--node-depth': depth }"
      @click="handleRowClick"
    >
      <div v-if="depth > 0" class="tree-node__depth-lines">
        <div
          v-for="i in depth"
          :key="i"
          class="depth-line"
          :style="{ '--line-index': i - 1 }"
        ></div>
      </div>
      <button
        v-if="isBranch"
        class="tree-node__toggle"
        type="button"
        @click.stop="store.toggleExpand(path)"
      >
        <i class="fa-solid" :class="isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      </button>
      <div v-if="!isBranch" class="tree-node__label-group">
        <span class="label-text">{{ label }}</span>
        <span class="type-text">{{ valueTypeName }}</span>
      </div>
      <span v-else class="tree-node__label">{{ label }}</span>
      <span v-if="isBranch" class="tree-node__badge">{{ badgeText }}</span>

      <!-- 分支（对象/数组）新增按钮 (hover显示) -->
      <button
        v-if="isBranch"
        class="tree-node__add-btn"
        type="button"
        @click.stop="startAdding"
      >
        <i class="fa-solid fa-plus"></i>
      </button>

      <!-- 叶子节点：值 + 收藏按钮 -->
      <div v-if="!isBranch" class="tree-node__value-group">
        <div class="tree-node__value" @click.stop="toggleEditor">
          {{ displayValue }}
        </div>
        <button
          class="tree-node__favorite-btn"
          type="button"
          :class="{ 'is-favorite': store.isFavorite(path) }"
          :title="store.isFavorite(path) ? '取消收藏' : '收藏'"
          @click.stop="toggleFavorite"
        >
          <i class="fa-solid fa-star"></i>
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div
      v-else
      class="tree-node__row tree-node__row--editing"
      :style="{ '--node-depth': depth }"
    >
      <div v-if="depth > 0" class="tree-node__depth-lines">
        <div
          v-for="i in depth"
          :key="i"
          class="depth-line"
          :style="{ '--line-index': i - 1 }"
        ></div>
      </div>
      <div class="tree-node__label-group">
        <span class="label-text">{{ label }}</span>
        <span class="type-text">{{ valueTypeName }}</span>
      </div>
      <ValueControls
        :path="path"
        :value="value"
        :is-mobile="isMobile"
        @close="closeEditor"
      />
    </div>

    <!-- 新增输入框（对象/数组通用）- 放在节点底部作为边框延伸 -->
    <Transition name="expand-add">
      <div v-if="isBranch && isAddingItem" class="add-toolbar" :style="{ '--node-depth': depth }">
        <div class="add-input-row">
          <!-- 对象需要输入属性名 -->
          <input
            v-if="isObject"
            v-model="pendingKey"
            class="editor-input name-input"
            type="text"
            placeholder="属性名"
            @keydown.stop
            @click.stop
          />
          <!-- 类型选择 -->
          <select
            v-model="pendingType"
            class="editor-select type-select"
            @click.stop
          >
            <option value="string">值</option>
            <option value="array">数组</option>
            <option value="object">对象</option>
          </select>
          <!-- 值输入框（仅类型为值时显示） -->
          <input
            v-if="pendingType === 'string'"
            v-model="pendingValue"
            class="editor-input value-input"
            type="text"
            placeholder="输入值"
            @keydown.stop
            @click.stop
          />
          <button class="action-btn confirm-button" type="button" @click.stop="applyAdd">
            <i class="fa-solid fa-check"></i>
          </button>
          <button class="action-btn cancel-button" type="button" @click.stop="cancelAdd">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="expand">
      <div v-if="isBranch && isExpanded" class="tree-node__children">
        <TreeNode
          v-for="child in children"
          :key="child.key"
          :label="child.label"
          :path="child.path"
          :value="child.value"
          :depth="depth + 1"
          :search-keyword="searchKeyword"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useVariableManagerStore } from '../store';
import ValueControls from './ValueControls.vue';

const props = defineProps<{
  label: string;
  value: any;
  path: string;
  depth: number;
  searchKeyword: string;
}>();

const store = useVariableManagerStore();
const showControls = ref(false);
const isAddingItem = ref(false);
const pendingKey = ref('');
const pendingType = ref<'string' | 'array' | 'object'>('string');
const pendingValue = ref('');

// 检测是否为移动端
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const isBranch = computed(() => _.isPlainObject(props.value) || Array.isArray(props.value));

const isArray = computed(() => Array.isArray(props.value));
const isObject = computed(() => _.isPlainObject(props.value) && !Array.isArray(props.value));
const isExpanded = computed(() => store.isExpanded(props.path));
const isVisible = computed(() => store.matchesKeyword(props.value, props.label, props.searchKeyword));
const isChanged = computed(() => store.isPathChanged(props.path));
const displayValue = computed(() => {
  if (_.isString(props.value)) {
    return props.value || '""';
  }
  if (_.isNumber(props.value) || _.isBoolean(props.value)) {
    return String(props.value);
  }
  if (props.value === null || props.value === undefined) {
    return 'null';
  }
  return String(props.value);
});
const badgeText = computed(() => {
  if (isArray.value) {
    return `数组 · ${(props.value as unknown[] | undefined)?.length ?? 0}`;
  }
  if (_.isPlainObject(props.value)) {
    return '对象';
  }
  return '';
});

const valueTypeName = computed(() => {
  if (_.isNumber(props.value)) {
    return '数值';
  }
  if (_.isBoolean(props.value)) {
    return '布尔';
  }
  if (_.isString(props.value)) {
    return '字符';
  }
  if (props.value === null || props.value === undefined) {
    return '空值';
  }
  return '其他';
});


function formatArrayIndex(index: number) {
  return `[${index}]`;
}

const children = computed(() => {
  if (Array.isArray(props.value)) {
    return props.value.map((child, index) => ({
      key: `${props.path}.${index}`,
      label: formatArrayIndex(index),
      path: `${props.path}.${index}`,
      value: child,
    }));
  }
  if (_.isPlainObject(props.value)) {
    return Object.entries(props.value).map(([childKey, childValue]) => ({
      key: `${props.path}.${childKey}`,
      label: childKey,
      path: `${props.path}.${childKey}`,
      value: childValue,
    }));
  }
  return [];
});

function handleRowClick() {
  if (isBranch.value) {
    store.toggleExpand(props.path);
  }
}

function toggleEditor() {
  showControls.value = !showControls.value;
}

function closeEditor() {
  showControls.value = false;
}

function startAdding() {
  isAddingItem.value = true;
}

function cancelAdd() {
  pendingKey.value = '';
  pendingType.value = 'string';
  pendingValue.value = '';
  isAddingItem.value = false;
}

function parseInput(input: string) {
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }
  const numberValue = Number(input);
  if (!Number.isNaN(numberValue)) {
    return numberValue;
  }
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

async function applyAdd() {
  if (isObject.value) {
    // 对象：需要属性名
    const key = pendingKey.value.trim();
    if (!key) {
      toastr?.warning?.('属性名不能为空', '变量管理器');
      return;
    }

    const currentObject = _.get(store.statData ?? {}, props.path, {});
    if (!_.isPlainObject(currentObject)) {
      toastr?.error?.('目标不是对象类型', '变量管理器');
      cancelAdd();
      return;
    }

    if (key in currentObject) {
      const confirmed = confirm(`属性 "${key}" 已存在，是否覆盖？`);
      if (!confirmed) {
        return;
      }
    }

    const nextObject = _.cloneDeep(currentObject);

    switch (pendingType.value) {
      case 'string':
        nextObject[key] = parseInput(pendingValue.value);
        break;
      case 'array':
        nextObject[key] = [];
        break;
      case 'object':
        nextObject[key] = {};
        break;
    }

    await store.setValue(props.path, nextObject);
  } else if (isArray.value) {
    // 数组：直接添加值
    const currentArray = _.get(store.statData ?? {}, props.path, []);
    const nextArray = Array.isArray(currentArray) ? currentArray.slice() : [];

    switch (pendingType.value) {
      case 'string': {
        const value = pendingValue.value.trim();
        if (!value) {
          toastr?.warning?.('值不能为空', '变量管理器');
          return;
        }
        nextArray.push(parseInput(value));
        break;
      }
      case 'array':
        nextArray.push([]);
        break;
      case 'object':
        nextArray.push({});
        break;
    }

    await store.setValue(props.path, nextArray);
  }

  cancelAdd();
}

function toggleFavorite() {
  if (store.isFavorite(props.path)) {
    store.removeFavorite(props.path);
    toastr?.success?.('已取消收藏', '变量管理器');
  } else {
    // 使用完整路径作为显示名称
    const displayLabel = props.path;
    store.addFavorite(props.path, displayLabel);
    toastr?.success?.('已添加到收藏', '变量管理器');
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

// 移动端断点
$mobile-breakpoint: 768px;

.tree-node__row {
  --node-depth: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-left: calc(var(--node-depth) * 20px);
  margin-bottom: 4px;
  border-radius: $border-radius;
  border: 1.5px solid $border-color;
  background: transparent;
  color: $text-color;
  cursor: default;
  transition: all 0.2s ease;
  overflow: visible;

  &:hover {
    border-color: $em-color;
    background: $bg-hover;
  }

  &--adding {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-bottom: 0;
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
      animation: variable_update_completion 1.4s cubic-bezier(0.3, 0.0, 0.3, 1) forwards;
      pointer-events: none;
      z-index: 5;
    }
  }

  &--editing {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    border-color: $em-color;
    background: $bg-hover;
    padding: 4px 8px;

    .tree-node__label {
      flex-shrink: 0;
      min-width: auto;
      max-width: 20px;
    }

    :deep(.value-controls) {
      flex: 1;
      min-width: 0;
      width: 100%;
    }
  }

  // 移动端优化
  @media (max-width: $mobile-breakpoint) {
    margin-left: calc(var(--node-depth) * 12px);
    padding: 10px 12px;
    gap: 10px;
    min-height: 44px;
    position: relative;
    opacity: calc(1 - var(--node-depth) * 0.12);
    border-width: calc(1.5px - var(--node-depth) * 0.2px);

    &--editing {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      .tree-node__label-group {
        flex-shrink: 0;
        min-width: fit-content;
        max-width: 100px;
      }

      :deep(.value-controls) {
        flex: 1;
        min-width: 0;
      }
    }
  }
}

.tree-node__depth-lines {
  display: none;
}

.depth-line {
  display: none;
}

.tree-node__toggle {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: $text-color;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: $bg-hover;
    color: $em-color;
  }

  i {
    font-size: 12px;
  }

  @media (max-width: $mobile-breakpoint) {
    width: 36px;
    height: 36px;

    i {
      font-size: 14px;
    }
  }
}


.tree-node__label-group {
  display: inline-flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  flex-grow: 0;
  background: $bg-hover;
  border: 1px solid $border-color;
  border-radius: 4px;
  overflow: hidden;
  user-select: none;
  min-width: fit-content;
  max-width: fit-content;

  .label-text {
    font-weight: 600;
    font-size: 11px;
    padding: 3px 6px;
    color: $text-color;
    background: $bg-hover;
    font-family: var(--mainFontFamily, system-ui, -apple-system, sans-serif);
    white-space: nowrap;
  }

  .type-text {
    font-size: 9px;
    padding: 3px 5px;
    color: $text-muted;
    font-weight: 500;
    white-space: nowrap;
    border-left: 1px solid $border-color;
  }

  @media (max-width: $mobile-breakpoint) {
    .label-text {
      font-size: 12px;
      padding: 4px 7px;
    }

    .type-text {
      font-size: 10px;
      padding: 4px 6px;
    }
  }
}

.tree-node__label {
  font-weight: 500;
  font-size: 13px;
  user-select: none;
  flex: 1;
  min-width: 0;
  font-family: var(--mainFontFamily, system-ui, -apple-system, sans-serif);

  @media (max-width: $mobile-breakpoint) {
    font-size: 15px;
  }
}

.tree-node__value-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 1;
}

.tree-node__value {
  margin-left: auto;
  min-width: 80px;
  max-width: 200px;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: transparent;
  padding: 5px 10px;
  cursor: pointer;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.25s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 1;
  position: relative;

  &:hover {
    border-color: $em-color;
    background: $bg-hover;
  }

  @media (max-width: $mobile-breakpoint) {
    min-width: 80px;
    max-width: 150px;
    padding: 8px 12px;
    font-size: 14px;
    min-height: 36px;
  }
}

.tree-node__favorite-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid $border-color;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.5;

  &:hover {
    background: $bg-hover;
    border-color: rgba(255, 193, 7, 0.5);
    color: #ffc107;
    opacity: 1;
  }

  &.is-favorite {
    color: #ffc107;
    border-color: rgba(255, 193, 7, 0.5);
    background: rgba(255, 193, 7, 0.08);
    opacity: 1;

    &:hover {
      background: rgba(255, 193, 7, 0.15);
    }
  }

  i {
    font-size: 11px;
  }

  @media (max-width: $mobile-breakpoint) {
    width: 28px;
    height: 28px;
    opacity: 1;

    i {
      font-size: 12px;
    }
  }
}

.tree-node__row:hover .tree-node__favorite-btn {
  opacity: 1;
}

.tree-node__row--changed .tree-node__value {
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
      rgba(80, 220, 120, 0.12) 15%,
      rgba(70, 210, 110, 0.25) 25%,
      rgba(60, 200, 100, 0.38) 35%,
      rgba(50, 190, 90, 0.48) 45%,
      rgba(60, 200, 100, 0.38) 55%,
      rgba(70, 210, 110, 0.25) 65%,
      rgba(80, 220, 120, 0.12) 75%,
      transparent 85%
    );
    filter: blur(15px);
    animation: variable_value_completion 1.2s cubic-bezier(0.3, 0.0, 0.3, 1) forwards;
    pointer-events: none;
    z-index: 5;
  }
}

/* 变量更新完成动画 - Material Design 风格 */
@keyframes variable_update_completion {
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

/* 变量值更新完成动画 - 更强烈的效果 */
@keyframes variable_value_completion {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  8% {
    opacity: 0.5;
  }
  25% {
    opacity: 0.9;
  }
  75% {
    opacity: 0.9;
  }
  92% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.tree-node__badge {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1.5px solid $border-color;
  background: transparent;
  font-size: 11px;
  color: $text-muted;
  user-select: none;
  flex-shrink: 0;
  transition: all 0.2s ease;

  @media (max-width: $mobile-breakpoint) {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
  }
}

.tree-node__add-btn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1.5px solid $border-color;
  background: transparent;
  color: $text-color;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
  opacity: 0.5;

  &:hover {
    background: $bg-hover;
    border-color: $em-color;
    color: $em-color;
    opacity: 1;
  }

  i {
    font-size: 10px;
  }

  @media (max-width: $mobile-breakpoint) {
    width: 28px;
    height: 28px;
    opacity: 1;

    i {
      font-size: 12px;
    }
  }
}

.tree-node__row:hover .tree-node__add-btn {
  opacity: 1;
}

.tree-node__children {
  margin-top: 4px;

  @media (max-width: $mobile-breakpoint) {
    margin-top: 2px;
    margin-bottom: 2px;
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
  max-height: 1000px;
}

.add-toolbar {
  --node-depth: 0;
  position: relative;
  margin-left: calc(var(--node-depth) * 20px);
  margin-bottom: 4px;
  padding: 8px 12px;
  border-radius: 0 0 $border-radius $border-radius;
  border: 1.5px solid $border-color;
  border-top: 1px dashed $border-color;
  background: transparent;
  display: flex;
  gap: 8px;
  align-items: center;
  transition: all 0.2s ease;

  @media (max-width: $mobile-breakpoint) {
    margin-left: calc(var(--node-depth) * 12px);
    padding: 8px 12px;
    gap: 6px;
    opacity: calc(1 - var(--node-depth) * 0.12);
    min-height: 40px;
  }
}

.expand-add-enter-active,
.expand-add-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-add-enter-from,
.expand-add-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-add-enter-to,
.expand-add-leave-from {
  opacity: 1;
  max-height: 100px;
}

.add-input-row {
  flex: 1;
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 0;

  @media (max-width: $mobile-breakpoint) {
    gap: 6px;
    flex-wrap: wrap;
  }
}

.action-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: $border-radius;
  border: 1.5px solid $border-color;
  background: transparent;
  color: $text-color;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 34px;

  &:hover {
    background: $bg-hover;
    border-color: $em-color;
  }

  i {
    font-size: 12px;
  }

  @media (max-width: $mobile-breakpoint) {
    height: 36px;
    padding: 0 16px;
    min-width: 48px;

    i {
      font-size: 14px;
    }
  }
}

.confirm-button {
  border-color: rgba(100, 200, 255, 0.6);
  color: rgba(100, 200, 255, 0.9);

  &:hover {
    background: rgba(100, 200, 255, 0.1);
    border-color: rgba(100, 200, 255, 0.9);
  }
}

.cancel-button {
  border-color: rgba(255, 100, 100, 0.6);
  color: rgba(255, 150, 150, 0.9);

  &:hover {
    background: rgba(255, 100, 100, 0.1);
    border-color: rgba(255, 150, 150, 0.9);
  }
}

.editor-input {
  flex: 1;
  min-width: 0;
  border-radius: $border-radius;
  border: 1px solid $border-color;
  background: var(--SmartThemeBlurTintColor);
  color: $text-color;
  padding: 6px 10px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:focus {
    outline: none;
    border-color: $em-color;
    white-space: normal;
    overflow: visible;
  }

  &::placeholder {
    color: $text-muted;
    opacity: 0.7;
  }

  @media (max-width: $mobile-breakpoint) {
    padding: 8px 10px;
    font-size: 14px;
    min-height: 36px;
  }
}

.key-input {
  flex: 0 0 120px;
  min-width: 80px;

  @media (max-width: $mobile-breakpoint) {
    flex: 1 1 100%;
    min-width: 0;
  }
}

.value-input {
  flex: 1;
  min-width: 100px;

  @media (max-width: $mobile-breakpoint) {
    flex: 1 1 100%;
  }
}

.editor-select {
  flex: 0 0 80px;
  border-radius: $border-radius;
  border: 1.5px solid $border-color;
  background: var(--SmartThemeBlurTintColor);
  color: $text-color;
  padding: 6px 8px;
  padding-right: 24px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 34px;
  display: flex;
  align-items: center;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L2 5h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 12px;

  &:focus {
    outline: none;
    border-color: $em-color;
  }

  @media (max-width: $mobile-breakpoint) {
    flex: 0 0 100px;
    padding: 8px 10px;
    padding-right: 28px;
    font-size: 13px;
    min-height: 36px;
    height: auto;
    background-position: right 8px center;
  }
}

.name-input {
  flex: 0 0 120px;
  min-width: 80px;

  @media (max-width: $mobile-breakpoint) {
    flex: 1 1 100%;
    min-width: 0;
  }
}

.type-select {
  flex: 0 0 70px;
}

</style>
