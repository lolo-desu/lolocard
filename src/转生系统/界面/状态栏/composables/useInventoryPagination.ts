import type { InventoryItem } from '../types';
import { ITEMS_PER_PAGE } from '../constants';

export function useInventoryPagination(inventoryItems: ComputedRef<InventoryItem[]>) {
  const currentPage = ref(1);

  const totalPages = computed(() => Math.max(1, Math.ceil(inventoryItems.value.length / ITEMS_PER_PAGE)));

  const paginatedInventory = computed(() => {
    const total = inventoryItems.value.length;
    const slice =
      total === 0
        ? []
        : inventoryItems.value.slice(
            (currentPage.value - 1) * ITEMS_PER_PAGE,
            (currentPage.value - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
          );
    const filled = [...slice];
    while (filled.length < ITEMS_PER_PAGE) {
      filled.push({
        id: `placeholder-${currentPage.value}-${filled.length}`,
        key: `placeholder-${filled.length}`,
        名称: '—',
        描述: '空槽位',
        主角评价: '',
        placeholder: true,
      });
    }
    return filled;
  });

  watch(
    () => inventoryItems.value.length,
    () => {
      currentPage.value = 1;
    },
  );

  watch(totalPages, pages => {
    if (currentPage.value > pages) {
      currentPage.value = pages;
    }
  });

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value -= 1;
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value += 1;
    }
  }

  return {
    currentPage,
    totalPages,
    paginatedInventory,
    prevPage,
    nextPage,
  };
}
