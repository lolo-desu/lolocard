/**
 * 修道院箱庭游戏界面 - 主脚本
 */
import { GameController } from './game.controller';
import { GameData } from './scripts/models/gameData';
import './styles/main.scss';

// 声明全局变量
declare global {
  interface Window {
    getChatMessages: (messageId: number) => string[];
    getCurrentMessageId: () => number;
    generate: (config: any) => Promise<string>;
    generateRaw: (config: any) => Promise<string>;
    // 世界书操作API
    getLorebookEntries: (lorebook: string) => Promise<any[]>;
    createLorebookEntry: (lorebook: string, fieldValues: any) => Promise<number>;
    deleteLorebookEntry: (lorebook: string, lorebookUid: number) => Promise<boolean>;
    editLorebookEntry: (lorebook: string, lorebookUid: number, fieldValues: any) => Promise<boolean>;
    triggerSlash: (command: string) => Promise<string>;
    // 聊天世界书API
    getOrCreateChatLorebook: () => Promise<string>;
    // 事件系统 - 设为可选属性，避免未定义错误
    eventOnce?: <T extends string>(event_type: T, listener: (...args: any[]) => any) => void;
    iframe_events?: {
      GENERATION_STARTED?: string;
      GENERATION_ENDED?: string;
      STREAM_TOKEN_RECEIVED_FULLY?: string;
      STREAM_TOKEN_RECEIVED_INCREMENTALLY?: string;
      MESSAGE_IFRAME_RENDER_STARTED?: string;
      MESSAGE_IFRAME_RENDER_ENDED?: string;
    };
  }

  // 自定义事件类型
  interface WindowEventMap {
    request_game_data: CustomEvent<{ callback: (gameData: GameData) => void }>;
    gameloaded: CustomEvent<{ gameData: GameData }>;
  }
}

// 等待DOM加载完成后初始化游戏
$(document).ready(() => {
  new GameController();
});

