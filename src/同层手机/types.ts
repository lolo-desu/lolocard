// 定义EventHandler接口，避免循环依赖
export interface IEventHandler {
  setHasPendingNotifications(value: boolean): void;
  setUIRenderer(uiRenderer: any): void;
  get hasNotifications(): boolean;
}

// 定义AppController接口，避免循环依赖
export interface IAppController {
  getDisplayName(type: 'user' | 'char'): string;
  notifyRecallViaMoments(sender: 'USER' | 'CHAR', targetText: string): void;
  navigateTo(viewName: 'home' | 'wechat' | 'moments' | 'settings' | 'music' | 'pureChat'): void;
  updateAvatar(avatarType: 'user' | 'char'): void;
  updateCharRemark(): void;
  updateUserName(): void;
  updateCoverPhoto(): void;
  changeWallpaper(viewType: 'chat' | 'home' | 'settings' | 'music' | 'pureChat'): void;
  removeFromUserMessageQueue(index: number): void;
  getLatestAiRawResponse(): string;
  getLatestSentPrompt(): string;
  getRawAiResponse(): string;
  getFullPrompt(): string;
}

// 音乐APP相关类型定义
export interface MusicData {
  name: string;
  artist: string;
  cover: string;
  url: string;
  lyrics?: string[];
}

export interface MusicPlayState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface MusicChatMessage {
  id: string;
  sender: 'user' | 'char';
  content: string;
  timestamp: number;
}

export interface ListenStats {
  distance: number;
  baseTime: number; // 基础听歌时长（秒）
  startTime: number; // 当前播放开始时间戳
  timerInterval?: number; // 定时器ID
}

export interface MusicInvitation {
  name: string;
  artist: string;
  cover: string;
  url: string;
  lyrics?: string[];
}

// 音乐管理器接口
export interface IMusicManager {
  loadMusic(musicData: MusicData): void;
  play(): Promise<void>;
  pause(): void;
  setCurrentTime(time: number): void;
  setVolume(volume: number): void;
  getCurrentState(): MusicPlayState;
  onStateChange(callback: (state: MusicPlayState) => void): void;
  onEnded(callback: () => void): void;
}

// 音乐UI渲染器接口
export interface IMusicUIRenderer {
  updateMusicInfo(musicData: MusicData): void;
  updatePlayState(state: MusicPlayState): void;
  updateProgress(currentTime: number, duration: number): void;
  showLyrics(lyrics: string[], currentIndex: number): void;
  hideLyrics(): void;
  toggleLyricsView(): void;
}

// 音乐聊天管理器接口
export interface IMusicChatManager {
  sendMessage(sender: 'user' | 'char', content: string): void;
  displayMessage(message: MusicChatMessage): void;
  clearMessages(): void;
  getMessageHistory(): MusicChatMessage[];
  showChatBubble(sender: 'user' | 'char', content: string): void;
  hideChatBubble(sender: 'user' | 'char'): void;
}
