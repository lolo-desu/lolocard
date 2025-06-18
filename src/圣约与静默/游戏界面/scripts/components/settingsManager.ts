/**
 * 设置管理器组件
 * 负责管理游戏的设置，如字体大小和界面类型
 */
import * as _ from 'lodash';

export type UIMode = 'adaptive' | 'mobile' | 'desktop';

export interface GameSettings {
  fontSize: 'small' | 'medium' | 'large'; // 字体大小
  uiMode: UIMode; // 界面模式：自适应、手机、电脑
  gameHeight: number | 'auto'; // 游戏界面高度，单位px或auto自动适应
}

export class SettingsManager {
  // 默认设置
  private defaultSettings: GameSettings = {
    fontSize: 'medium',
    uiMode: 'adaptive',
    gameHeight: 'auto', // 默认为自动高度
  };

  // 当前设置
  private currentSettings: GameSettings;

  // 设置变更回调
  private onSettingsChangedCallback: ((settings: GameSettings) => void) | null = null;

  // 本地存储键
  private readonly SETTINGS_STORAGE_KEY = 'monastery_game_settings';

  constructor() {
    // 从本地存储加载设置或使用默认设置
    this.currentSettings = this.loadSettings();

    // 初始应用设置
    this.applySettings();

    console.log('设置管理器初始化完成');
  }

  /**
   * 从本地存储加载设置
   */
  private loadSettings(): GameSettings {
    try {
      const savedSettings = localStorage.getItem(this.SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        // 处理从旧版本升级的情况
        if (parsedSettings.hasOwnProperty('useMobileUI')) {
          // 从旧版本迁移
          parsedSettings.uiMode = parsedSettings.useMobileUI ? 'mobile' : 'desktop';
          delete parsedSettings.useMobileUI;
        }

        return {
          ...this.defaultSettings,
          ...parsedSettings,
        };
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }

    return { ...this.defaultSettings };
  }

  /**
   * 保存设置到本地存储
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(this.currentSettings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  /**
   * 应用当前设置到UI
   */
  public applySettings(): void {
    // 应用字体大小
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    document.documentElement.classList.add(`font-${this.currentSettings.fontSize}`);

    // 应用界面类型
    document.documentElement.classList.remove('mobile-ui', 'desktop-ui');

    // 根据 UI 模式应用相应的类
    switch (this.currentSettings.uiMode) {
      case 'mobile':
        document.documentElement.classList.add('mobile-ui');
        break;
      case 'desktop':
        document.documentElement.classList.add('desktop-ui');
        break;
      case 'adaptive':
      default:
        // 自适应模式不添加特殊类，依赖于CSS媒体查询
        break;
    }

    // 应用游戏高度
    const gameContainer = document.querySelector('.game-container') as HTMLElement;
    if (gameContainer) {
      if (this.currentSettings.gameHeight === 'auto') {
        // 自动高度模式，移除设置的高度
        gameContainer.style.height = '';
      } else {
        // 固定高度模式
        gameContainer.style.height = `${this.currentSettings.gameHeight}px`;
      }
    }

    console.log('已应用设置:', this.currentSettings);
  }

  /**
   * 更新设置
   */
  public updateSettings(settings: Partial<GameSettings>): void {
    // 更新当前设置
    this.currentSettings = {
      ...this.currentSettings,
      ...settings,
    };

    // 保存设置
    this.saveSettings();

    // 应用设置
    this.applySettings();

    // 调用变更回调
    if (this.onSettingsChangedCallback) {
      this.onSettingsChangedCallback(this.currentSettings);
    }
  }

  /**
   * 设置字体大小
   */
  public setFontSize(fontSize: 'small' | 'medium' | 'large'): void {
    this.updateSettings({ fontSize });
  }

  /**
   * 设置界面模式
   */
  public setUIMode(uiMode: UIMode): void {
    this.updateSettings({ uiMode });
  }

  /**
   * 设置游戏高度
   */
  public setGameHeight(gameHeight: number | 'auto'): void {
    this.updateSettings({ gameHeight });
  }

  /**
   * 获取当前设置
   */
  public getSettings(): GameSettings {
    return { ...this.currentSettings };
  }

  /**
   * 重置为默认设置
   */
  public resetSettings(): void {
    this.currentSettings = { ...this.defaultSettings };
    this.saveSettings();
    this.applySettings();

    // 调用变更回调
    if (this.onSettingsChangedCallback) {
      this.onSettingsChangedCallback(this.currentSettings);
    }
  }

  /**
   * 设置设置变更回调
   */
  public setOnSettingsChanged(callback: (settings: GameSettings) => void): void {
    this.onSettingsChangedCallback = callback;
  }

  /**
   * 显示设置对话框
   */
  public showSettingsDialog(): void {
    // 创建设置对话框HTML
    const dialogHtml = `
      <div id="settings-dialog" class="modal fade">
        <div class="modal-dialog modal-dialog-centered monastery-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="fas fa-cog"></i> 游戏设置</h5>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group monastery-form-group">
                <label for="font-size-select" class="monastery-label">
                  <i class="fas fa-font"></i> 字体大小
                </label>
                <select id="font-size-select" class="form-control monastery-select">
                  <option value="small" ${this.currentSettings.fontSize === 'small' ? 'selected' : ''}>小</option>
                  <option value="medium" ${this.currentSettings.fontSize === 'medium' ? 'selected' : ''}>中</option>
                  <option value="large" ${this.currentSettings.fontSize === 'large' ? 'selected' : ''}>大</option>
                </select>
              </div>
              <div class="form-group monastery-form-group">
                <label for="ui-mode-select" class="monastery-label">
                  <i class="fas fa-mobile-alt"></i> 界面模式
                </label>
                <select id="ui-mode-select" class="form-control monastery-select">
                  <option value="adaptive" ${
                    this.currentSettings.uiMode === 'adaptive' ? 'selected' : ''
                  }>自适应</option>
                  <option value="mobile" ${this.currentSettings.uiMode === 'mobile' ? 'selected' : ''}>手机</option>
                  <option value="desktop" ${this.currentSettings.uiMode === 'desktop' ? 'selected' : ''}>电脑</option>
                </select>
                <small class="form-text text-muted monastery-help-text">自适应: 根据屏幕大小自动调整; 手机/电脑: 强制使用对应界面</small>
              </div>
              <div class="form-group monastery-form-group">
                <label for="game-height-mode" class="monastery-label">
                  <i class="fas fa-arrows-alt-v"></i> 游戏界面高度
                </label>
                <div class="custom-control custom-switch mb-2">
                  <input type="checkbox" class="custom-control-input" id="height-custom-switch" ${
                    this.currentSettings.gameHeight !== 'auto' ? 'checked' : ''
                  }>
                  <label class="custom-control-label" for="height-custom-switch">自定义高度</label>
                </div>
                <div id="custom-height-container" class="mt-2 ${
                  this.currentSettings.gameHeight === 'auto' ? 'd-none' : ''
                }">
                  <div class="input-group">
                    <input 
                      type="number" 
                      id="game-height-input" 
                      class="form-control monastery-input" 
                      value="${this.currentSettings.gameHeight === 'auto' ? 1000 : this.currentSettings.gameHeight}" 
                      min="500" 
                      max="2000" 
                      step="50" 
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">px</span>
                    </div>
                  </div>
                  <small class="form-text text-muted monastery-help-text">推荐值: 1000px（可根据屏幕大小调整）</small>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary monastery-btn monastery-btn-secondary" id="reset-settings-btn">
                <i class="fas fa-undo"></i> 恢复默认
              </button>
              <button type="button" class="btn btn-primary monastery-btn monastery-btn-primary" id="save-settings-btn">
                <i class="fas fa-check"></i> 保存设置
              </button>
              <button type="button" class="btn btn-secondary monastery-btn monastery-btn-cancel" data-dismiss="modal">
                <i class="fas fa-times"></i> 取消
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 添加到页面
    $('body').append(dialogHtml);

    // 绑定高度设置开关事件
    $('#height-custom-switch').on('change', function () {
      if ($(this).is(':checked')) {
        $('#custom-height-container').removeClass('d-none');
      } else {
        $('#custom-height-container').addClass('d-none');
      }
    });

    // 绑定保存按钮事件
    $('#save-settings-btn').on('click', () => {
      const fontSize = $('#font-size-select').val() as 'small' | 'medium' | 'large';
      const uiMode = $('#ui-mode-select').val() as UIMode;
      const useCustomHeight = $('#height-custom-switch').is(':checked');

      // 根据是否启用自定义高度决定使用auto还是自定义值
      let gameHeight: number | 'auto' = 'auto';

      if (useCustomHeight) {
        const gameHeightInput = $('#game-height-input').val();
        // 使用lodash验证并转换高度值，确保在有效范围内
        gameHeight = _.clamp(
          _.parseInt(gameHeightInput as string) || 1000,
          500, // 最小值
          2000, // 最大值
        );
      }

      this.updateSettings({
        fontSize,
        uiMode,
        gameHeight,
      });

      $('#settings-dialog').modal('hide');
    });

    $('#reset-settings-btn').on('click', () => {
      if (confirm('确定要恢复默认设置吗？')) {
        this.resetSettings();

        // 更新对话框中的选项
        $('#font-size-select').val(this.defaultSettings.fontSize);
        $('#ui-mode-select').val(this.defaultSettings.uiMode);

        // 更新自定义高度开关
        $('#height-custom-switch').prop('checked', this.defaultSettings.gameHeight !== 'auto');
        if (this.defaultSettings.gameHeight === 'auto') {
          $('#custom-height-container').addClass('d-none');
        } else {
          $('#custom-height-container').removeClass('d-none');
          $('#game-height-input').val(this.defaultSettings.gameHeight);
        }
      }
    });

    // 显示对话框
    $('#settings-dialog').modal('show').data('backdrop', 'static').data('keyboard', false);

    // 当对话框关闭时移除
    $('#settings-dialog').on('hidden.bs.modal', function () {
      $(this).remove();
    });
  }
}
