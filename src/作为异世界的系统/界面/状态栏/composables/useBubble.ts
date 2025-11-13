export function useBubble<T extends string>() {
  const activeBubble = ref<T | null>(null);

  function toggleBubble(id: T) {
    activeBubble.value = activeBubble.value === id ? null : id;
  }

  function closeBubble() {
    activeBubble.value = null;
  }

  return {
    activeBubble,
    toggleBubble,
    closeBubble,
  };
}
