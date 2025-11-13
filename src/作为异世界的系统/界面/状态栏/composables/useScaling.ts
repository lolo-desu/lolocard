import { BASE_WIDTH } from '../constants';

export function useScaling(isMobile: Ref<boolean>) {
  let resizeObserver: ResizeObserver | null = null;

  // 等比缩放状态栏（仅桌面端）
  function updateScale() {
    const wrapper = document.querySelector('.status-system-wrapper') as HTMLElement;
    const statusSystem = document.querySelector('.status-system') as HTMLElement;

    if (!wrapper || !statusSystem) return;

    // 移动端不进行缩放，保持原样
    if (isMobile.value) {
      statusSystem.style.transform = '';
      statusSystem.style.width = '';
      wrapper.style.height = '';
      return;
    }

    // 桌面端进行等比缩放
    const wrapperWidth = wrapper.clientWidth;
    const scale = wrapperWidth / BASE_WIDTH;

    // 应用缩放
    statusSystem.style.transform = `scale(${scale})`;
    statusSystem.style.transformOrigin = 'top left';
    statusSystem.style.width = `${BASE_WIDTH}px`;

    // 调整容器高度以适应缩放后的内容
    const scaledHeight = statusSystem.offsetHeight * scale;
    wrapper.style.height = `${scaledHeight}px`;
  }

  // 通知父窗口调整iframe高度
  function updateIframeHeight() {
    if (window.frameElement) {
      const height = document.documentElement.scrollHeight;
      (window.frameElement as HTMLIFrameElement).style.height = `${height}px`;
    }
  }

  onMounted(() => {
    window.addEventListener('resize', updateScale);

    // 初始缩放和高度调整
    setTimeout(() => {
      updateScale();
      updateIframeHeight();
    }, 0);

    // 监听内容高度变化
    resizeObserver = new ResizeObserver(() => {
      updateScale();
      updateIframeHeight();
    });

    const statusSystem = document.querySelector('.status-system');
    if (statusSystem) {
      resizeObserver.observe(statusSystem);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateScale);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  watch(isMobile, () => {
    // 切换移动端/桌面端时重新计算缩放
    updateScale();
  });

  return {
    updateScale,
  };
}
