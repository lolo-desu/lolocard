import { EventManager } from './event-manager';
import {
  ChatEntry,
  EventLogEntry,
  FileMessage,
  GiftMessage,
  ImageMessage,
  LocationMessage,
  LogEntry,
  StickerMessage,
  TextMessage,
  TransferMessage,
  VoiceMessage,
} from './script';

// 类型定义
interface Avatars {
  user: string;
  char: string;
}

interface UIRendererOptions {
  getDisplayName: (type: 'user' | 'char') => string;
  findStickerUrlByName: (name: string) => string | undefined;
  onTransferAccept?: (data: TransferMessage['data']) => void;
  onGiftAction?: (data: GiftMessage['data']) => Promise<void>;
  onRecallMessage?: (entry: ChatEntry) => Promise<void>;
  isMessageInQueue?: (messageId: string) => boolean;
}

// UI渲染器类
export class UIRenderer {
  private wechatBody: HTMLElement;
  private lastDisplayedTimeInMinutes: number = -Infinity;
  private options: UIRendererOptions;
  private avatars: Avatars;
  private eventManager: EventManager;

  // 性能优化：添加渲染节流
  private renderQueue: LogEntry[] = [];
  private isRendering: boolean = false;
  private renderThrottle: number = 16; // 60fps

  constructor(wechatBodySelector: string, avatars: Avatars, options: UIRendererOptions) {
    const $wechatBody = $(wechatBodySelector);
    if (!$wechatBody.length) {
      throw new Error(`Element with selector "${wechatBodySelector}" not found`);
    }
    this.wechatBody = $wechatBody[0];
    this.avatars = avatars;
    this.options = options;
    this.eventManager = new EventManager();

    // 启动渲染队列处理
    this.startRenderLoop();
  }

  /**
   * 性能优化：批量渲染队列处理
   */
  private startRenderLoop(): void {
    const processQueue = () => {
      if (this.renderQueue.length > 0 && !this.isRendering) {
        this.isRendering = true;
        const batch = this.renderQueue.splice(0, 5); // 每次处理5个

        batch.forEach(entry => {
          this.renderEntry(entry, undefined, false);
        });

        this.isRendering = false;
      }

      setTimeout(processQueue, this.renderThrottle);
    };

    processQueue();
  }

  /**
   * 添加到渲染队列而不是立即渲染
   */
  private queueRender(entry: LogEntry): void {
    this.renderQueue.push(entry);
  }

  // 清除聊天界面
  clearChat(): void {
    this.wechatBody.innerHTML = '';
    this.lastDisplayedTimeInMinutes = -Infinity;
  }

  // 渲染单个条目到UI
  renderEntry(entry: LogEntry, index?: number, animate: boolean = false): void {
    if (!entry) return;

    if ('type' in entry) {
      switch (entry.type) {
        case 'message':
          if (entry.isSystemMessage) {
            this.renderSystemMessage(entry as TextMessage, animate, index);
          } else {
            this.addMessageToWeChat(entry, index, animate);
          }
          break;
        case 'time':
          this.addTimestampToWeChat(entry.content.date, entry.content.time, true, index);
          break;
        case 'event':
          this.addEventLogToWeChat(entry.content, index);
          break;
        default:
          this.addMessageToWeChat(entry, index, animate);
      }
    }
  }

  // 渲染撤回通知
  renderRecallNotice(entry: LogEntry, elementToReplace: HTMLElement | null = null, index?: number): void {
    const who = this.options.getDisplayName('sender' in entry && entry.sender === 'me' ? 'user' : 'char');
    const noticeRow = document.createElement('div');
    noticeRow.className = 'timestamp-row';

    // 确保添加data-log-index属性，这样在删除模式下可以显示删除按钮
    if (index !== undefined) {
      noticeRow.dataset.logIndex = index.toString();
    }

    // 如果有id，添加message-id属性
    if ('id' in entry) {
      noticeRow.dataset.messageId = entry.id;
    }

    const recalledText =
      typeof entry.recalled_content === 'object' && entry.recalled_content !== null
        ? entry.recalled_content.text
        : entry.recalled_content;

    noticeRow.innerHTML = `
      <div class="recall-notice-container">
        <div class="recall-notice-text">"${who}" 撤回了一条消息</div>
        <div class="recall-content">${recalledText || ('content' in entry ? entry.content : '')}</div>
      </div>
    `;

    const noticeTextEl = noticeRow.querySelector('.recall-notice-text');
    const contentEl = noticeRow.querySelector('.recall-content');

    if (noticeTextEl && contentEl) {
      noticeTextEl.addEventListener('click', () => {
        contentEl.classList.toggle('expanded');
      });
    }

    if (elementToReplace) {
      elementToReplace.replaceWith(noticeRow);
    } else {
      this.wechatBody.appendChild(noticeRow);
    }

    this.scrollToBottom();
  }

  renderMomentsFeed(
    logEntries: LogEntry[],
    getDisplayName: (type: 'user' | 'char') => string,
    avatars: { user: string; char: string },
  ): void {
    const momentsFeedList = $('#moments-feed-list')[0] as HTMLUListElement;
    if (!momentsFeedList) return;

    momentsFeedList.innerHTML = '';
    const posts: { [key: number]: any } = {};
    const momentPostLogIndices: number[] = [];

    logEntries.forEach((entry, index) => {
      if ('key' in entry && entry.key.includes('_MOMENT')) {
        momentPostLogIndices.push(index);
      }
    });

    momentPostLogIndices.forEach(logIndex => {
      const entry = logEntries[logIndex];
      posts[logIndex] = { ...(entry as any), likes: [], comments: [], id: logIndex };
    });

    logEntries.forEach((entry, index) => {
      if ('key' in entry && (entry.key.includes('_LIKE') || entry.key.includes('_COMMENT'))) {
        const targetPostAbsoluteIndex = momentPostLogIndices[parseInt((entry as any).data.target_post_id, 10)];
        const targetPost = posts[targetPostAbsoluteIndex];

        if (targetPost) {
          if (entry.key.includes('_LIKE')) {
            const likerName = entry.key.startsWith('USER') ? getDisplayName('user') : getDisplayName('char');
            if (!targetPost.likes.some((l: any) => l.name === likerName)) {
              targetPost.likes.push({ key: entry.key, name: likerName, originalLogIndex: index });
            }
          } else {
            targetPost.comments.push({ ...(entry as any), originalLogIndex: index });
          }
        } else {
          // 目标帖子未找到，跳过交互渲染
        }
      }
    });

    Object.values(posts)
      .reverse()
      .forEach(post => {
        const fromUser = post.key.startsWith('USER');
        const authorName = fromUser ? getDisplayName('user') : getDisplayName('char');
        const authorAvatar = fromUser ? avatars.user : avatars.char;
        const li = document.createElement('li');
        li.className = 'moment-post';
        li.dataset.postId = post.id;
        const momentSequenceId = momentPostLogIndices.indexOf(post.id);
        li.dataset.momentSequenceId = String(momentSequenceId);
        // 设置moment-id属性，用于删除功能
        li.dataset.momentId = String(momentSequenceId);

        let mediaHtml = '';
        if (post.data.image_type === 'url' && post.data.image) {
          mediaHtml = `<img src="${post.data.image}" class="post-media-image" />`;
        } else if (post.data.image_type === 'desc' && post.data.image) {
          mediaHtml = `<div class="image-desc-content"><div class="text-wrapper">${post.data.image}</div></div>`;
        }

        let interactionsHtml = '';
        if (post.likes.length > 0 || post.comments.length > 0) {
          const likersHtml =
            post.likes.length > 0
              ? `<div class="likes-section"><i class="fas fa-heart"></i> ${post.likes
                  .map((l: any) => `<span class="liker-name">${l.name}</span>`)
                  .join(', ')}</div>`
              : '';
          const commentsHtml =
            post.comments.length > 0
              ? `<ul class="comments-section">${post.comments
                  .map(
                    (c: any) =>
                      `<li><span class="comment-author">${
                        c.key.startsWith('USER') ? getDisplayName('user') : getDisplayName('char')
                      }</span>: ${c.data.text}</li>`,
                  )
                  .join('')}</ul>`
              : '';
          interactionsHtml = `<div class="post-interactions">${likersHtml}${commentsHtml}</div>`;
        }

        const displayTime = this.formatMomentTimestamp(post.data.date, post.data.time);
        const deleteBtnHtml = fromUser ? `<span class="delete-moment-btn" title="删除">删除</span>` : '';

        li.innerHTML = `<img src="${authorAvatar}" class="post-author-avatar" />
                         <div class="post-details">
                             <span class="post-author-name">${authorName}</span>
                             <p class="post-content">${post.data.text || ''}</p>
                             <div class="post-media">${mediaHtml}</div>
                             <div class="post-meta">
                                 <div class="post-meta-left">
                                     <span class="timestamp">${displayTime}</span>
                                     ${deleteBtnHtml}
                                 </div>
                                 <div class="post-actions">
                                     <span class="comment-button" title="评论/点赞"><i class="fas fa-comment-dots"></i></span>
                                 </div>
                             </div>
                             ${interactionsHtml}
                         </div>`;
        momentsFeedList.appendChild(li);
      });
  }

  // 显示"正在输入"指示器
  showTypingIndicator(): void {
    this.hideTypingIndicator(); // 确保只有一个
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator-id';
    const avatarSrc = this.avatars.char;

    indicator.innerHTML = `
      <img src="${avatarSrc}" class="message-avatar" />
      <div class="message-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    this.wechatBody.appendChild(indicator);
    this.scrollToBottom();
  }

  // 隐藏"正在输入"指示器
  hideTypingIndicator(): void {
    $('#typing-indicator-id').remove();
  }

  // 显示AI生成内容的加载动画（在灵动岛上）
  showGeneratingIndicator(): void {
    this.hideGeneratingIndicator(); // 确保只有一个

    // 获取灵动岛元素 - 使用jQuery
    const dynamicIsland = $('.dynamic-island')[0] as HTMLElement;
    if (!dynamicIsland) return;

    // 创建加载动画容器
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'generating-indicator';
    loadingContainer.id = 'generating-indicator-id';

    // 创建加载动画点
    loadingContainer.innerHTML = `
      <span class="generating-dot"></span>
      <span class="generating-dot"></span>
      <span class="generating-dot"></span>
    `;

    // 添加到灵动岛
    dynamicIsland.appendChild(loadingContainer);

    // 添加活跃类
    dynamicIsland.classList.add('generating-active');
  }

  // 隐藏AI生成内容的加载动画
  hideGeneratingIndicator(): void {
    $('#generating-indicator-id').remove();
    $('.dynamic-island').removeClass('generating-active');
  }

  // 计算打字延迟时间
  calculateTypingDelay(messageContent: string | object): number {
    // 对于非文本消息（如表情、图片等），使用一个较短的固定延迟
    if (typeof messageContent !== 'string' || messageContent.trim() === '') {
      return 800 + Math.random() * 700; // 0.8s to 1.5s
    }

    const textLength = messageContent.length;
    const baseDelay = 500; // 基础延迟 0.5s
    const perCharDelay = 40; // 每个字符增加 40ms
    const randomComponent = Math.random() * 800; // 增加 0-0.8s 的随机性

    const totalDelay = baseDelay + textLength * perCharDelay + randomComponent;

    // 确保总延迟不超过3秒 (3000ms)
    return Math.min(totalDelay, 3000);
  }

  // 添加消息到微信界面
  private addMessageToWeChat(entry: ChatEntry, index?: number, isNewMessage: boolean = false): void {
    const { id, sender, type } = entry;
    const messageRow = document.createElement('div');
    messageRow.className = 'message-row';
    if (index !== undefined) messageRow.dataset.logIndex = index.toString();
    messageRow.dataset.messageId = id;

    const senderClass = sender;
    messageRow.classList.add(senderClass);

    const avatarSrc = sender === 'me' ? this.avatars.user : this.avatars.char;
    const avatarImgHtml = `<img src="${avatarSrc}" class="message-avatar" />`;

    if (type === 'voice') {
      this.renderVoiceMessage(messageRow, entry as VoiceMessage, avatarImgHtml);
    } else {
      let bubbleContent = '';

      switch (type) {
        case 'sticker':
          bubbleContent = this.renderStickerContent(entry as StickerMessage);
          break;
        case 'image':
          bubbleContent = this.renderImageContent(entry as ImageMessage);
          break;
        case 'location':
          bubbleContent = this.renderLocationContent(entry as LocationMessage);
          break;
        case 'transfer':
          bubbleContent = this.renderTransferContent(entry as TransferMessage);
          break;
        case 'file':
          bubbleContent = this.renderFileContent(entry as FileMessage);
          break;
        case 'gift':
          {
            // 判断是红包还是礼物
            const giftEntry = entry as GiftMessage;
            const isRedEnvelope =
              giftEntry.data.name.includes('红包') ||
              giftEntry.data.name.includes('压岁钱') ||
              giftEntry.data.name.includes('红利');

            if (isRedEnvelope) {
              bubbleContent = this.renderRedEnvelopeContent(giftEntry);
            } else {
              bubbleContent = this.renderGiftContent(giftEntry);
            }
          }
          break;
        default:
          bubbleContent = (entry as TextMessage).content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          break;
      }

      // 根据消息类型添加特殊的气泡类
      let bubbleClass = 'message-bubble';
      if (type === 'sticker') {
        bubbleClass += ' sticker-bubble';
      } else if (type === 'image') {
        bubbleClass += ' image-desc-bubble';
      } else if (type === 'location') {
        bubbleClass += ' location-bubble';
      } else if (type === 'transfer') {
        bubbleClass += ' transfer-bubble';
      } else if (type === 'file') {
        bubbleClass += ' file-bubble';
      } else if (type === 'gift') {
        bubbleClass += ' gift-bubble';
      }

      messageRow.innerHTML =
        sender === 'me'
          ? `<div class="${bubbleClass}">${bubbleContent}</div>${avatarImgHtml}`
          : `${avatarImgHtml}<div class="${bubbleClass}">${bubbleContent}</div>`;

      const bubble = messageRow.querySelector('.message-bubble');
      if (bubble) {
        this.applyBubbleStyles(bubble, type, entry);
        this.setupBubbleInteractions(bubble, type, entry);
      }
    }

    if (isNewMessage) {
      messageRow.classList.add('new-message');
    }

    // 为USER文字消息添加长按撤回功能
    if (sender === 'me' && entry.type === 'message') {
      this.setupUserMessageLongPress(messageRow, entry);
    }

    this.wechatBody.appendChild(messageRow);
    this.scrollToBottom();
  }

  // 渲染语音消息
  private renderVoiceMessage(messageRow: HTMLElement, entry: VoiceMessage, avatarImgHtml: string): void {
    const contentContainer = document.createElement('div');
    contentContainer.className = 'message-content-container';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble voice-bubble';
    bubble.innerHTML = `<span class="duration">${entry.content.duration}"</span><i class="fas fa-wifi voice-icon"></i>`;

    const textRevealBox = document.createElement('div');
    textRevealBox.className = 'voice-text-content';
    textRevealBox.textContent = entry.content.text;

    contentContainer.appendChild(bubble);
    contentContainer.appendChild(textRevealBox);

    if (entry.sender === 'me') {
      messageRow.appendChild(contentContainer);
      messageRow.insertAdjacentHTML('beforeend', avatarImgHtml);
    } else {
      messageRow.insertAdjacentHTML('afterbegin', avatarImgHtml);
      messageRow.appendChild(contentContainer);
    }

    let longPressFired = false;
    const timerDuration = 500;
    let pressTimer: number;

    bubble.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && (e as PointerEvent).button !== 0) return;
      longPressFired = false;
      pressTimer = window.setTimeout(() => {
        messageRow.classList.add('voice-text-visible');
        longPressFired = true;
      }, timerDuration);
    });

    bubble.addEventListener('pointerup', () => {
      clearTimeout(pressTimer);
      if (!longPressFired) {
        if (messageRow.classList.contains('voice-text-visible')) {
          messageRow.classList.remove('voice-text-visible');
        }
      }
    });

    bubble.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    bubble.addEventListener('contextmenu', e => e.preventDefault());
  }

  // 渲染表情包内容
  private renderStickerContent(entry: StickerMessage): string {
    const stickerUrl = this.options.findStickerUrlByName(entry.content);
    if (stickerUrl) {
      // 使用纯HTML创建表情包容器和图片
      return `<div class="sticker-container"><img src="${stickerUrl}" class="sticker-img" /></div>`;
    } else {
      return `<div class="sticker-placeholder">[表情]</div>`;
    }
  }

  // 渲染图片内容
  private renderImageContent(entry: ImageMessage): string {
    if (entry.content.type === 'url') {
      let imageUrl = entry.content.value;
      if (imageUrl.startsWith('blmx-img-')) {
        const storedImage = sessionStorage.getItem(imageUrl);
        if (storedImage) {
          imageUrl = storedImage;
        } else {
          return `<div class="image-desc-content"><div class="text-wrapper">[图片已过期]</div></div>`;
        }
      }
      return `<img src="${imageUrl}" class="chat-image" />`;
    } else {
      const descText = entry.content.value;
      return `<div class="image-desc-content"><div class="text-wrapper">${String(descText)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</div></div>`;
    }
  }

  // 渲染位置内容
  private renderLocationContent(entry: LocationMessage): string {
    return `<div class="location-card">
      <div class="location-content">
        <div class="location-title">${entry.content}</div>
        <div class="location-subtitle">共享实时位置</div>
      </div>
      <div class="location-map-placeholder"></div>
    </div>`;
  }

  // 渲染转账内容
  private renderTransferContent(entry: TransferMessage): string {
    const isReceipt = entry.data.status !== 'sent';
    const detailsHtml = isReceipt
      ? `<div class="status-text">${entry.data.status === 'accepted' ? '已接收' : '已退还'}</div>`
      : `<div class="note">${entry.data.note || ' '}</div>`;
    const cardClass = isReceipt ? 'transfer-receipt' : 'transfer-initial';

    return `<div class="transfer-card ${cardClass}">
      <div class="transfer-content">
        <img src="https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E7%B4%A0%E6%9D%90/arrows.png" class="transfer-icon-image">
        <div class="transfer-details">
          <div class="amount">¥${entry.data.amount}</div>
          ${detailsHtml}
        </div>
      </div>
      <div class="transfer-footer">转账</div>
    </div>`;
  }

  // 渲染文件内容
  private renderFileContent(entry: FileMessage): string {
    return `<div class="file-card">
      <div class="file-content">
        <i class="fas fa-file-alt file-icon"></i>
        <div class="file-details">
          <div class="file-name">${entry.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>
      </div>
      <div class="file-footer">文件</div>
    </div>`;
  }

  // 渲染礼物内容
  private renderGiftContent(entry: GiftMessage): string {
    let detailsClass = '';
    let detailsContent = '';
    const isReceipt = entry.data.status !== 'sent';
    const cardClass = isReceipt ? 'gift-receipt' : 'gift-initial';

    if (entry.data.status === 'sent') {
      if (entry.data.price) {
        detailsClass = 'gift-price';
        detailsContent = `¥ ${entry.data.price}`;
      }
    } else {
      detailsClass = 'gift-status-text';
      detailsContent = entry.data.status === 'accepted' ? '已收下' : '已拒收';
    }

    return `<div class="gift-card ${cardClass}">
      <div class="gift-content">
        <span class="gift-icon-emoji">🎁</span>
        <div class="gift-details">
          <div class="gift-name">${entry.data.name}</div>
          ${detailsContent ? `<div class="${detailsClass}">${detailsContent}</div>` : ''}
        </div>
      </div>
      <div class="gift-footer">礼物</div>
    </div>`;
  }

  // 渲染红包内容
  private renderRedEnvelopeContent(entry: GiftMessage): string {
    let detailsClass = '';
    let detailsContent = '';
    const isReceipt = entry.data.status !== 'sent';
    const cardClass = isReceipt ? 'gift-receipt' : 'gift-initial';

    if (entry.data.status === 'sent') {
      if (entry.data.price) {
        detailsClass = 'gift-price';
        detailsContent = `¥ ${entry.data.price}`;
      }
    } else {
      detailsClass = 'gift-status-text';
      detailsContent = entry.data.status === 'accepted' ? '已领取' : '已拒收';
    }

    return `<div class="gift-card ${cardClass}">
      <div class="gift-content">
        <img src="https://gitgud.io/lolodesu/lolobabytutorial/-/raw/master/lologame/%E7%B4%A0%E6%9D%90/red-envelope.png" class="gift-icon-image">
        <div class="gift-details">
          <div class="gift-name">${entry.data.name}</div>
          ${detailsContent ? `<div class="${detailsClass}">${detailsContent}</div>` : ''}
        </div>
      </div>
      <div class="gift-footer">红包</div>
    </div>`;
  }

  // 应用气泡样式
  private applyBubbleStyles(bubble: Element, type: string, entry: ChatEntry): void {
    if (type === 'image') {
      if ((entry as ImageMessage).content.type === 'url') {
        bubble.classList.add('image-url-bubble');
      } else {
        bubble.classList.add('image-desc-bubble');
      }
    } else {
      const bubbleTypeMap: Record<string, string> = {
        sticker: 'sticker-bubble',
        location: 'location-bubble',
        transfer: 'transfer-bubble',
        file: 'file-bubble',
        gift: 'gift-bubble',
      };

      if (bubbleTypeMap[type]) {
        bubble.classList.add(bubbleTypeMap[type]);
      }
    }
  }

  // 设置气泡交互
  private setupBubbleInteractions(bubble: Element, type: string, entry: ChatEntry): void {
    if (type === 'transfer') {
      const transferCard = bubble.querySelector('.transfer-card');
      if (!transferCard) return;

      const transferEntry = entry as TransferMessage;
      const isReceipt = transferEntry.data.status !== 'sent';

      if (!isReceipt && entry.sender === 'them') {
        transferCard.classList.add('them');
        transferCard.addEventListener(
          'click',
          () => {
            // 直接接收转账，因为转账功能本身已经有自定义对话框
            if (this.options.onTransferAccept) {
              this.options.onTransferAccept({
                ...transferEntry.data,
                status: 'accepted' as 'accepted' | 'rejected',
              });
            }
          },
          { once: true },
        );
      }
    }

    if (type === 'gift') {
      const giftBubble = bubble as HTMLElement;
      const giftCard = bubble.querySelector('.gift-card');
      const giftEntry = entry as GiftMessage;
      const isReceipt = giftEntry.data.status !== 'sent';

      if (isReceipt) {
        // 已经接收或拒收的礼物，不需要添加点击事件
        return;
      }

      // 为所有未处理的礼物添加点击事件，无论是用户还是AI发送的
      if (giftCard) giftCard.classList.add(entry.sender === 'them' ? 'them' : 'me');
      giftBubble.classList.add('gift-clickable');
      giftBubble.addEventListener(
        'click',
        async () => {
          if (this.options.onGiftAction) {
            await this.options.onGiftAction(giftEntry.data);
          }

          giftBubble.classList.remove('gift-clickable');
        },
        { once: true },
      );
    }
  }

  // 添加时间戳到微信界面
  private addTimestampToWeChat(date: string, time: string, isSystemTime: boolean, index?: number): void {
    const timeText = this.formatMomentTimestamp(date, time);

    // 检查是否需要显示时间戳
    // 如果是系统时间（而不是用户手动插入的时间）
    if (isSystemTime) {
      // 只有纯时间（今天的消息）才需要进行10分钟过滤
      const isOnlyTime = timeText === time;

      if (isOnlyTime) {
        // 对于今天的消息，检查是否与上一条时间戳太接近
        const timeInMinutes = this.parseTimeToMinutes(timeText);
        if (timeInMinutes !== null && timeInMinutes - this.lastDisplayedTimeInMinutes < 10) {
          return; // 跳过显示这个时间戳
        }

        // 更新最后显示的时间
        if (timeInMinutes !== null) {
          this.lastDisplayedTimeInMinutes = timeInMinutes;
        }
      } else {
        // 对于昨天或更早的消息，总是显示并重置时间计数器
        this.lastDisplayedTimeInMinutes = -Infinity;
      }
    }

    // 创建并添加时间戳元素
    const t = document.createElement('div');
    t.className = 'timestamp-row';
    if (index !== undefined) t.dataset.logIndex = index.toString();

    // 存储原始日期和时间用于刷新
    t.dataset.originalDate = date;
    t.dataset.originalTime = time;

    t.innerHTML = `<span class="timestamp-text">${timeText}</span>`;
    this.wechatBody.appendChild(t);

    this.scrollToBottom();
  }

  // 添加事件日志到微信界面
  private addEventLogToWeChat(eventData: EventLogEntry['content'], index?: number): void {
    // 确保eventData具有必要的字段
    if (!eventData || !eventData.date || !eventData.time) {
      console.error('事件日志数据不完整:', eventData);
      return;
    }

    // 获取格式化后的时间文本，包含日期信息
    const timeText = this.formatMomentTimestamp(eventData.date, eventData.time);

    // 创建事件日志行
    const row = document.createElement('div');
    row.className = 'event-log-row';
    if (index !== undefined) row.dataset.logIndex = index.toString();

    // 存储原始日期和时间用于刷新
    row.dataset.originalDate = eventData.date;
    row.dataset.originalTime = eventData.time;

    // 如果没有描述，只显示时间；如果有描述，显示时间和描述
    if (eventData.description) {
      row.innerHTML = `
        <div class="event-log-container">
          <div class="event-time-text has-desc clickable">${timeText}</div>
          <div class="event-description">${eventData.description}</div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="event-log-container">
          <div class="event-time-text">${timeText}</div>
        </div>
      `;
    }

    // 为带有描述的事件添加点击展开功能
    if (eventData.description) {
      const timeEl = row.querySelector('.event-time-text');
      const descEl = row.querySelector('.event-description');

      if (timeEl && descEl) {
        timeEl.addEventListener('click', () => {
          // 只使用CSS类来控制显示/隐藏，不手动设置display属性
          descEl.classList.toggle('expanded');
        });
      }
    }

    // 添加到聊天界面并滚动到底部
    this.wechatBody.appendChild(row);
    this.scrollToBottom();
  }

  // 渲染系统消息
  private renderSystemMessage(entry: TextMessage, animate: boolean = false, index?: number): void {
    const chatContainer = this.wechatBody;
    if (!chatContainer) return;

    const systemRow = document.createElement('div');
    systemRow.className = 'event-log-row';
    if (animate) systemRow.classList.add('new-message');
    if (entry.id) {
      systemRow.dataset.messageId = entry.id;
    }
    if (index !== undefined) {
      systemRow.dataset.logIndex = index.toString();
    }

    const systemContainer = document.createElement('div');
    systemContainer.className = 'event-log-container';

    const systemText = document.createElement('div');
    systemText.className = 'event-time-text system-message';
    systemText.textContent = entry.content;

    systemContainer.appendChild(systemText);
    systemRow.appendChild(systemContainer);
    chatContainer.appendChild(systemRow);

    this.scrollToBottom();
  }

  // 解析时间为分钟数
  private parseTimeToMinutes(timeString: string): number | null {
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    return match ? 60 * parseInt(match[1], 10) + parseInt(match[2], 10) : null;
  }

  // 格式化时间戳
  private formatMomentTimestamp(dateString: string, timeString: string): string {
    if (!dateString || !timeString) return ' ';

    try {
      // 解析日期和当前日期
      const postDate = new Date(dateString);
      // 确保我们使用游戏时间而非现实时间
      const currentDate = window.currentGameDate ? new Date(window.currentGameDate) : new Date();

      // 提取年月日
      const postYear = postDate.getFullYear();
      const postMonth = postDate.getMonth();
      const postDay = postDate.getDate();

      const nowYear = currentDate.getFullYear();
      const nowMonth = currentDate.getMonth();
      const nowDay = currentDate.getDate();

      // 判断是否是今天的消息
      if (postYear === nowYear && postMonth === nowMonth && postDay === nowDay) {
        return timeString;
      }

      // 创建昨天的日期对象
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);
      const yesterdayYear = yesterday.getFullYear();
      const yesterdayMonth = yesterday.getMonth();
      const yesterdayDay = yesterday.getDate();

      // 判断是否是昨天的消息
      if (postYear === yesterdayYear && postMonth === yesterdayMonth && postDay === yesterdayDay) {
        return `昨天 ${timeString}`;
      }

      // 判断是否是今年的消息
      if (postYear === nowYear) {
        return `${postMonth + 1}月${postDay}日 ${timeString}`;
      }

      // 其他情况显示完整日期
      return `${postYear}年${postMonth + 1}月${postDay}日 ${timeString}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timeString; // 出错时至少返回时间
    }
  }

  // 刷新所有时间戳显示
  public refreshAllTimestamps(): void {
    // 刷新所有时间戳
    const timestampRows = $('.timestamp-row', this.wechatBody);
    const eventLogRows = $('.event-log-row', this.wechatBody);

    // 刷新时间戳行
    timestampRows.each((_, row) => {
      const $row = $(row);
      const $timestampText = $row.find('.timestamp-text');
      if ($timestampText.length) {
        const originalDate = $row.data('originalDate');
        const originalTime = $row.data('originalTime');
        if (originalDate && originalTime) {
          $timestampText.text(this.formatMomentTimestamp(originalDate, originalTime));
        }
      }
    });

    // 刷新事件日志行
    eventLogRows.each((_, row) => {
      const $row = $(row);
      const $eventTimeText = $row.find('.event-time-text');
      if ($eventTimeText.length) {
        const originalDate = $row.data('originalDate');
        const originalTime = $row.data('originalTime');
        if (originalDate && originalTime) {
          // 更新文本内容
          $eventTimeText.text(this.formatMomentTimestamp(originalDate, originalTime));
        }
      }
    });
  }

  renderFeatureGrid(
    gridElement: HTMLElement,
    features: any[],
    callbacks: {
      onToggleDeleteMode: () => void;
      onAddStickers: () => void;
    },
  ): void {
    if (!gridElement) {
      console.error('[BLMX] Grid element not found for renderFeatureGrid');
      return;
    }

    gridElement.innerHTML = '';
    const isDeleteMode = gridElement.classList.contains('sticker-delete-mode');

    features.forEach(feature => {
      const item = document.createElement('div');
      item.className = 'feature-item';

      let iconHtml = '';
      if (feature.isAddBtn) {
        // 如果是表情管理按钮，使用齿轮图标
        if (feature.label === '表情管理') {
          iconHtml = `<div class="feature-icon"><i class="fas fa-cog"></i></div>`;
        } else {
          iconHtml = `<div class="feature-icon"><i class="fas fa-${
            feature.label === '添加' ? 'plus' : 'trash-alt'
          }"></i></div>`;
        }
      } else if (feature.icon && feature.icon.startsWith('http')) {
        // 处理图片URL (表情包)
        iconHtml = `<div class="feature-icon"><img src="${feature.icon}" alt="${feature.label}" class="feature-icon-img"></div>`;
      } else if (
        feature.icon &&
        (feature.icon.startsWith('fas ') || feature.icon.startsWith('far ') || feature.icon.startsWith('fab '))
      ) {
        // 处理带空格的Font Awesome图标
        iconHtml = `<div class="feature-icon"><i class="${feature.icon} theme-icon"></i></div>`;
      } else if (feature.icon && feature.icon.startsWith('fa')) {
        // 处理不带空格的Font Awesome图标
        iconHtml = `<div class="feature-icon"><i class="${feature.icon} theme-icon"></i></div>`;
      } else {
        // 处理其他图标类型
        iconHtml = `<div class="feature-icon"><i class="${feature.icon || 'fas fa-question'}"></i></div>`;
      }

      item.innerHTML = `${iconHtml}<span class="feature-label">${feature.label}</span>`;

      const iconContainer = item.querySelector('.feature-icon');
      if (isDeleteMode && !feature.isAddBtn && !feature.isDefault) {
        // 创建隐藏的原生checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'sticker-checkbox';
        checkbox.dataset.stickerLabel = feature.label;
        item.appendChild(checkbox);

        // 创建可见的checkbox按钮
        const checkboxButton = document.createElement('div');
        checkboxButton.className = 'sticker-checkbox-button';
        checkboxButton.style.display = 'block';
        item.appendChild(checkboxButton);

        // 更新checkbox按钮状态
        const updateCheckboxState = (checked: boolean) => {
          if (checked) {
            checkboxButton.classList.add('checked');
          } else {
            checkboxButton.classList.remove('checked');
          }
          iconContainer?.classList.toggle('selected-for-delete', checked);
        };

        // 点击事件
        const handleClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          checkbox.checked = !checkbox.checked;
          updateCheckboxState(checkbox.checked);
        };

        item.addEventListener('click', handleClick);
        checkboxButton.addEventListener('click', handleClick);

        // 设置初始状态
        updateCheckboxState(checkbox.checked);
      } else if (feature.label === '添加') {
        item.addEventListener('click', callbacks.onAddStickers);
      } else if (feature.label === '删除' || feature.label === '表情管理') {
        item.addEventListener('click', callbacks.onToggleDeleteMode);
      } else {
        item.addEventListener('click', feature.action);
      }

      gridElement.appendChild(item);
    });
  }

  // 滚动到底部
  private scrollToBottom(): void {
    // 直接设置scrollTop，避免jQuery动画可能导致的滚动锁定问题
    this.wechatBody.scrollTop = this.wechatBody.scrollHeight;

    // 添加一个延迟执行的备份滚动，确保在DOM完全渲染后滚动生效
    setTimeout(() => {
      this.wechatBody.scrollTop = this.wechatBody.scrollHeight;
    }, 100);
  }

  // 为USER消息设置长按撤回功能 - 完全照抄原版逻辑
  private setupUserMessageLongPress(messageRow: HTMLElement, entry: ChatEntry): void {
    const $messageRow = $(messageRow);
    const $messageBubble = $messageRow.find('.message-bubble');
    const $targetElement = $messageBubble.length ? $messageBubble : $messageRow;

    // 原版长按监听器实现
    this.addLongPressListener($targetElement[0], () => {
      this.handleLongPressRecall(entry);
    });

    // 添加双击撤回功能作为备用方案（特别是在全屏模式下长按可能失效时）
    this.setupDoubleClickRecall($targetElement, entry);
  }

  // 原版长按监听器实现 - 完全照抄原版逻辑
  private addLongPressListener(
    element: HTMLElement,
    callback: () => void,
    options = { duration: 600, preventDefault: true },
  ): void {
    let timer: number;
    let startX: number, startY: number;

    const onStart = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      if (options.preventDefault) e.preventDefault();
      clearTimeout(timer);
      timer = setTimeout(() => {
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

  // 处理长按撤回 - 先检查消息是否可以撤回
  private async handleLongPressRecall(entry: ChatEntry): Promise<void> {
    try {
      // 检查消息是否可以撤回
      if (this.options.isMessageInQueue && this.options.isMessageInQueue(entry.id)) {
        await this.handleUserMessageRecall(entry);
      } else {
        // 使用jQuery UI的效果显示无法撤回
        const $messageElement = $(`[data-message-id="${entry.id}"]`);
        $messageElement.effect('shake', { times: 2, distance: 5 }, 300);

        const { DialogManager } = await import('./dialog-manager');
        const dialogManager = DialogManager.getInstance();
        await dialogManager.alert('消息已合并发送，无法撤回。', '无法撤回');
      }
    } catch (error) {
      console.error('长按撤回失败:', error);

      // 显示错误反馈
      const $messageElement = $(`[data-message-id="${entry.id}"]`);
      $messageElement.effect('shake', { times: 2, distance: 5 }, 300);
    }
  }

  // 处理USER消息撤回
  private async handleUserMessageRecall(entry: ChatEntry): Promise<void> {
    try {
      // 导入DialogManager
      const { DialogManager } = await import('./dialog-manager');
      const dialogManager = DialogManager.getInstance();

      // 确认撤回操作
      const confirmed = await dialogManager.confirm(
        '确定要撤回这条文字消息吗？撤回后对方将看到"你撤回了一条消息"。',
        '撤回文字消息',
        '撤回',
        '取消',
      );

      if (confirmed) {
        // 调用撤回功能
        if (this.options.onRecallMessage) {
          await this.options.onRecallMessage(entry);
        }
      }
    } catch (error) {
      console.error('撤回消息时出错:', error);
    }
  }

  // 设置双击撤回功能 - 作为长按撤回的备用方案
  private setupDoubleClickRecall($targetElement: JQuery, entry: ChatEntry): void {
    let clickCount = 0;
    let clickTimer: number;
    const doubleClickDelay = 300; // 300ms内的两次点击视为双击

    $targetElement.on('click.doubleClickRecall', e => {
      // 阻止事件冒泡，避免干扰其他点击事件
      e.stopPropagation();

      clickCount++;

      if (clickCount === 1) {
        // 第一次点击，启动定时器
        clickTimer = window.setTimeout(() => {
          // 超时后重置点击计数
          clickCount = 0;
        }, doubleClickDelay);
      } else if (clickCount === 2) {
        // 双击检测到，清除定时器并执行撤回
        clearTimeout(clickTimer);
        clickCount = 0;

        // 添加视觉反馈
        $targetElement.addClass('double-click-active');
        setTimeout(() => {
          $targetElement.removeClass('double-click-active');
        }, 200);

        // 添加触觉反馈（移动端）
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 50, 30]); // 双击振动模式
        }

        // 执行撤回操作
        this.handleDoubleClickRecall(entry);
      }
    });
  }

  // 处理双击撤回
  private async handleDoubleClickRecall(entry: ChatEntry): Promise<void> {
    try {
      // 检查消息是否可以撤回
      if (this.options.isMessageInQueue && this.options.isMessageInQueue(entry.id)) {
        await this.handleUserMessageRecall(entry);
      } else {
        // 使用jQuery UI的效果显示无法撤回
        const $messageElement = $(`[data-message-id="${entry.id}"]`);
        $messageElement.effect('shake', { times: 2, distance: 5 }, 300);

        const { DialogManager } = await import('./dialog-manager');
        const dialogManager = DialogManager.getInstance();
        await dialogManager.alert('消息已合并发送，无法撤回。', '无法撤回');
      }
    } catch (error) {
      console.error('双击撤回失败:', error);

      // 显示错误反馈
      const $messageElement = $(`[data-message-id="${entry.id}"]`);
      $messageElement.effect('shake', { times: 2, distance: 5 }, 300);
    }
  }

  /**
   * 清理资源，防止内存泄漏
   */
  cleanup(): void {
    this.eventManager.cleanup();
  }
}
