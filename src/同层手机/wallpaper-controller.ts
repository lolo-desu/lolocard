// 壁纸控制器模块
// 负责壁纸的应用和管理

import { Theme, ThemeManager, WallpaperManager } from './theme-manager';
import { WallpaperSelector } from './wallpaper-selector';

export class WallpaperController {
  private wallpaperManager: WallpaperManager;
  private themeManager: ThemeManager;
  private wallpaperSelector: WallpaperSelector;

  constructor(themeManager: ThemeManager) {
    this.themeManager = themeManager;
    this.wallpaperManager = themeManager.getWallpaperManager();
    this.wallpaperSelector = new WallpaperSelector(this.wallpaperManager, this.themeManager);
  }

  // 应用壁纸到所有视图
  applyWallpapers(): void {
    const $chatView = $('#wechat-view');
    const $homeScreen = $('#app-homescreen');
    const $settingsView = $('#settings-view');
    const currentTheme = this.themeManager.getCurrentTheme();

    // 确保壁纸管理器使用当前主题名称
    this.wallpaperManager.setCurrentThemeName(currentTheme.name);

    // 应用聊天壁纸
    const chatWallpaper = this.wallpaperManager.getCurrentWallpaper('chat');
    this.wallpaperManager.applyWallpaperToElement(
      $chatView[0],
      chatWallpaper,
      currentTheme.colors.defaultWallpapers.chat,
    );

    // 应用主屏幕壁纸
    const homeWallpaper = this.wallpaperManager.getCurrentWallpaper('home');
    this.wallpaperManager.applyWallpaperToElement(
      $homeScreen[0],
      homeWallpaper,
      currentTheme.colors.defaultWallpapers.home,
    );

    // 应用设置壁纸
    const settingsWallpaper = this.wallpaperManager.getCurrentWallpaper('settings');
    this.wallpaperManager.applyWallpaperToElement(
      $settingsView[0],
      settingsWallpaper,
      currentTheme.colors.defaultWallpapers.settings,
    );
  }

  // 更改壁纸
  changeWallpaper(viewType: 'chat' | 'home' | 'settings'): void {
    // 显示壁纸选择器
    this.wallpaperSelector.showWallpaperSelector(viewType, () => {
      this.applyWallpapers();
    });
  }

  // 初始化壁纸（在主题切换时调用）
  initializeWallpapers(theme: Theme): void {
    // 确保应用当前主题的默认壁纸，但不覆盖用户已保存的壁纸设置
    this.wallpaperManager.applyThemeDefaultWallpapers(theme);
    this.applyWallpapers();
  }

  // 获取壁纸管理器（用于其他模块访问）
  getWallpaperManager(): WallpaperManager {
    return this.wallpaperManager;
  }
}
