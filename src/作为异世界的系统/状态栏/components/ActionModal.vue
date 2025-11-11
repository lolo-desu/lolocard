<template>
  <teleport to="body">
    <div v-if="visible" class="pixel-modal">
      <div class="pixel-modal__backdrop" @click="emit('close')"></div>
      <div class="pixel-modal__panel">
        <header class="pixel-modal__header">
          <h3 class="pixel-modal__title">{{ title }}</h3>
          <button type="button" class="pixel-modal__close" aria-label="关闭" @click="emit('close')">×</button>
        </header>
        <p v-if="description" class="pixel-modal__description">{{ description }}</p>

        <section class="pixel-modal__body">
          <slot />
        </section>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  title: string;
  description?: string;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped lang="scss">
.pixel-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }

  &__panel {
    position: relative;
    width: min(500px, 90vw);
    max-height: 85vh;
    overflow-y: auto;
    background: #f5f5f5;
    border: 4px solid #000;
    padding: 0;
    color: #000;
    font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
  }

  &__header {
    background: #333;
    color: #fff;
    padding: 12px 20px;
    border-bottom: 4px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 2px 2px 0px #000;
  }

  &__close {
    background: #fff;
    border: 2px solid #000;
    color: #000;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
    font-family: 'Courier New', monospace;
    transition: all 0.1s;

    &:hover {
      background: #ddd;
    }

    &:active {
      box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.3);
    }
  }

  &__description {
    background: #ffffcc;
    border: 2px solid #ff9900;
    padding: 10px;
    margin: 15px 20px;
    font-size: 14px;
    line-height: 1.4;
  }

  &__body {
    padding: 20px;

    :deep(.form-grid) {
      display: flex;
      flex-direction: column;
      gap: 15px;

      label {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        color: #000;

        > span:first-child {
          min-width: 100px;
          font-weight: bold;
          padding-top: 8px;
        }
      }

      input,
      textarea,
      select {
        flex: 1;
        width: 100%;
        padding: 8px 12px;
        border: 2px solid #000;
        background: #fff;
        color: #000;
        font-size: 14px;
        font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;

        &:focus {
          outline: none;
          background: #ffffcc;
          border-color: #ff0000;
        }

        &::placeholder {
          color: #999;
        }
      }

      textarea {
        resize: vertical;
        min-height: 70px;
      }

      select {
        cursor: pointer;
      }
    }

    :deep(.form-grid__checkbox) {
      flex-direction: row;
      align-items: center;

      input[type='checkbox'] {
        width: auto;
        flex: none;
        margin-right: 8px;
      }

      span {
        min-width: auto;
        padding-top: 0;
        font-weight: normal;
      }
    }

    :deep(.form-actions) {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #000;

      button {
        background: #fff;
        border: 3px solid #000;
        color: #000;
        padding: 8px 20px;
        font-size: 14px;
        cursor: pointer;
        font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
        text-transform: uppercase;
        transition: all 0.1s;

        &:hover {
          background: #ddd;
        }

        &:active {
          border-width: 3px 5px 5px 3px;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.primary {
          background: #000;
          color: #fff;

          &:hover {
            background: #333;
          }
        }

        &.ghost {
          background: transparent;
          border: 2px solid #000;

          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
  }
}
</style>
