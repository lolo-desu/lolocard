// 用户界面管理模块
// 负责导航、面板切换、尺寸调整、版本显示等UI相关功能

import { ConfigManager, PHONE_SIZES } from './config-manager';
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

    // 调试信息
    console.log('[BLMX] 更新按钮状态:', {
      hasText,
      hasPendingNotifications: hasNotifications,
      shouldShowSendBtn,
    });
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
      console.error('[BLMX] Sticker size control elements not found');
      return;
    }

    // 获取保存的尺寸设置
    const savedSize = this.configManager.getStickerSize();

    // 初始化控件值
    sizeSlider.value = savedSize.toString();
    sizeInput.value = savedSize.toString();

    // 设置初始按钮状态
    if (savedSize === 80) {
      smallSizeBtn.classList.add('phone-size-active');
      mediumSizeBtn.classList.remove('phone-size-active');
    } else if (savedSize === 120) {
      smallSizeBtn.classList.remove('phone-size-active');
      mediumSizeBtn.classList.add('phone-size-active');
    } else {
      smallSizeBtn.classList.remove('phone-size-active');
      mediumSizeBtn.classList.remove('phone-size-active');
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
      smallSizeBtn.classList.add('phone-size-active');
      mediumSizeBtn.classList.remove('phone-size-active');
    } else if (size === 120) {
      smallSizeBtn.classList.remove('phone-size-active');
      mediumSizeBtn.classList.add('phone-size-active');
    } else {
      smallSizeBtn.classList.remove('phone-size-active');
      mediumSizeBtn.classList.remove('phone-size-active');
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
}
