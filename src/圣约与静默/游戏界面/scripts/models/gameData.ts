/**
 * 游戏数据模型
 * 定义了游戏中使用的所有数据结构
 */

/**
 * 对话样式
 */
export type DialogueStyle = 'normal' | 'whisper' | 'shocked' | 'special';

/**
 * 表情差分类型
 * 与CharacterResourceService中定义保持一致
 */
export type EmotionType = 'default' | 'smile' | 'sad' | 'angry' | 'shocked' | 'blush' | 'thoughtful';

/**
 * 对话条目
 */
export interface Dialogue {
  speaker: string; // 发言人名字（任意值，无需预定义）
  content: string; // 对话内容
  style: DialogueStyle; // 对话样式
  portrait?: {
    // 显示的角色立绘信息
    character: string; // 角色ID或名称
    emotion: EmotionType; // 表情状态
  };
  background?: {
    // 该对话的背景设置
    location: string; // 位置名称（如"书店"、"公园"）
    scene: string; // 场景名称（如"白天"、"黄昏"）
  };
}

/**
 * 故事记忆数据
 */
export interface StoryMemory {
  id: number;
  content: string;
  timestamp?: string;
  image?: string;
}

/**
 * 游戏故事数据
 */
export interface StoryData {
  date: string;
  location: string; // 当前默认位置
  scene: string; // 当前默认场景
  dialogue: Dialogue[];
  options: string[];
  currentDialogueIndex: number;
  currentChapter: string;
  currentFunds: number;
}

/**
 * 游戏全局数据
 */
export interface GameData {
  story: StoryData;
  storySummary: StoryMemory[];
}
