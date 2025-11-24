import type { SectionKey } from '../types';

export function useResponsive() {
  const isMobile = ref(false);

  // 移动端：默认全部折叠
  // 电脑端：sectionOpen 一律返回 true，也就是永远展开
  const sectionState = reactive<Record<SectionKey, boolean>>({
    info: false,
    abilities: false,
    equipment: false,
    inventory: false,
    status: false,
    'held-abilities': false,
  });

  function sectionOpen(key: SectionKey) {
    return isMobile.value ? sectionState[key] : true;
  }

  function toggleSection(key: SectionKey) {
    if (!isMobile.value) {
      return;
    }
    sectionState[key] = !sectionState[key];
  }

  function updateIsMobile() {
    isMobile.value = window.matchMedia('(max-width: 768px)').matches;
  }

  onMounted(() => {
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateIsMobile);
  });

  watch(isMobile, value => {
    if (!value) {
      (Object.keys(sectionState) as SectionKey[]).forEach(key => {
        sectionState[key] = true;
      });
    }
  });

  return {
    isMobile,
    sectionState,
    sectionOpen,
    toggleSection,
  };
}
