// 主题编辑器模块
// 负责主题编辑器、主题保存、颜色处理等功能

import { Theme, ThemeManager } from './theme-manager';

export class ThemeEditor {
  private themeManager: ThemeManager;
  private onThemeChanged?: () => void;

  constructor(themeManager: ThemeManager, onThemeChanged?: () => void) {
    this.themeManager = themeManager;
    this.onThemeChanged = onThemeChanged;
  }

  // 设置主题选择器
  setupThemeSelector(): void {
    const themeOptionsContainer = document.querySelector('.theme-options') as HTMLElement;
    if (!themeOptionsContainer) return;

    // 清空现有内容
    themeOptionsContainer.innerHTML = '';

    // 获取所有默认主题
    const themes = this.themeManager.getThemes();

    // 为每个主题创建选择按钮
    Object.values(themes).forEach(theme => {
      const themeButton = document.createElement('div');
      themeButton.className = 'theme-option';
      themeButton.style.cssText = `
        width: calc(50% - 0.5rem);
        aspect-ratio: 1/1;
        border-radius: 8px;
        background-color: ${theme.colors.primary};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `;

      // 添加主题预览
      const previewEl = document.createElement('div');
      previewEl.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd});
      `;

      // 添加气泡预览
      const bubblePreview = document.createElement('div');
      bubblePreview.style.cssText = `
        position: relative;
        width: 70%;
        height: 60%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 1;
      `;

      const themBubble = document.createElement('div');
      themBubble.style.cssText = `
        align-self: flex-start;
        width: 60%;
        height: 40%;
        background-color: ${theme.colors.bubbleThemBg};
        border-radius: 8px;
      `;

      const meBubble = document.createElement('div');
      meBubble.style.cssText = `
        align-self: flex-end;
        width: 60%;
        height: 40%;
        background-color: ${theme.colors.bubbleMeBg};
        border-radius: 8px;
      `;

      bubblePreview.appendChild(themBubble);
      bubblePreview.appendChild(meBubble);

      // 添加主题名称
      const nameEl = document.createElement('div');
      nameEl.textContent = theme.displayName;
      nameEl.style.cssText = `
        position: relative;
        color: white;
        font-size: 0.8rem;
        font-weight: 500;
        margin-top: 5px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        z-index: 1;
      `;

      themeButton.appendChild(previewEl);
      themeButton.appendChild(bubblePreview);
      themeButton.appendChild(nameEl);

      // 添加点击事件
      themeButton.addEventListener('click', () => {
        this.themeManager.switchTheme(theme.name);
        // 通知主题已更改
        if (this.onThemeChanged) {
          this.onThemeChanged();
        }
      });

      themeOptionsContainer.appendChild(themeButton);
    });

    // 添加自定义主题按钮
    this.addCustomThemeButton(themeOptionsContainer);
  }

  // 添加自定义主题按钮
  private addCustomThemeButton(container: HTMLElement): void {
    const customButton = document.createElement('div');
    customButton.className = 'theme-option custom-theme-option';
    customButton.style.cssText = `
      width: calc(50% - 0.5rem);
      aspect-ratio: 1/1;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const iconEl = document.createElement('div');
    iconEl.innerHTML = '✨';
    iconEl.style.cssText = `
      font-size: 2rem;
      margin-bottom: 5px;
    `;

    const nameEl = document.createElement('div');
    nameEl.textContent = '自定义主题';
    nameEl.style.cssText = `
      color: white;
      font-size: 0.8rem;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    `;

    customButton.appendChild(iconEl);
    customButton.appendChild(nameEl);

    customButton.addEventListener('click', () => {
      this.openThemeEditor();
    });

    container.appendChild(customButton);
  }

  // 打开主题编辑器
  openThemeEditor(): void {
    const modal = document.getElementById('theme-editor-modal') as HTMLElement;
    if (!modal) return;

    // 获取当前主题并填充编辑器
    const currentTheme = this.themeManager.getCurrentTheme();
    this.fillThemeEditor(currentTheme);

    // 显示模态框
    modal.style.display = 'block';
  }

  // 关闭主题编辑器
  closeThemeEditor(): void {
    const modal = document.getElementById('theme-editor-modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // 填充主题编辑器
  private fillThemeEditor(theme: Theme): void {
    // 获取所有输入元素
    const nameInput = document.getElementById('theme-name-input') as HTMLInputElement;
    const phoneFrameColor = document.getElementById('phone-frame-color') as HTMLInputElement;
    const primaryColor = document.getElementById('primary-color') as HTMLInputElement;
    const lightColor = document.getElementById('light-color') as HTMLInputElement;
    const ultraLightColor = document.getElementById('ultra-light-color') as HTMLInputElement;
    const deepColor = document.getElementById('deep-color') as HTMLInputElement;
    const textPrimaryColor = document.getElementById('text-primary-color') as HTMLInputElement;
    const textSecondaryColor = document.getElementById('text-secondary-color') as HTMLInputElement;
    const meBubbleBackgroundColor = document.getElementById('bubble-me-color') as HTMLInputElement;
    const meBubbleTextColor = document.getElementById('bubble-me-text-color') as HTMLInputElement;
    const themBubbleBackgroundColor = document.getElementById('bubble-them-color') as HTMLInputElement;
    const themBubbleTextColor = document.getElementById('bubble-them-text-color') as HTMLInputElement;
    const backgroundPrimaryColor = document.getElementById('ultra-light-color') as HTMLInputElement;
    const backgroundSecondaryColor = document.getElementById('deep-color') as HTMLInputElement;
    const borderColor = document.getElementById('border-color') as HTMLInputElement;
    const shadowColor = document.getElementById('shadow-color') as HTMLInputElement;
    const statusBarColor = document.getElementById('status-bar-color') as HTMLInputElement;
    const dynamicIslandColor = document.getElementById('dynamic-island-color') as HTMLInputElement;
    const darkModeToggle = document.getElementById('dark-mode-toggle') as HTMLInputElement;
    const singleColorIconsToggle = document.getElementById('single-color-icons-toggle') as HTMLInputElement;

    // 填充基本颜色
    if (nameInput) nameInput.value = theme.name === 'custom' ? '我的自定义主题' : `自定义 ${theme.displayName}`;
    if (phoneFrameColor) phoneFrameColor.value = theme.colors.phoneFrame;
    if (primaryColor) primaryColor.value = theme.colors.primary;
    if (lightColor) lightColor.value = theme.colors.light;
    if (ultraLightColor) ultraLightColor.value = theme.colors.ultraLight;
    if (deepColor) deepColor.value = theme.colors.deep;
    if (textPrimaryColor) textPrimaryColor.value = theme.colors.textPrimary;
    if (textSecondaryColor) textSecondaryColor.value = theme.colors.textSecondary;

    // 填充气泡颜色
    if (meBubbleBackgroundColor) meBubbleBackgroundColor.value = theme.colors.bubbleMeBg;
    if (meBubbleTextColor) meBubbleTextColor.value = theme.colors.bubbleMeText;
    if (themBubbleBackgroundColor) themBubbleBackgroundColor.value = theme.colors.bubbleThemBg;
    if (themBubbleTextColor) themBubbleTextColor.value = theme.colors.bubbleThemText;

    // 填充背景颜色 - 使用已有的颜色控件
    // 应用背景色和卡片背景色已经在基本颜色中设置了

    // 填充新增颜色控件
    if (statusBarColor) statusBarColor.value = theme.colors.statusBarColor;
    if (dynamicIslandColor) dynamicIslandColor.value = theme.colors.dynamicIslandColor;
    if (borderColor) borderColor.value = theme.colors.borderColor;
    if (shadowColor) shadowColor.value = theme.colors.shadowColor;

    if (darkModeToggle) darkModeToggle.checked = theme.colors.isDarkMode;

    // 填充单一颜色图标选项
    if (singleColorIconsToggle) singleColorIconsToggle.checked = theme.colors.useSingleColorIcons || false;
  }

  // 重置主题编辑器
  resetThemeEditor(): void {
    // 使用蓝色主题重置编辑器
    const blueTheme = this.themeManager.getThemes().blue;
    this.fillThemeEditor(blueTheme);
  }

  // 保存自定义主题
  saveCustomTheme(): void {
    const nameInput = document.getElementById('theme-name-input') as HTMLInputElement;
    const phoneFrameColor = document.getElementById('phone-frame-color') as HTMLInputElement;
    const primaryColor = document.getElementById('primary-color') as HTMLInputElement;
    const lightColor = document.getElementById('light-color') as HTMLInputElement;
    const ultraLightColor = document.getElementById('ultra-light-color') as HTMLInputElement;
    const deepColor = document.getElementById('deep-color') as HTMLInputElement;
    const textPrimaryColor = document.getElementById('text-primary-color') as HTMLInputElement;
    const textSecondaryColor = document.getElementById('text-secondary-color') as HTMLInputElement;
    const meBubbleBackgroundColor = document.getElementById('bubble-me-color') as HTMLInputElement;
    const meBubbleTextColor = document.getElementById('bubble-me-text-color') as HTMLInputElement;
    const themBubbleBackgroundColor = document.getElementById('bubble-them-color') as HTMLInputElement;
    const themBubbleTextColor = document.getElementById('bubble-them-text-color') as HTMLInputElement;
    const statusBarColor = document.getElementById('status-bar-color') as HTMLInputElement;
    const dynamicIslandColor = document.getElementById('dynamic-island-color') as HTMLInputElement;
    const borderColor = document.getElementById('border-color') as HTMLInputElement;
    const shadowColor = document.getElementById('shadow-color') as HTMLInputElement;
    const darkModeToggle = document.getElementById('dark-mode-toggle') as HTMLInputElement;
    const singleColorIconsToggle = document.getElementById('single-color-icons-toggle') as HTMLInputElement;

    // 提取颜色值
    const phoneFrame = phoneFrameColor?.value || '#000000';
    const primary = primaryColor?.value || '#007AFF';
    const light = lightColor?.value || '#E3F2FD';
    const ultraLight = ultraLightColor?.value || '#F8FBFF';
    const deep = deepColor?.value || '#0056CC';
    const textPrimary = textPrimaryColor?.value || '#000000';
    const textSecondary = textSecondaryColor?.value || '#666666';
    const bubbleMeBg = meBubbleBackgroundColor?.value || '#007AFF';
    const bubbleMeText = meBubbleTextColor?.value || '#FFFFFF';
    const bubbleThemBg = themBubbleBackgroundColor?.value || '#F0F0F0';
    const bubbleThemText = themBubbleTextColor?.value || '#000000';
    const appBgColor = ultraLight;
    const settingsBgColor = ultraLight;
    const settingsCardBgColor = '#FFFFFF';
    const statusBar = statusBarColor?.value || '#000000';
    const dynamicIsland = dynamicIslandColor?.value || '#000000';
    const border = borderColor?.value || '#E0E0E0';
    const shadow = shadowColor?.value || '#000000';
    const isDarkMode = darkModeToggle?.checked || false;
    const useSingleColorIcons = singleColorIconsToggle?.checked || false;

    // 创建自定义主题
    const customTheme = this.createCustomTheme({
      name: nameInput?.value || '自定义主题',
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
    });

    // 保存并应用主题
    this.themeManager.saveCustomTheme(customTheme);
    this.themeManager.switchTheme('custom');

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
}
