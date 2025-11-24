import type { AbilityKey } from './types';

export const abilityOrder: readonly AbilityKey[] = ['力量', '敏捷', '体质', '感知', '意志', '魅力'];

export const abilityBaseDescriptions: Record<AbilityKey, string> = {
  力量: '体能与攻击能力，决定近战输出与负重',
  敏捷: '移动、闪避与反应速度，影响先手与命中',
  体质: '生命力与耐久度，决定抗性与恢复速度',
  感知: '观察与洞察能力，影响侦查与魔力控制',
  意志: '精神力与抗干扰能力，决定技能稳定性',
  魅力: '影响交涉、统御与社交反馈的综合指标',
};

export const BASE_WIDTH = 800;

export const ITEMS_PER_PAGE = 4;
