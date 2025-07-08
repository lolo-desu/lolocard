/**
 * 通用工具函数
 * 用于抽象重复的逻辑和提供共享功能
 */

import { logger } from './debug-logger';

/**
 * 安全的JSON解析
 * @param jsonString JSON字符串
 * @param defaultValue 解析失败时的默认值
 * @returns 解析结果或默认值
 */
export function safeJsonParse<T = any>(jsonString: string, defaultValue: T | null = null): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.warn('Utils', 'JSON解析失败', { jsonString: jsonString.substring(0, 100), error });
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 * @param obj 要序列化的对象
 * @param defaultValue 序列化失败时的默认值
 * @returns JSON字符串或默认值
 */
export function safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    logger.warn('Utils', 'JSON序列化失败', { error });
    return defaultValue;
  }
}

/**
 * 防抖函数 - 使用lodash的debounce
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param options lodash debounce选项
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number },
): T {
  return (window as any)._.debounce(func, wait, options);
}

/**
 * 节流函数 - 使用lodash的throttle
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @param options lodash throttle选项
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean },
): T {
  return (window as any)._.throttle(func, wait, options);
}

/**
 * 异步延迟函数
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 安全的DOM查询 - 使用jQuery
 * @param selector CSS选择器
 * @param context 查询上下文，默认为document
 * @returns jQuery对象
 */
export function $safe(selector: string, context?: Element | Document): JQuery<HTMLElement> {
  try {
    return context ? $(selector, context) : $(selector);
  } catch (error) {
    logger.warn('Utils', 'jQuery查询失败', { selector, error });
    return $(); // 返回空的jQuery对象
  }
}

/**
 * 安全的DOM查询（原生元素）
 * @param selector CSS选择器
 * @param context 查询上下文，默认为document
 * @returns 元素或null
 */
export function safeQuerySelector<T extends Element = Element>(
  selector: string,
  context: Document | Element = document,
): T | null {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    logger.warn('Utils', 'DOM查询失败', { selector, error });
    return null;
  }
}

/**
 * 安全的DOM查询（多个元素）- 使用jQuery更简洁
 * @param selector CSS选择器
 * @param context 查询上下文，默认为document
 * @returns 元素数组
 */
export function safeQuerySelectorAll<T extends Element = Element>(
  selector: string,
  context: Document | Element = document,
): T[] {
  try {
    const $elements = context ? $(selector, context) : $(selector);
    return $elements.toArray() as unknown as T[];
  } catch (error) {
    logger.warn('Utils', 'DOM查询失败', { selector, error });
    return [];
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间戳
 * @param timestamp 时间戳（毫秒）
 * @param format 格式类型
 * @returns 格式化的时间字符串
 */
export function formatTimestamp(timestamp: number, format: 'full' | 'time' | 'date' = 'full'): string {
  const date = new Date(timestamp);

  switch (format) {
    case 'time':
      return date.toLocaleTimeString('zh-CN', { hour12: false });
    case 'date':
      return date.toLocaleDateString('zh-CN');
    case 'full':
    default:
      return date.toLocaleString('zh-CN', { hour12: false });
  }
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID字符串
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 深度克隆对象 - 使用lodash的cloneDeep
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  return (window as any)._.cloneDeep(obj);
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检查是否支持触摸
 * @returns 是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 安全的本地存储操作
 */
export const SafeStorage = {
  /**
   * 获取本地存储项
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  getItem<T = string>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      // 尝试解析JSON，如果失败则返回原始字符串
      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      logger.warn('Utils', '本地存储读取失败', { key, error });
      return defaultValue;
    }
  },

  /**
   * 设置本地存储项
   * @param key 键名
   * @param value 值
   * @returns 是否成功
   */
  setItem(key: string, value: any): boolean {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.warn('Utils', '本地存储写入失败', { key, error });
      return false;
    }
  },

  /**
   * 删除本地存储项
   * @param key 键名
   * @returns 是否成功
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.warn('Utils', '本地存储删除失败', { key, error });
      return false;
    }
  },

  /**
   * 清空本地存储
   * @returns 是否成功
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      logger.warn('Utils', '本地存储清空失败', { error });
      return false;
    }
  },
};

/**
 * 错误处理工具
 */
export const ErrorHandler = {
  /**
   * 安全执行异步函数
   * @param fn 异步函数
   * @param errorMessage 错误消息
   * @returns 执行结果或null
   */
  async safeAsync<T>(fn: () => Promise<T>, errorMessage?: string): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      logger.error('ErrorHandler', errorMessage || '异步操作失败', { error });
      return null;
    }
  },

  /**
   * 安全执行同步函数
   * @param fn 同步函数
   * @param errorMessage 错误消息
   * @returns 执行结果或null
   */
  safeSync<T>(fn: () => T, errorMessage?: string): T | null {
    try {
      return fn();
    } catch (error) {
      logger.error('ErrorHandler', errorMessage || '同步操作失败', { error });
      return null;
    }
  },
};
