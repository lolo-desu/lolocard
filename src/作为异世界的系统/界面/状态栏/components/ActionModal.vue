<template>
  <Teleport to="body">
    <div class="pixel-modal">
      <div class="pixel-modal__backdrop" @click="emit('close')"></div>
      <div class="pixel-modal__panel">
        <header class="pixel-modal__header">
          <h3 class="pixel-modal__title">{{ title }}</h3>
          <button type="button" class="pixel-modal__close" aria-label="关闭" @click="emit('close')">×</button>
        </header>
        <div class="pixel-modal__scroll">
          <p v-if="description" class="pixel-modal__description">{{ description }}</p>

          <section class="pixel-modal__body">
            <slot />
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>();

const emit = defineEmits<{
  close: [void];
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
  animation: fadeIn 0.3s ease-out forwards;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }

  &__panel {
    position: relative;
    width: min(320px, 92vw);
    max-height: min(560px, calc(100% - 32px));
    margin: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    border: 4px solid #000;
    padding: 0;
    color: #000;
    font-family: 'Fusion Pixel 12px M latin', 'Courier New', monospace;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out forwards;
  }

  &__header {
    background: #333;
    color: #fff;
    padding: 5px 10px;
    border-bottom: 4px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    margin: 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0px #000;
  }

  &__close {
    background: #fff;
    border: 2px solid #000;
    color: #000;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 15px;
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

  &__scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0 6px 8px;
  }

  &__description {
    background: #ffffcc;
    border: 2px solid #ff9900;
    padding: 5px;
    margin: 6px 10px;
    font-size: 10px;
    line-height: 1.3;
  }

  &__body {
    padding: 8px 4px 4px;

    :deep(.form-grid) {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 10px;
        color: #000;

        > span:first-child {
          font-weight: bold;
          font-size: 9px;
          padding-top: 0;
        }
      }

      input,
      textarea,
      select {
        flex: 1;
        width: 100%;
        padding: 4px 6px;
        border: 1px solid #000;
        background: #fff;
        color: #000;
        font-size: 10px;
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
        min-height: 42px;
      }

      select {
        cursor: pointer;
      }
    }

    :deep(.form-grid__checkbox) {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: stretch !important;
      gap: 0 !important;
      padding: 0 !important;
      margin: 0 auto !important;
      border: 1px solid #000 !important;
      background: #fff !important;
      transition: all 0.1s;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      height: 26px !important;
      width: auto !important;
      max-width: fit-content !important;

      &:hover {
        background: #f9f9f9 !important;
      }

      &:active {
        background: #f0f0f0 !important;
      }

      > span:first-child {
        display: none !important;
      }

      input[type='checkbox'] {
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        width: 26px !important;
        height: 26px !important;
        min-height: unset !important;
        border: none !important;
        border-right: 1px solid #000 !important;
        background: #e8e8e8 !important;
        cursor: pointer !important;
        position: relative;
        flex: none !important;
        margin: 0 !important;
        padding: 0 !important;
        transition: all 0.1s;

        &::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border: 1px solid #666;
          background: #fff;
        }

        &:checked {
          background: #000 !important;

          &::before {
            background: #000;
            border-color: #fff;
          }

          &::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) translate(-1px, -1px) rotate(45deg);
            width: 5px;
            height: 8px;
            border: solid #fff;
            border-width: 0 2px 2px 0;
            z-index: 1;
          }
        }

        &:focus {
          outline: none;
        }
      }

      > span:last-child {
        flex: 1 !important;
        padding: 5px 8px !important;
        min-width: auto !important;
        font-weight: normal !important;
        cursor: pointer !important;
        user-select: none !important;
        display: flex !important;
        align-items: center !important;
        font-size: 10px !important;
        color: #000 !important;
        line-height: 1.4 !important;
      }

      &:focus-within {
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.15);
      }
    }

    :deep(.form-actions) {
      display: flex;
      justify-content: flex-end;
      gap: 5px;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 2px solid #000;

      button {
        background: #fff;
        border: 2px solid #000;
        color: #000;
        padding: 4px 10px;
        font-size: 10px;
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

  &__scroll::-webkit-scrollbar {
    height: 6px;
  }

  &__scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.08);
  }

  &__scroll {
    scrollbar-width: thin;
    scrollbar-color: #7a7a7a rgba(0, 0, 0, 0.08);
  }

  &__scroll::-webkit-scrollbar-thumb {
    background: #7a7a7a;
    border: 1px solid #f5f5f5;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .pixel-modal__panel {
    width: 100%;
    max-height: calc(100% - 12px);
    margin: 6px;
  }
}
</style>
