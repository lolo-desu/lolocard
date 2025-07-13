// 输入处理模块
// 负责消息发送、文件上传、语音录制、表情包选择等功能

import { ConfigManager, Sticker } from './config-manager';
import { DialogManager } from './dialog-manager';
import { LogEntry } from './script';

export class InputHandler {
  private configManager: ConfigManager;
  private onStageAndDisplayEntry: (entry: LogEntry) => void;
  private onUpdateFooterButtonsState: () => void;
  private dialogManager: DialogManager;

  constructor(
    configManager: ConfigManager,
    onStageAndDisplayEntry: (entry: LogEntry) => void,
    onUpdateFooterButtonsState: () => void,
  ) {
    this.configManager = configManager;
    this.onStageAndDisplayEntry = onStageAndDisplayEntry;
    this.onUpdateFooterButtonsState = onUpdateFooterButtonsState;
    this.dialogManager = DialogManager.getInstance();
  }

  // 处理转账接受
  async handleTransferAccept(data: any): Promise<void> {
    const result = await this.dialogManager.showReceiveDialog('transfer', data);
    if (result === 'accept') {
      const acceptData = { ...data, status: 'accepted' };
      this.onStageAndDisplayEntry({
        type: 'transfer',
        sender: 'me',
        content: JSON.stringify(acceptData),
        data: acceptData,
        id: `transfer-${Date.now()}`,
      } as any);
    } else if (result === 'reject') {
      const rejectData = { ...data, status: 'rejected' };
      this.onStageAndDisplayEntry({
        type: 'transfer',
        sender: 'me',
        content: JSON.stringify(rejectData),
        data: rejectData,
        id: `transfer-${Date.now()}`,
      } as any);
    }
  }

  // 处理礼物动作
  async handleGiftAction(data: any): Promise<void> {
    const result = await this.dialogManager.showReceiveDialog('gift', data);
    if (result === 'accept') {
      const receiptData = { name: data.name, status: 'accepted' };
      this.onStageAndDisplayEntry({
        type: 'gift',
        sender: 'me',
        content: JSON.stringify(receiptData),
        data: receiptData,
        id: `gift-${Date.now()}`,
      } as any);
    } else if (result === 'reject') {
      const receiptData = { name: data.name, status: 'rejected' };
      this.onStageAndDisplayEntry({
        type: 'gift',
        sender: 'me',
        content: JSON.stringify(receiptData),
        data: receiptData,
        id: `gift-${Date.now()}`,
      } as any);
    }
    // 通知有待处理的通知
    this.onUpdateFooterButtonsState();
  }

  // 发送文本消息
  sendTextMessage(text: string): void {
    if (!text.trim()) return;

    const messageEntry: LogEntry = {
      type: 'message',
      sender: 'me',
      content: text.trim(),
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(messageEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送表情包 - 简化数据结构
  sendSticker(stickerName: string): void {
    const stickerUrl = this.configManager.findStickerUrlByName(stickerName);
    if (!stickerUrl) {
      console.error(`[BLMX] 未找到表情包: ${stickerName}`);
      return;
    }

    // 使用简单的数据结构，与原版保持一致
    const stickerEntry: LogEntry = {
      type: 'sticker',
      sender: 'me',
      content: stickerName, // 直接存储表情包名称
      id: `sticker-${Date.now()}-${Math.random()}`, // 恢复原来的ID格式以保持兼容性
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(stickerEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送图片
  sendImage(imageData: { type: 'url' | 'file'; value: string; name?: string }): void {
    const imageEntry: LogEntry = {
      type: 'image',
      sender: 'me',
      content: imageData,
      id: `image-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(imageEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送语音消息
  sendVoiceMessage(voiceData: { text: string; duration?: number }): void {
    const voiceEntry: LogEntry = {
      type: 'voice',
      sender: 'me',
      content: voiceData,
      id: `voice-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(voiceEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送位置信息
  sendLocation(locationData: { name: string; address: string; latitude?: number; longitude?: number }): void {
    const locationEntry: LogEntry = {
      type: 'location',
      sender: 'me',
      content: locationData,
      id: `location-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(locationEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送文件
  sendFile(fileData: { name: string; size: number; type: string; url?: string }): void {
    const fileEntry: LogEntry = {
      type: 'file',
      sender: 'me',
      content: fileData,
      id: `file-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(fileEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送转账
  sendTransfer(transferData: { amount: number; note?: string }): void {
    const transferEntry: LogEntry = {
      type: 'transfer',
      sender: 'me',
      content: transferData,
      id: `transfer-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(transferEntry);
    this.onUpdateFooterButtonsState();
  }

  // 发送礼物
  sendGift(giftData: { name: string; image?: string; description?: string }): void {
    const giftEntry: LogEntry = {
      type: 'gift',
      sender: 'me',
      content: giftData,
      id: `gift-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    } as any;

    this.onStageAndDisplayEntry(giftEntry);
    this.onUpdateFooterButtonsState();
  }

  // 处理文件上传
  async handleFileUpload(file: File): Promise<void> {
    try {
      if (file.type.startsWith('image/')) {
        // 处理图片文件
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result as string;
          this.sendImage({
            type: 'file',
            value: result,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      } else {
        // 处理其他文件类型
        this.sendFile({
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    } catch (error) {
      console.error('[BLMX] 文件上传失败:', error);
      const dialogManager = DialogManager.getInstance();
      await dialogManager.alert('文件上传失败，请重试。', '上传失败');
    }
  }

  // 处理图片URL输入
  async handleImageUrl(url: string): Promise<void> {
    if (!url.trim()) return;

    // 验证URL格式
    try {
      new URL(url);
      this.sendImage({
        type: 'url',
        value: url.trim(),
      });
    } catch (error) {
      const dialogManager = DialogManager.getInstance();
      await dialogManager.alert('请输入有效的图片URL', 'URL格式错误');
    }
  }

  // 处理语音录制
  async handleVoiceRecording(): Promise<void> {
    try {
      const dialogManager = DialogManager.getInstance();

      // 检查浏览器是否支持语音录制
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        await dialogManager.alert('您的浏览器不支持语音录制功能', '不支持语音录制');
        return;
      }

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 这里可以集成语音录制库，如 MediaRecorder API
      // 为了简化，这里只是模拟语音录制
      const text = await dialogManager.prompt('请输入语音内容（模拟语音转文字）:', '', '语音录制');
      if (text) {
        this.sendVoiceMessage({
          text: text.trim(),
          duration: Math.floor(Math.random() * 30) + 5, // 模拟5-35秒的语音
        });
      }

      // 停止录制
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('[BLMX] 语音录制失败:', error);
      const dialogManager = DialogManager.getInstance();
      await dialogManager.alert('语音录制失败，请检查麦克风权限。', '录制失败');
    }
  }

  // 处理位置分享
  handleLocationShare(): void {
    // 检查浏览器是否支持地理位置
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理位置功能');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const locationName = prompt('请输入位置名称:') || '我的位置';
        const address = prompt('请输入详细地址:') || `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`;

        this.sendLocation({
          name: locationName,
          address: address,
          latitude: latitude,
          longitude: longitude,
        });
      },
      error => {
        console.error('[BLMX] 获取位置失败:', error);
        // 允许用户手动输入位置信息
        const locationName = prompt('无法获取当前位置，请手动输入位置名称:');
        const address = prompt('请输入详细地址:');

        if (locationName && address) {
          this.sendLocation({
            name: locationName,
            address: address,
          });
        }
      },
    );
  }

  // 处理转账发送
  handleTransferSend(): void {
    const amountStr = prompt('请输入转账金额:');
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的金额');
      return;
    }

    const note = prompt('请输入转账备注（可选）:') || '';

    this.sendTransfer({
      amount: amount,
      note: note,
    });
  }

  // 处理礼物发送
  handleGiftSend(): void {
    const giftName = prompt('请输入礼物名称:');
    if (!giftName) return;

    const giftImage = prompt('请输入礼物图片URL（可选）:') || '';
    const description = prompt('请输入礼物描述（可选）:') || '';

    this.sendGift({
      name: giftName,
      image: giftImage,
      description: description,
    });
  }

  // 获取表情包列表 - 增加向后兼容性
  getStickerList(): Sticker[] {
    // 尝试从新的存储键读取
    let globalStickers = JSON.parse(localStorage.getItem('blmx_wechat_stickers_global_blmx') || '[]');
    let charStickers = JSON.parse(
      localStorage.getItem(`blmx_char_stickers_blmx_${this.configManager.getConfig().currentCharId}`) || '[]',
    );

    // 如果新存储键没有数据，尝试从旧存储键读取
    if (globalStickers.length === 0) {
      const oldGlobalStickers = JSON.parse(localStorage.getItem('blmx_wechat_stickers_global') || '[]');
      if (oldGlobalStickers.length > 0) {
        globalStickers = oldGlobalStickers;
      }
    }

    if (charStickers.length === 0) {
      const oldCharStickers = JSON.parse(
        localStorage.getItem(`blmx_char_stickers_${this.configManager.getConfig().currentCharId}`) || '[]',
      );
      if (oldCharStickers.length > 0) {
        charStickers = oldCharStickers;
      }
    }

    return [...globalStickers, ...charStickers];
  }

  // 搜索表情包
  searchStickers(query: string): Sticker[] {
    const stickers = this.getStickerList();
    if (!query.trim()) return stickers;

    const searchTerm = query.toLowerCase();
    return stickers.filter(sticker => sticker.label.toLowerCase().includes(searchTerm));
  }

  // 清空输入框
  clearInput(): void {
    const inputElement = document.getElementById('wechat-input-field') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
      this.onUpdateFooterButtonsState();
    }
  }

  // 设置输入框焦点
  focusInput(): void {
    const inputElement = document.getElementById('wechat-input-field') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  // 获取输入框内容
  getInputText(): string {
    const inputElement = document.getElementById('wechat-input-field') as HTMLInputElement;
    return inputElement ? inputElement.value : '';
  }

  // 设置输入框内容
  setInputText(text: string): void {
    const inputElement = document.getElementById('wechat-input-field') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = text;
      this.onUpdateFooterButtonsState();
    }
  }
}
