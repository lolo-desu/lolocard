export interface TavernHelperBridge {
  getCharData(): Promise<{ name: string }>;
  getCharAvatarPath(): Promise<string>;
  getLastMessageId(): Promise<number | null>;
  getChatMessages(id: number): Promise<Array<{ message: string }>>;
  setChatMessage(content: string, id: number, options: { refresh: 'none' }): Promise<void>;
  generate(options: { user_input: string; should_stream: boolean }): Promise<AsyncGenerator<string, void, unknown>>;
}

// 使用类型断言来处理全局对象
declare global {
  interface Window {
    currentGameDate: Date;
  }
}

// 为TavernHelper创建一个访问器函数
export function getTavernHelper(): TavernHelperBridge {
  return (window.parent as any).TavernHelper;
}

export type Sender = 'me' | 'them';

export interface BaseLogEntry {
  recalled?: boolean;
  recalled_content?: any;
  recalled_timestamp?: string;
}

export interface BaseChatMessage extends BaseLogEntry {
  id: string;
  sender: Sender;
}

// 文本消息
export interface TextMessage extends BaseChatMessage {
  type: 'message';
  content: string;
  isSystemMessage?: boolean; // 添加系统消息标志
}

export interface VoiceMessage extends BaseChatMessage {
  type: 'voice';
  content: { text: string; duration: number };
}

export interface StickerMessage extends BaseChatMessage {
  type: 'sticker';
  content: string; // sticker name/label
  size?: 'small' | 'medium' | 'large'; // Add size option for stickers
}

export interface ImageMessage extends BaseChatMessage {
  type: 'image';
  content: { type: 'url' | 'desc'; value: string };
}

export interface LocationMessage extends BaseChatMessage {
  type: 'location';
  content: string;
}

export interface TransferMessage extends BaseChatMessage {
  type: 'transfer';
  content: string; // JSON string
  data: {
    amount: string;
    note?: string;
    status: 'sent' | 'accepted' | 'rejected';
  };
}

export interface FileMessage extends BaseChatMessage {
  type: 'file';
  content: string; // filename
}

export interface GiftMessage extends BaseChatMessage {
  type: 'gift';
  content: string; // JSON string
  data: {
    name: string;
    price?: string;
    status: 'sent' | 'accepted' | 'rejected';
  };
}

export type ChatEntry =
  | TextMessage
  | VoiceMessage
  | StickerMessage
  | ImageMessage
  | LocationMessage
  | TransferMessage
  | FileMessage
  | GiftMessage;

export interface TimeLogEntry extends BaseLogEntry {
  type: 'time';
  content: { date: string; time: string };
  id?: string; // 添加可选的id字段
}

export interface EventLogEntry extends BaseLogEntry {
  type: 'event';
  content: { date: string; time: string; description?: string };
  id?: string; // 添加可选的id字段
}

export type SystemEntry = TimeLogEntry | EventLogEntry;

export interface MomentEntry extends BaseLogEntry {
  key: 'USER_MOMENT' | 'CHAR_MOMENT';
  data: {
    text: string;
    image: string;
    image_type: 'url' | 'desc' | 'none';
    image_desc?: string;
    date: string;
    time: string;
  };
}

export interface CommentEntry extends BaseLogEntry {
  key: 'USER_COMMENT' | 'CHAR_COMMENT';
  data: {
    text: string;
    target_post_id: number;
  };
}

export interface LikeEntry extends BaseLogEntry {
  key: 'USER_LIKE' | 'CHAR_LIKE';
  data: {
    target_post_id: number;
  };
}

export type MomentRelatedEntry = MomentEntry | CommentEntry | LikeEntry;

export type LogEntry = ChatEntry | SystemEntry | MomentRelatedEntry;

export class BLMX_Protocol {
  public logEntries: LogEntry[] = [];
  private messageId: number | null = null;
  private readonly charId: string;
  private readonly LOG_START_TAG = '===BLMX_LOG_BEGIN===';
  private readonly LOG_END_TAG = '===BLMX_LOG_END===';

  constructor(charId: string) {
    this.charId = charId;
  }

  // 获取角色ID
  getCharId(): string {
    return this.charId;
  }

  async initialize(): Promise<boolean> {
    // console.log('[BLMX] Initializing and scanning for chat history...');
    const lastMessageId = await getTavernHelper().getLastMessageId();

    if (lastMessageId === null) {
      // console.warn('[BLMX] No messages found. Starting fresh at message ID 0.');
      this.messageId = 0;
      this.logEntries = [];
      await this.persistLogToStorage();
      return true;
    }

    let latestUiMessage: { id: number; content: string } | null = null;
    const previousUiMessages: { id: number; content: string }[] = [];

    for (let i = lastMessageId; i >= 0; i--) {
      try {
        const msg = (await getTavernHelper().getChatMessages(i))[0];
        if (msg && msg.message && msg.message.includes(this.LOG_START_TAG)) {
          if (!latestUiMessage) {
            latestUiMessage = { id: i, content: msg.message };
          } else {
            previousUiMessages.push({ id: i, content: msg.message });
          }
        }
      } catch (error) {
        // Ignore errors, likely message not found
      }
    }

    if (!latestUiMessage) {
      // console.log('[BLMX] No UI log found. Creating a new one in the latest message.');
      this.messageId = lastMessageId;
      this.logEntries = [];
      await this.persistLogToStorage();
      return true;
    }

    // console.log(`[BLMX] Found latest UI log in message ${latestUiMessage.id}. Consolidating...`);
    this.messageId = latestUiMessage.id;
    const consolidatedLogParts: string[] = [];

    const latestLogStartIndex = latestUiMessage.content.indexOf(this.LOG_START_TAG);
    const latestLogEndIndex = latestUiMessage.content.indexOf(this.LOG_END_TAG);
    if (latestLogStartIndex !== -1 && latestLogEndIndex !== -1) {
      const logPart = latestUiMessage.content
        .slice(latestLogStartIndex + this.LOG_START_TAG.length, latestLogEndIndex)
        .trim();
      if (logPart) consolidatedLogParts.push(logPart);
    }

    for (const prevMsg of previousUiMessages) {
      const prevLogStartIndex = prevMsg.content.indexOf(this.LOG_START_TAG);
      const prevLogEndIndex = prevMsg.content.indexOf(this.LOG_END_TAG);
      if (prevLogStartIndex !== -1 && prevLogEndIndex !== -1) {
        const logPart = prevMsg.content.slice(prevLogStartIndex + this.LOG_START_TAG.length, prevLogEndIndex).trim();
        if (logPart) consolidatedLogParts.unshift(logPart);

        const cleanedContent =
          prevMsg.content.substring(0, prevLogStartIndex) +
          prevMsg.content.substring(prevLogEndIndex + this.LOG_END_TAG.length);
        await getTavernHelper().setChatMessage(cleanedContent.trim(), prevMsg.id, { refresh: 'none' });
        // console.log(`[BLMX] Cleaned and moved UI log from message ${prevMsg.id}.`);
      }
    }

    const finalLogString = consolidatedLogParts.join('\n');
    this._parseLogFromString(finalLogString);

    await this.persistLogToStorage();
    // console.log(`[BLMX] Consolidated log saved to message ${this.messageId}.`);

    return true;
  }

  async persistLogToStorage(): Promise<void> {
    if (this.messageId === null) {
      console.warn('[BLMX] Cannot save log, message_id not initialized.'); // 保留重要警告
      return;
    }
    try {
      const logString = this._renderLogToString();
      const existingMessage = (await getTavernHelper().getChatMessages(this.messageId))[0];
      const existingContent = existingMessage ? existingMessage.message : '';

      const logStartIndex = existingContent.indexOf(this.LOG_START_TAG);
      const logEndIndex = existingContent.indexOf(this.LOG_END_TAG);

      const newLogBlock = `${this.LOG_START_TAG}\n${logString}\n${this.LOG_END_TAG}`;
      let fullText: string;

      if (logStartIndex !== -1 && logEndIndex !== -1) {
        fullText =
          existingContent.substring(0, logStartIndex) +
          newLogBlock +
          existingContent.substring(logEndIndex + this.LOG_END_TAG.length);
      } else {
        fullText = existingContent + '\n' + newLogBlock;
      }

      await getTavernHelper().setChatMessage(fullText.trim(), this.messageId, { refresh: 'none' });
    } catch (error) {
      console.error('Failed to save narrative log to text box:', error);
    }
  }

  private _parseLogFromString(logString: string): void {
    this.logEntries = [];
    const lines = logString.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return;

      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      try {
        switch (key) {
          case 'USER_MOMENT':
          case 'CHAR_MOMENT':
          case 'USER_COMMENT':
          case 'CHAR_COMMENT':
          case 'USER_LIKE':
          case 'CHAR_LIKE':
            try {
              const data = JSON.parse(value);
              this.logEntries.push({ key, data } as MomentRelatedEntry);
            } catch (error) {
              console.warn('[BLMX] 解析朋友圈数据失败:', value, error);
            }
            break;
          case 'TIME':
          case 'EVENT_LOG':
            if (value) {
              try {
                const data = JSON.parse(value);
                // console.log(`[BLMX] 解析${key}数据:`, data);

                // 验证必要字段
                if (!data.date || !data.time) {
                  console.warn(`[BLMX] ${key}缺少必要字段:`, data);
                  // 尝试补充缺失字段
                  if (!data.date || !data.time) {
                    const now = new Date();
                    if (!data.date) {
                      data.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
                        now.getDate(),
                      ).padStart(2, '0')}`;
                      // console.log(`[BLMX] 为${key}补充日期:`, data.date);
                    }
                    if (!data.time) {
                      data.time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
                        2,
                        '0',
                      )}`;
                      // console.log(`[BLMX] 为${key}补充时间:`, data.time);
                    }
                  }
                }

                const entryType = key === 'TIME' ? 'time' : 'event';
                const newEntry = { type: entryType, content: data } as SystemEntry;
                this.logEntries.push(newEntry);
                // console.log(`[BLMX] 添加${key}条目:`, newEntry);

                const timeDate = new Date(`${data.date} ${data.time}`);
                if (!isNaN(timeDate.getTime())) {
                  window.currentGameDate = timeDate;
                  const timeElement = document.getElementById('current-time');
                  if (timeElement) {
                    const timeString = `${window.currentGameDate
                      .getHours()
                      .toString()
                      .padStart(2, '0')}:${window.currentGameDate.getMinutes().toString().padStart(2, '0')}`;
                    timeElement.textContent = timeString;
                  }
                }
              } catch (error) {
                console.error(`[BLMX] 解析${key}失败:`, value, error);
              }
            } else {
              // console.warn(`[BLMX] ${key}值为空`);
            }
            break;
          case 'RECALL': {
            // console.log('[BLMX] 从存储中加载RECALL数据:', value);
            try {
              const recallData = JSON.parse(value);
              const senderToFind: Sender = recallData.sender === 'USER' ? 'me' : 'them';

              // 获取target_text，支持多种可能的属性名
              const targetText = recallData.target_text || recallData['target text'] || recallData.text || '';

              if (!targetText) {
                console.warn('[BLMX] RECALL数据缺少目标文本:', recallData);
                break;
              }

              // 使用更灵活的查找方法
              const entryToRecall = this.logEntries
                .slice()
                .reverse()
                .find(e => {
                  // 必须是有sender和content的消息
                  if (!('sender' in e) || e.sender !== senderToFind || !('content' in e)) {
                    return false;
                  }

                  // 精确匹配
                  if (e.content === targetText) {
                    return true;
                  }

                  // 模糊匹配（去除标点符号和空格后比较）
                  const normalizeText = (text: string) =>
                    typeof text === 'string' ? text.replace(/[^\w\u4e00-\u9fa5]/g, '').toLowerCase() : '';

                  if (typeof e.content === 'string') {
                    // 模糊匹配文本
                    if (normalizeText(e.content) === normalizeText(targetText)) {
                      return true;
                    }
                    // 包含匹配
                    if (e.content.includes(targetText) || targetText.includes(e.content)) {
                      return true;
                    }
                  }

                  // 对于复杂内容对象的匹配
                  if (typeof e.content === 'object' && e.content !== null) {
                    try {
                      // 比较序列化后的JSON
                      if (JSON.stringify(e.content) === targetText) {
                        return true;
                      }

                      // 如果是语音消息，比较text字段
                      if ('text' in e.content) {
                        const voiceText = (e.content as any).text;
                        if (voiceText === targetText || normalizeText(voiceText) === normalizeText(targetText)) {
                          return true;
                        }
                      }
                    } catch (err) {
                      console.warn('[BLMX] 比较复杂内容失败:', err);
                    }
                  }

                  return false;
                }) as ChatEntry;

              if (entryToRecall) {
                // console.log('[BLMX] 找到并标记要撤回的消息:', entryToRecall);
                entryToRecall.recalled = true;
                entryToRecall.recalled_content = entryToRecall.content;
                entryToRecall.recalled_timestamp = recallData.timestamp || new Date().toISOString();
              } else {
                console.warn('[BLMX] 未找到要撤回的消息:', {
                  sender: senderToFind,
                  target_text: targetText,
                  recall_data: recallData,
                });
              }
            } catch (error) {
              console.error('[BLMX] 处理RECALL数据失败:', error);
            }
            break;
          }
          case 'USER':
          case 'CHAR': {
            const sender: Sender = key === 'USER' ? 'me' : 'them';
            const id = `msg-${Date.now()}${Math.random()}-${sender}`;

            const voiceMatch = value.match(/^\[语音:\s*({.*})\]/);
            if (voiceMatch) {
              try {
                const voiceData = JSON.parse(voiceMatch[1]);
                this.logEntries.push({ id, type: 'voice', sender, content: voiceData });
                return;
              } catch (e) {
                console.error('Failed to parse voice data:', voiceMatch[1], e);
                // 添加默认语音数据
                this.logEntries.push({ id, type: 'voice', sender, content: { text: '', duration: 0 } });
                return;
              }
            }

            const stickerMatch = value.match(/^\[表情:\s*(.*)\]/);
            if (stickerMatch) {
              this.logEntries.push({ id, type: 'sticker', sender, content: stickerMatch[1] });
              return;
            }

            const imageMatch = value.match(/^\[图片:\s*(.*)\]/);
            if (imageMatch) {
              try {
                const imgData = JSON.parse(imageMatch[1]);
                this.logEntries.push({ id, type: 'image', sender, content: imgData });
              } catch (e) {
                this.logEntries.push({
                  id,
                  type: 'image',
                  sender,
                  content: { type: 'desc', value: imageMatch[1] },
                });
              }
              return;
            }

            const locationMatch = value.match(/^\[位置:\s*(.*)\]/);
            if (locationMatch) {
              this.logEntries.push({ id, type: 'location', sender, content: locationMatch[1] });
              return;
            }

            const transferMatch = value.match(/^\[转账:\s*(.*)\]/);
            if (transferMatch) {
              this.logEntries.push({
                id,
                type: 'transfer',
                sender,
                content: transferMatch[1],
                data: (() => {
                  try {
                    return JSON.parse(transferMatch[1]);
                  } catch (e) {
                    console.error('Failed to parse transfer data:', transferMatch[1], e);
                    return { amount: 0, message: '' };
                  }
                })(),
              });
              return;
            }

            const fileMatch = value.match(/^\[文件:\s*(.*)\]/);
            if (fileMatch) {
              this.logEntries.push({ id, type: 'file', sender, content: fileMatch[1] });
              return;
            }

            const giftMatch = value.match(/^\[礼物:\s*(.*)\]/);
            if (giftMatch) {
              this.logEntries.push({
                id,
                type: 'gift',
                sender,
                content: giftMatch[1],
                data: (() => {
                  try {
                    return JSON.parse(giftMatch[1]);
                  } catch (e) {
                    console.error('Failed to parse gift data:', giftMatch[1], e);
                    return { name: '', value: 0 };
                  }
                })(),
              });
              return;
            }

            this.logEntries.push({ id, type: 'message', sender, content: value });
            break;
          }
        }
      } catch (e) {
        console.error('Failed to parse log line:', line, e);
      }
    });
  }

  private _renderLogToString(): string {
    const recallCommands: string[] = [];
    const allEntriesString = this.logEntries
      .map(e => {
        if (e.recalled) {
          const recallData = {
            sender: 'sender' in e && e.sender === 'me' ? 'USER' : 'CHAR',
            target_text:
              typeof e.recalled_content === 'object' && e.recalled_content !== null
                ? e.recalled_content.text
                : e.recalled_content,
            timestamp: e.recalled_timestamp,
          };
          if (recallData.target_text) {
            recallCommands.push(`RECALL: ${JSON.stringify(recallData)}`);
          }
        }

        if ('key' in e) {
          return `${e.key}: ${JSON.stringify(e.data)}`;
        }

        if ('type' in e) {
          if (e.type === 'time' || e.type === 'event') {
            const key = e.type === 'time' ? 'TIME' : 'EVENT_LOG';
            // console.log(`[BLMX] 序列化${key}条目:`, e);
            return `${key}: ${JSON.stringify(e.content)}`;
          }

          const prefix = e.sender === 'me' ? 'USER' : 'CHAR';
          let content: string | object = e.content;
          switch (e.type) {
            case 'sticker':
              content = `[表情: ${e.content}]`;
              break;
            case 'voice':
              content = `[语音: ${JSON.stringify(e.content)}]`;
              break;
            case 'image':
              content = `[图片: ${JSON.stringify(e.content)}]`;
              break;
            case 'location':
              content = `[位置: ${e.content}]`;
              break;
            case 'file':
              content = `[文件: ${e.content}]`;
              break;
            case 'gift':
              content = `[礼物: ${e.content}]`;
              break;
            case 'transfer':
              content = `[转账: ${e.content}]`;
              break;
          }
          return `${prefix}: ${content}`;
        }
        return ''; // Should not happen for valid entries
      })
      .join('\n');

    return [allEntriesString, ...recallCommands].filter(Boolean).join('\n');
  }

  // 简化的addEntry方法 - 对表情包消息不进行重复检查
  addEntry(entry: LogEntry | null): void {
    if (entry) {
      // 对于表情包消息，直接添加，不进行重复检查
      if ('type' in entry && entry.type === 'sticker') {
        this.logEntries.push(entry);
        return;
      }

      // 对于其他类型的条目，进行重复检查
      const isDuplicate = this.logEntries.some(existingEntry => {
        // 检查朋友圈相关条目
        if ('key' in entry && 'key' in existingEntry) {
          if (entry.key === existingEntry.key) {
            // 对于朋友圈动态，比较文本和时间
            if (entry.key.includes('_MOMENT')) {
              const entryData = (entry as MomentEntry).data;
              const existingData = (existingEntry as MomentEntry).data;
              return (
                existingData.text === entryData.text &&
                existingData.date === entryData.date &&
                existingData.time === entryData.time
              );
            }
            // 对于评论，比较文本和目标帖子ID
            else if (entry.key.includes('_COMMENT')) {
              const entryData = (entry as CommentEntry).data;
              const existingData = (existingEntry as CommentEntry).data;
              return existingData.text === entryData.text && existingData.target_post_id === entryData.target_post_id;
            }
            // 对于点赞，比较目标帖子ID
            else if (entry.key.includes('_LIKE')) {
              const entryData = (entry as LikeEntry).data;
              const existingData = (existingEntry as LikeEntry).data;
              return existingData.target_post_id === entryData.target_post_id;
            }
          }
        }

        // 检查消息类型条目
        if ('type' in entry && 'type' in existingEntry) {
          // 如果两个条目类型相同
          if (entry.type === existingEntry.type) {
            // 对于有ID的条目，比较ID
            if ('id' in entry && 'id' in existingEntry && entry.id === existingEntry.id) {
              return true;
            }

            // 对于消息类型条目，比较发送者和内容
            if (
              (entry.type === 'message' || entry.type === 'location' || entry.type === 'file') &&
              'sender' in entry &&
              'sender' in existingEntry &&
              'content' in entry &&
              'content' in existingEntry
            ) {
              return (
                entry.sender === existingEntry.sender && (window as any)._.isEqual(entry.content, existingEntry.content)
              );
            }

            // 对于时间和事件日志，比较内容
            if ((entry.type === 'time' || entry.type === 'event') && 'content' in entry && 'content' in existingEntry) {
              return (window as any)._.isEqual(entry.content, existingEntry.content);
            }

            // 对于其他复杂类型（如image, voice, transfer, gift），比较内容
            if (
              'content' in entry &&
              'content' in existingEntry &&
              (entry.type === 'image' || entry.type === 'voice' || entry.type === 'transfer' || entry.type === 'gift')
            ) {
              return (window as any)._.isEqual(entry.content, existingEntry.content);
            }
          }
        }

        return false;
      });

      if (isDuplicate) {
        // console.log(`[BLMX] 跳过添加重复条目:`, entry);
        return; // 如果是重复条目，直接返回，不添加
      }

      this.logEntries.push(entry);

      // 添加时间更新逻辑 - 参考原版简化
      if ('type' in entry && (entry.type === 'time' || entry.type === 'event')) {
        const data = entry.content;
        const timeDate = new Date(`${data.date} ${data.time}`);
        if (!isNaN(timeDate.getTime())) {
          window.currentGameDate = timeDate;
          const timeElement = document.getElementById('current-time');
          if (timeElement) {
            const timeString = `${window.currentGameDate
              .getHours()
              .toString()
              .padStart(2, '0')}:${window.currentGameDate.getMinutes().toString().padStart(2, '0')}`;
            timeElement.textContent = timeString;
          }
        }
      }
    }
  }

  getContextForAI(): string {
    return this._renderLogToString();
  }
}
