export type TaskType = '主线' | '支线' | '每日' | '临危受命';

export interface AbilityStat {
  数值: string | number;
  自我评价: string;
}

export type AbilityKey = '力量' | '敏捷' | '体质' | '感知' | '意志' | '魅力';
export type AbilityPanel = Record<AbilityKey, AbilityStat>;

export interface WorldState {
  当前时间: string;
  当前地点: string;
}

export interface Appearance {
  描述: string;
  自我评价: string;
}

export interface EquipmentSlots {
  主手: string;
  副手: string;
  防具: string;
  饰品: string;
  [key: string]: string;
}

export type InventoryTuple = [string, string, string?];

export interface InventoryItem {
  名称: string;
  描述: string;
  主角评价?: string;
}

export interface HeroState {
  姓名: string;
  性别: string;
  年龄: string;
  外貌: Appearance;
  能力面板: AbilityPanel;
  物品栏: Array<InventoryTuple | InventoryItem>;
  装备栏: EquipmentSlots;
  [key: string]: any;
}

export interface SystemState {
  系统模式: string;
  可用积分: number | string;
  当前提示: string;
  对主角可见形象: string;
  玩家ID: string;
  [key: string]: any;
}

export interface TaskEntry {
  任务名: string;
  任务类型: TaskType;
  任务说明: string;
  任务目标: string;
  奖励: string;
  惩罚: string;
  [key: string]: any;
}

export type TaskDictionary = Record<string, TaskEntry>;

export interface ShopEntry {
  物品名称: string;
  描述: string;
  主角评价: string;
  '价格(积分)': number;
  [key: string]: any;
}

export type ShopDictionary = Record<string, ShopEntry>;

export interface IsekaiStatData {
  世界: WorldState;
  主角: HeroState;
  系统状态: SystemState;
  商城: ShopDictionary;
  任务列表: TaskDictionary;
  [key: string]: any;
}

export type PublishTaskPayload = TaskEntry;

export interface RewardPayload {
  名称: string;
  描述: string;
  主角评价?: string;
  增加积分?: number;
  写入背包?: boolean;
}

export interface ShopItemPayload {
  物品名称: string;
  描述: string;
  主角评价: string;
  价格: number;
}

export interface DirectMessagePayload {
  提示: string;
  附注?: string;
  同步到聊天?: boolean;
}

export const TASK_TYPES: TaskType[] = ['主线', '支线', '每日', '临危受命'];
