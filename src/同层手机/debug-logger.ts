/**
 * 统一的调试日志工具
 * 用于替代散布在各处的 console.log 调试代码
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class DebugLogger {
  private static instance: DebugLogger;
  private isDevelopment: boolean;
  private logLevel: LogLevel;
  private logHistory: Array<{ timestamp: Date; level: LogLevel; module: string; message: string; data?: any }> = [];
  private maxHistorySize: number = 1000;

  private constructor() {
    // 检查是否为开发模式
    this.isDevelopment = this.checkDevelopmentMode();
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  /**
   * 检查是否为开发模式
   */
  private checkDevelopmentMode(): boolean {
    // 检查多种开发模式标识
    return !!(
      (window as any).BLMX_DEV_MODE ||
      (window as any).DEBUG ||
      localStorage.getItem('blmx_debug') === 'true' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.search.includes('debug=true')
    );
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 启用/禁用开发模式
   */
  setDevelopmentMode(enabled: boolean): void {
    this.isDevelopment = enabled;
    if (enabled) {
      localStorage.setItem('blmx_debug', 'true');
    } else {
      localStorage.removeItem('blmx_debug');
    }
  }

  /**
   * 记录日志到历史
   */
  private addToHistory(level: LogLevel, module: string, message: string, data?: any): void {
    this.logHistory.push({
      timestamp: new Date(),
      level,
      module,
      message,
      data,
    });

    // 限制历史记录大小
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(module: string, message: string): string {
    const timestamp = new Date().toISOString().substr(11, 12);
    return `[${timestamp}] [BLMX:${module}] ${message}`;
  }

  /**
   * 调试日志
   */
  debug(module: string, message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG && this.isDevelopment) {
      console.log(this.formatMessage(module, message), data || '');
      this.addToHistory(LogLevel.DEBUG, module, message, data);
    }
  }

  /**
   * 信息日志
   */
  info(module: string, message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO && this.isDevelopment) {
      console.info(this.formatMessage(module, message), data || '');
      this.addToHistory(LogLevel.INFO, module, message, data);
    }
  }

  /**
   * 警告日志
   */
  warn(module: string, message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage(module, message), data || '');
      this.addToHistory(LogLevel.WARN, module, message, data);
    }
  }

  /**
   * 错误日志（总是显示）
   */
  error(module: string, message: string, data?: any): void {
    console.error(this.formatMessage(module, message), data || '');
    this.addToHistory(LogLevel.ERROR, module, message, data);
  }

  /**
   * 性能测量开始
   */
  timeStart(module: string, label: string): void {
    if (this.isDevelopment) {
      console.time(this.formatMessage(module, label));
    }
  }

  /**
   * 性能测量结束
   */
  timeEnd(module: string, label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(this.formatMessage(module, label));
    }
  }

  /**
   * 分组日志开始
   */
  groupStart(module: string, title: string): void {
    if (this.isDevelopment) {
      console.group(this.formatMessage(module, title));
    }
  }

  /**
   * 分组日志结束
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * 获取日志历史
   */
  getHistory(filterModule?: string, filterLevel?: LogLevel): typeof this.logHistory {
    let filtered = this.logHistory;

    if (filterModule) {
      filtered = filtered.filter(log => log.module === filterModule);
    }

    if (filterLevel !== undefined) {
      filtered = filtered.filter(log => log.level >= filterLevel);
    }

    return filtered;
  }

  /**
   * 清空日志历史
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * 导出日志历史为JSON
   */
  exportHistory(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * 显示调试面板（如果在开发模式）
   */
  showDebugPanel(): void {
    if (!this.isDevelopment) {
      console.warn('调试面板仅在开发模式下可用');
      return;
    }

    console.group('🐛 BLMX 调试信息');
    console.log('开发模式:', this.isDevelopment);
    console.log('日志级别:', LogLevel[this.logLevel]);
    console.log('历史记录数量:', this.logHistory.length);
    
    if (this.logHistory.length > 0) {
      console.log('最近的日志:');
      this.logHistory.slice(-10).forEach(log => {
        const levelIcon = ['🔍', 'ℹ️', '⚠️', '❌'][log.level];
        console.log(`${levelIcon} [${log.module}] ${log.message}`, log.data || '');
      });
    }
    
    console.groupEnd();
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    isDevelopment: boolean;
    logLevel: string;
    historyCount: number;
  } {
    return {
      isDevelopment: this.isDevelopment,
      logLevel: LogLevel[this.logLevel],
      historyCount: this.logHistory.length,
    };
  }
}

// 创建全局实例
export const logger = DebugLogger.getInstance();

// 在开发模式下暴露到全局作用域，方便调试
if (typeof window !== 'undefined' && logger.getStatus().isDevelopment) {
  (window as any).blmxLogger = logger;
}
