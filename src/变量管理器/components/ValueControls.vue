<template>
  <div class="value-controls">
    <div class="input-row" :class="{ 'input-row--string': type === 'string' }">
      <template v-if="type === 'number'">
        <input
          v-model="numberDraft"
          class="editor-input"
          type="text"
          @keydown.stop
          @click.stop
        />
      </template>
      <template v-else-if="type === 'boolean'">
        <label class="toggle-checkbox">
          <input
            v-model="booleanDraft"
            type="checkbox"
          />
          <span class="checkbox-icon">
            <i v-if="booleanDraft" class="fa-solid fa-check"></i>
          </span>
          <span class="checkbox-label">{{ booleanDraft ? 'true' : 'false' }}</span>
        </label>
      </template>
      <template v-else>
        <textarea
          ref="textareaRef"
          v-model="textDraft"
          class="editor-textarea"
          rows="1"
          @keydown.stop
          @click.stop
          @input="autoResize"
        />
      </template>
      <div class="cta-group">
        <button class="pill danger" type="button" @click.stop="deleteValue">删除</button>
        <button class="pill ghost cancel-btn" type="button" @click.stop="cancelEdit">取消</button>
        <button class="pill" type="button" @click.stop="applyEdit">应用</button>
      </div>
    </div>

    <div v-if="type === 'number'" class="quick-row">
      <button
        v-for="delta in deltas"
        :key="delta"
        class="pill small"
        type="button"
        @click.stop="adjustNumber(delta)"
      >
        {{ delta > 0 ? `+${delta}` : delta }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVariableManagerStore } from '../store';

const props = defineProps<{
  path: string;
  value: any;
  isMobile?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useVariableManagerStore();
const deltas = [-10, -1, 1, 10];

const type = computed<'number' | 'boolean' | 'string'>(() => {
  if (_.isNumber(props.value)) {
    return 'number';
  }
  if (_.isBoolean(props.value)) {
    return 'boolean';
  }
  return 'string';
});

const numberDraft = ref<string>(stringifyValue(props.value));
const textDraft = ref(stringifyValue(props.value));
const booleanDraft = ref<boolean>(Boolean(props.value));
const textareaRef = ref<HTMLTextAreaElement | null>(null);

watch(
  () => props.value,
  value => {
    numberDraft.value = stringifyValue(value);
    textDraft.value = stringifyValue(value);
    booleanDraft.value = Boolean(value);
    // 值变化时也调整高度
    nextTick(() => {
      if (textareaRef.value && type.value === 'string') {
        adjustTextareaHeight(textareaRef.value);
      }
    });
  },
);

function adjustTextareaHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  const maxHeight = window.innerWidth <= 768 ? 420 : 520;
  textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 96), maxHeight)}px`;
}

function autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  adjustTextareaHeight(textarea);
}

onMounted(() => {
  if (type.value === 'string') {
    nextTick(() => {
      if (textareaRef.value) {
        adjustTextareaHeight(textareaRef.value);
      }
    });
  }
});

function stringifyValue(value: unknown) {
  return value === undefined || value === null ? '' : String(value);
}

function adjustNumber(delta: number) {
  const current = Number(numberDraft.value);
  const base = Number.isNaN(current) ? 0 : current;
  numberDraft.value = String(base + delta);
}

function toggleBoolean() {
  booleanDraft.value = !booleanDraft.value;
}

async function applyEdit() {
  switch (type.value) {
    case 'number':
      await store.setValue(props.path, normalizeNumberDraft());
      break;
    case 'boolean':
      await store.setValue(props.path, booleanDraft.value);
      break;
    case 'string':
      await store.setValue(props.path, textDraft.value ?? '');
      break;
  }
  emit('close');
}

function cancelEdit() {
  numberDraft.value = stringifyValue(props.value);
  textDraft.value = stringifyValue(props.value);
  booleanDraft.value = Boolean(props.value);
  emit('close');
}

async function deleteValue() {
  if (confirm('确定要删除这个变量吗？')) {
    await store.deleteValue(props.path);
    emit('close');
  }
}

function normalizeNumberDraft() {
  const raw = (numberDraft.value ?? '').toString().trim();
  if (raw === '') {
    return 0;
  }
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? raw : parsed;
}
</script>

<style scoped lang="scss">
$border-color: var(--SmartThemeBorderColor);
$bg-tint: var(--SmartThemeBlurTintColor);
$text-color: var(--SmartThemeBodyColor);
$em-color: var(--SmartThemeEmColor);
$text-muted: var(--SmartThemeQuoteColor);
$bg-hover: var(--SmartThemeBlurTintColor);
$border-radius: 5px;
$mobile-breakpoint: 768px;

.value-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  min-width: 0;
  flex: 1;

  @media (max-width: $mobile-breakpoint) {
    gap: 12px;
  }
}

.input-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  width: 100%;

  @media (max-width: $mobile-breakpoint) {
    flex-direction: column;
    gap: 10px;
  }
}
.input-row--string {
  align-items: stretch;
}

.editor-input {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: var(--SmartThemeBlurTintColor);
  color: $text-color;
  font-size: 13px;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  transition: all 0.2s ease;
  min-height: 44px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;

  &:focus {
    outline: none;
    border-color: $em-color;
    background: $bg-hover;
  }

  &::placeholder {
    color: $text-muted;
    opacity: 0.7;
  }

  @media (max-width: $mobile-breakpoint) {
    padding: 10px 12px;
    font-size: 14px;
    min-height: 40px;
  }
}

.editor-textarea {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: var(--SmartThemeBlurTintColor);
  color: $text-color;
  font-size: 13px;
  font-family: var(--monoFontFamily, 'Consolas', monospace);
  transition: border-color 0.2s ease, background 0.2s ease;
  resize: none;
  min-height: 96px;
  max-height: 520px;
  overflow-y: auto;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  display: block;

  &:focus {
    outline: none;
    border-color: $em-color;
    background: $bg-hover;
  }

  &::placeholder {
    color: $text-muted;
    opacity: 0.7;
  }

  @media (max-width: $mobile-breakpoint) {
    padding: 10px 12px;
    font-size: 14px;
    max-height: 420px;
  }
}

.toggle-checkbox {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: var(--SmartThemeBlurTintColor);
  color: $text-color;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  box-sizing: border-box;

  &:hover {
    background: $bg-hover;
    border-color: $em-color;
  }

  input[type='checkbox'] {
    display: none;
  }

  .checkbox-icon {
    width: 18px;
    height: 18px;
    border: 1.5px solid $border-color;
    border-radius: 3px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;

    i {
      font-size: 11px;
      color: rgba(100, 200, 255, 0.9);
    }
  }

  input[type='checkbox']:checked ~ .checkbox-icon {
    background: rgba(100, 200, 255, 0.15);
    border-color: rgba(100, 200, 255, 0.6);
  }

  .checkbox-label {
    font-size: 12px;
    font-weight: 500;
    font-family: var(--monoFontFamily, 'Consolas', monospace);
    user-select: none;
  }

  @media (max-width: $mobile-breakpoint) {
    padding: 10px 14px;
    gap: 12px;
    min-height: 40px;

    .checkbox-icon {
      width: 20px;
      height: 20px;

      i {
        font-size: 12px;
      }
    }

    .checkbox-label {
      font-size: 14px;
    }
  }
}

.cta-group {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;

  @media (max-width: $mobile-breakpoint) {
    width: 100%;
    gap: 8px;
  }
}

.input-row--string .cta-group {
  flex-direction: column;
  align-self: stretch;
  justify-content: flex-start;
  padding-left: 10px;
  gap: 8px;
  flex: 0 0 96px;
}

.input-row--string .cta-group .pill {
  width: 100%;
}

@media (max-width: $mobile-breakpoint) {
  .input-row--string {
    align-items: stretch;
  }

  .input-row--string .cta-group {
    flex-direction: row;
    flex-wrap: wrap;
    padding-left: 0;
    flex: 1 1 100%;
    justify-content: flex-end;
    gap: 10px;
  }

  .input-row--string .cta-group .pill {
    flex: 1 1 30%;
    min-width: 90px;
  }
}

.pill {
  padding: 6px 14px;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  background: transparent;
  color: $text-color;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  min-height: 24px;
  min-width: 48px;

  &:hover {
    background: $bg-hover;
    border-color: $em-color;
  }

  &.danger {
    color: rgba(255, 100, 100, 0.9);
    border-color: rgba(255, 100, 100, 0.6);

    &:hover {
      background: rgba(255, 100, 100, 0.1);
      border-color: rgba(255, 150, 150, 0.9);
    }

    @media (max-width: $mobile-breakpoint) {
      flex: 0.5;
      min-width: 0;
    }
  }

  &.ghost {
    background: transparent;

    &:hover {
      background: $bg-hover;
      border-color: $em-color;
    }
  }

  &.small {
    padding: 4px 10px;
    font-size: 10px;
    min-height: 22px;
    min-width: 40px;

    @media (max-width: $mobile-breakpoint) {
      flex: 1;
      padding: 10px 14px;
      font-size: 13px;
      min-height: 40px;
      min-width: 0;
    }
  }

  @media (max-width: $mobile-breakpoint) {
    flex: 1;
    padding: 10px 16px;
    font-size: 13px;
    min-height: 40px;
    min-width: 0;
  }
}

.quick-row {
  display: flex;
  gap: 4px;
  padding-top: 6px;
  border-top: 1px dashed $border-color;
  margin-top: 2px;
  width: 100%;

  @media (max-width: $mobile-breakpoint) {
    gap: 6px;
    padding-top: 8px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
