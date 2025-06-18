import { Status } from './character';

export interface BattleResult {
  victory: boolean;
  playerState: {
    hp: number;
    mp: number;
    status: Status[];
  };
  enemyState: {
    hp: number;
    defeated: boolean;
  };
  summary: string;
  keyEvents: string[];
}

export interface BattleTarget {
  id: string;
  name: string;
  strengthLevel: 'weak' | 'equal' | 'strong';
}

// 可以在这里添加 BattleLog 等其他战斗相关模型
export interface BattleLogEntry {
  turn: number;
  actorId: string;
  actorName: string;
  actionType: 'attack' | 'skill' | 'defend' | 'escape' | 'system';
  skillName?: string;
  targetId?: string;
  targetName?: string;
  description: string; // 原始描述，可以直接显示
  // 可以添加更结构化的数据，如伤害、治疗量、状态变化等
  damageDealt?: number;
  healingDone?: number;
  isCritical?: boolean;
  statusApplied?: Status[];
}
