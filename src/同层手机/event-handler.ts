import { DialogManager } from './dialog-manager';
import { BLMX_Protocol, ChatEntry, LogEntry } from './script';
import { IAppController, IEventHandler } from './types';
import { UIRenderer } from './ui-renderer';
import { safeJsonStringify, SafeStorage } from './utils';

// 类型定义
interface EventHandlerOptions {
  getDisplayName: (type: 'user' | 'char') => string;
  stageAndDisplayEntry: (entry: LogEntry) => void;
  triggerAiResponse: (immediate?: boolean) => Promise<void>;
  updateFooterButtonsState: () => void;
  renderChatHistory: () => void;
  renderMomentsFeed: () => void;
  togglePanel: (panelName: string | null) => void;
  findStickerUrlByName: (name: string) => string | undefined;
}

// 事件处理器类
export class EventHandler implements IEventHandler {
  private wechatInput: HTMLInputElement;
  private sendBtn: HTMLElement;
  private plusBtn: HTMLElement;
  private uiRenderer: UIRenderer | null;
  private options: EventHandlerOptions;
  private blmxManager: BLMX_Protocol;
  private appController: IAppController;
  private hasPendingNotifications: boolean = false;
  private dialogManager: DialogManager = DialogManager.getInstance();

  // 添加getter方法
  get hasNotifications(): boolean {
    return this.hasPendingNotifications;
  }

  // 设置UIRenderer引用
  setUIRenderer(uiRenderer: UIRenderer): void {
    this.uiRenderer = uiRenderer;
  }

  constructor(
    inputSelector: string,
    sendBtnSelector: string,
    plusBtnSelector: string,
    blmxManager: BLMX_Protocol,
    appController: IAppController,
    uiRenderer: UIRenderer | null,
    options: EventHandlerOptions,
  ) {
    this.wechatInput = $(inputSelector)[0] as HTMLInputElement;
    this.sendBtn = $(sendBtnSelector)[0] as HTMLElement;
    this.plusBtn = $(plusBtnSelector)[0] as HTMLElement;

    if (!this.wechatInput || !this.sendBtn || !this.plusBtn) {
      throw new Error('One or more required elements not found');
    }

    this.blmxManager = blmxManager;
    this.options = options;
    this.appController = appController;
    this.uiRenderer = uiRenderer;

    this.setupEventListeners();
  }

  // 设置是否有待处理的通知
  setHasPendingNotifications(value: boolean): void {
    this.hasPendingNotifications = value;
    this.options.updateFooterButtonsState();
  }

  // 统一更新时间到全局状态 + 状态栏 + 时间戳
  private updateGameTime(date: Date): void {
    if (isNaN(date.getTime())) return;
    window.currentGameDate = date;

    const $timeElement = $('#current-time');
    if ($timeElement.length) {
      const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      $timeElement.text(formattedTime);
    }

    if (this.uiRenderer) {
      this.uiRenderer.refreshAllTimestamps();
    }
  }

  // 删除模式：按日志下标或消息队列下标删除，并刷新界面
  private async deleteByLogIndex(indexToDelete: number, previewText: string): Promise<void> {
    const confirmed = await this.dialogManager.confirm(
      `确定要删除这条记录吗？\n\n预览: "${previewText}..."`,
      '删除记录',
    );
    if (!confirmed) return;

    const mainLogLength = this.blmxManager.logEntries.length;
    if (indexToDelete < mainLogLength) {
      this.blmxManager.logEntries.splice(indexToDelete, 1);
      await this.blmxManager.persistLogToStorage();
    } else {
      const queueIndex = indexToDelete - mainLogLength;
      this.appController.removeFromUserMessageQueue(queueIndex);
    }

    this.options.renderChatHistory();
    this.options.renderMomentsFeed();
  }

  // 删除模式：按 messageId 删除，并处理找不到日志的情况
  private async deleteByMessageId(
    messageId: string,
    previewText: string,
    $messageRow: JQuery<HTMLElement>,
  ): Promise<void> {
    const confirmed = await this.dialogManager.confirm(
      `确定要删除这条消息吗？\n\n预览: "${previewText}..."`,
      '删除消息',
    );
    if (!confirmed) return;

    const indexToDelete = this.blmxManager.logEntries.findIndex(entry => 'id' in entry && entry.id === messageId);

    if (indexToDelete !== -1) {
      this.blmxManager.logEntries.splice(indexToDelete, 1);
      await this.blmxManager.persistLogToStorage();
      this.options.renderChatHistory();
      this.options.renderMomentsFeed();
    } else {
      $messageRow.remove();
      await this.dialogManager.alert('无法找到对应的日志条目，已从界面移除该消息', '错误');
    }
  }

  // 添加长按监听器
  addLongPressListener(
    element: HTMLElement,
    callback: () => void,
    options: { duration: number; preventDefault: boolean } = { duration: 600, preventDefault: true },
  ): void {
    let timer: number;
    let startX: number, startY: number;

    const onStart = (e: PointerEvent) => {
      if (e.type === 'mousedown' && e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      if (options.preventDefault) e.preventDefault();
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = 0;
        callback();
      }, options.duration);
    };

    const onMove = (e: PointerEvent) => {
      if (!timer) return;
      const moveX = e.clientX;
      const moveY = e.clientY;
      if (Math.abs(moveX - startX) > 10 || Math.abs(moveY - startY) > 10) {
        clearTimeout(timer);
      }
    };

    const onEnd = () => clearTimeout(timer);

    element.addEventListener('pointerdown', onStart);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onEnd);
    element.addEventListener('pointerleave', onEnd);

    if (options.preventDefault) {
      element.addEventListener('contextmenu', e => e.preventDefault());
    }
  }

  // 提示用户输入日期和时间
  async promptForDateTime(defaultText: string): Promise<[string, string] | null> {
    const dateTimeInput = await this.dialogManager.prompt(
      '请输入日期和时间',
      defaultText,
      '日期时间设置',
      '确定',
      '取消',
      'text',
      '格式YYYY-MM-DD HH:mm',
    );

    if (!dateTimeInput || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTimeInput)) {
      if (dateTimeInput) await this.dialogManager.alert('格式错误，请输入YYYY-MM-DD HH:mm 格式。', '格式错误');
      return null;
    }

    const [newDate, newTime] = dateTimeInput.split(' ');
    const parsedDate = new Date(dateTimeInput.replace(' ', 'T'));

    if (isNaN(parsedDate.getTime())) {
      await this.dialogManager.alert('无效的日期时间格式。', '格式错误');
      return null;
    }

    // 统一更新系统当前日期和相关UI
    this.updateGameTime(parsedDate);

    return [newDate, newTime] as [string, string];
  }

  // 处理消息撤回
  async handleMessageRecall(messageId: string): Promise<void> {
    const entryToRecall = this.blmxManager.logEntries.find(e => 'id' in e && e.id === messageId) as
      | ChatEntry
      | undefined;

    if (entryToRecall) {
      const currentDate = window.currentGameDate || new Date();
      const timeString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

      const dateTimeResult = await this.promptForDateTime(timeString);

      if (dateTimeResult === null) {
        return;
      }

      const confirmed = await this.dialogManager.confirm('是否要撤回这条消息？', '确认撤回');

      if (confirmed) {
        const [newDate, newTime] = dateTimeResult;
        // 标记消息为已撤回
        entryToRecall.recalled = true;
        entryToRecall.recalled_timestamp = `${newDate} ${newTime}`;
        entryToRecall.recalled_content = entryToRecall.content;

        // 立即保存更新后的日志
        this.blmxManager.persistLogToStorage().then(() => {
          // 保存成功后，立即用最新的数据重绘整个聊天界面
          this.options.renderChatHistory();
        });

        // 更新底部按钮状态
        this.options.updateFooterButtonsState();

        // 如果是用户撤回的消息，询问是否通过朋友圈通知AI
        if (entryToRecall.sender === 'me') {
          // 获取消息内容
          const messageContent =
            typeof entryToRecall.content === 'string'
              ? entryToRecall.content
              : safeJsonStringify(entryToRecall.content);

          // 调用AppController的通知方法
          this.appController.notifyRecallViaMoments('USER', messageContent);
        }
      }
    } else {
      await this.dialogManager.alert('找不到该消息，无法撤回。', '错误');
    }
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 发送按钮点击事件 - 使用jQuery
    $(this.sendBtn).on('click', () => {
      const text = this.wechatInput.value.trim();
      if (text) {
        this.options.stageAndDisplayEntry({
          id: `msg-${Date.now()}${Math.random()}`,
          type: 'message',
          sender: 'me',
          content: text,
        });
        this.wechatInput.value = '';
        this.options.updateFooterButtonsState();
      } else {
        // 无论是否有通知，都强制触发AI响应
        this.hasPendingNotifications = false;
        this.options.triggerAiResponse(true); // 明确传递immediate=true
      }
    });

    $('#smile-btn').on('click', () => {
      this.options.togglePanel('sticker');
      this.renderStickerFeatures();
    });

    // Plus按钮点击事件 - 使用jQuery
    $(this.plusBtn).on('click', () => {
      this.options.togglePanel('plus');
      this.renderPlusFeatures();
    });

    $('#microphone-btn').on('click', async () => {
      const result = await this.dialogManager.showVoiceDialog();
      if (result) {
        this.options.stageAndDisplayEntry({
          id: `msg-${Date.now()}${Math.random()}`,
          type: 'voice',
          sender: 'me',
          content: { text: result.text, duration: result.duration },
        });
      }
    });

    // 输入框事件 - 使用jQuery
    $(this.wechatInput).on('keydown', (e: JQuery.KeyDownEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $(this.sendBtn).trigger('click');
      }
    });

    $(this.wechatInput).on('input', () => {
      this.options.updateFooterButtonsState();
    });

    $(this.wechatInput).on('focus', () => {
      this.options.togglePanel(null);
    });

    // 导航事件
    $('#app-wechat').on('click', () => this.appController.navigateTo('wechat'));
    $('#app-settings').on('click', () => this.appController.navigateTo('settings'));
    $('#wechat-back-btn-dummy').on('click', () => this.appController.navigateTo('home'));
    $('#settings-back-btn').on('click', () => this.appController.navigateTo('home'));
    $('#wechat-options-btn').on('click', () => this.appController.navigateTo('moments'));
    $('#moments-back-btn').on('click', () => this.appController.navigateTo('wechat'));

    // 渲染功能面板
    this.renderPlusFeatures();
    this.renderStickerFeatures();

    // 各种点击事件监听
    this.setupClickListeners();

    // 输入框长按事件 - 使用jQuery获取元素
    this.addLongPressListener(
      $('#wechat-input-field')[0] as HTMLElement,
      async () => {
        // 使用自定义对话框来更新输入框提示文字
        const currentPlaceholder = $('#wechat-input-field').attr('placeholder') || '';
        const newPlaceholder = await this.dialogManager.prompt(
          '修改输入框提示文字:',
          currentPlaceholder,
          '修改提示文字',
        );
        if (newPlaceholder !== null) {
          $('#wechat-input-field').attr('placeholder', newPlaceholder);
          localStorage.setItem(`blmx_input_placeholder_${this.blmxManager.getCharId()}`, newPlaceholder);
        }
      },
      { duration: 5000, preventDefault: false },
    );
  }

  private async setupClickListeners(): Promise<void> {
    $('#hidden-send-trigger').on('click', async () => {
      const confirmed = await this.dialogManager.confirm('是否要立即触发AI响应（即使没有新消息）？', '触发AI响应');
      if (confirmed) {
        this.options.triggerAiResponse(true);
      }
    });

    // 添加微信选项按钮点击事件 - 导航到朋友圈
    $('#wechat-options-btn').on('click', () => {
      this.appController.navigateTo('moments');
    });

    $('#delete-mode-trigger').on('click', async () => {
      const wechatView = $('#wechat-view');
      wechatView?.toggleClass('delete-mode');
      if (wechatView?.hasClass('delete-mode')) {
        await this.dialogManager.alert(
          '已进入删除模式。点击任意消息或时间戳可将其删除。再次点击左上角可退出。',
          '删除模式',
        );
      } else {
        await this.dialogManager.alert('已退出删除模式。', '删除模式');
      }
    });

    $('#post-moment-btn').on('click', async () => {
      const currentDate = window.currentGameDate || new Date();
      const timeString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

      // 使用综合对话框获取所有朋友圈信息
      const momentData = await this.dialogManager.showMomentDialog(timeString);
      if (!momentData) return; // 用户取消了发布

      // 为朋友圈生成唯一ID
      const momentId = `moment-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const momentEntry = {
        key: 'USER_MOMENT',
        id: momentId,
        data: {
          text: momentData.text,
          image: momentData.image,
          image_type: momentData.image_type,
          image_desc: momentData.image_desc,
          date: momentData.date,
          time: momentData.time,
        },
      } as import('./script').MomentEntry;

      // 添加到日志
      this.blmxManager.addEntry(momentEntry);

      // 检查是否需要推进时间
      const momentDateTime = `${momentData.date} ${momentData.time}`;
      const momentDate = new Date(momentDateTime.replace(' ', 'T'));
      const currentGameDate = window.currentGameDate || new Date();

      // 如果朋友圈时间晚于当前游戏时间，延迟询问用户是否要推进时间（避免对话框冲突）
      if (momentDate > currentGameDate) {
        // 延迟300ms避免与朋友圈发布对话框冲突
        setTimeout(async () => {
          const shouldAdvanceTime = await this.dialogManager.confirm(
            `朋友圈发布时间（${momentData.date} ${momentData.time}）晚于当前游戏时间。\n是否要将游戏时间推进到朋友圈发布时间？`,
            '时间推进确认',
          );

          if (shouldAdvanceTime) {
            // 推进时间到朋友圈发布时间
            const parsedDate = new Date(momentDateTime.replace(' ', 'T'));
            if (!isNaN(parsedDate.getTime())) {
              // 统一更新时间和相关UI
              this.updateGameTime(parsedDate);

              // 创建时间推进事件记录
              const timeAdvanceEvent: import('./script').EventLogEntry = {
                type: 'event',
                content: {
                  date: momentData.date,
                  time: momentData.time,
                  description: `时间来到了 ${momentData.date} ${momentData.time}`,
                },
                id: `event-${Date.now()}`,
              };
              this.blmxManager.addEntry(timeAdvanceEvent);

              // 重新渲染朋友圈以反映时间变化
              this.options.renderMomentsFeed();
            }
          }
        }, 300);
      }

      // 关键修改：先渲染朋友圈，再异步持久化数据
      this.options.renderMomentsFeed();

      // 设置通知状态
      this.setHasPendingNotifications(true);
      this.options.updateFooterButtonsState();

      // 在后台进行数据持久化，不阻塞UI更新
      this.blmxManager.persistLogToStorage().then(() => {});
    });

    const momentsFeedList = $('#moments-feed-list');
    momentsFeedList?.on('click', async e => {
      const target = $(e.target)[0] as HTMLElement;
      const postEl = target.closest('.moment-post') as HTMLElement;
      if (!postEl) return;

      // 获取朋友圈的唯一ID
      const momentId = postEl.dataset.momentId;
      if (!momentId) {
        console.error('[BLMX] 无法获取朋友圈ID，data-moment-id属性缺失');
        return;
      }
      // 朋友圈操作

      if (target.closest('.delete-moment-btn')) {
        const confirmed = await this.dialogManager.confirm(
          '确定要删除这条朋友圈吗？\n此操作也会删除相关的点赞和评论。',
          '删除朋友圈',
        );
        if (confirmed) {
          // momentId是序列ID，需要找到对应的实际朋友圈条目
          const momentPostLogIndices: number[] = [];
          this.blmxManager.logEntries.forEach((entry, index) => {
            if ('key' in entry && entry.key.includes('_MOMENT')) {
              momentPostLogIndices.push(index);
            }
          });

          const momentSequenceId = parseInt(momentId, 10);
          const actualMomentIndex = momentPostLogIndices[momentSequenceId];

          // 删除朋友圈

          if (actualMomentIndex !== undefined && actualMomentIndex >= 0) {
            // 先收集所有需要删除的条目索引（从后往前删除避免索引变化）
            const indicesToDelete: number[] = [actualMomentIndex];

            // 找到相关的点赞和评论索引
            this.blmxManager.logEntries.forEach((entry, index) => {
              if (
                'key' in entry &&
                (entry.key === 'USER_LIKE' || entry.key === 'USER_COMMENT') &&
                'data' in entry &&
                'target_post_id' in entry.data &&
                entry.data.target_post_id === momentSequenceId
              ) {
                indicesToDelete.push(index);
              }
            });

            // 按索引从大到小排序，从后往前删除
            indicesToDelete.sort((a, b) => b - a);
            for (const index of indicesToDelete) {
              this.blmxManager.logEntries.splice(index, 1);
            }

            // 保存更新后的日志
            this.blmxManager.persistLogToStorage().then(() => {
              // 重绘朋友圈界面
              this.options.renderMomentsFeed();
            });
          }
        }
      } else if (target.closest('.comment-button')) {
        // 处理评论/点赞按钮
        const result = await this.dialogManager.showCommentDialog();
        if (result) {
          if (result.type === 'like') {
            // 添加点赞
            const likeId = `like-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
            const likeEntry = {
              key: 'USER_LIKE',
              id: likeId,
              data: { target_post_id: parseInt(momentId, 10) },
            } as import('./script').LikeEntry;

            this.blmxManager.addEntry(likeEntry);
            // 用户点赞朋友圈
          } else if (result.type === 'comment' && result.content) {
            // 添加评论
            const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
            const commentEntry = {
              key: 'USER_COMMENT',
              id: commentId,
              data: { text: result.content, target_post_id: parseInt(momentId, 10) },
            } as import('./script').CommentEntry;

            this.blmxManager.addEntry(commentEntry);
            // 用户评论朋友圈
          }

          // 更新界面和状态
          this.options.renderMomentsFeed();
          this.setHasPendingNotifications(true);
          this.options.updateFooterButtonsState();

          // 持久化数据
          this.blmxManager.persistLogToStorage();
        }
      }
    });

    $(document.body).on('click', e => {
      const target = $(e.target)[0] as HTMLElement;
      if (target.matches('.message-avatar')) {
        const row = target.closest('.message-row');
        if (row) {
          const avatarType = row.classList.contains('me') ? 'user' : 'char';
          this.appController.updateAvatar(avatarType);
        }
      }
    });

    $('#contact-name-header').on('click', () => {
      this.appController.updateCharRemark();
    });
    $('#moments-user-name').on('click', () => {
      this.appController.updateUserName();
    });
    $('#moments-user-avatar').on('click', () => {
      this.appController.updateAvatar('user');
    });
    // 个性签名设置已整合到用户头像设置对话框中，无需单独点击事件
    $('#moments-cover-photo').on('click', () => {
      this.appController.updateCoverPhoto();
    });

    const $wechatBody = $('.wechat-body');
    // 使用jQuery的on方法，不使用capture参数
    $wechatBody.on('click', async (e: JQuery.ClickEvent) => {
      const $wechatView = $('#wechat-view');
      if (!$wechatView.hasClass('delete-mode')) {
        return;
      }

      // 首先检查是否有data-log-index属性
      const $targetRow = $(e.target).closest('[data-log-index]');
      if ($targetRow.length) {
        e.preventDefault();
        e.stopPropagation();

        // 以当前 DOM 顺序为准，避免 data-log-index 与最新日志错位
        const indexToDelete =
          $('.wechat-body [data-log-index]').index($targetRow) !== -1
            ? $('.wechat-body [data-log-index]').index($targetRow)
            : parseInt($targetRow.data('logIndex'), 10);
        const previewText = $targetRow.text().trim().replace(/\s+/g, ' ').substring(0, 50);

        await this.deleteByLogIndex(indexToDelete, previewText);
        return;
      }

      // 如果没有data-log-index属性，检查是否有data-message-id属性
      const $messageRow = $(e.target).closest('[data-message-id]');
      if ($messageRow.length) {
        e.preventDefault();
        e.stopPropagation();

        const messageId = $messageRow.data('messageId');
        const previewText = $messageRow.text().trim().replace(/\s+/g, ' ').substring(0, 50);

        await this.deleteByMessageId(messageId, previewText, $messageRow);
      }
    });

    $('#change-chat-wallpaper-btn').on('click', e => {
      e.preventDefault();
      this.appController.changeWallpaper('chat');
    });
    $('#change-home-wallpaper-btn').on('click', e => {
      e.preventDefault();
      this.appController.changeWallpaper('home');
    });
    $('#change-settings-wallpaper-btn').on('click', e => {
      e.preventDefault();
      this.appController.changeWallpaper('settings');
    });

    $('#show-last-ai-response-btn').on('click', async e => {
      e.preventDefault();
      const response = this.appController.getLatestAiRawResponse();
      await this.dialogManager.showScrollableText(response || '暂无AI回复内容', 'AI原始回复', '关闭');
    });

    $('#show-last-sent-prompt-btn').on('click', async e => {
      e.preventDefault();
      const prompt = this.appController.getLatestSentPrompt();
      await this.dialogManager.showScrollableText(prompt || '暂无发送的提示内容', '发送的提示', '关闭');
    });

    // 灵动岛全屏功能
    $('.dynamic-island').on('click', async () => {
      try {
        // 使用jQuery检查全屏状态，但仍需要使用原生API进行全屏操作
        if (!document.fullscreenElement) {
          // 进入全屏
          await document.documentElement.requestFullscreen();
        } else {
          // 退出全屏
          await document.exitFullscreen();
        }
      } catch (error) {
        console.warn('[BLMX] 全屏功能不支持或被阻止:', error);
        await this.dialogManager.alert('您的浏览器不支持全屏功能或被阻止', '全屏功能');
      }
    });
  }

  private renderPlusFeatures(): void {
    const $plusGrid = $('#plus-grid');
    if (!$plusGrid.length) return;

    const PLUS_FEATURES = [
      {
        label: '相册',
        icon: 'fas fa-images',
        action: async () => {
          const desc = await this.dialogManager.prompt('请输入图片描述:', '', '添加图片');
          if (desc) {
            this.options.stageAndDisplayEntry({
              type: 'image',
              sender: 'me',
              content: { type: 'desc', value: desc },
              id: `msg-${Date.now()}`,
            });
            this.options.togglePanel(null);
          }
        },
      },
      {
        label: '拍摄',
        icon: 'fas fa-camera',
        action: async () => {
          const currentDate = window.currentGameDate || new Date();
          const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
          const timeString = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;

          // 使用综合时间跳跃对话框
          const timeJumpData = await this.dialogManager.showTimeJumpDialog(`${dateString} ${timeString}`);
          if (!timeJumpData) return;

          const eventData = {
            date: timeJumpData.date,
            time: timeJumpData.time,
            description: timeJumpData.description,
          };

          // 按照原版逻辑：发送eventlog时立即更新游戏时间
          const [newDate, newTime] = [timeJumpData.date, timeJumpData.time];
          const newGameDate = new Date(`${newDate} ${newTime}`.replace(' ', 'T'));
          this.updateGameTime(newGameDate);

          this.options.stageAndDisplayEntry({
            type: 'event',
            content: eventData,
            id: `event-${Date.now()}`,
          } as import('./script').EventLogEntry);
          this.options.togglePanel(null);
        },
      },
      {
        label: '视频通话',
        icon: 'fas fa-video',
        action: async () =>
          await this.dialogManager.alert(
            '本同层手机只【免费发布于discord的尾巴镇社区和旅程社区，作者暴力美学，点击链接即可免费获取https://discord.com/channels/1379304008157499423/1388180976873766973。https://discord.com/channels/1291925535324110879/1388182155707814009',
            '关于作者',
          ),
      },
      {
        label: '位置',
        icon: 'fas fa-map-marker-alt',
        action: async () => {
          const loc = await this.dialogManager.prompt('请输入位置:', '', '发送位置');
          if (loc)
            this.options.stageAndDisplayEntry({
              type: 'location',
              sender: 'me',
              content: loc,
              id: `msg-${Date.now()}`,
            });
          this.options.togglePanel(null);
        },
      },
      {
        label: '红包',
        icon: 'fas fa-envelope',
        action: async () => {
          const result = await this.dialogManager.showRedPacketDialog();
          if (result) {
            const giftData = {
              name: '红包',
              price: result.amount,
              note: result.note,
              status: 'sent' as const,
            };
            this.options.stageAndDisplayEntry({
              type: 'gift',
              sender: 'me',
              content: safeJsonStringify(giftData),
              data: giftData,
              id: `msg-${Date.now()}`,
            });
            this.options.togglePanel(null);
          }
        },
      },
      {
        label: '转账',
        icon: 'fas fa-money-bill-wave',
        action: async () => {
          const result = await this.dialogManager.showTransferDialog();
          if (result) {
            const transferData = {
              amount: result.amount,
              note: result.note || ' ',
              status: 'sent' as const,
            };
            this.options.stageAndDisplayEntry({
              type: 'transfer',
              sender: 'me',
              content: safeJsonStringify(transferData),
              data: transferData,
              id: `msg-${Date.now()}`,
            });
            this.options.togglePanel(null);
          }
        },
      },
      {
        label: '文件',
        icon: 'fas fa-file-alt',
        action: async () => {
          const fileName = await this.dialogManager.prompt('请输入文件名:', '', '发送文件');
          if (fileName)
            this.options.stageAndDisplayEntry({
              type: 'file',
              sender: 'me',
              content: fileName,
              id: `msg-${Date.now()}`,
            });
          this.options.togglePanel(null);
        },
      },
      {
        label: '礼物',
        icon: 'fas fa-gift',
        action: async () => {
          const result = await this.dialogManager.showGiftDialog();
          if (result) {
            const giftData = {
              name: result.name,
              price: result.price,
              status: 'sent' as const,
            };
            this.options.stageAndDisplayEntry({
              type: 'gift',
              sender: 'me',
              content: safeJsonStringify(giftData),
              data: giftData,
              id: `msg-${Date.now()}`,
            });
            this.options.togglePanel(null);
          }
        },
      },
    ];

    // 确保uiRenderer存在且已经初始化
    if (this.uiRenderer) {
      // 直接使用DOM元素而不是jQuery对象
      this.uiRenderer.renderFeatureGrid($plusGrid[0], PLUS_FEATURES, {
        onToggleDeleteMode: () => {},
        onAddStickers: () => {},
      });
    } else {
      console.error('[BLMX] UIRenderer is not initialized');
    }
  }

  private renderStickerFeatures(): void {
    const $stickerGrid = $('#sticker-grid');
    if (!$stickerGrid.length) return;

    // 定义默认表情包
    const defaultGlobalStickers = [{ label: '好的', url: 'https://files.catbox.moe/3j0tpc.jpeg' }];

    // 读取全局表情包 - 使用与原版一致的存储键
    const GLOBAL_STICKER_STORAGE_KEY = 'blmx_wechat_stickers_global_blmx';
    const customStickers = SafeStorage.getItem(GLOBAL_STICKER_STORAGE_KEY, []) || [];
    const allStickers = [...defaultGlobalStickers, ...customStickers];

    // 创建表情包功能
    const features = allStickers.map(s => ({
      label: s.label,
      icon: s.url,
      isDefault: defaultGlobalStickers.some(ds => ds.label === s.label),
      action: () => {
        this.options.stageAndDisplayEntry({
          type: 'sticker',
          sender: 'me',
          content: s.label,
          id: `msg-${Date.now()}`,
        });
        this.options.togglePanel(null);
      },
    }));

    // 添加"表情管理"按钮
    features.unshift({
      label: '表情管理',
      icon: 'fas fa-cog', // 将图标改为齿轮图标
      isAddBtn: true,
      isDefault: false, // 添加isDefault属性
      action: () => {
        this.showStickerManager();
      },
    } as {
      label: string;
      icon: string;
      isAddBtn: boolean;
      isDefault: boolean;
      action: () => void;
    });

    // 确保uiRenderer存在且已经初始化
    if (this.uiRenderer) {
      // 直接使用DOM元素而不是jQuery对象
      this.uiRenderer.renderFeatureGrid($stickerGrid[0], features, {
        onToggleDeleteMode: () => this.showStickerManager(),
        onAddStickers: () => this.showStickerManager(),
      });
    } else {
      console.error('[BLMX] UIRenderer is not initialized');
    }
  }

  // 表情包管理界面
  private showStickerManager(): void {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'sticker-manager-modal';

    // 创建内容容器
    const container = document.createElement('div');
    container.className = 'sticker-manager-container';

    // 使用innerHTML创建完整结构，包含多标签页
    container.innerHTML = `
      <h2>表情包管理</h2>
      <div class="sticker-manager-tabs">
        <div class="tab-button active" data-tab="add-sticker">添加表情</div>
        <div class="tab-button" data-tab="batch-add">批量添加</div>
        <div class="tab-button" data-tab="delete-manage">删除管理</div>
      </div>
      <div class="sticker-manager-content">
        <!-- 添加单个表情标签页 -->
        <div class="tab-content active" data-tab="add-sticker">
          <div class="add-sticker-section">
            <div class="add-sticker-form">
              <div class="form-group">
                <label for="sticker-label">表情包名称</label>
                <input type="text" id="sticker-label" placeholder="表情描述/名称">
              </div>
              <div class="form-group">
                <label for="sticker-url">表情包URL</label>
                <input type="url" id="sticker-url" placeholder="表情图片URL链接">
              </div>
              <div class="preview-container">
                <div class="preview-label">预览</div>
                <img id="preview-img" class="preview-img" style="display: none;">
              </div>
              <button class="add-sticker-btn">添加表情包</button>
            </div>
          </div>
        </div>

        <!-- 批量添加标签页 -->
        <div class="tab-content" data-tab="batch-add">
          <div class="batch-add-section">
            <div class="batch-instructions">
              <p>批量添加格式说明：</p>
              <ul>
                <li>每个表情包格式：<strong>表情名称http://图片链接</strong></li>
                <li>多个表情包用<strong>英文逗号</strong>分隔</li>
                <li>也支持 <strong>表情名称=http://图片链接</strong> 格式</li>
                <li>示例：<code>笑脸https://example.com/smile.jpg,哭脸https://example.com/cry.jpg</code></li>
              </ul>
            </div>
            <div class="form-group">
              <label for="batch-textarea">批量表情包数据</label>
              <textarea id="batch-textarea" placeholder="请按照上述格式输入多个表情包..."></textarea>
            </div>
            <button class="batch-add-btn">批量添加表情包</button>
          </div>
        </div>

        <!-- 删除管理标签页 -->
        <div class="tab-content" data-tab="delete-manage">
          <div class="delete-manage-section">
            <div class="control-bar">
              <div class="selection-controls">
                <button class="select-all-btn">全选</button>
                <button class="deselect-all-btn">取消选择</button>
              </div>
              <button class="delete-selected-btn">删除选中</button>
            </div>
            <div class="sticker-list-container">
              <div class="sticker-grid" id="delete-sticker-grid">
                <!-- 表情包列表将在这里动态生成 -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sticker-manager-footer">
        <button class="dialog-button">关闭</button>
      </div>
    `;

    // 获取DOM元素
    const tabButtons = container.querySelectorAll('.tab-button') as NodeListOf<HTMLElement>;
    const tabContents = container.querySelectorAll('.tab-content') as NodeListOf<HTMLElement>;
    const closeBtn = container.querySelector('.dialog-button') as HTMLButtonElement;

    // 添加表情相关元素
    const labelInput = container.querySelector('#sticker-label') as HTMLInputElement;
    const urlInput = container.querySelector('#sticker-url') as HTMLInputElement;
    const previewImg = container.querySelector('#preview-img') as HTMLImageElement;
    const addStickerBtn = container.querySelector('.add-sticker-btn') as HTMLButtonElement;

    // 批量添加相关元素
    const batchTextarea = container.querySelector('#batch-textarea') as HTMLTextAreaElement;
    const batchAddBtn = container.querySelector('.batch-add-btn') as HTMLButtonElement;

    // 删除管理相关元素
    const selectAllBtn = container.querySelector('.select-all-btn') as HTMLButtonElement;
    const deselectAllBtn = container.querySelector('.deselect-all-btn') as HTMLButtonElement;
    const deleteSelectedBtn = container.querySelector('.delete-selected-btn') as HTMLButtonElement;
    const deleteStickerGrid = container.querySelector('#delete-sticker-grid') as HTMLElement;

    // 标签页切换功能
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // 移除所有活动状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // 设置当前标签为活动状态
        button.classList.add('active');
        const targetContent = container.querySelector(`.tab-content[data-tab="${targetTab}"]`);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        // 如果切换到删除管理标签页，渲染表情包列表
        if (targetTab === 'delete-manage') {
          renderDeleteStickerList();
        }
      });
    });

    // URL输入预览功能
    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim()) {
        previewImg.src = urlInput.value.trim();
        previewImg.style.display = 'block';
      } else {
        previewImg.style.display = 'none';
      }
    });

    // 添加单个表情包
    addStickerBtn.addEventListener('click', () => {
      const label = labelInput.value.trim();
      const url = urlInput.value.trim();

      if (!label || !url) {
        alert('请输入表情名称和URL');
        return;
      }

      const GLOBAL_STICKER_STORAGE_KEY = 'blmx_wechat_stickers_global_blmx';
      const existingStickers = SafeStorage.getItem<any[]>(GLOBAL_STICKER_STORAGE_KEY, []) || [];

      const newSticker = { label, url };
      existingStickers.push(newSticker);

      SafeStorage.setItem(GLOBAL_STICKER_STORAGE_KEY, existingStickers);
      alert('表情包添加成功！');

      // 清空输入框
      labelInput.value = '';
      urlInput.value = '';
      previewImg.style.display = 'none';

      // 刷新表情包菜单
      this.renderStickerFeatures();
    });

    // 批量添加表情包
    batchAddBtn.addEventListener('click', () => {
      const input = batchTextarea.value.trim();
      if (!input) {
        alert('请输入表情包数据');
        return;
      }

      const GLOBAL_STICKER_STORAGE_KEY = 'blmx_wechat_stickers_global_blmx';
      const pairs = input.split(',');
      const newStickers = [];

      for (const pair of pairs) {
        // 查找URL部分的起始位置 - 通常是http或https开头
        const urlStartIndex = pair.indexOf('http');

        if (urlStartIndex > 0) {
          const label = pair.substring(0, urlStartIndex).trim();
          const url = pair.substring(urlStartIndex).trim();

          if (label && url) {
            newStickers.push({ label, url });
          }
        } else if (pair.includes('=')) {
          // 支持label=url格式
          const [label, url] = pair.split('=').map(part => part.trim());
          if (label && url) {
            newStickers.push({ label, url });
          }
        }
      }

      if (newStickers.length > 0) {
        const existingStickers = SafeStorage.getItem<any[]>(GLOBAL_STICKER_STORAGE_KEY, []) || [];
        const updatedStickers = [...existingStickers, ...newStickers];
        SafeStorage.setItem(GLOBAL_STICKER_STORAGE_KEY, updatedStickers);
        alert(`${newStickers.length} 个表情包已添加！`);
        batchTextarea.value = '';

        // 刷新表情包菜单
        this.renderStickerFeatures();
      } else {
        alert('未找到有效的表情包格式。请按照上方的格式说明输入。');
      }
    });

    // 渲染删除管理的表情包列表
    const renderDeleteStickerList = () => {
      const GLOBAL_STICKER_STORAGE_KEY = 'blmx_wechat_stickers_global_blmx';
      const stickers = SafeStorage.getItem<any[]>(GLOBAL_STICKER_STORAGE_KEY, []) || [];

      deleteStickerGrid.innerHTML = '';

      if (stickers.length === 0) {
        const noStickersMsg = document.createElement('div');
        noStickersMsg.textContent = '没有表情包，请点击"添加表情"标签添加。';
        noStickersMsg.className = 'no-stickers-msg';
        deleteStickerGrid.appendChild(noStickersMsg);
        return;
      }

      stickers.forEach((sticker: any, index: number) => {
        const stickerItem = document.createElement('div');
        stickerItem.className = 'sticker-item';

        // 创建隐藏的原生checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'sticker-checkbox';
        checkbox.dataset.index = index.toString();

        // 创建可见的checkbox按钮
        const checkboxButton = document.createElement('div');
        checkboxButton.className = 'sticker-checkbox-button';

        // 创建其他元素
        const stickerImg = document.createElement('img');
        stickerImg.src = sticker.url;
        stickerImg.alt = sticker.label;
        stickerImg.className = 'sticker-preview';

        const stickerLabel = document.createElement('div');
        stickerLabel.className = 'sticker-label';
        stickerLabel.textContent = sticker.label;

        // 更新checkbox按钮状态
        const updateCheckboxState = (checked: boolean) => {
          if (checked) {
            checkboxButton.classList.add('checked');
          } else {
            checkboxButton.classList.remove('checked');
          }
        };

        // 点击事件
        const handleClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          checkbox.checked = !checkbox.checked;
          updateCheckboxState(checkbox.checked);
        };

        stickerItem.addEventListener('click', handleClick);
        checkboxButton.addEventListener('click', handleClick);

        // 组装元素
        stickerItem.appendChild(checkbox);
        stickerItem.appendChild(checkboxButton);
        stickerItem.appendChild(stickerImg);
        stickerItem.appendChild(stickerLabel);

        deleteStickerGrid.appendChild(stickerItem);

        // 设置初始状态
        updateCheckboxState(checkbox.checked);
      });
    };

    // 全选功能
    selectAllBtn.addEventListener('click', () => {
      const checkboxes = deleteStickerGrid.querySelectorAll('.sticker-checkbox') as NodeListOf<HTMLInputElement>;
      const checkboxButtons = deleteStickerGrid.querySelectorAll('.sticker-checkbox-button');

      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = true;
        checkboxButtons[index]?.classList.add('checked');
      });
    });

    // 取消选择功能
    deselectAllBtn.addEventListener('click', () => {
      const checkboxes = deleteStickerGrid.querySelectorAll('.sticker-checkbox') as NodeListOf<HTMLInputElement>;
      const checkboxButtons = deleteStickerGrid.querySelectorAll('.sticker-checkbox-button');

      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = false;
        checkboxButtons[index]?.classList.remove('checked');
      });
    });

    // 删除选中功能
    deleteSelectedBtn.addEventListener('click', () => {
      const checkboxes = deleteStickerGrid.querySelectorAll(
        '.sticker-checkbox:checked',
      ) as NodeListOf<HTMLInputElement>;

      if (checkboxes.length === 0) {
        alert('请选择要删除的表情包');
        return;
      }

      if (confirm(`确定要删除选中的 ${checkboxes.length} 个表情包吗？`)) {
        const GLOBAL_STICKER_STORAGE_KEY = 'blmx_wechat_stickers_global_blmx';
        const stickers = SafeStorage.getItem<any[]>(GLOBAL_STICKER_STORAGE_KEY, []) || [];

        // 获取要删除的索引（从大到小排序，避免删除时索引变化）
        const indicesToDelete = (window as any)._.chain(checkboxes)
          .map((checkbox: HTMLInputElement) => parseInt(checkbox.dataset.index!))
          .sortBy()
          .reverse()
          .value();

        // 删除选中的表情包
        indicesToDelete.forEach((index: number) => {
          stickers.splice(index, 1);
        });

        SafeStorage.setItem(GLOBAL_STICKER_STORAGE_KEY, stickers);
        alert(`已删除 ${checkboxes.length} 个表情包`);

        // 重新渲染列表
        renderDeleteStickerList();

        // 刷新表情包菜单
        this.renderStickerFeatures();
      }
    });

    // 关闭按钮事件
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // 点击遮罩层关闭
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    modal.appendChild(container);
    document.body.appendChild(modal);
  }
}
