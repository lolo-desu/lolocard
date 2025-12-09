// AI响应处理模块
// 负责AI响应触发、条目处理、动画显示等功能

import { logger } from './debug-logger';
import { EventManager } from './event-manager';
import { MomentsManager } from './moments-manager';
import { BLMX_Protocol, LogEntry, getTavernHelper } from './script';
import { IEventHandler } from './types';
import { UIRenderer } from './ui-renderer';
import { safeJsonParse, safeJsonStringify } from './utils';

export class AiResponseManager {
  private blmxManager: BLMX_Protocol;
  private uiRenderer: UIRenderer;
  private eventHandler: IEventHandler;
  private momentsManager: MomentsManager;
  private eventManager: EventManager;

  private isGenerating: boolean = false;
  private latestAiRawResponse: string = '还没有收到AI的回复。';
  private latestSentPrompt: string = '还没有发送任何内容给AI。';

  // 新增：记录原始响应和完整提示词，与同层手机保持一致
  private rawAiResponse: string = '';
  private fullPrompt: string = '';

  constructor(
    blmxManager: BLMX_Protocol,
    uiRenderer: UIRenderer,
    eventHandler: IEventHandler,
    momentsManager: MomentsManager,
  ) {
    this.blmxManager = blmxManager;
    this.uiRenderer = uiRenderer;
    this.eventHandler = eventHandler;
    this.momentsManager = momentsManager;
    this.eventManager = new EventManager();

    // 使用事件管理器来添加事件监听器，防止内存泄漏
    this.eventManager.addGlobalListener('js_generation_ended', (text: string) => {
      this.rawAiResponse = text;
      logger.debug('AiResponseManager', '原始AI响应已接收', { length: text.length });
    });

    this.eventManager.addGlobalListener('chat_completion_prompt_ready', (event_data: any) => {
      this.fullPrompt = safeJsonStringify(event_data.chat);
      logger.debug('AiResponseManager', '完整提示词已准备', { promptLength: this.fullPrompt.length });
    });
  }

  // 获取是否正在生成
  getIsGenerating(): boolean {
    return this.isGenerating;
  }

  // 触发AI响应 - 按照原始同层手机中的实现移植
  async triggerAiResponse(_immediate: boolean = false): Promise<void> {
    if (this.isGenerating || !this.blmxManager) return;

    // 检查逻辑已移到AppController中，这里直接处理

    // 检查全局标志，防止重复处理
    if ((window as any).BLMX_PROCESSING_AI_RESPONSE) {
      logger.debug('AiResponseManager', '已有AI响应处理进行中，跳过重复处理');
      return;
    }

    // 设置全局处理标志
    (window as any).BLMX_PROCESSING_AI_RESPONSE = true;
    this.isGenerating = true;

    try {
      // getContextForAI should now get all necessary context from the main log.
      let contextForAI = this.blmxManager.getContextForAI();

      contextForAI +=
        '\n【BLMX_LOG中的内容为目前过往线上聊天记录，其中也包括最新的USER输入，请你作为CHAR进行回应。】\n【本次响应必须遵循线上规则】【必须使用特殊约定的格式且保证正确换行】';
      this.latestSentPrompt = contextForAI;

      // Clean up 'isNewForAI' flags from the main log after generating context.
      this.blmxManager.logEntries.forEach(entry => {
        if ('type' in entry && entry.type === 'image' && 'content' in entry && (entry.content as any).isNewForAI) {
          (entry.content as any).value = `[用户发送的图片]`;
          delete (entry.content as any).isNewForAI;
        }
      });

      // 重置待响应标志
      this.eventHandler.setHasPendingNotifications(false);

      const MAX_RETRIES = 2;
      let attempt = 0;
      let success = false;

      while (attempt <= MAX_RETRIES && !success) {
        if (attempt > 0) {
          logger.warn('AiResponseManager', `AI响应为空，重试中`, { attempt: attempt + 1, maxRetries: MAX_RETRIES + 1 });
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        try {
          // 显示灵动岛生成指示器，而不是打字指示器
          this.uiRenderer.showGeneratingIndicator();

          const stream = await getTavernHelper().generate({ user_input: contextForAI, should_stream: true });
          let finalAiResponse = '';

          for await (const chunk of stream) {
            finalAiResponse += chunk;
          }

          // 隐藏灵动岛生成指示器
          this.uiRenderer.hideGeneratingIndicator();
          this.latestAiRawResponse = finalAiResponse.trim();

          // 记录原始响应以便调试
          if (!this.rawAiResponse) {
            this.rawAiResponse = finalAiResponse.trim();
            logger.debug('AiResponseManager', '直接获取的原始AI响应', { length: this.rawAiResponse.length });
          }

          // 处理重复响应问题 - 从原始同层手机移植过来
          let processedResponse = finalAiResponse.trim();
          const len = processedResponse.length;

          // 检查完全相同的两半
          if (len > 0 && len % 2 === 0) {
            const firstHalf = processedResponse.substring(0, len / 2);
            const secondHalf = processedResponse.substring(len / 2);

            if (firstHalf === secondHalf && firstHalf.trim() !== '') {
              logger.warn('AiResponseManager', '检测到完全重复的AI响应，自动修剪');
              processedResponse = firstHalf;
            }
          }

          // 增强的重复检测：检查是否有相同的行被重复
          const lines = processedResponse.split('\n').filter(line => line.trim() !== '');
          if (lines.length > 1) {
            const uniqueLines = (window as any)._.uniq(lines);
            // 如果去重后的行数明显少于原始行数，可能存在重复
            if (uniqueLines.length < lines.length * 0.7) {
              logger.warn('AiResponseManager', '检测到AI响应中的潜在行重复，仅使用唯一行');
              processedResponse = uniqueLines.join('\n');
            }
          }

          if (processedResponse.trim()) {
            // 处理AI响应
            success = await this.processAiResponse(processedResponse.trim());
          }
        } catch (error) {
          logger.error('AiResponseManager', `尝试${attempt}时出错`, { attempt, error });
          this.uiRenderer.hideGeneratingIndicator();

          if (attempt >= MAX_RETRIES) {
            this.showErrorMessage('AI代理出错 (详情见F12控制台)');
          }
        }

        attempt++;
      }

      if (!success && attempt > MAX_RETRIES) {
        console.error(`[BLMX] AI generation failed after ${MAX_RETRIES + 1} attempts (empty response).`);
        this.showErrorMessage('(AI响应为空，请稍后再试或手动触发)');
        this.latestAiRawResponse = '[AI响应为空]';
      }

      await this.blmxManager.persistLogToStorage();

      // 刷新所有时间戳的显示，确保AI回复的时间戳正确展示
      this.uiRenderer.refreshAllTimestamps();
    } catch (error) {
      console.error('[BLMX] Error in triggerAiResponse:', error);
    } finally {
      // 无论成功失败，都重置处理标志
      this.isGenerating = false;
      (window as any).BLMX_PROCESSING_AI_RESPONSE = false;
    }
  }

  // 处理AI响应
  private async processAiResponse(response: string): Promise<boolean> {
    const entriesForAnimation: LogEntry[] = [];
    let hasNewCharMoments = false;

    // 预处理响应文本
    const processedResponse = response.replace(/^\s*[[{].*[\]}]\s*$/gm, match => {
      const parsed = safeJsonParse(match.trim());
      return parsed !== null ? match : '';
    });

    const responseLines = processedResponse.split('\n').filter(line => line.trim() !== '');
    logger.debug('AiResponseManager', '处理AI响应行', { lineCount: responseLines.length });

    responseLines.forEach(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) {
        logger.debug('AiResponseManager', '跳过没有分隔符的行', { line });
        return;
      }

      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      logger.debug('AiResponseManager', '解析响应', {
        key,
        valuePreview: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
        valueLength: value.length,
      });

      if (!key || !value) return;

      try {
        let newEntry: LogEntry | null = null;
        // 声明所有可能在case中使用的变量
        const id = `ai-${Date.now()}-${Math.random()}`;
        let voiceMatch: RegExpMatchArray | null = null;
        let stickerMatch: RegExpMatchArray | null = null;
        let imageMatch: RegExpMatchArray | null = null;
        let locationMatch: RegExpMatchArray | null = null;
        let transferMatch: RegExpMatchArray | null = null;
        let fileMatch: RegExpMatchArray | null = null;
        let giftMatch: RegExpMatchArray | null = null;

        switch (key) {
          case 'CHAR_MOMENT':
          case 'CHAR_COMMENT':
          case 'CHAR_LIKE':
            newEntry = { key, data: safeJsonParse(value) } as any;
            this.blmxManager.addEntry(newEntry);

            // 将朋友圈相关条目也添加到动画队列中
            if (newEntry) {
              entriesForAnimation.push(newEntry);
              hasNewCharMoments = true;
            }

            // 立即更新朋友圈界面，不等待动画完成
            if (this.momentsManager) {
              this.momentsManager.renderMomentsFeed();
            }
            break;

          case 'message': {
            const parsedMessageContent = safeJsonParse(value);
            newEntry = {
              id: `ai-${Date.now()}-${Math.random()}`,
              type: 'message',
              sender: 'them',
              content: parsedMessageContent !== null ? parsedMessageContent : value,
            } as any;
            this.blmxManager.addEntry(newEntry);
            if (newEntry) entriesForAnimation.push(newEntry);
            break;
          }

          case 'CHAR':
            // 兼容原始的CHAR格式
            voiceMatch = value.match(/^\[语音:\s*({.*})\]/);
            stickerMatch = value.match(/^\[表情:\s*(.*)\]/);
            imageMatch = value.match(/^\[图片:\s*(.*)\]/);
            locationMatch = value.match(/^\[位置:\s*(.*)\]/);
            transferMatch = value.match(/^\[转账:\s*(.*)\]/);
            fileMatch = value.match(/^\[文件:\s*(.*)\]/);
            giftMatch = value.match(/^\[礼物:\s*(.*)\]/);

            if (voiceMatch) {
              const parsedVoiceData = safeJsonParse(voiceMatch[1]);
              newEntry = {
                id,
                type: 'voice',
                sender: 'them',
                content: parsedVoiceData || { text: '', duration: 0 },
              };
            } else if (stickerMatch) {
              newEntry = {
                id,
                type: 'sticker',
                sender: 'them',
                content: stickerMatch[1],
              };
            } else if (imageMatch) {
              const parsedImageData = safeJsonParse(imageMatch[1]);
              if (parsedImageData !== null) {
                // 成功解析JSON格式的图片数据
                newEntry = {
                  id,
                  type: 'image',
                  sender: 'them',
                  content: parsedImageData,
                };
              } else {
                // 解析失败，说明是纯文本描述
                newEntry = {
                  id,
                  type: 'image',
                  sender: 'them',
                  content: { type: 'desc', value: imageMatch[1] },
                };
              }
            } else if (locationMatch) {
              newEntry = {
                id,
                type: 'location',
                sender: 'them',
                content: locationMatch[1],
              };
            } else if (transferMatch) {
              try {
                newEntry = {
                  id,
                  type: 'transfer',
                  sender: 'them',
                  content: transferMatch[1],
                  data: safeJsonParse(transferMatch[1]) || { amount: 0, message: '' },
                } as any;
              } catch (e) {
                console.error('Failed to parse transfer data:', transferMatch[1], e);
              }
            } else if (fileMatch) {
              try {
                newEntry = {
                  id,
                  type: 'file',
                  sender: 'them',
                  content: fileMatch[1],
                  data: safeJsonParse(fileMatch[1]) || { name: '', size: 0, url: '' },
                } as any;
              } catch (e) {
                console.error('Failed to parse file data:', fileMatch[1], e);
              }
            } else if (giftMatch) {
              try {
                newEntry = {
                  id,
                  type: 'gift',
                  sender: 'them',
                  content: giftMatch[1],
                  data: safeJsonParse(giftMatch[1]) || { name: '', value: 0 },
                } as any;
              } catch (e) {
                console.error('Failed to parse gift data:', giftMatch[1], e);
              }
            } else {
              // 纯文本消息
              newEntry = {
                id,
                type: 'message',
                sender: 'them',
                content: value,
              };
            }

            if (newEntry) {
              this.blmxManager.addEntry(newEntry);
              entriesForAnimation.push(newEntry);
            }
            break;

          case 'sticker': {
            this.addStickerEntry(value, entriesForAnimation);
            break;
          }

          case 'voice':
            this.addJsonContentEntry('voice', value, entriesForAnimation);
            break;

          case 'image':
            this.addJsonContentEntry('image', value, entriesForAnimation);
            break;

          case 'location':
            this.addJsonContentEntry('location', value, entriesForAnimation);
            break;

          case 'transfer':
            this.addJsonContentEntry('transfer', value, entriesForAnimation);
            break;

          case 'file':
            this.addJsonContentEntry('file', value, entriesForAnimation);
            break;

          case 'gift':
            this.addJsonContentEntry('gift', value, entriesForAnimation);
            break;

          case 'RECALL': {
            const recallData = safeJsonParse(value);
            const senderToFind = recallData.sender === 'USER' ? 'me' : 'them';
            const entryToRecall = this.blmxManager.logEntries
              .slice()
              .reverse()
              .find(
                e =>
                  'sender' in e && e.sender === senderToFind && 'content' in e && e.content === recallData.target_text,
              ) as any;

            if (entryToRecall) {
              // 创建一个"指令"条目给动画函数处理
              entriesForAnimation.push({
                type: 'recall_instruction',
                content: {
                  originalEntry: entryToRecall,
                  recallTimestamp: recallData.timestamp,
                },
              } as any);
            }
            break;
          }

          case 'EVENT_LOG':
          case 'TIME':
            newEntry = {
              type: key === 'TIME' ? 'time' : 'event',
              content: safeJsonParse(value),
            } as any;
            this.blmxManager.addEntry(newEntry);
            if (newEntry) entriesForAnimation.push(newEntry);
            break;

          default:
            logger.warn('AiResponseManager', '未知的AI响应键', { key });
        }
      } catch (error) {
        console.error(`[BLMX] Error processing AI response line "${line}":`, error);
      }
    });

    // 如果有新条目要动画显示
    if (entriesForAnimation.length > 0) {
      await this.displayAiEntriesSequentially(entriesForAnimation);

      // 如果有朋友圈相关的更新，检查用户是否在朋友圈视图
      if (hasNewCharMoments && this.momentsManager) {
        // 只有当用户不在朋友圈视图时才设置通知
        const userInMomentsView = $('#moments-view').hasClass('active');
        if (!userInMomentsView) {
          this.momentsManager.setMomentNotification(true);
        } else {
          // 如果用户正在朋友圈视图，更新最后查看时间戳
          this.momentsManager.setLastMomentViewTimestamp();
        }
      }

      return true;
    }

    return false;
  }

  // 显示错误消息
  private showErrorMessage(message: string): void {
    const $errorDiv = $('<div>').addClass('ai-error-message').text(message);

    $('.wechat-body').append($errorDiv);

    setTimeout(() => {
      $errorDiv.remove();
    }, 5000);
  }

  // 按顺序展示AI条目
  async displayAiEntriesSequentially(entries: LogEntry[]): Promise<void> {
    // 定义哪些类型是"消息"，需要播放输入动画
    const messageLikeTypes = ['message', 'sticker', 'voice', 'image', 'location', 'transfer', 'file', 'gift'];
    for (const entry of entries) {
      // 找到条目在日志中的索引
      const entryIndex = this.blmxManager.logEntries.findIndex(log => {
        // 对于有ID的条目，通过ID匹配
        if ('id' in log && 'id' in entry && log.id === entry.id) {
          return true;
        }

        // 对于朋友圈相关条目，通过key和内容匹配
        if ('key' in log && 'key' in entry && log.key === entry.key) {
          // 对于朋友圈动态
          if (entry.key.includes('_MOMENT')) {
            return (window as any)._.isEqual((log as any).data, (entry as any).data);
          }

          // 对于点赞和评论
          if (entry.key.includes('_LIKE') || entry.key.includes('_COMMENT')) {
            return (window as any)._.isEqual((log as any).data, (entry as any).data);
          }
        }

        // 对于没有ID的条目（如TIME、EVENT_LOG），通过内容匹配
        if (
          'type' in log &&
          'type' in entry &&
          (log.type === 'time' || log.type === 'event') &&
          log.type === entry.type &&
          (window as any)._.isEqual(log.content, (entry as any).content)
        ) {
          return true;
        }

        // 对于消息类型条目，通过类型、发送者和内容匹配
        if (
          'type' in log &&
          'type' in entry &&
          'sender' in log &&
          'sender' in entry &&
          'content' in log &&
          'content' in entry &&
          log.type === entry.type &&
          log.sender === entry.sender
        ) {
          // 对于简单类型的内容，直接比较
          if (typeof log.content === 'string' && typeof (entry as any).content === 'string') {
            return log.content === (entry as any).content;
          }
          // 对于复杂类型的内容，使用lodash深度比较
          return (window as any)._.isEqual(log.content, (entry as any).content);
        }

        return false;
      });

      if (entryIndex !== -1) {
        logger.debug('AiResponseManager', '找到已存在的条目', {
          entryIndex,
          entryType: 'type' in entry ? entry.type : 'unknown',
        });
      }

      // 判断条目类型是否是需要动画的"消息"
      if ('type' in entry && messageLikeTypes.includes(entry.type)) {
        // 是消息，执行完整的动画流程
        this.uiRenderer.showTypingIndicator();

        const messageText =
          entry.type === 'message' ? entry.content : entry.type === 'voice' ? (entry.content as any).text : '';

        const delay = this.uiRenderer.calculateTypingDelay(messageText);
        await new Promise(resolve => setTimeout(resolve, delay));

        this.uiRenderer.hideTypingIndicator();
        this.uiRenderer.renderEntry(entry, entryIndex !== -1 ? entryIndex : undefined, true);
      } else if ('type' in entry && (entry.type as any) === 'recall_instruction') {
        // 处理撤回指令，使用类型断言
        const { originalEntry, recallTimestamp } = (entry as any).content;

        // 在内存中找到这个条目并标记
        const entryToUpdate = this.blmxManager.logEntries.find(log => 'id' in log && log.id === originalEntry.id);
        if (entryToUpdate) {
          (entryToUpdate as any).recalled = true;
          (entryToUpdate as any).recalled_content = originalEntry.content;
          (entryToUpdate as any).recalled_timestamp = recallTimestamp;

          // 获取条目在日志中的索引，以便在删除模式下显示删除按钮
          const recallEntryIndex = this.blmxManager.logEntries.indexOf(entryToUpdate);

          // 在UI上找到对应的DOM元素并替换它
          const $elementToReplace = $(`[data-message-id="${originalEntry.id}"]`);
          if ($elementToReplace.length) {
            // 使用一个小的延迟，让撤回动作看起来更自然
            await new Promise(resolve => setTimeout(resolve, 500));
            this.uiRenderer.renderRecallNotice(entryToUpdate, $elementToReplace[0] as HTMLElement, recallEntryIndex);
          }
        }
      } else {
        // 是系统事件 (如 EVENT_LOG, TIME)，直接显示
        this.uiRenderer.renderEntry(entry, entryIndex !== -1 ? entryIndex : undefined, true);
      }

      // 在所有条目之间都增加一个短暂的停顿，让节奏更舒适
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // 显示完所有条目后刷新时间戳，确保日期格式正确
    this.uiRenderer.refreshAllTimestamps();
  }

  /**
   * 清理资源，防止内存泄漏
   */
  cleanup(): void {
    this.eventManager.cleanup();
  }

  // 获取最新的AI原始响应
  getLatestAiRawResponse(): string {
    return this.latestAiRawResponse;
  }

  // 获取最新发送的提示词
  getLatestSentPrompt(): string {
    return this.latestSentPrompt;
  }

  // 获取原始AI响应
  getRawAiResponse(): string {
    return this.rawAiResponse;
  }

  // 获取完整提示词
  getFullPrompt(): string {
    return this.fullPrompt;
  }

  private addStickerEntry(value: string, entriesForAnimation: LogEntry[]): void {
    const parsedStickerContent = safeJsonParse(value);
    const entry = {
      id: `ai-sticker-${Date.now()}-${Math.random()}`,
      type: 'sticker',
      sender: 'them',
      content: parsedStickerContent !== null ? parsedStickerContent : value,
    } as any;
    this.blmxManager.addEntry(entry);
    entriesForAnimation.push(entry);
  }

  private addJsonContentEntry(
    type: 'voice' | 'image' | 'location' | 'transfer' | 'file' | 'gift',
    value: string,
    entriesForAnimation: LogEntry[],
  ): void {
    const entry = {
      id: `ai-${type}-${Date.now()}-${Math.random()}`,
      type,
      sender: 'them',
      content: JSON.parse(value),
    } as any;
    this.blmxManager.addEntry(entry);
    entriesForAnimation.push(entry);
  }
}
