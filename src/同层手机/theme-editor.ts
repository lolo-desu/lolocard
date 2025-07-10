// 主题编辑器模块 - 重构版本
// 使用jQuery和lodash确保兼容性和稳定性
import { Theme, ThemeManager } from './theme-manager';

export class ThemeEditor {
  private themeManager: ThemeManager;
  private onThemeChanged?: () => void;
  private $modal: JQuery<HTMLElement>;
  private checkboxHandlers: Map<string, (e: JQuery.ClickEvent) => void> = new Map();

  constructor(themeManager: ThemeManager, onThemeChanged?: () => void) {
    this.themeManager = themeManager;
    this.onThemeChanged = onThemeChanged;
    this.$modal = $('#theme-editor-modal');
  }

  // 设置主题选择器 - 使用jQuery重构
  setupThemeSelector(): void {
    const $container = $('.theme-options');
    if (!$container.length) return;

    // 清空现有内容
    $container.empty();

    // 获取所有默认主题
    const themes = this.themeManager.getThemes();

    // 使用lodash遍历主题
    _.forEach(themes, theme => {
      const $themeButton = $('<div>').addClass('theme-option').css({
        width: 'calc(50% - 0.5rem)',
        'aspect-ratio': '1/1',
        'border-radius': '8px',
        'background-color': theme.colors.primary,
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
      });

      // 添加主题预览
      const $previewEl = $('<div>').css({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`,
      });

      // 添加气泡预览
      const $bubblePreview = $('<div>').css({
        position: 'relative',
        width: '70%',
        height: '60%',
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'space-between',
        'z-index': 1,
      });

      const $themBubble = $('<div>').css({
        'align-self': 'flex-start',
        width: '60%',
        height: '40%',
        'background-color': theme.colors.bubbleThemBg,
        'border-radius': '8px',
      });

      const $meBubble = $('<div>').css({
        'align-self': 'flex-end',
        width: '60%',
        height: '40%',
        'background-color': theme.colors.bubbleMeBg,
        'border-radius': '8px',
      });

      $bubblePreview.append($themBubble, $meBubble);

      // 添加主题名称
      const $nameEl = $('<div>').text(theme.displayName).css({
        position: 'relative',
        color: 'white',
        'font-size': '0.8rem',
        'font-weight': '500',
        'margin-top': '5px',
        'text-shadow': '0 1px 2px rgba(0,0,0,0.3)',
        'z-index': 1,
      });

      $themeButton.append($previewEl, $bubblePreview, $nameEl);

      // 添加点击事件
      $themeButton.on('click', () => {
        this.themeManager.switchTheme(theme.name);
        // 通知主题已更改
        if (this.onThemeChanged) {
          this.onThemeChanged();
        }
      });

      $container.append($themeButton);
    });

    // 添加自定义主题选择按钮（正方形，用于切换主题）
    this.addCustomThemeSelector($container);
  }

  // 添加自定义主题编辑按钮（长方形，用于打开编辑器）
  addCustomThemeEditButton(): void {
    // 查找设置面板中的按钮容器
    const $settingsPanel = $('.settings-panel');
    if (!$settingsPanel.length) return;

    // 创建长方形的编辑按钮
    const $editButton = $('<div>').addClass('custom-theme-edit-button').css({
      width: '100%',
      padding: '12px 16px',
      margin: '8px 0',
      'border-radius': '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      'font-size': '0.9rem',
      'font-weight': '500',
      'text-align': 'center',
      cursor: 'pointer',
      'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      gap: '8px',
    });

    const $icon = $('<span>').html('🎨');
    const $text = $('<span>').text('自定义主题设置');

    $editButton.append($icon, $text);

    // 添加悬停效果
    $editButton
      .on('mouseenter', function () {
        $(this).css('transform', 'translateY(-1px)');
      })
      .on('mouseleave', function () {
        $(this).css('transform', 'translateY(0)');
      });

    // 添加点击事件
    $editButton.on('click', () => {
      this.openThemeEditor();
    });

    // 将按钮添加到设置面板的适当位置
    // 查找主题选择器容器，在其后添加编辑按钮
    const $themeOptions = $settingsPanel.find('.theme-options');
    if ($themeOptions.length) {
      $themeOptions.after($editButton);
    } else {
      $settingsPanel.append($editButton);
    }
  }

  // 添加自定义主题选择按钮（正方形，用于切换到自定义主题）
  private addCustomThemeSelector($container: JQuery<HTMLElement>): void {
    // 获取自定义主题数据
    const customThemeData = this.getCustomThemeData();

    const $customButton = $('<div>').addClass('theme-option custom-theme-option').css({
      width: 'calc(50% - 0.5rem)',
      'aspect-ratio': '1/1',
      'border-radius': '8px',
      background: customThemeData.background,
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
    });

    // 添加渐变背景预览（类似其他主题按钮）
    const $previewEl = $('<div>').css({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: customThemeData.gradient,
    });

    const $iconEl = $('<div>').html('✨').css({
      'font-size': '2rem',
      'margin-bottom': '5px',
      position: 'relative',
      'z-index': 1,
    });

    const $nameEl = $('<div>').text(customThemeData.displayName).css({
      color: 'white',
      'font-size': '0.8rem',
      'font-weight': '500',
      'text-shadow': '0 1px 2px rgba(0,0,0,0.3)',
      position: 'relative',
      'z-index': 1,
    });

    $customButton.append($previewEl, $iconEl, $nameEl);

    $customButton.on('click', () => {
      // 切换到自定义主题
      this.themeManager.switchTheme('custom');
      // 通知主题已更改
      if (this.onThemeChanged) {
        this.onThemeChanged();
      }
    });

    $container.append($customButton);
  }

  // 获取自定义主题数据（名称和颜色）
  private getCustomThemeData(): { displayName: string; background: string; gradient: string } {
    try {
      const customThemeJson = localStorage.getItem('blmx_custom_theme');
      if (customThemeJson) {
        const customTheme = JSON.parse(customThemeJson);
        const primaryColor = customTheme.colors?.primary || '#667eea';
        const gradientStart = customTheme.colors?.gradientStart || primaryColor;
        const gradientEnd = customTheme.colors?.gradientEnd || primaryColor;

        return {
          displayName: customTheme.displayName || '自定义主题',
          background: primaryColor,
          gradient: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        };
      }
    } catch (error) {
      console.warn('Failed to load custom theme data:', error);
    }

    // 默认值
    return {
      displayName: '自定义主题',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };
  }

  // 更新自定义主题按钮的显示（公共方法）
  updateCustomThemeButton(): void {
    const $customButton = $('.custom-theme-option');
    if (!$customButton.length) return;

    const customThemeData = this.getCustomThemeData();

    // 更新背景渐变预览层
    const $previewEl = $customButton.children().eq(0); // 第一个子元素是预览层
    if ($previewEl.length) {
      $previewEl.css('background', customThemeData.gradient);
    }

    // 更新主题名称（最后一个子元素）
    const $nameEl = $customButton.children().last();
    if ($nameEl.length && $nameEl.text() !== customThemeData.displayName) {
      $nameEl.text(customThemeData.displayName);
    }

    // 更新按钮整体背景色
    $customButton.css('background', customThemeData.background);
  }

  // 打开主题编辑器 - 使用jQuery重构
  openThemeEditor(): void {
    if (!this.$modal.length) return;

    // 获取当前主题的实际应用数据（包括动态计算的值）
    const currentTheme = this.themeManager.getCurrentThemeWithAppliedValues();
    this.fillThemeEditor(currentTheme);

    // 设置checkbox事件监听器
    this.setupCheckboxes();

    // 显示模态框
    this.$modal.show();
  }

  // 关闭主题编辑器 - 使用jQuery重构
  closeThemeEditor(): void {
    this.$modal.hide();
    // 清理checkbox事件监听器
    this.cleanupCheckboxes();
  }

  // 填充主题编辑器 - 使用jQuery重构
  private fillThemeEditor(theme: Theme): void {
    // 使用jQuery选择器，更简洁
    const $nameInput = $('#theme-name-input');
    const $darkModeToggle = $('#dark-mode-toggle');
    const $singleColorIconsToggle = $('#single-color-icons-toggle');

    // 填充主题名称 - 修复：保持用户自定义的名称
    let themeName: string;
    if (theme.name === 'custom') {
      // 如果是自定义主题，使用用户保存的displayName
      themeName = theme.displayName || '我的自定义主题';
    } else {
      // 如果是基于其他主题的自定义，使用"自定义 + 原主题名"格式
      themeName = `自定义 ${theme.displayName}`;
    }
    $nameInput.val(themeName);

    // 定义颜色字段映射 - 使用lodash简化数据处理
    const colorMappings = {
      '#phone-frame-color': theme.colors.phoneFrame,
      '#primary-color': theme.colors.primary,
      '#light-color': theme.colors.light,
      '#ultra-light-color': theme.colors.ultraLight,
      '#deep-color': theme.colors.deep,
      '#text-primary-color': theme.colors.textPrimary,
      '#text-secondary-color': theme.colors.textSecondary,
      '#bubble-me-color': theme.colors.bubbleMeBg,
      '#bubble-me-text-color': theme.colors.bubbleMeText,
      '#bubble-them-color': theme.colors.bubbleThemBg,
      '#bubble-them-text-color': theme.colors.bubbleThemText,
      '#status-bar-color': theme.colors.statusBarColor,
      '#dynamic-island-color': theme.colors.dynamicIslandColor,
      '#border-color': theme.colors.borderColor,
      '#shadow-color': theme.colors.shadowColor,
    };

    // 使用lodash的forEach批量设置颜色值
    _.forEach(colorMappings, (colorValue, selector) => {
      $(selector).val(this.convertToHex(colorValue));
    });

    // 设置checkbox状态
    $darkModeToggle.prop('checked', theme.colors.isDarkMode);
    $singleColorIconsToggle.prop('checked', theme.colors.useSingleColorIcons || false);

    // 注意：checkbox的事件监听器和初始状态在openThemeEditor()中的setupCheckboxes()里设置
  }

  // 设置checkbox事件监听器 - 使用jQuery重构
  private setupCheckboxes(): void {
    // 清理之前的事件监听器
    this.cleanupCheckboxes();

    // 设置夜间模式checkbox
    this.setupSingleCheckboxWithJQuery('dark-mode-toggle', 'dark-mode-checkbox-button');

    // 设置单一颜色图标checkbox
    this.setupSingleCheckboxWithJQuery('single-color-icons-toggle', 'single-color-icons-checkbox-button');
  }

  // 清理checkbox事件监听器
  private cleanupCheckboxes(): void {
    // 移除所有存储的事件处理器
    this.checkboxHandlers.forEach((handler, id) => {
      $(`#${id}`).off('click', handler);
    });
    this.checkboxHandlers.clear();
  }

  // 使用jQuery设置单个checkbox
  private setupSingleCheckboxWithJQuery(checkboxId: string, buttonId: string): void {
    const $checkbox = $(`#${checkboxId}`);
    const $button = $(`#${buttonId}`);

    if (!$checkbox.length || !$button.length) return;

    // 更新checkbox按钮状态的函数
    const updateCheckboxState = (checked: boolean) => {
      $button.toggleClass('checked', checked);
    };

    // 点击事件处理函数
    const handleClick = (e: JQuery.ClickEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const checkbox = $checkbox[0] as HTMLInputElement;
      checkbox.checked = !checkbox.checked;
      updateCheckboxState(checkbox.checked);
    };

    // 存储事件处理器以便后续清理
    this.checkboxHandlers.set(buttonId, handleClick);

    // 添加点击事件监听器
    $button.on('click', handleClick);

    // 设置初始状态
    const checkbox = $checkbox[0] as HTMLInputElement;
    updateCheckboxState(checkbox.checked);
  }

  // 重置主题编辑器
  resetThemeEditor(): void {
    // 使用蓝色主题重置编辑器
    const blueTheme = this.themeManager.getThemes().blue;
    this.fillThemeEditor(blueTheme);

    // 重新设置事件监听器，确保按钮能正常工作
    this.setupCheckboxes();
  }

  // 导出主题为JSON - 修复：包含实际壁纸设置和正确文件名
  exportThemeAsJSON(): void {
    try {
      const currentTheme = this.getCurrentThemeFromEditor();
      const wallpaperManager = this.themeManager.getWallpaperManager();

      // 获取当前实际使用的壁纸设置
      const currentWallpapers = {
        chat: wallpaperManager.getCurrentWallpaper('chat'),
        home: wallpaperManager.getCurrentWallpaper('home'),
        settings: wallpaperManager.getCurrentWallpaper('settings'),
      };

      // 构建导出数据，包含壁纸信息
      const themeData = {
        name: currentTheme.name,
        displayName: currentTheme.displayName,
        version: '1.0',
        exportDate: new Date().toISOString(),
        colors: currentTheme.colors,
        wallpapers: currentWallpapers, // 包含实际使用的壁纸
      };

      const jsonString = JSON.stringify(themeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // 生成文件名：custom-主题名字.json
      const themeName = currentTheme.displayName || '自定义主题';
      const safeThemeName = themeName.replace(/[<>:"/\\|?*]/g, '_'); // 替换文件名中的非法字符
      const fileName = `custom-${safeThemeName}.json`;

      // 使用jQuery创建下载链接
      const $a = $('<a>', {
        href: url,
        download: fileName,
        css: { display: 'none' },
      });
      $('body').append($a);
      $a[0].click();
      $a.remove();
      URL.revokeObjectURL(url);

      console.log(`[ThemeEditor] 主题已导出为JSON: ${fileName}`);
    } catch (error) {
      console.error('[ThemeEditor] 导出JSON失败:', error);
      alert('导出失败，请重试');
    }
  }

  // 导入主题文件
  importTheme(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', event => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          let themeData;

          if (file.name.endsWith('.json')) {
            themeData = JSON.parse(content);
          } else {
            throw new Error('只支持JSON格式的主题文件');
          }

          // 验证主题数据
          if (!this.validateThemeData(themeData)) {
            throw new Error('主题文件格式不正确');
          }

          // 应用导入的主题
          this.applyImportedTheme(themeData);
          console.log('[ThemeEditor] 主题导入成功');
          alert('主题导入成功！');
        } catch (error) {
          console.error('[ThemeEditor] 导入失败:', error);
          alert(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      };

      reader.readAsText(file);
    });

    // 使用jQuery操作DOM
    $('body').append(input);
    input.click();
    $(input).remove();
  }

  // 从编辑器获取当前主题 - 使用jQuery重构
  private getCurrentThemeFromEditor(): Theme {
    // 使用jQuery获取值，更简洁
    const getValue = (selector: string, defaultValue: string = '') => ($(selector).val() as string) || defaultValue;
    const getChecked = (selector: string) => $(selector).prop('checked') as boolean;

    return this.createCustomTheme({
      name: getValue('#theme-name-input', '自定义主题'),
      phoneFrame: getValue('#phone-frame-color', '#b4d0fa'),
      primary: getValue('#primary-color', '#72adf3'),
      light: getValue('#light-color', '#a8cbeb'),
      ultraLight: getValue('#ultra-light-color', '#e8f4fd'),
      deep: getValue('#deep-color', '#2c5282'),
      textPrimary: getValue('#text-primary-color', 'rgb(139, 162, 186)'),
      textSecondary: getValue('#text-secondary-color', '#64748b'),
      bubbleMeBg: getValue('#bubble-me-color', '#a8cbeb'),
      bubbleMeText: getValue('#bubble-me-text-color', '#ffffff'),
      bubbleThemBg: getValue('#bubble-them-color', '#ffffff'),
      bubbleThemText: getValue('#bubble-them-text-color', '#72adf3'),
      appBgColor: '#ffffff',
      settingsBgColor: '#f2f2f7',
      settingsCardBgColor: '#ffffff',
      statusBar: getValue('#status-bar-color', '#428af2'),
      dynamicIsland: getValue('#dynamic-island-color', '#a0c4f4'),
      border: getValue('#border-color', '#E0E0E0'),
      shadow: getValue('#shadow-color', '#4a90e2'),
      isDarkMode: getChecked('#dark-mode-toggle'),
      useSingleColorIcons: getChecked('#single-color-icons-toggle'),
    });
  }

  // 保存自定义主题 - 使用jQuery重构
  saveCustomTheme(): void {
    // 直接使用getCurrentThemeFromEditor方法，避免重复代码
    const customTheme = this.getCurrentThemeFromEditor();

    // 保存并应用主题
    this.themeManager.saveCustomTheme(customTheme);
    this.themeManager.switchTheme('custom');

    // 更新自定义主题按钮的显示
    this.updateCustomThemeButton();

    // 关闭编辑器
    this.closeThemeEditor();

    // 通知主题已更改
    if (this.onThemeChanged) {
      this.onThemeChanged();
    }
  }

  // 创建自定义主题
  private createCustomTheme(params: {
    name: string;
    phoneFrame: string;
    primary: string;
    light: string;
    ultraLight: string;
    deep: string;
    textPrimary: string;
    textSecondary: string;
    bubbleMeBg: string;
    bubbleMeText: string;
    bubbleThemBg: string;
    bubbleThemText: string;
    appBgColor: string;
    settingsBgColor: string;
    settingsCardBgColor: string;
    statusBar: string;
    dynamicIsland: string;
    border: string;
    shadow: string;
    isDarkMode: boolean;
    useSingleColorIcons: boolean;
  }): Theme {
    const {
      name,
      phoneFrame,
      primary,
      light,
      ultraLight,
      deep,
      textPrimary,
      textSecondary,
      bubbleMeBg,
      bubbleMeText,
      bubbleThemBg,
      bubbleThemText,
      appBgColor,
      settingsBgColor,
      settingsCardBgColor,
      statusBar,
      dynamicIsland,
      border,
      shadow,
      isDarkMode,
      useSingleColorIcons,
    } = params;

    // 提取阴影颜色的RGB分量
    const r = parseInt(shadow.slice(1, 3), 16);
    const g = parseInt(shadow.slice(3, 5), 16);
    const b = parseInt(shadow.slice(5, 7), 16);
    const shadowColorRgba = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : `rgba(${r}, ${g}, ${b}, 0.3)`;
    const bubbleShadow = `0 2px 8px rgba(${r}, ${g}, ${b}, 0.15)`;

    // 渐变色
    const gradientStart = this.lightenDarkenColor(primary, 20);
    const gradientEnd = this.lightenDarkenColor(primary, -10);

    // 添加缺少的属性
    const soft = this.lightenDarkenColor(light, -10);
    const textColor = '#ffffff';
    const headerBg = isDarkMode
      ? 'linear-gradient(315deg, #333333 0%, #444444 100%)'
      : `linear-gradient(315deg, ${this.lightenDarkenColor(ultraLight, -5)} 0%, ${ultraLight} 100%)`;

    // 创建自定义主题
    const customTheme: Theme = {
      name: 'custom',
      displayName: name,
      colors: {
        phoneFrame: phoneFrame,
        phoneFrameGradient: [
          this.lightenDarkenColor(phoneFrame, -40),
          phoneFrame,
          this.lightenDarkenColor(phoneFrame, 20),
          this.lightenDarkenColor(phoneFrame, -40),
        ],
        primary: primary,
        light: light,
        ultraLight: ultraLight,
        soft: soft,
        deep: deep,
        textPrimary: textPrimary,
        textSecondary: textSecondary,
        textColor: textColor,
        bubbleMeBg,
        bubbleMeText,
        bubbleThemBg,
        bubbleThemText,
        headerBg,
        appBgColor,
        settingsBgColor,
        settingsCardBgColor,
        gradientStart,
        gradientEnd,
        statusBarColor: statusBar,
        dynamicIslandColor: dynamicIsland,
        borderColor: border,
        shadowColor: shadow,
        shadowColorRgba,
        bubbleShadow,
        isDarkMode,
        defaultWallpapers: {
          chat: isDarkMode
            ? 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_1.jpg'
            : 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_3.jpg',
          home: isDarkMode
            ? 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_1.jpg'
            : 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_2.jpg',
          settings: isDarkMode ? '#1a1a1a' : '#f2f7fd',
        },
        useSingleColorIcons,
      },
    };

    return customTheme;
  }

  // 颜色处理工具：调亮或调暗颜色
  private lightenDarkenColor(col: string, amt: number): string {
    let usePound = false;

    if (col[0] === '#') {
      col = col.slice(1);
      usePound = true;
    }

    const num = parseInt(col, 16);

    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
  }

  // 将颜色值转换为十六进制格式（用于颜色输入框）
  private convertToHex(color: string): string {
    // 如果已经是十六进制格式，直接返回
    if (color.startsWith('#')) {
      return color;
    }

    // 处理rgb()格式
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 处理rgba()格式（忽略alpha通道）
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // 如果无法识别格式，返回默认颜色
    console.warn(`[ThemeEditor] 无法转换颜色格式: ${color}`);
    return '#000000';
  }

  // 验证主题数据格式
  private validateThemeData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    // 检查必需的字段
    const requiredFields = ['name', 'colors'];
    for (const field of requiredFields) {
      if (!(field in data)) return false;
    }

    // 检查colors对象
    const colors = data.colors;
    if (!colors || typeof colors !== 'object') return false;

    // 检查必需的颜色字段
    const requiredColors = ['primary', 'phoneFrame', 'textPrimary', 'textSecondary'];
    for (const color of requiredColors) {
      if (!(color in colors)) return false;
    }

    return true;
  }

  // 应用导入的主题 - 使用jQuery重构
  private applyImportedTheme(themeData: any): void {
    // 填充主题名称
    $('#theme-name-input').val(themeData.displayName || themeData.name || '导入的主题');

    // 填充颜色字段 - 使用lodash简化映射
    const colorMappings = {
      '#phone-frame-color': themeData.colors.phoneFrame,
      '#primary-color': themeData.colors.primary,
      '#light-color': themeData.colors.light,
      '#ultra-light-color': themeData.colors.ultraLight,
      '#deep-color': themeData.colors.deep,
      '#text-primary-color': themeData.colors.textPrimary,
      '#text-secondary-color': themeData.colors.textSecondary,
      '#bubble-me-color': themeData.colors.bubbleMeBg,
      '#bubble-me-text-color': themeData.colors.bubbleMeText,
      '#bubble-them-color': themeData.colors.bubbleThemBg,
      '#bubble-them-text-color': themeData.colors.bubbleThemText,
      '#status-bar-color': themeData.colors.statusBarColor,
      '#dynamic-island-color': themeData.colors.dynamicIslandColor,
      '#border-color': themeData.colors.borderColor,
      '#shadow-color': themeData.colors.shadowColor,
    };

    // 使用lodash批量设置颜色值，并转换为十六进制格式
    _.forEach(colorMappings, (colorValue, selector) => {
      if (colorValue) {
        $(selector).val(this.convertToHex(colorValue));
      }
    });

    // 填充checkbox选项
    if ('isDarkMode' in themeData.colors) {
      $('#dark-mode-toggle').prop('checked', themeData.colors.isDarkMode);
    }

    if ('useSingleColorIcons' in themeData.colors) {
      $('#single-color-icons-toggle').prop('checked', themeData.colors.useSingleColorIcons);
    }

    // 处理壁纸信息（如果存在）
    if (themeData.wallpapers) {
      this.applyImportedWallpapers(themeData.wallpapers);
    }

    // 重新设置checkbox状态
    this.setupCheckboxes();
  }

  // 应用导入的壁纸设置
  private applyImportedWallpapers(wallpapers: any): void {
    try {
      const wallpaperManager = this.themeManager.getWallpaperManager();

      // 应用各个视图的壁纸
      const viewTypes: ('chat' | 'home' | 'settings')[] = ['chat', 'home', 'settings'];

      viewTypes.forEach(viewType => {
        const wallpaper = wallpapers[viewType];
        if (wallpaper) {
          // 设置壁纸到当前主题
          wallpaperManager.setWallpaper(viewType, wallpaper);
        }
      });

      console.log('[ThemeEditor] 壁纸设置已导入');
    } catch (error) {
      console.warn('[ThemeEditor] 导入壁纸设置失败:', error);
    }
  }
}
