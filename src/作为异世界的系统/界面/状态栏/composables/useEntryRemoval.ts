import { computed, ref } from 'vue';

type EntryRemovalOptions<T> = {
  getName: (entry: T | null) => string;
  getKey: (entry: T | null) => string | undefined;
  removeByKey: (key: string | undefined) => boolean;
  deleteSuccessMessage?: (name: string) => string;
  deleteFailureMessage?: string;
  destroySuccessMessage?: (name: string) => string;
  destroyFailureMessage?: string;
  logDestroy?: (name: string) => void;
};

export function useEntryRemoval<T>(options: EntryRemovalOptions<T>) {
  const showRemovalModal = ref(false);
  const pendingEntry = ref<T | null>(null);

  const selectedName = computed(() => options.getName(pendingEntry.value));

  function openRemoval(entry: T) {
    pendingEntry.value = entry;
    showRemovalModal.value = true;
  }

  function closeRemoval() {
    showRemovalModal.value = false;
    pendingEntry.value = null;
  }

  function runRemoval(type: 'delete' | 'destroy') {
    const entry = pendingEntry.value;
    if (!entry) {
      return;
    }
    const removed = options.removeByKey(options.getKey(entry));
    if (!removed) {
      toastr.warning(
        type === 'delete'
          ? options.deleteFailureMessage ?? '未找到要删除的条目'
          : options.destroyFailureMessage ?? '未找到要销毁的条目',
      );
      return;
    }

    const name = selectedName.value;
    if (type === 'destroy') {
      options.logDestroy?.(name);
    }

    const successMessage =
      type === 'delete'
        ? options.deleteSuccessMessage?.(name) ?? `已删除「${name}」`
        : options.destroySuccessMessage?.(name) ?? `已销毁「${name}」`;
    toastr.success(successMessage);
    closeRemoval();
  }

  return {
    showRemovalModal,
    pendingEntry,
    selectedName,
    openRemovalModal: openRemoval,
    closeRemovalModal: closeRemoval,
    handleBugDelete: () => runRemoval('delete'),
    handleDestroy: () => runRemoval('destroy'),
  };
}
