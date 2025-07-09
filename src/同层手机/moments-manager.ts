// 朋友圈管理模块
// 负责朋友圈渲染、通知管理、时间格式化等功能

import { ConfigManager } from './config-manager';
import { BLMX_Protocol, LogEntry, MomentEntry } from './script';
import { UIRenderer } from './ui-renderer';

// Allow use of lodash as global
// @ts-ignore
declare const _: any;

export class MomentsManager {
  private blmxManager: BLMX_Protocol;
  private configManager: ConfigManager;
  private uiRenderer: UIRenderer;
  private hasMomentNotification: boolean = false;

  constructor(blmxManager: BLMX_Protocol, configManager: ConfigManager, uiRenderer: UIRenderer) {
    this.blmxManager = blmxManager;
    this.configManager = configManager;
    this.uiRenderer = uiRenderer;

    // 初始化通知状态
    this.hasMomentNotification = this.configManager.getMomentNotificationState();
  }

  // 渲染朋友圈
  renderMomentsFeed(): void {
    if (!this.blmxManager || !this.uiRenderer) return;

    const logEntries = this.blmxManager.logEntries;
    const avatars = this.configManager.getConfig().avatars;

    // 使用jQuery选择器
    const $momentsFeedList = $('#moments-feed-list');
    if (!$momentsFeedList.length) return;

    // 检查用户是否在朋友圈界面，如果是则更新最后查看时间戳
    const isCurrentlyInMomentsView = this.isInMomentsView();
    if (isCurrentlyInMomentsView) {
      this.setLastMomentViewTimestamp();
      // 清除朋友圈通知，因为用户正在查看朋友圈
      this.setMomentNotification(false);
    }

    $momentsFeedList.empty();

    // 使用lodash进行数据处理
    const posts: Record<number, any> = {};
    const momentPostLogIndices = _.reduce(
      logEntries,
      (result: number[], entry: LogEntry, index: number) => {
        if ('key' in entry && entry.key.includes('_MOMENT')) {
          result.push(index);
        }
        return result;
      },
      [],
    );

    // 收集所有帖子
    _.forEach(momentPostLogIndices, (logIndex: number) => {
      const entry = logEntries[logIndex];
      posts[logIndex] = { ...entry, likes: [], comments: [], id: logIndex };
    });

    // 检查是否有CHAR发表的新朋友圈或评论
    let hasNewCharMoments = false;
    const lastViewTimestamp = this.getLastMomentViewTimestamp();
    const userInMomentsView = this.isInMomentsView();

    // 处理点赞和评论
    _.forEach(logEntries, (entry: LogEntry, index: number) => {
      if ('key' in entry && (entry.key.includes('_LIKE') || entry.key.includes('_COMMENT'))) {
        // 修复target_post_id的处理逻辑，使用与原版相同的方式
        const targetPostAbsoluteIndex = momentPostLogIndices[parseInt((entry as any).data.target_post_id, 10)];
        const targetPost = posts[targetPostAbsoluteIndex];

        if (targetPost) {
          if (entry.key.includes('_LIKE')) {
            const likerName = entry.key.startsWith('USER') ? this.getDisplayName('user') : this.getDisplayName('char');
            if (!_.some(targetPost.likes, (l: any) => l.name === likerName)) {
              targetPost.likes.push({ key: entry.key, name: likerName, originalLogIndex: index });

              // 如果是CHAR点赞，且用户不在朋友圈界面，检查是否是新活动
              if (entry.key.startsWith('CHAR') && !userInMomentsView) {
                // 使用索引位置来判断是否是新活动：
                // 如果这个点赞在日志中的索引大于最后查看朋友圈时保存的日志长度，说明这是新活动
                const isNewActivity = index > lastViewTimestamp;
                if (isNewActivity) {
                  hasNewCharMoments = true;
                }
              }
            }
          } else {
            targetPost.comments.push({ ...entry, originalLogIndex: index });

            // 如果是CHAR评论，且用户不在朋友圈界面，检查是否是新活动
            if (entry.key.startsWith('CHAR') && !userInMomentsView) {
              // 使用索引位置来判断是否是新活动
              const isNewActivity = index > lastViewTimestamp;
              if (isNewActivity) {
                hasNewCharMoments = true;
              }
            }
          }
        } else {
          console.warn(
            `[BLMX] Could not find target post for interaction. target_post_id: ${
              (entry as any).data.target_post_id
            }, available posts: ${Object.keys(posts).join(', ')}`,
            entry,
          );
        }
      }

      // 检查CHAR发表的朋友圈
      if ('key' in entry && entry.key === 'CHAR_MOMENT') {
        // 使用索引位置判断是否是新朋友圈
        const isNewMoment = index > lastViewTimestamp;

        // 只有当是新朋友圈且用户不在朋友圈界面时才显示通知
        if (isNewMoment && !userInMomentsView) {
          hasNewCharMoments = true;
        }
      }
    });

    // 更新朋友圈通知状态 - 只有当有新活动且用户不在朋友圈界面时才设置通知
    if (!userInMomentsView) {
      this.setMomentNotification(hasNewCharMoments);
      // console.log('[BLMX] 朋友圈通知状态:', {
      //   hasNewCharMoments,
      //   lastViewIndex: this.getLastMomentViewTimestamp(),
      //   currentLogLength: this.blmxManager.logEntries.length,
      //   userInMomentsView,
      // });
    }

    // 反转帖子顺序并渲染
    _.chain(posts)
      .values()
      .reverse()
      .forEach((post: any) => {
        const fromUser = post.key.startsWith('USER');
        const authorName = fromUser ? this.getDisplayName('user') : this.getDisplayName('char');
        const authorAvatar = fromUser ? avatars.user : avatars.char;

        const $li = $('<li>').addClass('moment-post').attr('data-post-id', post.id);

        const momentSequenceId = momentPostLogIndices.indexOf(post.id);
        $li.attr('data-moment-sequence-id', String(momentSequenceId));

        // 设置moment-id属性，使用momentSequenceId作为朋友圈的唯一标识符
        // 这样可以确保点赞和评论正确关联到对应的朋友圈
        $li.attr('data-moment-id', String(momentSequenceId));

        // 构建媒体HTML
        let mediaHtml = '';
        if (post.data.image_type === 'url' && post.data.image) {
          mediaHtml = `<img src="${post.data.image}" class="post-media-image" />`;
        } else if (post.data.image_type === 'desc' && post.data.image) {
          mediaHtml = `<div class="image-desc-content"><div class="text-wrapper">${post.data.image}</div></div>`;
        }

        // 构建互动区域HTML
        let interactionsHtml = '';
        if (post.likes.length > 0 || post.comments.length > 0) {
          const likersHtml =
            post.likes.length > 0
              ? `<div class="likes-section"><i class="fas fa-heart"></i> ${_.map(
                  post.likes,
                  (l: any) => `<span class="liker-name">${l.name}</span>`,
                ).join(', ')}</div>`
              : '';

          const commentsHtml =
            post.comments.length > 0
              ? `<ul class="comments-section">${_.map(
                  post.comments,
                  (c: any) =>
                    `<li><span class="comment-author">${
                      c.key.startsWith('USER') ? this.getDisplayName('user') : this.getDisplayName('char')
                    }</span>: ${c.data.text}</li>`,
                ).join('')}</ul>`
              : '';

          interactionsHtml = `<div class="post-interactions">${likersHtml}${commentsHtml}</div>`;
        }

        // 使用自定义格式化时间函数
        const displayTime = this.formatMomentTime(post.data.date, post.data.time);
        const deleteBtnHtml = `<span class="delete-moment-btn" title="删除">删除</span>`;

        $li.html(`<img src="${authorAvatar}" class="post-author-avatar" />
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
                 </div>`);

        $momentsFeedList.append($li);
      })
      .value();

    // 确保加载最新的封面图片
    const savedCoverPhoto = this.configManager.getSavedCoverPhoto();
    if (savedCoverPhoto) {
      $('#moments-cover-photo').attr('src', savedCoverPhoto);
    }
  }

  // 格式化朋友圈时间显示
  private formatMomentTime(dateString: string, timeString: string): string {
    try {
      // 使用游戏内时间而非现实时间
      const now = window.currentGameDate ? new Date(window.currentGameDate) : new Date();
      const date = new Date(`${dateString} ${timeString}`);

      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) {
        return '刚刚';
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays === 2) {
        return '前天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        // 超过一周显示具体日期
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
      }
    } catch (error) {
      console.error('时间格式化错误:', error);
      return `${dateString} ${timeString}`;
    }
  }

  // 获取显示名称
  private getDisplayName(type: 'user' | 'char'): string {
    return this.configManager.getDisplayName(type);
  }

  // 检查用户是否在朋友圈界面
  private isInMomentsView(): boolean {
    return $('#moments-view').hasClass('active');
  }

  // 获取朋友圈通知状态
  hasMomentNotifications(): boolean {
    return this.configManager.getMomentNotificationState();
  }

  // 设置朋友圈通知状态
  setMomentNotification(value: boolean): void {
    this.hasMomentNotification = value;
    this.configManager.setMomentNotificationState(value);
    // 更新UI中的通知指示器
    this.updateMomentNotificationIndicator();
  }

  // 更新朋友圈通知指示器
  private updateMomentNotificationIndicator(): void {
    const $optionsBtn = $('#wechat-options-btn');
    if (this.hasMomentNotification) {
      if (!$optionsBtn.find('.notification-dot').length) {
        $optionsBtn.append('<span class="notification-dot"></span>');
      }
    } else {
      $optionsBtn.find('.notification-dot').remove();
    }
  }

  // 获取最后查看朋友圈时的时间戳
  private getLastMomentViewTimestamp(): number {
    return this.configManager.getLastMomentViewTimestamp();
  }

  // 设置最后查看朋友圈时的时间戳
  setLastMomentViewTimestamp(): void {
    // 保存当前日志长度作为最后查看时间点
    const currentLogLength = this.blmxManager.logEntries.length;
    this.configManager.setLastMomentViewTimestamp(currentLogLength);
  }

  // 进入朋友圈视图时的处理
  onEnterMomentsView(): void {
    // console.log('[BLMX] 进入朋友圈视图，清除通知并更新最后查看时间');

    // 使用jQuery更新封面图片
    const savedCoverPhoto = this.configManager.getSavedCoverPhoto();
    if (savedCoverPhoto) {
      $('#moments-cover-photo').attr('src', savedCoverPhoto);
    }

    // 使用jQuery更新个性签名
    const savedSignature = this.configManager.getSavedSignature();
    $('#user-signature-display').text(savedSignature || '点击头像设置个性签名');

    // 清除朋友圈通知
    this.setMomentNotification(false);

    // 更新最后查看朋友圈的时间戳
    this.setLastMomentViewTimestamp();

    // 记录当前日志长度用于调试
    // console.log('[BLMX] 更新朋友圈最后查看索引为:', this.blmxManager.logEntries.length);
  }

  // 创建用户朋友圈动态
  createUserMoment(text: string, image: string = '', imageType: string = 'none'): MomentEntry {
    // 获取当前日期时间
    const now = window.currentGameDate || new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return {
      key: 'USER_MOMENT',
      data: {
        text,
        image,
        image_type: imageType as 'url' | 'desc' | 'none',
        date: dateStr,
        time: timeStr,
      },
    };
  }

  // 发送朋友圈动态通知（用于用户名、签名等变更）
  notifyMomentChange(type: 'name' | 'signature', _oldValue: string, newValue: string): void {
    let text = '';
    switch (type) {
      case 'name':
        text = `我改名字啦，新名字是"${newValue}"`;
        break;
      case 'signature':
        text = `我的个性签名已更改为："${newValue}"`;
        break;
    }

    const momentEntry = this.createUserMoment(text);

    // 添加到聊天记录
    this.blmxManager.addEntry(momentEntry);
    this.renderMomentsFeed();
  }

  // 处理消息撤回的朋友圈通知
  notifyRecallViaMoments(sender: 'USER' | 'CHAR', targetText: string): any {
    // 获取当前日期时间
    const now = window.currentGameDate || new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 创建撤回通知条目
    const recallEntry = {
      key: 'RECALL',
      data: {
        sender: sender,
        target_text: targetText,
        timestamp: `${timeStr}`,
      },
    };

    // 添加到聊天记录
    this.blmxManager.addEntry(recallEntry as any);

    return recallEntry;
  }
}
