/**
 * 事件管理器
 * 统一管理全局事件监听器和定时器，防止内存泄漏
 */

export class EventManager {
  private listeners: Array<() => void> = [];
  private timers: Set<number> = new Set();
  private intervals: Set<number> = new Set();
  private isDestroyed: boolean = false;

  /**
   * 添加全局事件监听器
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 清理函数
   */
  addGlobalListener(event: string, handler: Function): () => void {
    if (this.isDestroyed) {
      console.warn('[EventManager] 尝试在已销毁的管理器上添加监听器');
      return () => {};
    }

    const cleanup = (window as any).eventOn(event, handler);
    if (cleanup && typeof cleanup === 'function') {
      this.listeners.push(cleanup);
      return cleanup;
    } else {
      console.warn(`[EventManager] 无法为事件 ${event} 创建清理函数`);
      return () => {};
    }
  }

  /**
   * 添加DOM事件监听器
   * @param element DOM元素
   * @param event 事件类型
   * @param handler 事件处理函数
   * @param options 事件选项
   */
  addDOMListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (this.isDestroyed) {
      console.warn('[EventManager] 尝试在已销毁的管理器上添加DOM监听器');
      return;
    }

    element.addEventListener(event, handler, options);

    // 创建清理函数
    const cleanup = () => {
      element.removeEventListener(event, handler, options);
    };

    this.listeners.push(cleanup);
  }

  /**
   * 安全的setTimeout
   * @param callback 回调函数
   * @param delay 延迟时间
   * @returns 定时器ID
   */
  setTimeout(callback: Function, delay: number): number {
    if (this.isDestroyed) {
      console.warn('[EventManager] 尝试在已销毁的管理器上创建定时器');
      return -1;
    }

    const timerId = window.setTimeout(() => {
      this.timers.delete(timerId);
      try {
        callback();
      } catch (error) {
        console.error('[EventManager] 定时器回调执行错误:', error);
      }
    }, delay);

    this.timers.add(timerId);
    return timerId;
  }

  /**
   * 安全的setInterval
   * @param callback 回调函数
   * @param interval 间隔时间
   * @returns 定时器ID
   */
  setInterval(callback: Function, interval: number): number {
    if (this.isDestroyed) {
      console.warn('[EventManager] 尝试在已销毁的管理器上创建间隔定时器');
      return -1;
    }

    const intervalId = window.setInterval(() => {
      try {
        callback();
      } catch (error) {
        console.error('[EventManager] 间隔定时器回调执行错误:', error);
      }
    }, interval);

    this.intervals.add(intervalId);
    return intervalId;
  }

  /**
   * 清除指定的定时器
   * @param timerId 定时器ID
   */
  clearTimeout(timerId: number): void {
    if (this.timers.has(timerId)) {
      window.clearTimeout(timerId);
      this.timers.delete(timerId);
    }
  }

  /**
   * 清除指定的间隔定时器
   * @param intervalId 间隔定时器ID
   */
  clearInterval(intervalId: number): void {
    if (this.intervals.has(intervalId)) {
      window.clearInterval(intervalId);
      this.intervals.delete(intervalId);
    }
  }

  /**
   * 清理所有监听器和定时器
   */
  cleanup(): void {
    if (this.isDestroyed) {
      return;
    }

    // 清理事件监听器
    this.listeners.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('[EventManager] 清理监听器时出错:', error);
      }
    });
    this.listeners = [];

    // 清理定时器
    this.timers.forEach(timerId => {
      window.clearTimeout(timerId);
    });
    this.timers.clear();

    // 清理间隔定时器
    this.intervals.forEach(intervalId => {
      window.clearInterval(intervalId);
    });
    this.intervals.clear();

    this.isDestroyed = true;
    //console.log('[EventManager] 所有资源已清理');
  }

  /**
   * 获取当前状态信息
   */
  getStatus(): {
    listenersCount: number;
    timersCount: number;
    intervalsCount: number;
    isDestroyed: boolean;
  } {
    return {
      listenersCount: this.listeners.length,
      timersCount: this.timers.size,
      intervalsCount: this.intervals.size,
      isDestroyed: this.isDestroyed,
    };
  }

  /**
   * 检查是否已销毁
   */
  isDestroyed_(): boolean {
    return this.isDestroyed;
  }
}

/**
 * 全局事件管理器实例
 * 用于管理应用级别的事件监听器
 */
export const globalEventManager = new EventManager();

/**
 * 在页面卸载时自动清理全局事件管理器
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalEventManager.cleanup();
  });
}
