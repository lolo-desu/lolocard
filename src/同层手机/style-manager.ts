/**
 * 样式管理器
 * 负责导入和管理所有SCSS样式文件
 */

// 导入主样式文件
import './styles/main.scss';

/**
 * 样式管理器类
 * 提供样式相关的工具方法和管理功能
 */
export class StyleManager {
  private static instance: StyleManager;
  private loadedStyles: Set<string> = new Set();

  private constructor() {
    this.initializeStyles();
  }

  /**
   * 获取样式管理器单例实例
   */
  public static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager();
    }
    return StyleManager.instance;
  }

  /**
   * 初始化样式
   */
  private initializeStyles(): void {
    console.log('[StyleManager] 正在加载样式文件...');

    // 标记主样式已加载
    this.loadedStyles.add('main');

    // 添加样式加载完成的标记到body
    document.body.classList.add('styles-loaded');

    console.log('[StyleManager] 样式文件加载完成');
  }

  /**
   * 检查样式是否已加载
   */
  public isStyleLoaded(styleName: string): boolean {
    return this.loadedStyles.has(styleName);
  }

  /**
   * 动态切换主题
   */
  public toggleTheme(theme: 'light' | 'dark'): void {
    const body = document.body;

    if (theme === 'dark') {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }

    console.log(`[StyleManager] 主题已切换到: ${theme}`);
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): 'light' | 'dark' {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  /**
   * 动态设置CSS变量
   */
  public setCSSVariable(name: string, value: string): void {
    document.documentElement.style.setProperty(name, value);
  }

  /**
   * 获取CSS变量值
   */
  public getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /**
   * 批量设置CSS变量
   */
  public setCSSVariables(variables: Record<string, string>): void {
    Object.entries(variables).forEach(([name, value]) => {
      this.setCSSVariable(name, value);
    });
  }

  /**
   * 重置所有自定义CSS变量
   */
  public resetCSSVariables(): void {
    // 移除所有自定义设置的CSS变量
    const style = document.documentElement.style;
    const propertiesToRemove: string[] = [];

    for (let i = 0; i < style.length; i++) {
      const property = style[i];
      if (property.startsWith('--')) {
        propertiesToRemove.push(property);
      }
    }

    propertiesToRemove.forEach(property => {
      style.removeProperty(property);
    });
  }

  /**
   * 添加自定义样式类
   */
  public addStyleClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  /**
   * 移除样式类
   */
  public removeStyleClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  /**
   * 切换样式类
   */
  public toggleStyleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className);
  }

  /**
   * 检查元素是否包含指定样式类
   */
  public hasStyleClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  /**
   * 获取样式管理器状态信息
   */
  public getStatus(): {
    loadedStyles: string[];
    currentTheme: string;
    stylesLoaded: boolean;
  } {
    return {
      loadedStyles: Array.from(this.loadedStyles),
      currentTheme: this.getCurrentTheme(),
      stylesLoaded: document.body.classList.contains('styles-loaded'),
    };
  }
}

// 导出单例实例
export const styleManager = StyleManager.getInstance();

// 在模块加载时自动初始化
console.log('[StyleManager] 样式管理器已初始化');
