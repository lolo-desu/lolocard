// 用户界面管理模块
// 负责导航、面板切换、尺寸调整、版本显示等UI相关功能

import { ConfigManager } from './config-manager';
import { LogEntry } from './script';
import { APP_VERSION } from './theme-manager';

export class UIManager {
  private configManager: ConfigManager;
  private onAddEntry?: (entry: LogEntry) => void;
  private onRenderEntry?: (entry: LogEntry, index?: number, animate?: boolean) => void;

  constructor(
    configManager: ConfigManager,
    onAddEntry?: (entry: LogEntry) => void,
    onRenderEntry?: (entry: LogEntry, index?: number, animate?: boolean) => void,
  ) {
    this.configManager = configManager;
    this.onAddEntry = onAddEntry;
    this.onRenderEntry = onRenderEntry;
  }

  // 显示应用版本
  displayAppVersion(): void {
    $('#app-version-display').text(`v${APP_VERSION}`);
  }

  // 检查是否显示版本更新通知
  checkVersionUpdateNotification(): void {
    const lastNotifiedVersion = this.configManager.getLastNotifiedVersion();

    // 如果没有通知过当前版本，显示通知
    if (lastNotifiedVersion !== APP_VERSION) {
      this.showVersionUpdateNotification();
      this.configManager.setLastNotifiedVersion(APP_VERSION);
    }
  }

  // 显示版本更新通知
  private showVersionUpdateNotification(): void {
    // 创建系统消息
    const updateEntry: LogEntry = {
      type: 'message',
      sender: 'them',
      content: `系统消息：应用已更新到 v${APP_VERSION}，已自动清理过时数据以确保功能正常运行。您无需手动清除浏览器缓存。`,
      id: `system-${Date.now()}`,
      isSystemMessage: true,
    };

    // 添加到聊天记录
    if (this.onAddEntry) {
      this.onAddEntry(updateEntry);
    }

    // 渲染消息
    if (this.onRenderEntry) {
      this.onRenderEntry(updateEntry, undefined, true);
    }
  }

  // 更新底部按钮状态
  updateFooterButtonsState(hasNotifications: boolean): void {
    const $wechatInput = $('#wechat-input-field');
    const $sendBtn = $('#send-btn');
    const $plusBtn = $('#plus-btn');

    const hasText = $wechatInput.val()?.toString().trim() !== '';
    const shouldShowSendBtn = hasText || hasNotifications;

    // 使用jQuery方法更新显示状态
    $sendBtn.css('display', shouldShowSendBtn ? 'flex' : 'none');
    $plusBtn.css('display', hasText ? 'none' : 'inline-block');
  }

  // 切换面板
  togglePanel(panelToShow: string | null): void {
    const $panelContainer = $('#panel-container');
    const $currentActivePanel = $('.panel-view.active');
    const isActive = $panelContainer.hasClass('active');

    if (isActive && $currentActivePanel.length && $currentActivePanel.attr('id')?.startsWith(panelToShow || '')) {
      $panelContainer.removeClass('active');
      $currentActivePanel.removeClass('active');
    } else if (panelToShow) {
      if ($currentActivePanel.length) $currentActivePanel.removeClass('active');
      $(`#${panelToShow}-panel`).addClass('active');
      if (!isActive) $panelContainer.addClass('active');
    } else {
      if (isActive) $panelContainer.removeClass('active');
      if ($currentActivePanel.length) $currentActivePanel.removeClass('active');
    }
  }

  // 导航到指定视图
  navigateTo(viewName: 'home' | 'wechat' | 'moments' | 'settings', onEnterMomentsView?: () => void): void {
    const views = {
      home: '#app-homescreen',
      wechat: '#wechat-view',
      moments: '#moments-view',
      settings: '#settings-view',
    };

    // 使用jQuery隐藏所有视图并显示目标视图
    $('.app-view').removeClass('active');
    $(views[viewName]).addClass('active');

    // 当导航到朋友圈视图时，执行回调
    if (viewName === 'moments' && onEnterMomentsView) {
      onEnterMomentsView();
    }
  }

  // 设置输入框提示文字
  setupInputPlaceholder(charDisplayName: string): void {
    const savedPlaceholder = this.configManager.getSavedInputPlaceholder();
    const $inputElement = $('#wechat-input-field');
    $inputElement.attr('placeholder', savedPlaceholder || `与 ${charDisplayName} 对话...`);
    $inputElement.prop('disabled', false);
  }

  // 设置手机尺寸调整
  setupPhoneSizeAdjustment(): void {
    const defaultBtn = document.getElementById('phone-size-default');
    const mediumBtn = document.getElementById('phone-size-medium');
    const smallBtn = document.getElementById('phone-size-small');
    const phoneScreen = document.querySelector('.phone-screen') as HTMLElement;

    if (!defaultBtn || !mediumBtn || !smallBtn || !phoneScreen) {
      console.error('[BLMX] Phone size adjustment elements not found');
      return;
    }

    // 应用保存的尺寸设置
    const savedSize = this.configManager.getPhoneSize();
    this.applyPhoneSize(savedSize, phoneScreen, [defaultBtn, mediumBtn, smallBtn]);

    // 设置按钮点击事件
    defaultBtn.addEventListener('click', () => {
      this.applyPhoneSize('default', phoneScreen, [defaultBtn, mediumBtn, smallBtn]);
    });

    mediumBtn.addEventListener('click', () => {
      this.applyPhoneSize('medium', phoneScreen, [defaultBtn, mediumBtn, smallBtn]);
    });

    smallBtn.addEventListener('click', () => {
      this.applyPhoneSize('small', phoneScreen, [defaultBtn, mediumBtn, smallBtn]);
    });
  }

  // 设置表情包尺寸控制
  setupStickerSizeControl(): void {
    const sizeSlider = document.getElementById('sticker-size-slider') as HTMLInputElement;
    const sizeInput = document.getElementById('sticker-size-input') as HTMLInputElement;
    const smallSizeBtn = document.getElementById('sticker-size-small');
    const mediumSizeBtn = document.getElementById('sticker-size-medium');

    if (!sizeSlider || !sizeInput || !smallSizeBtn || !mediumSizeBtn) {
      return;
    }

    // 获取保存的尺寸设置
    const savedSize = this.configManager.getStickerSize();

    // 初始化控件值
    sizeSlider.value = savedSize.toString();
    sizeInput.value = savedSize.toString();

    // 设置初始按钮状态
    if (savedSize === 80) {
      smallSizeBtn.classList.add('sticker-size-active');
      mediumSizeBtn.classList.remove('sticker-size-active');
    } else if (savedSize === 120) {
      smallSizeBtn.classList.remove('sticker-size-active');
      mediumSizeBtn.classList.add('sticker-size-active');
    } else {
      smallSizeBtn.classList.remove('sticker-size-active');
      mediumSizeBtn.classList.remove('sticker-size-active');
    }

    // 设置CSS变量
    this.applyStickerSize(savedSize);

    // 滑块事件
    sizeSlider.addEventListener('input', () => {
      const newSize = parseInt(sizeSlider.value);
      sizeInput.value = newSize.toString();
      this.configManager.setStickerSize(newSize);
      this.applyStickerSize(newSize);

      // 更新按钮状态
      this.updateStickerSizeButtonState(newSize, smallSizeBtn, mediumSizeBtn);
    });

    // 数字输入框事件
    sizeInput.addEventListener('change', () => {
      let newSize = parseInt(sizeInput.value);
      // 限制范围
      if (newSize < 40) newSize = 40;
      if (newSize > 200) newSize = 200;

      const newSizeStr = newSize.toString();
      sizeInput.value = newSizeStr;
      sizeSlider.value = newSizeStr;
      this.configManager.setStickerSize(newSize);
      this.applyStickerSize(newSize);

      // 更新按钮状态
      this.updateStickerSizeButtonState(newSize, smallSizeBtn, mediumSizeBtn);
    });

    // 小尺寸按钮事件
    smallSizeBtn.addEventListener('click', () => {
      this.setStickerSize(80, sizeSlider, sizeInput, smallSizeBtn, mediumSizeBtn);
    });

    // 中尺寸按钮事件
    mediumSizeBtn.addEventListener('click', () => {
      this.setStickerSize(120, sizeSlider, sizeInput, smallSizeBtn, mediumSizeBtn);
    });
  }

  // 应用手机尺寸设置
  private applyPhoneSize(size: 'default' | 'medium' | 'small', phoneScreen: HTMLElement, buttons: HTMLElement[]): void {
    // 手机尺寸常量
    const PHONE_SIZES = {
      default: '48.75rem', // 默认尺寸: 48.75rem (780px)
      medium: '42rem', // 中等尺寸: 42rem (672px)
      small: '36rem', // 小尺寸: 36rem (576px)
    };

    // 设置屏幕高度
    phoneScreen.style.height = PHONE_SIZES[size];

    // 保存设置
    this.configManager.setPhoneSize(size);

    // 更新按钮样式
    buttons.forEach(btn => btn.classList.remove('phone-size-active'));

    // 根据选择的尺寸激活对应按钮
    if (size === 'default') {
      buttons[0].classList.add('phone-size-active');
    } else if (size === 'medium') {
      buttons[1].classList.add('phone-size-active');
    } else if (size === 'small') {
      buttons[2].classList.add('phone-size-active');
    }
  }

  // 应用表情包尺寸
  private applyStickerSize(size: number): void {
    document.documentElement.style.setProperty('--sticker-size', `${size}px`);
  }

  // 设置表情包尺寸
  private setStickerSize(
    size: number,
    sizeSlider: HTMLInputElement,
    sizeInput: HTMLInputElement,
    smallSizeBtn: HTMLElement,
    mediumSizeBtn: HTMLElement,
  ): void {
    sizeSlider.value = size.toString();
    sizeInput.value = size.toString();
    this.configManager.setStickerSize(size);
    this.applyStickerSize(size);

    this.updateStickerSizeButtonState(size, smallSizeBtn, mediumSizeBtn);
  }

  // 更新表情包尺寸按钮状态
  private updateStickerSizeButtonState(size: number, smallSizeBtn: HTMLElement, mediumSizeBtn: HTMLElement): void {
    if (size === 80) {
      smallSizeBtn.classList.add('sticker-size-active');
      mediumSizeBtn.classList.remove('sticker-size-active');
    } else if (size === 120) {
      smallSizeBtn.classList.remove('sticker-size-active');
      mediumSizeBtn.classList.add('sticker-size-active');
    } else {
      smallSizeBtn.classList.remove('sticker-size-active');
      mediumSizeBtn.classList.remove('sticker-size-active');
    }
  }

  // 滚动到聊天底部
  scrollToBottom(): void {
    setTimeout(() => {
      const wechatBody = document.querySelector('.wechat-body') as HTMLElement;
      if (wechatBody) {
        wechatBody.scrollTop = wechatBody.scrollHeight;
      }
    }, 300);
  }

  // 设置字体选择功能
  setupFontSelection(): void {
    const $customFontBtn = $('#font-default');
    const $systemFontBtn = $('#font-system');

    if (!$customFontBtn.length || !$systemFontBtn.length) {
      return;
    }

    // 从localStorage读取保存的字体设置
    const savedFont = localStorage.getItem('blmx_font_setting') || 'custom';
    this.applyFontSetting(savedFont as 'custom' | 'system');

    // 绑定点击事件
    $customFontBtn.on('click', () => {
      this.applyFontSetting('custom');
      localStorage.setItem('blmx_font_setting', 'custom');
    });

    $systemFontBtn.on('click', () => {
      this.applyFontSetting('system');
      localStorage.setItem('blmx_font_setting', 'system');
    });
  }

  // 应用字体设置
  private applyFontSetting(fontType: 'custom' | 'system'): void {
    const $body = $('body');
    const $customBtn = $('#font-default');
    const $systemBtn = $('#font-system');

    // 移除所有按钮的激活状态
    $('.font-btn').removeClass('font-active');

    if (fontType === 'custom') {
      // 使用自定义字体 - 改进兼容性
      this.applyCustomFont();
      $customBtn.addClass('font-active');
    } else {
      // 使用系统字体 - 改进兼容性
      this.applySystemFont();
      $systemBtn.addClass('font-active');
    }
  }

  // 应用自定义字体的兼容性方法
  private applyCustomFont(): void {
    const $body = $('body');

    // 检测特殊WebView环境
    const isIOSWebView = /iPhone|iPad|iPod/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
    const isHuaweiWebView = /HUAWEI/.test(navigator.userAgent);

    if (isIOSWebView || isHuaweiWebView) {
      // 对于问题WebView，使用更简单的方法
      // 直接设置字体，不依赖Font Loading API
      const fontStack =
        "'MyCustomFont', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
      $body.css('font-family', fontStack);

      // 强制重新渲染
      $body.addClass('force-font-refresh');
      setTimeout(() => {
        $body.removeClass('force-font-refresh');
      }, 50);

      // 延迟再次应用，确保生效
      setTimeout(() => {
        $body.css('font-family', fontStack);
      }, 100);

      return;
    }

    // 对于正常浏览器，使用标准方法
    this.checkFontLoaded('MyCustomFont').then(loaded => {
      if (loaded) {
        // 字体已加载，直接应用
        $body.css('font-family', "'MyCustomFont', 'Noto Sans SC', sans-serif");
      } else {
        // 字体未加载，尝试加载后再应用
        this.loadCustomFont()
          .then(() => {
            $body.css('font-family', "'MyCustomFont', 'Noto Sans SC', sans-serif");
          })
          .catch(() => {
            // 加载失败，使用备用字体
            $body.css('font-family', "'Noto Sans SC', sans-serif");
          });
      }
    });
  }

  // 应用系统字体的兼容性方法
  private applySystemFont(): void {
    const $body = $('body');

    // 检测特殊WebView环境
    const isIOSWebView = /iPhone|iPad|iPod/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent);
    const isHuaweiWebView = /HUAWEI/.test(navigator.userAgent);

    let fontStack: string;

    if (isIOSWebView) {
      // iOS WebView 优化字体栈
      fontStack = '-apple-system, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
    } else if (isHuaweiWebView) {
      // 华为 WebView 优化字体栈
      fontStack = '"HarmonyOS Sans", "Noto Sans SC", "Microsoft YaHei", Arial, sans-serif';
    } else {
      // 通用系统字体栈
      fontStack =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
    }

    $body.css('font-family', fontStack);

    // 对于问题WebView，强制重新渲染
    if (isIOSWebView || isHuaweiWebView) {
      $body.addClass('force-font-refresh');
      setTimeout(() => {
        $body.removeClass('force-font-refresh');
      }, 50);
    }
  }

  // 检查字体是否已加载
  private checkFontLoaded(fontFamily: string): Promise<boolean> {
    return new Promise(resolve => {
      if (!document.fonts) {
        // 不支持Font Loading API，假设已加载
        resolve(true);
        return;
      }

      document.fonts.ready
        .then(() => {
          const fontFace = Array.from(document.fonts).find(
            font => font.family === fontFamily || font.family === `'${fontFamily}'`,
          );
          resolve(!!fontFace && fontFace.status === 'loaded');
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  // 加载自定义字体
  private loadCustomFont(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!document.fonts) {
        // 不支持Font Loading API，使用传统方法
        const testElement = $('<div>')
          .css({
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            fontSize: '72px',
            fontFamily: "'MyCustomFont', monospace",
            visibility: 'hidden',
          })
          .text('test')
          .appendTo('body');

        // 等待一段时间后检查
        setTimeout(() => {
          testElement.remove();
          resolve();
        }, 1000);
        return;
      }

      const fontFace = new FontFace('MyCustomFont', 'url(https://files.catbox.moe/er4wsg.ttf)');

      fontFace
        .load()
        .then(loadedFace => {
          document.fonts.add(loadedFace);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // 设置全屏模式手机大小调整
  setupFullscreenSizeAdjustment(): void {
    // 等待DOM完全加载
    setTimeout(() => {
      const $defaultBtn = $('#fullscreen-size-default');
      const $largeBtn = $('#fullscreen-size-large');
      const $xlargeBtn = $('#fullscreen-size-xlarge');
      const $slider = $('#fullscreen-size-slider');
      const $input = $('#fullscreen-size-input');

      if (!$defaultBtn.length || !$largeBtn.length || !$xlargeBtn.length || !$slider.length || !$input.length) {
        return;
      }

      this.initializeFullscreenSizeControls($defaultBtn, $largeBtn, $xlargeBtn, $slider, $input);
    }, 100);
  }

  // 初始化全屏大小控件
  private initializeFullscreenSizeControls(
    $defaultBtn: JQuery,
    $largeBtn: JQuery,
    $xlargeBtn: JQuery,
    $slider: JQuery,
    $input: JQuery,
  ): void {
    // 从localStorage读取保存的全屏大小设置
    const savedSize = this.configManager.getFullscreenSize();

    // 初始化控件值
    $slider.val(savedSize);
    $input.val(savedSize);
    this.applyFullscreenSize(savedSize);
    this.updateFullscreenSizeButtonState(savedSize);

    // 预设按钮点击事件
    $defaultBtn.off('click').on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.setFullscreenSize(100);
    });

    $largeBtn.off('click').on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.setFullscreenSize(130);
    });

    $xlargeBtn.off('click').on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.setFullscreenSize(160);
    });

    // 滑块事件
    $slider.off('input').on('input', e => {
      const newSize = parseInt($(e.target).val() as string);
      $input.val(newSize);
      this.setFullscreenSize(newSize);
    });

    // 数字输入框事件
    $input.off('change').on('change', e => {
      let newSize = parseInt($(e.target).val() as string);
      // 限制范围
      if (newSize < 50) newSize = 50;
      if (newSize > 200) newSize = 200;

      $input.val(newSize);
      $slider.val(newSize);
      this.setFullscreenSize(newSize);
    });

    // 监听全屏状态变化
    this.setupFullscreenListener();
  }

  // 设置全屏状态监听器
  private setupFullscreenListener(): void {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFullscreen) {
        // 退出全屏时重置缩放
        this.resetBrowserZoom();
      } else {
        // 进入全屏时应用当前设置
        const currentSize = this.configManager.getFullscreenSize();
        this.applyBrowserLikeZoom(currentSize / 100);
      }
    };

    // 绑定全屏状态变化事件
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  }

  // 重置浏览器缩放
  private resetBrowserZoom(): void {
    const body = document.body;

    // 重置所有缩放相关样式
    body.style.transform = '';
    body.style.transformOrigin = '';
    body.style.position = '';
    body.style.width = '';
    body.style.height = '';
    body.style.margin = '';
  }

  // 设置全屏大小并更新UI
  private setFullscreenSize(size: number): void {
    // 保存设置
    this.configManager.setFullscreenSize(size);

    // 更新滑块和输入框
    $('#fullscreen-size-slider').val(size);
    $('#fullscreen-size-input').val(size);

    // 应用设置
    this.applyFullscreenSize(size);

    // 更新按钮状态
    this.updateFullscreenSizeButtonState(size);
  }

  // 应用全屏模式手机大小设置
  private applyFullscreenSize(size: number): void {
    const scale = size / 100;

    // 检查当前是否在全屏模式
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isFullscreen) {
      // 在全屏模式下应用浏览器级别的缩放
      this.applyBrowserLikeZoom(scale);
    }
    // 删除非全屏模式下的临时预览功能
  }

  // 应用类似浏览器的缩放效果
  private applyBrowserLikeZoom(scale: number): void {
    const body = document.body;

    if (scale !== 1) {
      body.style.transform = `scale(${scale})`;
      body.style.transformOrigin = 'center center';
      body.style.position = 'relative';
      body.style.width = `${100 / scale}%`;
      body.style.height = `${100 / scale}%`;
      body.style.margin = '0 auto';
    } else {
      body.style.transform = '';
      body.style.transformOrigin = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
      body.style.margin = '';
    }
  }

  // 更新按钮状态
  private updateFullscreenSizeButtonState(size: number): void {
    // 移除所有按钮的激活状态
    $('.fullscreen-size-btn').removeClass('fullscreen-size-active');

    // 根据大小激活对应按钮
    if (size === 100) {
      $('#fullscreen-size-default').addClass('fullscreen-size-active');
    } else if (size === 130) {
      $('#fullscreen-size-large').addClass('fullscreen-size-active');
    } else if (size === 160) {
      $('#fullscreen-size-xlarge').addClass('fullscreen-size-active');
    }
    // 自定义大小不激活任何预设按钮
  }
}
