import { onBeforeUnmount, ref } from 'vue';

type LongPressOptions<T> = {
  onTap?: (payload: T, event: PointerEvent) => void;
  onLongPress?: (payload: T, event: PointerEvent) => void;
  delay?: number;
  usePointerCapture?: boolean;
  shouldHandle?: (payload: T, event: PointerEvent) => boolean;
  preventDefaultOnTouch?: boolean;
};

export function useLongPress<T>(options: LongPressOptions<T>) {
  const delay = options.delay ?? 600;
  const usePointerCapture = options.usePointerCapture ?? true;
  const preventDefaultOnTouch = options.preventDefaultOnTouch ?? true;

  const activePointerId = ref<number | null>(null);
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const longPressTriggered = ref(false);

  function clearPressTimer() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  onBeforeUnmount(() => {
    clearPressTimer();
  });

  function onPointerDown(payload: T, event: PointerEvent) {
    if (event.button !== 0) return;
    if (options.shouldHandle && !options.shouldHandle(payload, event)) {
      return;
    }

    activePointerId.value = event.pointerId;
    longPressTriggered.value = false;
    if (usePointerCapture) {
      (event.currentTarget as HTMLElement | null)?.setPointerCapture(event.pointerId);
    }
    if (preventDefaultOnTouch && event.pointerType !== 'mouse') {
      event.preventDefault();
    }

    clearPressTimer();
    pressTimer = setTimeout(() => {
      longPressTriggered.value = true;
      options.onLongPress?.(payload, event);
    }, delay);
  }

  function onPointerUp(payload: T, event: PointerEvent) {
    if (event.button !== 0 || activePointerId.value !== event.pointerId) return;

    if (usePointerCapture) {
      (event.currentTarget as HTMLElement | null)?.releasePointerCapture(event.pointerId);
    }
    activePointerId.value = null;

    const wasLongPress = longPressTriggered.value;
    clearPressTimer();
    if (!wasLongPress) {
      options.onTap?.(payload, event);
    }
  }

  function onPointerCancel(event?: PointerEvent) {
    if (event && activePointerId.value === event.pointerId && usePointerCapture) {
      (event.currentTarget as HTMLElement | null)?.releasePointerCapture(event.pointerId);
    }
    activePointerId.value = null;
    clearPressTimer();
    longPressTriggered.value = false;
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    clearPressTimer,
  };
}
