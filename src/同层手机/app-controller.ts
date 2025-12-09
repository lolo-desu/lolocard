import { AiResponseManager } from './ai-response-manager';
import { ConfigManager } from './config-manager';
import { addTestEntry, clearDebugData, loadDebugData, showDebugInfo, showTestEntryTypes } from './debug-data'; // 导入调试数据
import { DialogManager } from './dialog-manager';
import { InputHandler } from './input-handler';
import { MomentsManager } from './moments-manager';
import { BLMX_Protocol, ChatEntry, getTavernHelper, LogEntry } from './script';
import { ThemeEditor } from './theme-editor';
import { ThemeManager } from './theme-manager';
import { IAppController, IEventHandler } from './types';
import { UIManager } from './ui-manager';
import { UIRenderer } from './ui-renderer';
import { WallpaperController } from './wallpaper-controller';

/**
 * 应用主控制器
 *
 * 重构后的主控制器专注于：
 * 1. 模块初始化和协调
 * 2. 核心业务流程编排
 * 3. 模块间通信协调
 * 4. 对外接口统一管理
 *
 * 具体功能已拆分到各专门模块：
 * - ConfigManager: 配置管理
 * - UIManager: 界面管理
 * - MomentsManager: 朋友圈管理
 * - AiResponseManager: AI响应处理
 * - ThemeEditor: 主题编辑
 * - InputHandler: 输入处理
 * - WallpaperController: 壁纸管理
 */
export class AppController implements IAppController {
  private blmxManager!: BLMX_Protocol;
  private uiRenderer!: UIRenderer;
  private eventHandler!: IEventHandler;
  private themeManager!: ThemeManager;
  private wallpaperController!: WallpaperController;
  private configManager!: ConfigManager;
  private momentsManager!: MomentsManager;
  private aiResponseManager!: AiResponseManager;
  private themeEditor!: ThemeEditor;
  private inputHandler!: InputHandler;
  private uiManager!: UIManager;
  private dialogManager!: DialogManager;

  // 用户消息队列，模拟原版机制
  private userMessageQueue: ChatEntry[] = [];

  // 朋友圈通知状态管理
  hasMomentNotifications(): boolean {
    return this.momentsManager.hasMomentNotifications();
  }

  setMomentNotification(value: boolean): void {
    this.momentsManager.setMomentNotification(value);
  }

  constructor() {
    // 初始化配置管理器
    this.configManager = new ConfigManager();
  }

  // 初始化应用
  async initialize(): Promise<void> {
    try {
      window.currentGameDate = new Date();

      // 初始化主题管理器
      this.themeManager = new ThemeManager();
      this.wallpaperController = new WallpaperController(this.themeManager);

      // 确保应用当前主题的默认壁纸，但不覆盖用户已保存的壁纸设置
      const currentTheme = this.themeManager.getCurrentTheme();
      this.wallpaperController.initializeWallpapers(currentTheme);

      const charData = await getTavernHelper().getCharData();

      // 使用配置管理器加载配置
      await this.configManager.loadFromStorage(charData);

      // 如果没有保存的角色头像，获取默认头像
      let config = this.configManager.getConfig();
      if (!config.avatars.char) {
        const charAvatarPath = await getTavernHelper().getCharAvatarPath();
        this.configManager.updateAvatar('char', charAvatarPath);
        config = this.configManager.getConfig(); // 重新获取更新后的配置
      }

      // 更新UI元素 - 使用jQuery
      $('.contact-name').text(this.getDisplayName('char'));
      $('#moments-user-name').text(this.getDisplayName('user'));
      $('#moments-user-avatar').attr('src', config.avatars.user);

      // 加载朋友圈封面图片 - 使用jQuery
      const savedCoverPhoto = this.configManager.getSavedCoverPhoto();
      if (savedCoverPhoto) {
        $('#moments-cover-photo').attr('src', savedCoverPhoto);
      }

      // 加载个性签名 - 使用jQuery
      const savedSignature = this.configManager.getSavedSignature();
      $('#user-signature-display').text(savedSignature);

      // 初始化BLMX协议
      this.blmxManager = new BLMX_Protocol(config.currentCharId);
      await this.blmxManager.initialize();

      // 加载调试数据（仅在开发模式下）
      if ((window as any).BLMX_DEV_MODE) {
        loadDebugData(this.blmxManager);
      }

      // 首先初始化EventHandler，因为其他模块可能依赖它
      const EventHandler = (window as any).EventHandlerClass;
      this.eventHandler = new EventHandler(
        '#wechat-input-field',
        '#send-btn',
        '#plus-btn',
        this.blmxManager,
        this,
        null, // uiRenderer 稍后设置
        {
          getDisplayName: this.getDisplayName.bind(this),
          stageAndDisplayEntry: this.stageAndDisplayEntry.bind(this),
          triggerAiResponse: this.triggerAiResponse.bind(this),
          updateFooterButtonsState: this.updateFooterButtonsState.bind(this),
          renderChatHistory: this.renderChatHistory.bind(this),
          renderMomentsFeed: this.renderMomentsFeed.bind(this),
          togglePanel: this.togglePanel.bind(this),
          findStickerUrlByName: this.findStickerUrlByName.bind(this),
        },
      );

      // 初始化UI渲染器
      this.uiRenderer = new UIRenderer('.wechat-body', config.avatars, {
        getDisplayName: this.getDisplayName.bind(this),
        findStickerUrlByName: this.findStickerUrlByName.bind(this),
        onTransferAccept: this.handleTransferAccept.bind(this),
        onGiftAction: this.handleGiftAction.bind(this),
        onRecallMessage: this.handleMessageRecall.bind(this),
        isMessageInQueue: this.isMessageInQueue.bind(this),
      });

      // 更新EventHandler中的uiRenderer引用
      this.eventHandler.setUIRenderer(this.uiRenderer);

      // 初始化朋友圈管理器
      this.momentsManager = new MomentsManager(this.blmxManager, this.configManager, this.uiRenderer);

      // 初始化AI响应管理器
      this.aiResponseManager = new AiResponseManager(
        this.blmxManager,
        this.uiRenderer,
        this.eventHandler,
        this.momentsManager,
      );

      // 初始化主题编辑器
      this.themeEditor = new ThemeEditor(this.themeManager, () => {
        this.applyWallpapers();
      });

      // 初始化输入处理器
      this.inputHandler = new InputHandler(
        this.configManager,
        this.stageAndDisplayEntry.bind(this),
        this.updateFooterButtonsState.bind(this),
      );

      // 初始化UI管理器
      this.uiManager = new UIManager(
        this.configManager,
        this.blmxManager.addEntry.bind(this.blmxManager),
        this.uiRenderer.renderEntry.bind(this.uiRenderer),
      );

      // 初始化对话框管理器
      this.dialogManager = DialogManager.getInstance();

      // 应用壁纸
      this.applyWallpapers();

      // 渲染初始界面
      this.renderChatHistory();
      this.renderMomentsFeed();

      // 设置输入框提示文字
      this.uiManager.setupInputPlaceholder(this.getDisplayName('char'));

      // 更新底部按钮状态
      this.updateFooterButtonsState();

      // 初始化UI后设置主题选择器
      this.setupThemeSelector();

      // 确保自定义主题按钮显示正确的信息
      this.themeEditor.updateCustomThemeButton();

      // 初始化手机尺寸调整功能
      this.uiManager.setupPhoneSizeAdjustment();

      // 初始化表情包尺寸控制
      this.uiManager.setupStickerSizeControl();

      // 初始化字体设置功能
      this.uiManager.setupFontSelection();

      // 初始化全屏模式手机大小设置功能
      this.uiManager.setupFullscreenSizeAdjustment();

      // 显示当前版本
      this.uiManager.displayAppVersion();

      // 检查是否显示版本更新通知
      this.uiManager.checkVersionUpdateNotification();

      // 初始化朋友圈通知状态
      // 通知状态由 MomentsManager 管理

      // 事件监听器现在由 AiResponseManager 管理
    } catch (error) {
      // console.error('[BLMX] Failed to initialize:', error);
    }
  }

  // 核心数据访问方法
  getDisplayName(type: 'user' | 'char'): string {
    return this.configManager.getDisplayName(type);
  }

  findStickerUrlByName(name: string): string | undefined {
    return this.configManager.findStickerUrlByName(name);
  }

  // 壁纸管理
  applyWallpapers(): void {
    this.wallpaperController.applyWallpapers();
  }

  changeWallpaper(viewType: 'chat' | 'home' | 'settings'): void {
    this.wallpaperController.changeWallpaper(viewType);
  }

  // 界面渲染协调
  renderChatHistory(): void {
    this.uiRenderer.clearChat();
    if (!this.blmxManager) return;

    // 先渲染主日志中的消息
    this.blmxManager.logEntries.forEach((entry, index) => {
      if (entry.recalled) {
        this.uiRenderer.renderRecallNotice(entry, null, index);
      } else {
        this.uiRenderer.renderEntry(entry, index, false);
      }
    });

    // 再渲染队列中的消息（模拟原版机制）
    this.userMessageQueue.forEach((entry, queueIndex) => {
      // 队列中的消息索引应该是主日志长度 + 队列索引
      const actualIndex = this.blmxManager.logEntries.length + queueIndex;
      if (entry.recalled) {
        this.uiRenderer.renderRecallNotice(entry, null, actualIndex);
      } else {
        this.uiRenderer.renderEntry(entry, actualIndex, false);
      }
    });

    this.uiRenderer.refreshAllTimestamps();
    this.uiManager.scrollToBottom();
  }

  renderMomentsFeed(): void {
    this.momentsManager.renderMomentsFeed();
  }

  // 暂存并显示条目
  stageAndDisplayEntry(entry: LogEntry): void {
    if ('type' in entry) {
      if (entry.type === 'event') {
        // 为event类型的条目添加到日志中并渲染
        this.blmxManager.addEntry(entry);
        const entryIndex = this.blmxManager.logEntries.length - 1;
        this.uiRenderer.renderEntry(entry, entryIndex, true);

        // 如果是用户发送的事件，则标记为需要AI响应
        if ('sender' in entry && entry.sender === 'me') {
          this.eventHandler.setHasPendingNotifications(true);
        }

        return;
      } else if (entry.type === 'time') {
        // 跳过time类型处理
        return;
      }

      if (!entry.id) {
        entry.id = 'msg-' + Date.now() + Math.random();
      }

      // 处理图片上传
      if (
        entry.type === 'image' &&
        'content' in entry &&
        entry.content.type === 'url' &&
        typeof entry.content.value === 'string' &&
        entry.content.value.startsWith('data:image')
      ) {
        // 使用类型断言
        ((entry as ChatEntry).content as any).isNewForAI = true;
      }

      // 如果是用户消息，先添加到队列（模拟原版机制）
      if ('sender' in entry && entry.sender === 'me') {
        this.userMessageQueue.push(entry as ChatEntry);
        this.eventHandler.setHasPendingNotifications(true);

        // 渲染条目（使用全局索引：主日志长度 + 队列索引）
        const queueIndex = this.userMessageQueue.length - 1;
        const globalIndex = this.blmxManager.logEntries.length + queueIndex;
        this.uiRenderer.renderEntry(entry as ChatEntry, globalIndex, true);
      } else {
        // 非用户消息直接添加到主日志
        this.blmxManager.addEntry(entry as ChatEntry);
        const entryIndex = this.blmxManager.logEntries.length - 1;
        this.uiRenderer.renderEntry(entry as ChatEntry, entryIndex, true);
      }
      this.updateFooterButtonsState();
    }
  }

  // AI响应协调
  async triggerAiResponse(immediate: boolean = false): Promise<void> {
    // 检查是否有待处理的消息（队列机制）
    const hasQueuedMessages = this.userMessageQueue.length > 0;

    // 如果没有立即触发标志，且没有队列消息和通知，则不触发
    if (!immediate && !hasQueuedMessages && !this.eventHandler.hasNotifications) {
      return;
    }

    // 在触发AI响应前，将队列中的消息移到主日志（模拟原版机制）
    if (hasQueuedMessages) {
      // 复制队列中的消息
      const messagesToProcess = [...this.userMessageQueue];

      // 将消息添加到主日志
      messagesToProcess.forEach(entry => {
        if (entry.type === 'image' && 'content' in entry && (entry.content as any).isNewForAI) {
          (entry.content as any).value = `[用户发送的图片]`;
          delete (entry.content as any).isNewForAI;
        }
        this.blmxManager.addEntry(entry);
      });

      // 清空队列（模拟原版的 userMessageQueue = []）
      this.userMessageQueue = [];
    }

    await this.aiResponseManager.triggerAiResponse(immediate);
  }

  // UI控制协调
  updateFooterButtonsState(): void {
    this.uiManager.updateFooterButtonsState(this.eventHandler.hasNotifications);
  }

  togglePanel(panelToShow: string | null): void {
    this.uiManager.togglePanel(panelToShow);
  }

  // 导航到指定视图
  navigateTo(viewName: 'home' | 'wechat' | 'wechatHome' | 'moments' | 'settings'): void {
    const views = {
      home: '#app-homescreen',
      wechat: '#wechat-view',
      wechatHome: '#wechat-home',
      moments: '#moments-view',
      settings: '#settings-view',
    };

    try {
      // 首先尝试使用jQuery
      if (typeof $ !== 'undefined' && typeof jQuery !== 'undefined') {
        // 使用jQuery隐藏所有视图并显示目标视图
        $('.app-view').removeClass('active');
        $(views[viewName]).addClass('active');
      } else {
        // 备用方案：使用jQuery（应该总是可用的）
        $('.app-view').removeClass('active');
        const $targetView = $(views[viewName]);
        if ($targetView.length) {
          $targetView.addClass('active');
        } else {
          console.error(`[BLMX] 找不到目标视图: ${views[viewName]}`);
        }
      }

      // 当导航到朋友圈视图时，更新通知状态并重新渲染
      if (viewName === 'moments') {
        // 更新朋友圈通知状态
        this.setMomentNotification(false);

        // 重新渲染朋友圈内容
        this.renderMomentsFeed();
      }
    } catch (error) {
      console.error(`[BLMX] 导航错误:`, error);

      // 最后的备用方案，使用jQuery
      try {
        $('.app-view').removeClass('active');
        const $targetElement = $(views[viewName]);
        if ($targetElement.length) {
          $targetElement.addClass('active');
        }
      } catch (e) {
        console.error(`[BLMX] 最终导航失败:`, e);
      }
    }
  }

  async updateAvatar(avatarType: 'user' | 'char'): Promise<void> {
    const config = this.configManager.getConfig();
    const currentUrl = config.avatars[avatarType] || '';
    const displayName = this.getDisplayName(avatarType);

    if (avatarType === 'user') {
      // 用户头像：显示头像和个性签名设置对话框
      await this.showUserProfileDialog(currentUrl);
    } else {
      // 角色头像：只设置头像
      const newUrl = await this.dialogManager.showInputDialog(
        '更换头像',
        `${displayName}头像URL`,
        currentUrl,
        '请输入头像图片链接',
        'url',
      );

      if (newUrl) {
        this.configManager.updateAvatar(avatarType, newUrl);
        await this.dialogManager.alert('头像已更新！', '更新成功');
        this.renderChatHistory();
        this.renderMomentsFeed();
      }
    }
  }

  // 显示用户资料设置对话框（头像+个性签名）
  private async showUserProfileDialog(currentAvatarUrl: string): Promise<void> {
    const currentSignature = this.configManager.getSavedSignature();

    return new Promise(resolve => {
      // 创建对话框HTML，使用与现有对话框完全一致的样式
      const dialogHtml = `
        <div class="custom-dialog-overlay" id="user-profile-dialog-overlay">
          <div class="custom-dialog user-profile-dialog">
            <div class="dialog-header">
              <h3 class="dialog-title">个人资料设置</h3>
            </div>
            <div class="dialog-body">
              <div class="dialog-input-container">
                <input type="url" id="avatar-url-input" value="${currentAvatarUrl}" placeholder="请输入头像图片链接">
              </div>
              <div class="dialog-input-container">
                <input type="text" id="signature-input" value="${currentSignature}" placeholder="请输入个性签名">
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-button cancel-button" id="user-profile-cancel">取消</button>
              <button class="dialog-button primary-button" id="user-profile-confirm">确定</button>
            </div>
          </div>
        </div>
      `;

      // 添加到手机屏幕容器内，与其他对话框保持一致
      const $phoneScreen = $('.phone-screen');
      if ($phoneScreen.length) {
        $phoneScreen.append(dialogHtml);
      } else {
        // 如果找不到手机屏幕容器，回退到body
        $('body').append(dialogHtml);
      }
      const $overlay = $('#user-profile-dialog-overlay');

      // 显示对话框
      $overlay.show();

      // 绑定事件
      $('#user-profile-cancel').on('click', () => {
        $overlay.remove();
        resolve();
      });

      $('#user-profile-confirm').on('click', async () => {
        const newAvatarUrl = ($('#avatar-url-input').val() as string).trim();
        const newSignature = ($('#signature-input').val() as string).trim();

        let hasChanges = false;

        // 更新头像
        if (newAvatarUrl && newAvatarUrl !== currentAvatarUrl) {
          this.configManager.updateAvatar('user', newAvatarUrl);
          $('#moments-user-avatar').attr('src', newAvatarUrl);
          hasChanges = true;
        }

        // 更新个性签名
        if (newSignature !== currentSignature) {
          this.configManager.setSignature(newSignature);
          $('#user-signature-display').text(newSignature);
          hasChanges = true;

          // 询问是否发送朋友圈通知
          if (newSignature !== currentSignature) {
            const shouldNotify = await this.dialogManager.confirm(
              '是否要发送朋友圈动态通知AI你更改了个性签名？',
              '朋友圈通知',
            );
            if (shouldNotify) {
              this.momentsManager.notifyMomentChange('signature', currentSignature, newSignature);
              this.eventHandler.setHasPendingNotifications(true);
            }
          }
        }

        $overlay.remove();

        if (hasChanges) {
          this.renderChatHistory();
          this.renderMomentsFeed();
          await this.dialogManager.alert('个人资料已更新！', '更新成功');
        }

        resolve();
      });

      // ESC键关闭
      $(document).on('keydown.userProfile', e => {
        if (e.key === 'Escape') {
          $overlay.remove();
          $(document).off('keydown.userProfile');
          resolve();
        }
      });

      // 点击遮罩关闭
      $overlay.on('click', e => {
        if (e.target === $overlay[0]) {
          $overlay.remove();
          resolve();
        }
      });

      // 聚焦到头像输入框
      setTimeout(() => {
        $('#avatar-url-input').focus();
      }, 100);
    });
  }

  async updateCharRemark(): Promise<void> {
    const oldDisplayName = this.getDisplayName('char');
    const config = this.configManager.getConfig();
    const newRemark = await this.dialogManager.prompt('请输入新的备注:', config.charRemark, '修改备注');
    if (newRemark !== null) {
      this.configManager.updateCharRemark(newRemark);
      const newDisplayName = this.getDisplayName('char');

      $('#contact-name-header').text(newDisplayName);
      $('#wechat-input-field').attr(
        'placeholder',
        this.configManager.getSavedInputPlaceholder() || `与 ${newDisplayName} 对话...`,
      );

      $('#moments-feed-list .post-author-name').each(function () {
        if ($(this).text() === oldDisplayName) $(this).text(newDisplayName);
      });

      $('.recall-notice-text').each(function () {
        const text = $(this).text();
        if (text && text.includes(`"${oldDisplayName}"`)) {
          $(this).text(`"${newDisplayName}" 撤回了一条消息`);
        }
      });

      await this.dialogManager.alert('备注已更新！', '更新成功');
    }
  }

  async updateUserName(): Promise<void> {
    const oldName = this.getDisplayName('user');
    const newName = await this.dialogManager.showInputDialog('更改名字', '请输入你的新名字', oldName, '输入新名字...');

    if (newName && newName.trim() !== '' && newName !== oldName) {
      this.configManager.updateUserName(newName);
      $('#moments-user-name').text(newName);

      // 询问用户是否要发送朋友圈通知AI
      const shouldNotify = await this.dialogManager.confirm('是否要发送朋友圈动态通知AI你更改了名字？', '朋友圈通知');
      if (shouldNotify) {
        this.momentsManager.notifyMomentChange('name', oldName, newName);
        this.eventHandler.setHasPendingNotifications(true);
      }

      await this.dialogManager.alert('名字已更新！', '更新成功');
    }
  }

  // updateSignature方法已移除，个性签名设置已整合到用户头像设置对话框中

  async updateCoverPhoto(): Promise<void> {
    const currentCover = this.configManager.getSavedCoverPhoto() || '';
    const newCover = await this.dialogManager.showInputDialog(
      '朋友圈封面',
      '朋友圈封面URL',
      currentCover,
      '请输入封面图片链接',
      'url',
    );
    if (newCover) {
      this.configManager.setCoverPhoto(newCover);
      $('#moments-cover-photo').attr('src', newCover);
    }
  }

  // 输入处理协调
  async handleTransferAccept(data: any): Promise<void> {
    await this.inputHandler.handleTransferAccept(data);
  }

  async handleGiftAction(data: any): Promise<void> {
    await this.inputHandler.handleGiftAction(data);
    this.eventHandler.setHasPendingNotifications(true);
  }

  // 检查消息是否在队列中（模拟原版逻辑）
  isMessageInQueue(messageId: string): boolean {
    return this.userMessageQueue.some(entry => entry.id === messageId);
  }

  // 从用户消息队列中移除指定索引的消息
  removeFromUserMessageQueue(index: number): void {
    if (index >= 0 && index < this.userMessageQueue.length) {
      this.userMessageQueue.splice(index, 1);
    }
  }

  // 处理消息撤回（仅限文字消息）
  async handleMessageRecall(entry: ChatEntry): Promise<void> {
    try {
      // 只允许撤回文字消息
      if (entry.type !== 'message') {
        // 只能撤回文字消息
        return;
      }

      // 查找消息在队列中的索引
      const queueIndex = this.userMessageQueue.findIndex(queueEntry => queueEntry.id === entry.id);

      if (queueIndex === -1) {
        // 未找到要撤回的消息
        return;
      }

      const targetEntry = this.userMessageQueue[queueIndex];

      // 保存原始内容到recalled_content
      targetEntry.recalled_content = targetEntry.content;

      // 设置撤回时间戳
      targetEntry.recalled_timestamp = new Date().toISOString();

      // 标记消息为已撤回
      targetEntry.recalled = true;

      // 重新渲染聊天历史
      this.renderChatHistory();
    } catch (error) {
      console.error('撤回消息时出错:', error);
    }
  }

  // AI响应数据访问
  getLatestAiRawResponse(): string {
    return this.aiResponseManager.getLatestAiRawResponse();
  }

  getLatestSentPrompt(): string {
    return this.aiResponseManager.getLatestSentPrompt();
  }

  getRawAiResponse(): string {
    return this.aiResponseManager.getRawAiResponse();
  }

  getFullPrompt(): string {
    return this.aiResponseManager.getFullPrompt();
  }

  // 主题管理协调
  setupThemeSelector(): void {
    this.themeEditor.setupThemeSelector();
    this.themeEditor.addCustomThemeEditButton();
    this.setupThemeEditorEvents();
  }

  private setupThemeEditorEvents(): void {
    // 使用jQuery进行事件绑定
    $('#close-theme-editor').on('click', () => this.themeEditor.closeThemeEditor());
    $('#save-theme-btn').on('click', () => this.themeEditor.saveCustomTheme());
    $('#reset-theme-btn').on('click', () => this.themeEditor.resetThemeEditor());
    $('#custom-theme-btn').on('click', () => this.themeEditor.openThemeEditor());
    $('#import-theme-btn').on('click', () => this.themeEditor.importTheme());
    $('#export-json-btn').on('click', () => this.themeEditor.exportThemeAsJSON());
  }

  openThemeEditor(): void {
    this.themeEditor.openThemeEditor();
  }

  closeThemeEditor(): void {
    this.themeEditor.closeThemeEditor();
  }

  // 辅助方法：HEX转RGBA
  hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // 调试功能协调
  addTestEntry(entryType: string): void {
    addTestEntry(this.blmxManager, entryType);
  }

  clearDebugData(): void {
    clearDebugData(this.blmxManager);
  }

  showTestEntryTypes(): void {
    showTestEntryTypes();
  }

  showDebugInfo(): void {
    showDebugInfo(this);
  }

  // 处理消息撤回的朋友圈通知
  notifyRecallViaMoments(sender: 'USER' | 'CHAR', targetText: string): void {
    // 询问用户是否要发送朋友圈通知AI
    if (confirm('是否要发送朋友圈动态通知AI你撤回了消息？')) {
      this.momentsManager.notifyRecallViaMoments(sender, targetText);
      this.eventHandler.setHasPendingNotifications(true);
    }
  }

  /**
   * 清理所有资源，防止内存泄漏
   */
  cleanup(): void {
    // 清理各个管理器的资源
    if (this.aiResponseManager && typeof this.aiResponseManager.cleanup === 'function') {
      this.aiResponseManager.cleanup();
    }

    if (this.uiRenderer && typeof this.uiRenderer.cleanup === 'function') {
      this.uiRenderer.cleanup();
    }
  }
}
