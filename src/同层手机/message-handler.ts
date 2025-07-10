import { logger } from './debug-logger';
import { EventManager } from './event-manager';
import { BLMX_Protocol, ChatEntry, getTavernHelper, LogEntry, SystemEntry } from './script';
import { UIRenderer } from './ui-renderer';
import { safeJsonParse } from './utils';

export class MessageHandler {
  private blmxManager: BLMX_Protocol;
  private uiRenderer: UIRenderer;
  private eventManager: EventManager;
  private isGenerating: boolean = false;
  private hasPendingUserMessages: boolean = false;
  private latestAiRawResponse: string = '还没有收到AI的回复。';
  private latestSentPrompt: string = '还没有发送任何内容给AI。';

  // 新增：记录原始响应和完整提示词
  private rawAiResponse: string = '';
  private fullPrompt: string = '';

  constructor(blmxManager: BLMX_Protocol, uiRenderer: UIRenderer) {
    this.blmxManager = blmxManager;
    this.uiRenderer = uiRenderer;
    this.eventManager = new EventManager();

    // 使用事件管理器来添加事件监听器，防止内存泄漏
    this.eventManager.addGlobalListener('js_generation_ended', (text: string) => {
      this.rawAiResponse = text;
      logger.debug('MessageHandler', '原始AI响应已接收', { length: text.length });
    });

    this.eventManager.addGlobalListener('chat_completion_prompt_ready', (event_data: any) => {
      this.fullPrompt = JSON.stringify(event_data.chat);
      logger.debug('MessageHandler', '完整提示词已准备', { promptLength: this.fullPrompt.length });
    });
  }

  // 暂存并显示条目
  stageAndDisplayEntry(entry: LogEntry): void {
    if ('type' in entry) {
      if (entry.type === 'event') {
        // 为event类型的条目添加到日志中并渲染
        this.blmxManager.addEntry(entry);
        const entryIndex = this.blmxManager.logEntries.length - 1;
        this.uiRenderer.renderEntry(entry, entryIndex, true);
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

      // 直接将消息添加到主日志
      this.blmxManager.addEntry(entry as ChatEntry);
      const entryIndex = this.blmxManager.logEntries.length - 1;

      // 设置有待响应的用户消息标志
      if ('sender' in entry && entry.sender === 'me') {
        this.hasPendingUserMessages = true;
        logger.debug('MessageHandler', '用户发送了消息，设置hasPendingUserMessages', {
          hasPendingUserMessages: this.hasPendingUserMessages,
        });
      }

      // 渲染UI
      this.uiRenderer.renderEntry(entry, entryIndex, true);
    }
  }

  // 触发AI响应
  async triggerAiResponse(immediate: boolean = false, hasNotifications: boolean = false): Promise<void> {
    if (this.isGenerating || !this.blmxManager) return;

    // 如果设置了immediate=true，则强制触发响应
    // 否则，检查是否有待处理的消息
    if (!immediate && !this.hasPendingUserMessages && !hasNotifications) return;

    // 检查全局标志，防止重复处理
    if ((window as any).BLMX_PROCESSING_AI_RESPONSE) {
      logger.debug('MessageHandler', '已有AI响应处理进行中，跳过重复处理');
      return;
    }

    // 设置全局处理标志
    (window as any).BLMX_PROCESSING_AI_RESPONSE = true;
    this.isGenerating = true;

    try {
      // getContextForAI should now get all necessary context from the main log.
      let contextForAI = this.blmxManager.getContextForAI();

      contextForAI += '\n以上内容为过往聊天记录与最新用户输入(`<user_input>`)\n【本次响应必须遵循线上规则】';
      this.latestSentPrompt = contextForAI;

      // Clean up 'isNewForAI' flags from the main log after generating context.
      this.blmxManager.logEntries.forEach(entry => {
        if ('type' in entry && entry.type === 'image' && 'content' in entry && (entry.content as any).isNewForAI) {
          (entry.content as any).value = `[用户发送的图片]`;
          delete (entry.content as any).isNewForAI;
        }
      });

      // 重置待响应标志
      this.hasPendingUserMessages = false;

      const MAX_RETRIES = 2;
      let attempt = 0;
      let success = false;

      while (attempt <= MAX_RETRIES && !success) {
        if (attempt > 0) {
          //console.log(`[BLMX] AI response was empty. Retrying, attempt ${attempt + 1}/${MAX_RETRIES + 1}...`);
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
            logger.debug('MessageHandler', '直接获取的原始AI响应', { length: this.rawAiResponse.length });
          }

          // 处理重复响应问题
          let processedResponse = finalAiResponse.trim();
          const len = processedResponse.length;

          // 检查完全相同的两半
          if (len > 0 && len % 2 === 0) {
            const firstHalf = processedResponse.substring(0, len / 2);
            const secondHalf = processedResponse.substring(len / 2);

            if (firstHalf === secondHalf && firstHalf.trim() !== '') {
              console.warn('[BLMX] Detected fully duplicated AI response, trimming automatically.');
              processedResponse = firstHalf;
            }
          }

          // 增强的重复检测：检查是否有相同的行被重复
          const lines = processedResponse.split('\n').filter(line => line.trim() !== '');
          if (lines.length > 1) {
            const uniqueLines = Array.from(new Set(lines));
            // 如果去重后的行数明显少于原始行数，可能存在重复
            if (uniqueLines.length < lines.length * 0.7) {
              console.warn('[BLMX] Detected potential line duplication in AI response, using unique lines only.');
              processedResponse = uniqueLines.join('\n');
            }
          }

          const responseLines = processedResponse.split('\n').filter(line => line.trim() !== '');

          if (responseLines.length > 0) {
            const entriesForAnimation: LogEntry[] = [];

            responseLines.forEach(line => {
              const separatorIndex = line.indexOf(':');
              if (separatorIndex === -1) return;

              const key = line.substring(0, separatorIndex).trim();
              const value = line.substring(separatorIndex + 1).trim();

              if (!key || !value) return;

              try {
                let newEntry: LogEntry | null = null;

                switch (key) {
                  case 'CHAR_MOMENT':
                  case 'CHAR_COMMENT':
                  case 'CHAR_LIKE':
                    newEntry = { key, data: safeJsonParse(value) } as any;
                    this.blmxManager.addEntry(newEntry);
                    // 将朋友圈相关条目也添加到动画队列中，以便在 displayAiEntriesSequentially 中处理
                    if (newEntry) {
                      entriesForAnimation.push(newEntry);
                    }
                    break;

                  case 'EVENT_LOG':
                    try {
                      const eventData = safeJsonParse(value);
                      newEntry = {
                        type: 'event',
                        content: eventData,
                      } as any;
                      logger.debug('MessageHandler', '处理EVENT_LOG事件', { eventData });
                      this.blmxManager.addEntry(newEntry);
                      if (newEntry) {
                        entriesForAnimation.push(newEntry);
                      }
                    } catch (error) {
                      logger.error('MessageHandler', '解析EVENT_LOG数据失败', { error });
                    }
                    break;

                  case 'RECALL': {
                    const recallData = safeJsonParse(value);
                    logger.debug('MessageHandler', '处理RECALL指令', { recallData });

                    const senderToFind = recallData.sender === 'USER' ? 'me' : 'them';

                    // 更灵活的消息查找逻辑
                    const entryToRecall = this.blmxManager.logEntries
                      .slice()
                      .reverse()
                      .find(e => {
                        if (!('sender' in e) || e.sender !== senderToFind || !('content' in e)) {
                          return false;
                        }

                        const targetText = recallData.target_text || recallData['target text']; // 支持两种字段名

                        // 精确匹配
                        if (e.content === targetText) {
                          return true;
                        }

                        // 模糊匹配（去除标点符号和空格后比较）
                        const normalizeText = (text: string) => text.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase();
                        if (typeof e.content === 'string' && typeof targetText === 'string') {
                          if (normalizeText(e.content) === normalizeText(targetText)) {
                            return true;
                          }
                          // 包含匹配（目标文本包含在消息内容中，或消息内容包含在目标文本中）
                          if (e.content.includes(targetText) || targetText.includes(e.content)) {
                            return true;
                          }
                        }

                        // 对于复杂内容，尝试JSON字符串匹配
                        if (typeof e.content === 'object') {
                          try {
                            if (JSON.stringify(e.content) === targetText) {
                              return true;
                            }
                            // 如果是语音消息，比较text字段
                            if (e.content && typeof e.content === 'object' && 'text' in e.content) {
                              const voiceText = (e.content as any).text;
                              return voiceText === targetText || normalizeText(voiceText) === normalizeText(targetText);
                            }
                          } catch (err) {
                            console.warn('[BLMX] JSON解析失败:', err);
                          }
                        }

                        return false;
                      }) as ChatEntry;

                    if (entryToRecall) {
                      // 创建一个"指令"条目给动画函数处理
                      entriesForAnimation.push({
                        type: 'recall_instruction',
                        content: {
                          originalEntry: entryToRecall,
                          recallTimestamp: recallData.timestamp,
                        },
                      } as any);
                    } else {
                      const targetText = recallData.target_text || recallData['target text'];
                      console.warn('[BLMX] 未找到要撤回的消息:', {
                        sender: senderToFind,
                        target_text: targetText,
                        recall_data: recallData,
                        available_messages: this.blmxManager.logEntries
                          .filter(e => 'sender' in e && e.sender === senderToFind)
                          .map(e => ({
                            id: 'id' in e ? e.id : 'no-id',
                            content: 'content' in e ? e.content : 'no-content',
                          })),
                      });
                    }
                    break;
                  }

                  case 'CHAR': {
                    const id = 'msg-' + Date.now() + Math.random();
                    const voiceMatch = value.match(/^\[语音:\s*({.*})\]/);
                    const stickerMatch = value.match(/^\[表情:\s*(.*)\]/);
                    const imageMatch = value.match(/^\[图片:\s*(.*)\]/);
                    const locationMatch = value.match(/^\[位置:\s*(.*)\]/);
                    const transferMatch = value.match(/^\[转账:\s*(.*)\]/);
                    const fileMatch = value.match(/^\[文件:\s*(.*)\]/);
                    const giftMatch = value.match(/^\[礼物:\s*(.*)\]/);

                    if (voiceMatch) {
                      try {
                        newEntry = {
                          id,
                          type: 'voice',
                          sender: 'them',
                          content: safeJsonParse(voiceMatch[1]) || { text: '', duration: 0 },
                        };
                      } catch (e) {
                        console.error('Failed to parse voice data:', voiceMatch[1], e);
                      }
                    } else if (stickerMatch) {
                      newEntry = {
                        id,
                        type: 'sticker',
                        sender: 'them',
                        content: stickerMatch[1],
                      };
                    } else if (imageMatch) {
                      try {
                        newEntry = {
                          id,
                          type: 'image',
                          sender: 'them',
                          content: safeJsonParse(imageMatch[1]) || { type: 'url', value: '' },
                        };
                      } catch (e) {
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
                      newEntry = {
                        id,
                        type: 'transfer',
                        sender: 'them',
                        content: transferMatch[1],
                        data: safeJsonParse(transferMatch[1]) || { amount: 0, message: '' },
                      } as any;
                    } else if (fileMatch) {
                      newEntry = {
                        id,
                        type: 'file',
                        sender: 'them',
                        content: fileMatch[1],
                      };
                    } else if (giftMatch) {
                      newEntry = {
                        id,
                        type: 'gift',
                        sender: 'them',
                        content: giftMatch[1],
                        data: safeJsonParse(giftMatch[1]) || { name: '', value: 0 },
                      } as any;
                    } else {
                      newEntry = {
                        id,
                        type: 'message',
                        sender: 'them',
                        content: value,
                      };
                    }
                    break;
                  }

                  case 'TIME':
                    {
                      const parsedContent = safeJsonParse(value);
                      newEntry = {
                        type: 'time',
                        content: parsedContent,
                      } as any;
                      logger.debug('MessageHandler', '处理TIME', { content: parsedContent });
                    }
                    break;
                }

                if (newEntry) {
                  this.blmxManager.addEntry(newEntry);
                  if ('type' in newEntry) {
                    // 检查是否已经在entriesForAnimation中存在相同的条目
                    const isDuplicate = entriesForAnimation.some(existingEntry => {
                      // 对于有ID的条目，比较ID
                      if ('id' in newEntry && 'id' in existingEntry) {
                        return newEntry.id === existingEntry.id;
                      }

                      // 对于类型相同的条目，比较内容
                      if ('type' in existingEntry && newEntry.type === existingEntry.type) {
                        // 对于消息、表情、位置和文件，比较内容
                        if (
                          (newEntry.type === 'message' ||
                            newEntry.type === 'sticker' ||
                            newEntry.type === 'location' ||
                            newEntry.type === 'file') &&
                          'content' in newEntry &&
                          'content' in existingEntry
                        ) {
                          return JSON.stringify(newEntry.content) === JSON.stringify(existingEntry.content);
                        }

                        // 对于时间和事件日志，比较内容
                        if (
                          (newEntry.type === 'time' || newEntry.type === 'event') &&
                          'content' in newEntry &&
                          'content' in existingEntry
                        ) {
                          return JSON.stringify(newEntry.content) === JSON.stringify(existingEntry.content);
                        }
                      }

                      return false;
                    });

                    if (!isDuplicate) {
                      entriesForAnimation.push(newEntry);
                      //console.log(`[BLMX] 添加${newEntry.type}条目到动画队列:`, newEntry);
                    } else {
                      //console.log('[BLMX] 跳过添加重复的动画条目:', newEntry);
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to parse AI response:', line, e);
              }
            });

            // 显示AI响应动画
            if (entriesForAnimation.length > 0) {
              await this.displayAiEntriesSequentially(entriesForAnimation);
            }

            success = true;
            // 不要返回值，这是一个void函数
          }
        } catch (error) {
          console.error(`[BLMX] Error on attempt ${attempt}:`, error);
          this.uiRenderer.hideGeneratingIndicator();

          if (attempt >= MAX_RETRIES) {
            // 创建错误消息但不保存到聊天记录中
            const errorEntry: any = {
              id: 'error-' + Date.now(),
              type: 'message',
              sender: 'them',
              content: 'AI代理出错 (详情见F12控制台)',
              isErrorMessage: true, // 标记为错误消息
            };

            // 直接在UI中显示错误消息，但不添加到blmxManager中
            this.uiRenderer.renderEntry(errorEntry, undefined, true);

            // 设置一个定时器，几秒后自动移除错误消息
            setTimeout(() => {
              const errorElement = document.querySelector(`[data-message-id="${errorEntry.id}"]`);
              if (errorElement) {
                errorElement.classList.add('fade-out');
                setTimeout(() => {
                  if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                  }
                }, 500);
              }
            }, 5000);
          }
        }

        attempt++;
      }

      if (!success && attempt > MAX_RETRIES) {
        console.error(`[BLMX] AI generation failed after ${MAX_RETRIES + 1} attempts (empty response).`);

        // 创建错误消息但不保存到聊天记录中
        const errorEntry: any = {
          id: 'error-' + Date.now(),
          type: 'message',
          sender: 'them',
          content: '(AI响应为空，请稍后再试或手动触发)',
          isErrorMessage: true, // 标记为错误消息
        };

        // 直接在UI中显示错误消息，但不添加到blmxManager中
        this.uiRenderer.renderEntry(errorEntry, undefined, true);

        // 设置一个定时器，几秒后自动移除错误消息
        setTimeout(() => {
          const errorElement = document.querySelector(`[data-message-id="${errorEntry.id}"]`);
          if (errorElement) {
            errorElement.classList.add('fade-out');
            setTimeout(() => {
              if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
              }
            }, 500);
          }
        }, 5000);

        this.latestAiRawResponse = '[AI响应为空]';
      }

      await this.blmxManager.persistLogToStorage();

      // 刷新所有时间戳的显示，确保AI回复的时间戳正确展示
      this.uiRenderer.refreshAllTimestamps();
    } catch (error) {
      console.error('Error in triggerAiResponse:', error);
    } finally {
      // 无论成功失败，都重置处理标志
      this.isGenerating = false;
      (window as any).BLMX_PROCESSING_AI_RESPONSE = false;
    }
  }

  // 顺序显示AI条目
  async displayAiEntriesSequentially(entries: LogEntry[]): Promise<void> {
    // 定义哪些类型是"消息"，需要播放输入动画
    const messageLikeTypes = ['message', 'sticker', 'voice', 'image', 'location', 'transfer', 'file', 'gift'];

    // 增强去重：首先对entries数组进行去重处理
    const uniqueEntries: LogEntry[] = [];
    const seenEntrySignatures = new Set<string>();

    for (const entry of entries) {
      // 为每个条目创建一个唯一签名
      let signature = '';

      if ('id' in entry) {
        signature = `id:${entry.id}`;
      } else if ('key' in entry) {
        signature = `key:${entry.key}:${JSON.stringify((entry as any).data)}`;
      } else if ('type' in entry) {
        if (entry.type === 'time' || entry.type === 'event') {
          signature = `${entry.type}:${JSON.stringify((entry as SystemEntry).content)}`;
        } else if ('sender' in entry && 'content' in entry) {
          const contentStr =
            typeof (entry as ChatEntry).content === 'string'
              ? (entry as ChatEntry).content
              : JSON.stringify((entry as ChatEntry).content);
          signature = `${(entry as ChatEntry).type}:${(entry as ChatEntry).sender}:${contentStr}`;
        }
      }

      // 如果这个签名是新的，添加到uniqueEntries
      if (signature && !seenEntrySignatures.has(signature)) {
        seenEntrySignatures.add(signature);
        uniqueEntries.push(entry);
      } else if (signature) {
        //console.log('[BLMX] 跳过重复条目:', entry);
      }
    }

    //console.log(`[BLMX] 去重后的条目数量: ${uniqueEntries.length} (原始: ${entries.length})`);

    // 使用去重后的条目数组
    for (const entry of uniqueEntries) {
      // 找到条目在日志中的索引
      const entryIndex = this.blmxManager.logEntries.findIndex(log => {
        // 对于有ID的条目，通过ID匹配
        if ('id' in log && 'id' in entry && log.id === entry.id) {
          return true;
        }

        // 对于朋友圈相关条目，通过key和内容匹配
        if ('key' in log && 'key' in entry && log.key === entry.key) {
          return JSON.stringify((log as any).data) === JSON.stringify((entry as any).data);
        }

        // 对于没有ID的条目（如TIME、EVENT_LOG），通过内容匹配
        if (
          'type' in log &&
          'type' in entry &&
          (log.type === 'time' || log.type === 'event') &&
          log.type === entry.type &&
          JSON.stringify(log.content) === JSON.stringify(entry.content)
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
          if (typeof log.content === 'string' && typeof entry.content === 'string') {
            return log.content === entry.content;
          }
          // 对于复杂类型的内容，使用JSON.stringify比较
          return JSON.stringify(log.content) === JSON.stringify(entry.content);
        }

        return false;
      });

      if (entryIndex !== -1) {
        //console.log(`[BLMX] 找到已存在的条目，索引: ${entryIndex}`, entry);
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
          entryToUpdate.recalled = true;
          entryToUpdate.recalled_content = originalEntry.content;
          entryToUpdate.recalled_timestamp = recallTimestamp;

          // 在UI上找到对应的DOM元素并替换它
          const elementToReplace = document.querySelector(`[data-message-id="${originalEntry.id}"]`);
          if (elementToReplace) {
            // 使用一个小的延迟，让撤回动作看起来更自然
            await new Promise(resolve => setTimeout(resolve, 500));
            this.uiRenderer.renderRecallNotice(entryToUpdate, elementToReplace as HTMLElement);
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

  // 渲染聊天历史
  renderChatHistory(): void {
    this.uiRenderer.clearChat();
    if (!this.blmxManager) return;

    this.blmxManager.logEntries.forEach((entry, index) => {
      if (entry.recalled) {
        this.uiRenderer.renderRecallNotice(entry, null, index);
      } else {
        this.uiRenderer.renderEntry(entry, index, false);
      }
    });

    // 确保所有时间戳正确显示
    this.uiRenderer.refreshAllTimestamps();

    // 添加延迟初始化，确保滚动功能正常工作
    setTimeout(() => {
      const wechatBody = document.querySelector('.wechat-body') as HTMLElement;
      if (wechatBody) {
        wechatBody.scrollTop = wechatBody.scrollHeight;
      }
    }, 300);
  }

  // 处理转账接受
  handleTransferAccept(data: any): void {
    this.stageAndDisplayEntry({
      type: 'transfer',
      sender: 'me',
      content: JSON.stringify(data),
      data: data,
      id: `transfer-${Date.now()}`,
    } as any);
  }

  // 处理礼物动作
  handleGiftAction(data: any, action: 'accepted' | 'rejected'): void {
    const receiptData = { name: data.name, status: action };
    this.stageAndDisplayEntry({
      type: 'gift',
      sender: 'me',
      content: JSON.stringify(receiptData),
      data: receiptData,
      id: `gift-${Date.now()}`,
    } as any);
  }

  // 获取最新AI原始响应
  getLatestAiRawResponse(): string {
    return this.latestAiRawResponse;
  }

  // 获取最新发送给AI的提示
  getLatestSentPrompt(): string {
    return this.latestSentPrompt;
  }

  // 获取原始AI响应（未经处理）
  getRawAiResponse(): string {
    return this.rawAiResponse;
  }

  // 获取完整提示词（发送给模型的实际内容）
  getFullPrompt(): string {
    return this.fullPrompt;
  }

  // 获取是否有待处理的用户消息
  hasPendingMessages(): boolean {
    return this.hasPendingUserMessages;
  }

  // 更新底部按钮状态
  updateFooterButtonsState(hasNotifications: boolean): void {
    const $wechatInput = $('#wechat-input-field');
    const $sendBtn = $('#send-btn');
    const $plusBtn = $('#plus-btn');

    const hasText = $wechatInput.val()?.toString().trim() !== '';
    const shouldShowSendBtn = hasText || hasNotifications || this.hasPendingUserMessages;

    // 使用jQuery方法更新显示状态
    $sendBtn.css('display', shouldShowSendBtn ? 'flex' : 'none');
    $plusBtn.css('display', hasText ? 'none' : 'inline-block');

    // 调试信息
    console.log('[BLMX] 更新按钮状态:', {
      hasText,
      hasNotifications,
      hasPendingUserMessages: this.hasPendingUserMessages,
      shouldShowSendBtn,
    });
  }

  // 设置是否有待处理的用户消息
  setPendingUserMessages(value: boolean): void {
    this.hasPendingUserMessages = value;
  }

  /**
   * 清理资源，防止内存泄漏
   */
  cleanup(): void {
    this.eventManager.cleanup();
    //console.log('[MessageHandler] 资源已清理');
  }
}
