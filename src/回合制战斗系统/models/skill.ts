export interface Effect {
  type: 'damage' | 'heal' | 'addStatus' | 'removeStatus';
  attribute?: 'hp' | 'mp'; // For damage/heal
  value?: number; // Amount for damage/heal
  statusId?: string; // For addStatus/removeStatus
  chance?: number; // 0-1 probability
  duration?: number; // For status effects
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  targetType: 'single' | 'all' | 'self';
  effects: Effect[];
}
