// 主题类型定义
export interface Theme {
  name: string;
  displayName: string;
  colors: {
    // 手机边框
    phoneFrame: string;
    phoneFrameGradient: string[];

    // 主要颜色
    primary: string;
    light: string;
    ultraLight: string;
    soft: string;
    deep: string;

    // 渐变色
    gradientStart: string;
    gradientEnd: string;

    // 文字颜色
    textColor: string;
    textPrimary: string;
    textSecondary: string;

    // 边框和阴影
    borderColor: string;
    bubbleShadow: string;

    // 气泡背景
    bubbleThemBg: string;
    bubbleMeBg: string;

    // 气泡文字颜色
    bubbleThemText: string;
    bubbleMeText: string;

    // 头部背景
    headerBg: string;

    // 新增：状态栏颜色
    statusBarColor: string;

    // 新增：灵动岛颜色
    dynamicIslandColor: string;

    // 新增：应用背景色
    appBgColor: string;

    // 新增：设置页面背景色
    settingsBgColor: string;

    // 新增：设置卡片背景色
    settingsCardBgColor: string;

    // 新增：阴影颜色
    shadowColor: string;
    shadowColorRgba: string;

    // 新增：是否是暗色主题
    isDarkMode: boolean;

    // 新增：默认壁纸
    defaultWallpapers: {
      chat: string; // 可以是颜色值或图片URL
      home: string;
      settings: string;
    };

    // 新增：是否使用单一颜色图标
    useSingleColorIcons?: boolean;
  };
}

// 当前应用版本
export const APP_VERSION = '1.1.0';

// 默认主题配置
export const THEMES: Record<string, Theme> = {
  blue: {
    name: 'blue',
    displayName: '蓝色主题',
    colors: {
      // 手机边框
      phoneFrame: '#b4d0fa',
      phoneFrameGradient: ['#4a95ed', '#98c2f5', '#accef2', '#4a95ed'],

      // 主要颜色
      primary: '#72adf3',
      light: '#a8cbeb',
      ultraLight: '#e8f4fd',
      soft: '#b8d4f0',
      deep: '#2c5282',

      // 渐变色
      gradientStart: '#98c2f5',
      gradientEnd: '#accef2',

      // 文字颜色
      textColor: '#ffffff',
      textPrimary: 'rgb(139, 162, 186)',
      textSecondary: '#64748b',

      // 边框和阴影
      borderColor: '#cbd5e1',
      bubbleShadow: '0 2px 8px rgba(74, 144, 226, 0.15)',

      // 气泡背景
      bubbleThemBg: '#ffffff',
      bubbleMeBg: '#a8cbeb',

      // 气泡文字颜色
      bubbleThemText: '#72adf3',
      bubbleMeText: '#ffffff',

      // 头部背景
      headerBg: 'linear-gradient(315deg, #eef4ff 0%, #f8faff 100%)',

      // 新增：状态栏颜色
      statusBarColor: '#428af2',

      // 新增：灵动岛颜色
      dynamicIslandColor: '#a0c4f4',

      // 新增：应用背景色
      appBgColor: '#ffffff',

      // 新增：设置页面背景色
      settingsBgColor: '#f2f2f7',

      // 新增：设置卡片背景色
      settingsCardBgColor: '#ffffff',

      // 新增：阴影颜色
      shadowColor: '#4a90e2',
      shadowColorRgba: 'rgba(74, 144, 226, 0.3)',

      // 新增：是否是暗色主题
      isDarkMode: false,

      // 新增：默认壁纸
      defaultWallpapers: {
        chat: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_3.jpg', // 更新为指定的蓝色主题壁纸
        home: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_2.jpg', // 更新为指定的蓝色主题壁纸
        settings: '#f2f7fd',
      },

      // 新增：是否使用单一颜色图标
      useSingleColorIcons: true,
    },
  },

  pink: {
    name: 'pink',
    displayName: '粉色主题',
    colors: {
      // 手机边框
      phoneFrame: '#fad0e8',
      phoneFrameGradient: ['#ed4a9e', '#f598c8', '#f2acce', '#ed4a9e'],

      // 主要颜色
      primary: '#f372ad',
      light: '#eba8cb',
      ultraLight: '#fde8f4',
      soft: '#f0b8d4',
      deep: '#822c5c',

      // 渐变色
      gradientStart: '#f598c8',
      gradientEnd: '#f2acce',

      // 文字颜色
      textColor: '#ffffff',
      textPrimary: 'rgb(186, 139, 162)',
      textSecondary: '#8b647a',

      // 边框和阴影
      borderColor: '#e1cbd5',
      bubbleShadow: '0 2px 8px rgba(226, 74, 144, 0.15)',

      // 气泡背景
      bubbleThemBg: '#ffffff',
      bubbleMeBg: '#eba8cb',

      // 气泡文字颜色
      bubbleThemText: '#f372ad',
      bubbleMeText: '#ffffff',

      // 头部背景
      headerBg: 'linear-gradient(315deg, #ffeeef 0%, #fff8fa 100%)',

      // 新增：状态栏颜色
      statusBarColor: '#ed72ad',

      // 新增：灵动岛颜色
      dynamicIslandColor: '#f4a0c4',

      // 新增：应用背景色
      appBgColor: '#ffffff',

      // 新增：设置页面背景色
      settingsBgColor: '#fff2f7',

      // 新增：设置卡片背景色
      settingsCardBgColor: '#ffffff',

      // 新增：阴影颜色
      shadowColor: '#e24a90',
      shadowColorRgba: 'rgba(226, 74, 144, 0.3)',

      // 新增：是否是暗色主题
      isDarkMode: false,

      // 新增：默认壁纸
      defaultWallpapers: {
        chat: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色星星_1.jpg', // 更新为指定的粉色主题壁纸
        home: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色格子_3.jpg', // 更新为指定的粉色主题壁纸
        settings: '#fdf2f7',
      },

      // 新增：是否使用单一颜色图标
      useSingleColorIcons: true,
    },
  },

  white: {
    name: 'white',
    displayName: '微信主题',
    colors: {
      // 手机边框
      phoneFrame: '#000000',
      phoneFrameGradient: ['#000000', '#222222', '#333333', '#000000'],

      // 主要颜色 - 微信绿只用于特定元素
      primary: '#999999', // 大多数按钮和图标用灰色
      light: '#cccccc',
      ultraLight: '#f8f8f8',
      soft: '#e0e0e0',
      deep: '#666666',

      // 渐变色
      gradientStart: '#cccccc',
      gradientEnd: '#dddddd',

      // 文字颜色
      textColor: '#ffffff',
      textPrimary: '#333333',
      textSecondary: '#909090',

      // 边框和阴影
      borderColor: '#e0e0e0',
      bubbleShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',

      // 气泡背景
      bubbleThemBg: '#ffffff',
      bubbleMeBg: '#A0E75A', // 更浅的微信气泡绿色

      // 气泡文字颜色
      bubbleThemText: '#333333',
      bubbleMeText: '#333333',

      // 头部背景
      headerBg: 'linear-gradient(315deg, #f5f5f5 0%, #ffffff 100%)',

      // 新增：状态栏颜色
      statusBarColor: '#000000',

      // 新增：灵动岛颜色
      dynamicIslandColor: '#000000',

      // 新增：应用背景色
      appBgColor: '#ffffff',

      // 新增：设置页面背景色
      settingsBgColor: '#f5f5f5',

      // 新增：设置卡片背景色
      settingsCardBgColor: '#ffffff',

      // 新增：阴影颜色
      shadowColor: '#999999',
      shadowColorRgba: 'rgba(0, 0, 0, 0.1)',

      // 新增：是否是暗色主题
      isDarkMode: false,

      // 新增：默认壁纸
      defaultWallpapers: {
        chat: '#EDEDED', // 微信聊天背景灰色
        home: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/白色_1.jpg', // 默认图片壁纸
        settings: '#f5f5f5',
      },

      // 新增：是否使用单一颜色图标
      useSingleColorIcons: false,
    },
  },

  dark: {
    name: 'dark',
    displayName: '夜间模式',
    colors: {
      // 手机边框
      phoneFrame: '#2c2c2c',
      phoneFrameGradient: ['#1a1a1a', '#2c2c2c', '#3c3c3c', '#1a1a1a'],

      // 主要颜色
      primary: '#505050',
      light: '#3c3c3c',
      ultraLight: '#1a1a1a',
      soft: '#2c2c2c',
      deep: '#c0c0c0',

      // 渐变色
      gradientStart: '#3c3c3c',
      gradientEnd: '#2c2c2c',

      // 文字颜色
      textColor: '#e0e0e0',
      textPrimary: '#c0c0c0',
      textSecondary: '#a0a0a0',

      // 边框和阴影
      borderColor: '#3c3c3c',
      bubbleShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',

      // 气泡背景
      bubbleThemBg: '#2a2a2a',
      bubbleMeBg: '#505050',

      // 气泡文字颜色
      bubbleThemText: '#e0e0e0',
      bubbleMeText: '#c0c0c0',

      // 头部背景
      headerBg: 'linear-gradient(315deg, #2c2c2c 0%, #1a1a1a 100%)',

      // 新增：状态栏颜色
      statusBarColor: '#888888',

      // 新增：灵动岛颜色
      dynamicIslandColor: '#3c3c3c',

      // 新增：应用背景色
      appBgColor: '#1a1a1a',

      // 新增：设置页面背景色
      settingsBgColor: '#1a1a1a',

      // 新增：设置卡片背景色
      settingsCardBgColor: '#2c2c2c',

      // 新增：阴影颜色
      shadowColor: '#000000',
      shadowColorRgba: 'rgba(0, 0, 0, 0.5)',

      // 新增：是否是暗色主题
      isDarkMode: true,

      // 新增：默认壁纸
      defaultWallpapers: {
        chat: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_1.jpg', // 夜间模式壁纸
        home: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_1.jpg', // 夜间模式壁纸
        settings: '#1a1a1a',
      },

      // 新增：是否使用单一颜色图标
      useSingleColorIcons: false,
    },
  },
};

// 主题管理器类
export class ThemeManager {
  private static THEME_STORAGE_KEY = 'blmx_theme';
  private static CUSTOM_THEME_STORAGE_KEY = 'blmx_custom_theme';
  private static VERSION_STORAGE_KEY = 'blmx_app_version';
  private currentTheme: Theme;
  private wallpaperManager: WallpaperManager;

  constructor() {
    // 检查版本并在需要时清理缓存
    this.checkVersion();

    // 从本地存储加载主题或使用默认微信主题
    const savedThemeName = localStorage.getItem(ThemeManager.THEME_STORAGE_KEY) || 'white';

    if (savedThemeName === 'custom') {
      try {
        const customThemeJson = localStorage.getItem(ThemeManager.CUSTOM_THEME_STORAGE_KEY);
        if (customThemeJson) {
          this.currentTheme = JSON.parse(customThemeJson);
        } else {
          this.currentTheme = THEMES.white;
        }
      } catch (e) {
        console.error('Failed to load custom theme:', e);
        this.currentTheme = THEMES.white;
      }
    } else {
      this.currentTheme = THEMES[savedThemeName] || THEMES.white;
    }

    // 初始化壁纸管理器
    this.wallpaperManager = new WallpaperManager();

    // 应用当前主题
    this.applyTheme(this.currentTheme);
  }

  // 检查版本并清理过时数据
  private checkVersion(): void {
    const savedVersion = localStorage.getItem(ThemeManager.VERSION_STORAGE_KEY);

    // 如果没有版本记录或版本不匹配，执行清理
    if (!savedVersion || savedVersion !== APP_VERSION) {
      console.log(`版本更新: ${savedVersion || '初次安装'} -> ${APP_VERSION}, 清理过时数据...`);
      this.cleanOutdatedData();

      // 保存新版本号
      localStorage.setItem(ThemeManager.VERSION_STORAGE_KEY, APP_VERSION);
    }
  }

  // 清理过时数据
  private cleanOutdatedData(): void {
    // 保留用户的个人设置数据，但清理可能导致问题的主题和壁纸数据
    const keysToPreserve: string[] = [];

    // 查找所有需要保留的个人设置键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('blmx_user_name_') ||
          key.startsWith('blmx_user_avatar_') ||
          key.startsWith('blmx_char_avatar_') ||
          key.startsWith('blmx_remark_') ||
          key.startsWith('blmx_signature_') ||
          key.startsWith('blmx_cover_photo_') ||
          key.startsWith('blmx_input_placeholder_'))
      ) {
        keysToPreserve.push(key);
      }
    }

    // 临时保存需要保留的数据
    const preservedData: Record<string, string> = {};
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) preservedData[key] = value;
    });

    // 清除所有 blmx_ 开头的数据
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('blmx_')) {
        localStorage.removeItem(key);
      }
    }

    // 恢复需要保留的数据
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }

  // 获取当前主题
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  // 获取当前主题的实际应用数据（从DOM的CSS变量中读取）
  getCurrentThemeWithAppliedValues(): Theme {
    const theme = { ...this.currentTheme };
    const colors = { ...theme.colors };

    // 从DOM中读取实际应用的CSS变量值
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // 读取实际应用的颜色值
    const actualValues = {
      phoneFrame: computedStyle.getPropertyValue('--phoneFrame').trim(),
      primary: computedStyle.getPropertyValue('--primary-blue').trim(),
      light: computedStyle.getPropertyValue('--light-blue').trim(),
      ultraLight: computedStyle.getPropertyValue('--ultra-light-blue').trim(),
      soft: computedStyle.getPropertyValue('--soft-blue').trim(),
      deep: computedStyle.getPropertyValue('--deep-blue').trim(),
      textColor: computedStyle.getPropertyValue('--text-color').trim(),
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
      borderColor: computedStyle.getPropertyValue('--border-color').trim(),
      bubbleShadow: computedStyle.getPropertyValue('--bubble-shadow').trim(),
      bubbleThemBg: computedStyle.getPropertyValue('--wechat-bubble-them-bg').trim(),
      bubbleMeBg: computedStyle.getPropertyValue('--wechat-bubble-me-bg').trim(),
      bubbleThemText: computedStyle.getPropertyValue('--wechat-bubble-them-text').trim(),
      bubbleMeText: computedStyle.getPropertyValue('--wechat-bubble-me-text').trim(),
      headerBg: computedStyle.getPropertyValue('--header-bg').trim(),
      statusBarColor: computedStyle.getPropertyValue('--status-bar-color').trim(),
      dynamicIslandColor: computedStyle.getPropertyValue('--dynamic-island-color').trim(),
      appBgColor: computedStyle.getPropertyValue('--app-bg-color').trim(),
      settingsBgColor: computedStyle.getPropertyValue('--settings-bg-color').trim(),
      settingsCardBgColor: computedStyle.getPropertyValue('--settings-card-bg-color').trim(),
      shadowColor: computedStyle.getPropertyValue('--shadow-color').trim(),
      shadowColorRgba: computedStyle.getPropertyValue('--shadow-color-rgba').trim(),
      gradientStart:
        computedStyle.getPropertyValue('--blue-gradient-start').trim() ||
        computedStyle.getPropertyValue('--primary-gradient-light').trim(),
      gradientEnd:
        computedStyle.getPropertyValue('--blue-gradient-end').trim() ||
        computedStyle.getPropertyValue('--primary-gradient-dark').trim(),
    };

    // 使用实际应用的值，如果CSS变量存在的话
    Object.keys(actualValues).forEach(key => {
      const value = actualValues[key as keyof typeof actualValues];
      if (value && value !== '') {
        (colors as any)[key] = value;
      }
    });

    // 保持原有的布尔值和其他非颜色属性
    colors.isDarkMode = theme.colors.isDarkMode;
    colors.useSingleColorIcons = theme.colors.useSingleColorIcons;
    colors.phoneFrameGradient = theme.colors.phoneFrameGradient;
    colors.defaultWallpapers = theme.colors.defaultWallpapers;

    return {
      ...theme,
      colors,
    };
  }

  // 获取所有默认主题
  getThemes(): Record<string, Theme> {
    return THEMES;
  }

  // 获取壁纸管理器
  getWallpaperManager(): WallpaperManager {
    return this.wallpaperManager;
  }

  // 切换到指定主题
  switchTheme(themeName: string): void {
    if (themeName === 'custom') {
      try {
        const customThemeJson = localStorage.getItem(ThemeManager.CUSTOM_THEME_STORAGE_KEY);
        if (customThemeJson) {
          this.currentTheme = JSON.parse(customThemeJson);
          localStorage.setItem(ThemeManager.THEME_STORAGE_KEY, 'custom');

          // 更新壁纸管理器中的当前主题名称
          this.wallpaperManager.setCurrentThemeName('custom');

          this.applyTheme(this.currentTheme);

          // 应用主题默认壁纸
          this.wallpaperManager.applyThemeDefaultWallpapers(this.currentTheme);
        }
      } catch (e) {
        console.error('Failed to load custom theme:', e);
      }
    } else if (THEMES[themeName]) {
      this.currentTheme = THEMES[themeName];
      localStorage.setItem(ThemeManager.THEME_STORAGE_KEY, themeName);

      // 更新壁纸管理器中的当前主题名称
      this.wallpaperManager.setCurrentThemeName(themeName);

      this.applyTheme(this.currentTheme);

      // 应用主题默认壁纸
      this.wallpaperManager.applyThemeDefaultWallpapers(this.currentTheme);
    }
  }

  // 保存自定义主题
  saveCustomTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(ThemeManager.CUSTOM_THEME_STORAGE_KEY, JSON.stringify(theme));
    localStorage.setItem(ThemeManager.THEME_STORAGE_KEY, 'custom');

    // 更新壁纸管理器中的当前主题名称
    this.wallpaperManager.setCurrentThemeName('custom');

    this.applyTheme(theme);

    // 应用主题默认壁纸
    this.wallpaperManager.applyThemeDefaultWallpapers(theme);
  }

  // 应用主题到DOM
  private applyTheme(theme: Theme): void {
    const colors = theme.colors;
    const root = document.documentElement;

    // 设置CSS变量
    root.style.setProperty('--phoneFrame', colors.phoneFrame);
    root.style.setProperty('--primary-blue', colors.primary);
    root.style.setProperty('--light-blue', colors.light);
    root.style.setProperty('--ultra-light-blue', colors.ultraLight);
    root.style.setProperty('--blue-gradient-start', colors.gradientStart);
    root.style.setProperty('--blue-gradient-end', colors.gradientEnd);
    root.style.setProperty('--soft-blue', colors.soft);
    root.style.setProperty('--deep-blue', colors.deep);

    // 设置文字颜色变量 - 这是关键的修复！
    root.style.setProperty('--text-color', colors.textColor);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);

    // 设置边框颜色
    root.style.setProperty('--border-color', colors.borderColor);

    // 根据useSingleColorIcons属性设置图标颜色
    if (colors.useSingleColorIcons) {
      // 使用主题色作为图标颜色
      document.body.classList.add('single-color-icon');

      // 计算渐变色：比主色更亮和更暗的变体
      const lighterColor = this.lightenDarkenColor(colors.primary, 20);
      const darkerColor = this.lightenDarkenColor(colors.primary, -20);

      // 设置渐变色变量
      root.style.setProperty('--primary-gradient-light', lighterColor);
      root.style.setProperty('--primary-gradient-dark', darkerColor);
    } else {
      // 使用默认的绿色和灰色图标
      document.body.classList.remove('single-color-icon');
      root.style.setProperty('--wechat-green-icon', theme.name === 'white' ? '#07C160' : '#07C160');
      root.style.setProperty('--settings-icon-color', theme.name === 'white' ? '#8a8a8a' : '#8a8a8a');
    }

    root.style.setProperty('--wechat-green-bubble', colors.light);
    root.style.setProperty('--wechat-bg', colors.ultraLight);
    root.style.setProperty('--link-color', colors.primary);
    root.style.setProperty('--text-color', colors.textColor);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border-color', colors.borderColor);
    root.style.setProperty('--header-bg', colors.headerBg);
    root.style.setProperty('--bubble-shadow', colors.bubbleShadow);
    root.style.setProperty('--wechat-bubble-them-bg', colors.bubbleThemBg);
    root.style.setProperty('--wechat-bubble-me-bg', colors.bubbleMeBg);

    // 设置气泡文字颜色
    root.style.setProperty('--wechat-bubble-them-text', colors.bubbleThemText || colors.primary);
    root.style.setProperty('--wechat-bubble-me-text', colors.bubbleMeText || '#ffffff');

    // 设置状态栏颜色
    root.style.setProperty('--status-bar-color', colors.statusBarColor);

    // 设置灵动岛颜色
    root.style.setProperty('--dynamic-island-color', colors.dynamicIslandColor);

    // 设置应用背景色
    root.style.setProperty('--app-bg-color', colors.appBgColor);

    // 设置设置页面背景色
    root.style.setProperty('--settings-bg-color', colors.settingsBgColor);

    // 设置设置卡片背景色
    root.style.setProperty('--settings-card-bg-color', colors.settingsCardBgColor);

    // 设置输入框背景色（非夜间模式统一为白色）
    root.style.setProperty('--input-bg', colors.isDarkMode ? '#2a2a2a' : '#ffffff');

    // 设置阴影颜色
    root.style.setProperty('--shadow-color', colors.shadowColor);
    root.style.setProperty('--shadow-color-rgba', colors.shadowColorRgba);

    // 提取阴影颜色的RGB分量，用于其他计算
    const shadowRGB = this.extractRgbComponents(colors.shadowColor);
    root.style.setProperty('--shadow-r', shadowRGB.r.toString());
    root.style.setProperty('--shadow-g', shadowRGB.g.toString());
    root.style.setProperty('--shadow-b', shadowRGB.b.toString());

    // 设置暗色模式类
    if (colors.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // 手机边框样式
    const phoneFrame = document.querySelector('.phone-frame') as HTMLElement;
    if (phoneFrame) {
      phoneFrame.style.background = colors.phoneFrame;

      // 更新手机边框渐变 - 原子性更新避免闪烁
      const gradientColors = colors.phoneFrameGradient.join(', ');

      // 检查是否已存在样式元素
      let phoneFrameStyle = document.getElementById('phone-frame-style') as HTMLStyleElement;
      if (!phoneFrameStyle) {
        phoneFrameStyle = document.createElement('style');
        phoneFrameStyle.id = 'phone-frame-style';
        document.head.appendChild(phoneFrameStyle);
      }

      // 直接更新样式内容，避免移除和重新添加造成的闪烁
      phoneFrameStyle.textContent = `
        .phone-frame::before {
          background: linear-gradient(45deg, ${gradientColors});
          background-size: 400% 400%;
        }
      `;
    }

    // 更新动态岛颜色
    const dynamicIsland = document.querySelector('.dynamic-island') as HTMLElement;
    if (dynamicIsland) {
      dynamicIsland.style.background = colors.dynamicIslandColor;
    }

    // 更新状态栏颜色
    const statusLeft = document.querySelector('.status-left') as HTMLElement;
    const statusRight = document.querySelector('.status-right') as HTMLElement;
    if (statusLeft && statusRight) {
      statusLeft.style.color = colors.statusBarColor;
      statusRight.style.color = colors.statusBarColor;
    }

    // 更新设置页面背景色
    const settingsView = document.getElementById('settings-view');
    if (settingsView) {
      settingsView.style.backgroundColor = colors.settingsBgColor;
    }

    // 更新设置卡片背景色
    const settingsCards = document.querySelectorAll('.settings-card');
    settingsCards.forEach((card: Element) => {
      (card as HTMLElement).style.backgroundColor = colors.settingsCardBgColor;
    });

    // 更新手机阴影
    if (phoneFrame) {
      phoneFrame.style.boxShadow = `
        0 15px 20px ${this.hexToRgba(colors.shadowColor, 0.25)},
        0 8px 20px ${this.hexToRgba(colors.shadowColor, 0.15)},
        0 3px 8px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        inset 0 -1px 0 rgba(255, 255, 255, 0.2),
        0 5px ${this.hexToRgba(colors.shadowColor, 0.08)}
      `;
    }

    // 更新气泡阴影和颜色
    const style = document.createElement('style');
    style.id = 'theme-dynamic-styles';

    // 检查是否是自定义主题（使用纯色背景）还是默认主题（保留渐变）
    // 注释掉未使用的变量
    // const isCustomBubbleColors = theme.name === 'custom';

    style.textContent = `
      /* 微信主题下的气泡样式 - 直接应用绿色 */
      .message-row.me .message-bubble {
        background-color: ${colors.bubbleMeBg} !important;
        background: ${colors.bubbleMeBg} !important;
        color: ${colors.bubbleMeText || '#ffffff'} !important;
        box-shadow: 0 4px 12px ${this.hexToRgba(colors.shadowColor, 0.3)};
      }
      
      /* 对方气泡样式 */
      .message-row.them .message-bubble {
        background-color: ${colors.bubbleThemBg} !important;
        background: ${colors.bubbleThemBg} !important;
        color: ${colors.bubbleThemText || colors.primary} !important;
      }
      
      /* 确保语音气泡也使用正确的颜色 */
      .message-row.me .message-bubble.voice-bubble {
        background: ${colors.bubbleMeBg} !important;
        background-color: ${colors.bubbleMeBg} !important;
        background-image: none !important;
        color: ${colors.bubbleMeText || '#ffffff'} !important;
      }
      
      .message-row.them .message-bubble.voice-bubble {
        background: ${colors.bubbleThemBg} !important;
        color: ${colors.bubbleThemText || colors.primary} !important;
      }
      
      /* 朋友圈文字描述图片样式 */
      .post-media .image-desc-content {
        background-color: ${this.hexToRgba(colors.primary, 0.1)} !important;
        border: 1px solid ${this.hexToRgba(colors.primary, 0.1)} !important;
      }
      
      /* 发送按钮样式 */
      .wechat-footer .send-btn {
        box-shadow: 0 4px 12px ${this.hexToRgba(colors.shadowColor, 0.3)};
      }
      
      .wechat-footer .send-btn:hover {
        box-shadow: 0 6px 16px ${this.hexToRgba(colors.shadowColor, 0.4)};
      }
      
      /* 夜间模式特殊处理 */
      ${
        colors.isDarkMode
          ? `
        .settings-card p, 
        .settings-card a,
        .settings-card li a,
        .post-content,
        .post-meta,
        .theme-editor-modal .modal-content {
          color: #e0e0e0 !important;
        }
        
        .settings-card,
        .theme-editor-modal .modal-content {
          background-color: #2a2a2a !important;
        }
        
        /* 修改夜间模式下正在输入指示器样式 */
        .typing-indicator .message-bubble {
          background-color: ${colors.bubbleThemBg} !important;
          background: ${colors.bubbleThemBg} !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        .typing-dot {
          background-color: rgba(255, 255, 255, 0.6) !important;
        }
        
        .settings-card li {
          border-bottom-color: #3c3c3c !important;
        }
        
        .settings-card li a {
          color: #a0a0a0 !important;
        }
        
        #show-last-ai-response-btn,
        #show-last-sent-prompt-btn {
          background-color: #2c2c2c !important;
          color: #a0a0a0 !important;
        }

        /* 朋友圈暗色模式 */
        #moments-view {
          background: linear-gradient(180deg, #1a1a1a 0%, #252525 100%) !important;
        }
        
        .moments-body {
          background-color: #1a1a1a !important;
        }
        
        .moment-post {
          border-bottom-color: #2c2c2c !important;
        }
        
        .post-interactions {
          background: #2a2a2a !important;
          border-color: #3c3c3c !important;
        }
        
        .post-interactions::before {
          border-bottom-color: #2a2a2a !important;
        }
        
        .likes-section {
          background: rgba(42, 42, 42, 0.8) !important;
        }
        
        .comments-section {
          border-top-color: #3c3c3c !important;
        }
        
        .post-meta .comment-button {
          background: #2c2c2c !important;
        }

        /* 朋友圈文字描述图片样式 - 夜间模式 */
        .post-media .image-desc-content {
          background-color: rgba(42, 42, 42, 0.8) !important;
          border: 1px solid rgba(60, 60, 60, 0.4) !important;
          color: #e0e0e0 !important;
        }

        /* 更多夜间模式样式 */
        .post-author-name, 
        .liker-name, 
        .comment-author {
          color: #a0c0e0 !important;
        }
        
        .moments-header,
        .wechat-header {
          background: linear-gradient(315deg, #252525 0%, #1a1a1a 100%) !important;
          border-bottom-color: #3c3c3c !important;
        }
        
        .wechat-footer {
          background: linear-gradient(315deg, #252525 0%, #1a1a1a 100%) !important;
          border-top-color: #3c3c3c !important;
        }
        
        .wechat-footer .text-input {
          background-color: #2a2a2a !important;
          border-color: #3c3c3c !important;
          color: #e0e0e0 !important;
        }
        
        .wechat-footer .text-input::placeholder {
          color: #808080 !important;
        }
        
        .timestamp-text,
        .event-time-text {
          background: linear-gradient(315deg, #505050 0%, #3c3c3c 100%) !important;
        }
        
        .recall-notice-text {
          background: linear-gradient(315deg, #505050 0%, #3c3c3c 100%) !important;
        }
        
        .message-row.them .voice-bubble .voice-icon {
          color: #a0c0e0 !important;
        }
        
        .voice-text-content {
          background-color: #2a2a2a !important;
          border-color: #3c3c3c !important;
          color: #e0e0e0 !important;
        }
        
        .location-card,
        .file-card {
          background-color: #2a2a2a !important;
        }
        
        .location-content .location-title {
          color: #e0e0e0 !important;
        }
        
        .file-details .file-name {
          color: #e0e0e0 !important;
        }
        
        .file-footer {
          background-color: #252525 !important;
          border-top-color: #3c3c3c !important;
        }
        
        .panel-container {
          background-color: #1a1a1a !important;
        }
        
        .feature-icon {
          background-color: #2a2a2a !important;
          border-color: #3c3c3c !important;
        }
        
        .feature-label {
          color: #a0a0a0 !important;
        }
        
        /* Theme-colored icons in dark mode */
        .feature-icon .theme-icon {
          color: var(--primary-blue) !important;
        }
        
        /* 壁纸选择器暗色模式 */
        .wallpaper-container {
          background-color: #2a2a2a !important;
          color: #e0e0e0 !important;
        }
        
        .wallpaper-container h2,
        .wallpaper-container h3,
        .wallpaper-container p {
          color: #e0e0e0 !important;
        }
        
        .wallpaper-container input[type="text"],
        .wallpaper-container input[type="file"] {
          background-color: #1a1a1a !important;
          border-color: #3c3c3c !important;
          color: #e0e0e0 !important;
        }
        
        .wallpaper-item .name {
          background-color: rgba(42, 42, 42, 0.9) !important;
          color: #e0e0e0 !important;
        }
      `
          : ''
      }
    `;

    const oldDynamicStyles = document.getElementById('theme-dynamic-styles');
    if (oldDynamicStyles) {
      oldDynamicStyles.remove();
    }
    document.head.appendChild(style);
  }

  // 辅助方法：HEX转RGBA
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // 辅助方法：提取RGB分量
  private extractRgbComponents(hex: string): { r: number; g: number; b: number } {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
  }

  // 辅助方法：调整颜色亮度
  private lightenDarkenColor(color: string, amount: number): string {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }
}

// 壁纸类型定义
export interface Wallpaper {
  id: string;
  type: 'color' | 'image' | 'url';
  value: string; // 颜色代码或图片URL
  name: string;
  thumbnail?: string; // 缩略图URL，如果是图片类型
}

// 壁纸管理器类
export class WallpaperManager {
  private static WALLPAPER_STORAGE_KEY_PREFIX = 'blmx_wallpaper_';
  private static CUSTOM_WALLPAPERS_KEY = 'blmx_custom_wallpapers';
  private static THEME_WALLPAPER_KEY_PREFIX = 'blmx_theme_wallpaper_';
  private currentThemeName: string = 'white'; // 默认主题名称

  // 内置壁纸
  private builtInWallpapers: Wallpaper[] = [
    { id: 'blue_solid', type: 'color', value: '#e8f4fd', name: '蓝色纯色' },
    { id: 'pink_solid', type: 'color', value: '#fde8f4', name: '粉色纯色' },
    { id: 'white_solid', type: 'color', value: '#f8f8f8', name: '白色纯色' },
    { id: 'dark_solid', type: 'color', value: '#1a1a1a', name: '黑色纯色' },
    {
      id: 'default_image',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/白色_1.jpg',
      name: '白色壁纸',
    },
    {
      id: 'dark_image',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_1.jpg',
      name: '深色星星壁纸',
    },
    {
      id: 'blue_theme',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色星星_1.jpg',
      name: '蓝色星星壁纸',
    },
    {
      id: 'pink_theme',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色星星_1.jpg',
      name: '粉色星星壁纸',
    },
    {
      id: 'kitty_theme',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色小猫_1.jpg',
      name: '粉色小猫壁纸',
    },
    {
      id: 'deep_stars_2',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_2.jpg',
      name: '深色星星壁纸2',
    },
    {
      id: 'deep_stars_3',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/深色星星_3.jpg',
      name: '深色星星壁纸3',
    },
    {
      id: 'white_stars',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/白色星星_1.jpg',
      name: '白色星星壁纸',
    },
    {
      id: 'pink_stars_2',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色星星_2.jpg',
      name: '粉色星星壁纸2',
    },
    {
      id: 'pink_grid_2',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色格子_2.jpg',
      name: '粉色格子壁纸2',
    },
    {
      id: 'pink_grid_4',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/粉色格子_4.jpg',
      name: '粉色格子壁纸4',
    },
    {
      id: 'blue_1',
      type: 'image',
      value: 'https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/素材/wallpaper/蓝色_1.jpg',
      name: '蓝色壁纸1',
    },
  ];

  // 自定义壁纸
  private customWallpapers: Wallpaper[] = [];

  constructor() {
    this.loadCustomWallpapers();
    // 从localStorage加载当前主题名称
    const savedThemeName = localStorage.getItem('blmx_theme');
    if (savedThemeName) {
      this.currentThemeName = savedThemeName;
    }

    // 迁移旧的壁纸设置到新的主题关联格式
    this.migrateOldWallpaperSettings();
  }

  // 设置当前主题名称
  setCurrentThemeName(themeName: string): void {
    this.currentThemeName = themeName;
  }

  // 获取所有壁纸（内置+自定义）
  getAllWallpapers(): Wallpaper[] {
    return [...this.builtInWallpapers, ...this.customWallpapers];
  }

  // 获取内置壁纸
  getBuiltInWallpapers(): Wallpaper[] {
    return this.builtInWallpapers;
  }

  // 获取自定义壁纸
  getCustomWallpapers(): Wallpaper[] {
    return this.customWallpapers;
  }

  // 添加自定义壁纸
  addCustomWallpaper(wallpaper: Omit<Wallpaper, 'id'>): Wallpaper {
    const id = `custom_${Date.now()}`;
    const newWallpaper: Wallpaper = { ...wallpaper, id };

    this.customWallpapers.push(newWallpaper);
    this.saveCustomWallpapers();

    return newWallpaper;
  }

  // 删除自定义壁纸
  deleteCustomWallpaper(id: string): boolean {
    const initialLength = this.customWallpapers.length;
    this.customWallpapers = this.customWallpapers.filter(w => w.id !== id);

    if (this.customWallpapers.length !== initialLength) {
      this.saveCustomWallpapers();
      return true;
    }

    return false;
  }

  // 设置壁纸（与主题关联）
  setWallpaper(viewType: 'chat' | 'home' | 'settings', wallpaper: Wallpaper | null): void {
    // 使用主题名称作为存储键的一部分
    const storageKey = `${WallpaperManager.THEME_WALLPAPER_KEY_PREFIX}${this.currentThemeName}_${viewType}`;

    if (wallpaper) {
      localStorage.setItem(storageKey, JSON.stringify(wallpaper));
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  // 获取当前壁纸（与主题关联）
  getCurrentWallpaper(viewType: 'chat' | 'home' | 'settings'): Wallpaper | null {
    // 首先尝试获取与当前主题关联的壁纸
    const themeStorageKey = `${WallpaperManager.THEME_WALLPAPER_KEY_PREFIX}${this.currentThemeName}_${viewType}`;
    const savedThemeWallpaper = localStorage.getItem(themeStorageKey);

    if (savedThemeWallpaper) {
      try {
        return JSON.parse(savedThemeWallpaper);
      } catch (e) {
        console.error('Failed to parse theme wallpaper:', e);
      }
    }

    // 如果没有与主题关联的壁纸，则尝试获取旧格式的壁纸设置（兼容性）
    const oldStorageKey = `${WallpaperManager.WALLPAPER_STORAGE_KEY_PREFIX}${viewType}`;
    const savedOldWallpaper = localStorage.getItem(oldStorageKey);

    if (savedOldWallpaper) {
      try {
        return JSON.parse(savedOldWallpaper);
      } catch (e) {
        console.error('Failed to parse old wallpaper:', e);
      }
    }

    return null;
  }

  // 迁移旧的壁纸设置到新的主题关联格式
  private migrateOldWallpaperSettings(): void {
    const viewTypes: Array<'chat' | 'home' | 'settings'> = ['chat', 'home', 'settings'];

    viewTypes.forEach(viewType => {
      const oldStorageKey = `${WallpaperManager.WALLPAPER_STORAGE_KEY_PREFIX}${viewType}`;
      const savedOldWallpaper = localStorage.getItem(oldStorageKey);

      if (savedOldWallpaper) {
        try {
          // 解析但不存储未使用的变量
          JSON.parse(savedOldWallpaper);
          // 将旧设置迁移到当前主题下
          const themeStorageKey = `${WallpaperManager.THEME_WALLPAPER_KEY_PREFIX}${this.currentThemeName}_${viewType}`;

          // 只有在当前主题下没有设置时才迁移
          if (!localStorage.getItem(themeStorageKey)) {
            localStorage.setItem(themeStorageKey, savedOldWallpaper);
          }

          // 迁移后删除旧设置
          localStorage.removeItem(oldStorageKey);
        } catch (e) {
          console.error('Failed to migrate old wallpaper setting:', e);
        }
      }
    });
  }

  // 应用主题默认壁纸
  applyThemeDefaultWallpapers(theme: Theme): void {
    // 更新当前主题名称
    this.setCurrentThemeName(theme.name);

    const viewTypes: Array<'chat' | 'home' | 'settings'> = ['chat', 'home', 'settings'];

    viewTypes.forEach(viewType => {
      // 检查是否已经有与当前主题关联的壁纸设置
      const themeStorageKey = `${WallpaperManager.THEME_WALLPAPER_KEY_PREFIX}${theme.name}_${viewType}`;
      const existingWallpaper = localStorage.getItem(themeStorageKey);

      if (existingWallpaper) {
        // 已有壁纸设置，保留现有设置
        return;
      }

      const defaultValue = theme.colors.defaultWallpapers[viewType];

      // 检查是否是颜色值
      const isColor = defaultValue.startsWith('#');

      const wallpaper: Wallpaper = {
        id: `theme_default_${viewType}`,
        type: isColor ? 'color' : 'image',
        value: defaultValue,
        name: `${theme.displayName}默认${viewType === 'chat' ? '聊天' : viewType === 'home' ? '主屏幕' : '设置'}壁纸`,
      };

      // 保存为与主题关联的壁纸
      localStorage.setItem(themeStorageKey, JSON.stringify(wallpaper));
    });
  }

  // 应用壁纸到DOM
  applyWallpaperToElement(element: HTMLElement, wallpaper: Wallpaper | null, defaultThemeWallpaper?: string): void {
    if (!element) return;

    // 重置样式
    element.style.backgroundImage = 'none';
    element.style.backgroundColor = '';
    element.style.backgroundSize = '';
    element.style.backgroundPosition = '';
    element.style.backgroundRepeat = '';

    if (wallpaper) {
      if (wallpaper.type === 'color') {
        // 纯色壁纸 - 确保清除背景图并设置背景色
        element.style.backgroundImage = 'none';
        element.style.backgroundColor = wallpaper.value;
      } else {
        // 图片壁纸
        element.style.backgroundImage = `url("${wallpaper.value}")`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
      }
    } else if (defaultThemeWallpaper) {
      // 使用主题默认壁纸
      if (defaultThemeWallpaper.startsWith('#')) {
        // 如果是颜色值，设置背景色
        element.style.backgroundImage = 'none';
        element.style.backgroundColor = defaultThemeWallpaper;
      } else {
        // 如果是图片URL，设置背景图
        element.style.backgroundImage = `url("${defaultThemeWallpaper}")`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
      }
    }
  }

  // 从URL创建壁纸
  async createWallpaperFromUrl(url: string, name: string): Promise<Wallpaper | null> {
    try {
      // 验证URL
      new URL(url);

      return this.addCustomWallpaper({
        type: 'url',
        value: url,
        name: name || `URL壁纸 ${new Date().toLocaleString()}`,
      });
    } catch (e) {
      console.error('Invalid URL:', e);
      return null;
    }
  }

  // 从File对象创建壁纸
  async createWallpaperFromFile(file: File): Promise<Wallpaper | null> {
    return new Promise(resolve => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          const wallpaper = this.addCustomWallpaper({
            type: 'image',
            value: e.target.result as string,
            name: file.name || `上传的壁纸 ${new Date().toLocaleString()}`,
          });
          resolve(wallpaper);
        } else {
          resolve(null);
        }
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // 创建纯色壁纸
  createSolidColorWallpaper(color: string, name?: string): Wallpaper | null {
    // 验证颜色格式，支持3位和6位十六进制颜色
    if (!color.match(/^#([0-9A-Fa-f]{3}){1,2}$/)) {
      console.error('Invalid color format:', color);
      return null;
    }

    // 确保颜色格式统一为6位十六进制
    let normalizedColor = color;
    if (color.length === 4) {
      // #RGB 格式
      const r = color[1];
      const g = color[2];
      const b = color[3];
      normalizedColor = `#${r}${r}${g}${g}${b}${b}`;
    }

    return this.addCustomWallpaper({
      type: 'color',
      value: normalizedColor,
      name: name || `纯色壁纸 ${normalizedColor}`,
    });
  }

  // 加载自定义壁纸
  private loadCustomWallpapers(): void {
    const savedWallpapers = localStorage.getItem(WallpaperManager.CUSTOM_WALLPAPERS_KEY);

    if (savedWallpapers) {
      try {
        this.customWallpapers = JSON.parse(savedWallpapers);
      } catch (e) {
        console.error('Failed to load custom wallpapers:', e);
        this.customWallpapers = [];
      }
    }
  }

  // 保存自定义壁纸
  private saveCustomWallpapers(): void {
    localStorage.setItem(WallpaperManager.CUSTOM_WALLPAPERS_KEY, JSON.stringify(this.customWallpapers));
  }
}
