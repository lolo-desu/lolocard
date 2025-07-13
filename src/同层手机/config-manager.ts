// 配置管理模块
// 负责管理应用配置、常量定义和配置初始化

import { SafeStorage } from './utils';

// 类型定义
export interface AppConfig {
  avatars: {
    user: string;
    char: string;
  };
  names: {
    user: string;
    char: string;
  };
  charRemark: string;
  currentCharId: string;
}

// 表情包定义
export interface Sticker {
  label: string;
  url: string;
}

// 常量定义
export const STORAGE_KEYS = {
  GLOBAL_STICKER: 'blmx_wechat_stickers_global_blmx', // 修改为与原版一致
  CHAR_STICKER_PREFIX: 'blmx_char_stickers_blmx_', // 修改为与原版一致
  PHONE_SIZE: 'blmx_phone_size',
  FULLSCREEN_SIZE: 'blmx_fullscreen_size',
  STICKER_SIZE: 'blmx_sticker_size',
  MOMENT_NOTIFICATION: 'blmx_moment_notification',
  MOMENT_LAST_VIEW: 'blmx_moment_last_view',
  USER_NAME_PREFIX: 'blmx_user_name_',
  USER_AVATAR_PREFIX: 'blmx_user_avatar_',
  CHAR_AVATAR_PREFIX: 'blmx_char_avatar_',
  CHAR_REMARK_PREFIX: 'blmx_remark_',
  COVER_PHOTO_PREFIX: 'blmx_cover_photo_',
  SIGNATURE_PREFIX: 'blmx_signature_',
  INPUT_PLACEHOLDER_PREFIX: 'blmx_input_placeholder_',
  LAST_NOTIFIED_VERSION: 'blmx_last_notified_version',
} as const;

// 手机尺寸常量
export const PHONE_SIZES = {
  default: '48.75rem', // 默认尺寸: 48.75rem (780px)
  medium: '42rem', // 中等尺寸: 42rem (672px)
  small: '36rem', // 小尺寸: 36rem (576px)
} as const;

// 全屏模式手机大小常量（缩放比例）
export const FULLSCREEN_SIZES = {
  default: 100, // 默认：100%
  large: 130, // 大：130%
  xlarge: 160, // 超大：160%
} as const;

// 配置管理器类
export class ConfigManager {
  private config: AppConfig;
  private defaultGlobalStickers: Sticker[] = [{ label: '好的', url: 'https://files.catbox.moe/3j0tpc.jpeg' }];

  constructor() {
    // 初始化默认配置
    this.config = {
      avatars: { user: '', char: '' },
      names: { user: 'User', char: 'Character' },
      charRemark: '',
      currentCharId: '',
    };
  }

  // 获取配置
  getConfig(): AppConfig {
    return this.config;
  }

  // 设置配置
  setConfig(config: Partial<AppConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取显示名称
  getDisplayName(type: 'user' | 'char'): string {
    if (type === 'char') {
      return this.config.charRemark || this.config.names.char;
    }
    return this.config.names.user;
  }

  // 更新头像
  updateAvatar(avatarType: 'user' | 'char', newUrl: string): void {
    this.config.avatars[avatarType] = newUrl;
    const storageKey =
      avatarType === 'user'
        ? `${STORAGE_KEYS.USER_AVATAR_PREFIX}${this.config.currentCharId}`
        : `${STORAGE_KEYS.CHAR_AVATAR_PREFIX}${this.config.currentCharId}`;
    localStorage.setItem(storageKey, newUrl);
  }

  // 更新角色备注
  updateCharRemark(newRemark: string): void {
    this.config.charRemark = newRemark;
    localStorage.setItem(`${STORAGE_KEYS.CHAR_REMARK_PREFIX}${this.config.currentCharId}`, newRemark);
  }

  // 更新用户名
  updateUserName(newName: string): void {
    this.config.names.user = newName;
    localStorage.setItem(`${STORAGE_KEYS.USER_NAME_PREFIX}${this.config.currentCharId}`, newName);
  }

  // 查找表情包URL - 增加向后兼容性
  findStickerUrlByName(name: string): string | undefined {
    // 尝试从新的存储键读取
    let customGlobalStickers = SafeStorage.getItem<any[]>(STORAGE_KEYS.GLOBAL_STICKER, []) || [];
    let charStickers =
      SafeStorage.getItem<any[]>(`${STORAGE_KEYS.CHAR_STICKER_PREFIX}${this.config.currentCharId}`, []) || [];

    // 如果新存储键没有数据，尝试从旧存储键迁移
    if (customGlobalStickers.length === 0) {
      const oldGlobalStickers = SafeStorage.getItem<any[]>('blmx_wechat_stickers_global', []) || [];
      if (oldGlobalStickers.length > 0) {
        // 迁移数据到新存储键
        SafeStorage.setItem(STORAGE_KEYS.GLOBAL_STICKER, oldGlobalStickers);
        customGlobalStickers = oldGlobalStickers;
        console.log('[BLMX] 已迁移全局表情包数据到新存储键');
      }
    }

    if (charStickers.length === 0) {
      const oldCharStickers = SafeStorage.getItem<any[]>(`blmx_char_stickers_${this.config.currentCharId}`, []) || [];
      if (oldCharStickers.length > 0) {
        // 迁移数据到新存储键
        SafeStorage.setItem(`${STORAGE_KEYS.CHAR_STICKER_PREFIX}${this.config.currentCharId}`, oldCharStickers);
        charStickers = oldCharStickers;
        console.log('[BLMX] 已迁移角色表情包数据到新存储键');
      }
    }

    const globalStickers = [...this.defaultGlobalStickers, ...customGlobalStickers];
    return [...globalStickers, ...charStickers].find((s: Sticker) => s.label === name)?.url;
  }

  // 从localStorage加载配置
  async loadFromStorage(charData: any): Promise<void> {
    this.config.currentCharId = charData.name;
    this.config.names.char = charData.name;

    // 加载保存的配置
    this.config.charRemark =
      localStorage.getItem(`${STORAGE_KEYS.CHAR_REMARK_PREFIX}${this.config.currentCharId}`) || '';
    this.config.names.user =
      localStorage.getItem(`${STORAGE_KEYS.USER_NAME_PREFIX}${this.config.currentCharId}`) || 'User';
    this.config.avatars.user =
      localStorage.getItem(`${STORAGE_KEYS.USER_AVATAR_PREFIX}${this.config.currentCharId}`) || '';

    // 加载角色头像
    const savedCharAvatar = localStorage.getItem(`${STORAGE_KEYS.CHAR_AVATAR_PREFIX}${this.config.currentCharId}`);
    if (savedCharAvatar) {
      this.config.avatars.char = savedCharAvatar;
    } else {
      // 这里需要从外部获取角色头像路径
      // 在实际使用时会通过参数传入
      this.config.avatars.char = '';
    }
  }

  // 获取朋友圈通知状态
  getMomentNotificationState(): boolean {
    const notificationState = localStorage.getItem(`${STORAGE_KEYS.MOMENT_NOTIFICATION}_${this.config.currentCharId}`);
    return notificationState === 'true';
  }

  // 设置朋友圈通知状态
  setMomentNotificationState(value: boolean): void {
    localStorage.setItem(`${STORAGE_KEYS.MOMENT_NOTIFICATION}_${this.config.currentCharId}`, value.toString());
  }

  // 获取最后查看朋友圈时的时间戳
  getLastMomentViewTimestamp(): number {
    const lastView = localStorage.getItem(`${STORAGE_KEYS.MOMENT_LAST_VIEW}_${this.config.currentCharId}`);
    return lastView ? parseInt(lastView, 10) : 0;
  }

  // 设置最后查看朋友圈时的时间戳
  setLastMomentViewTimestamp(timestamp: number): void {
    localStorage.setItem(`${STORAGE_KEYS.MOMENT_LAST_VIEW}_${this.config.currentCharId}`, timestamp.toString());
  }

  // 获取保存的封面图片
  getSavedCoverPhoto(): string | null {
    return localStorage.getItem(`${STORAGE_KEYS.COVER_PHOTO_PREFIX}${this.config.currentCharId}`);
  }

  // 设置封面图片
  setCoverPhoto(url: string): void {
    localStorage.setItem(`${STORAGE_KEYS.COVER_PHOTO_PREFIX}${this.config.currentCharId}`, url);
  }

  // 获取保存的个性签名
  getSavedSignature(): string {
    return localStorage.getItem(`${STORAGE_KEYS.SIGNATURE_PREFIX}${this.config.currentCharId}`) || '';
  }

  // 设置个性签名
  setSignature(signature: string): void {
    localStorage.setItem(`${STORAGE_KEYS.SIGNATURE_PREFIX}${this.config.currentCharId}`, signature);
  }

  // 获取保存的输入框占位符
  getSavedInputPlaceholder(): string | null {
    return localStorage.getItem(`${STORAGE_KEYS.INPUT_PLACEHOLDER_PREFIX}${this.config.currentCharId}`);
  }

  // 设置输入框占位符
  setInputPlaceholder(placeholder: string): void {
    localStorage.setItem(`${STORAGE_KEYS.INPUT_PLACEHOLDER_PREFIX}${this.config.currentCharId}`, placeholder);
  }

  // 获取手机尺寸设置
  getPhoneSize(): 'default' | 'medium' | 'small' {
    const savedSize = localStorage.getItem(STORAGE_KEYS.PHONE_SIZE) || 'default';
    return savedSize === 'medium' ? 'medium' : savedSize === 'small' ? 'small' : 'default';
  }

  // 设置手机尺寸
  setPhoneSize(size: 'default' | 'medium' | 'small'): void {
    localStorage.setItem(STORAGE_KEYS.PHONE_SIZE, size);
  }

  // 获取全屏模式手机大小设置（百分比）
  getFullscreenSize(): number {
    const savedSize = localStorage.getItem(STORAGE_KEYS.FULLSCREEN_SIZE) || '100';
    const size = parseInt(savedSize, 10);
    // 确保在有效范围内
    return Math.max(50, Math.min(200, size));
  }

  // 设置全屏模式手机大小（百分比）
  setFullscreenSize(size: number): void {
    // 确保在有效范围内
    const clampedSize = Math.max(50, Math.min(200, size));
    localStorage.setItem(STORAGE_KEYS.FULLSCREEN_SIZE, clampedSize.toString());
  }

  // 获取表情包尺寸设置
  getStickerSize(): number {
    const savedSize = localStorage.getItem(STORAGE_KEYS.STICKER_SIZE) || '120';
    return parseInt(savedSize, 10);
  }

  // 设置表情包尺寸
  setStickerSize(size: number): void {
    localStorage.setItem(STORAGE_KEYS.STICKER_SIZE, size.toString());
  }

  // 获取版本通知状态
  getLastNotifiedVersion(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_NOTIFIED_VERSION);
  }

  // 设置版本通知状态
  setLastNotifiedVersion(version: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_NOTIFIED_VERSION, version);
  }
}
