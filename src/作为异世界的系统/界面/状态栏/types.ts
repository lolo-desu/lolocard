export type SectionKey = 'info' | 'abilities' | 'equipment' | 'inventory' | 'status' | 'held-abilities';

export type StatusTab = '增益' | '减益';

export type StatusEffectEntry = {
  id: string;
  name: string;
  key: string;
  类型: '增益' | '减益';
  持续时间: string;
  触发条件: string;
  描述: string;
  主角评价: string;
};

export type AbilityKey = '力量' | '敏捷' | '体质' | '感知' | '意志' | '魅力';

export type AbilityData = {
  key: AbilityKey;
  数值: string | number;
  主角评价: string;
};

export type HeldAbility = {
  id: string;
  key: string;
  name: string;
  描述: string;
  主角评价: string;
};

export type EquipmentSlot = {
  label: string;
  item: string;
  evaluation: string;
};

export type InventoryItem = {
  id: string;
  key: string;
  名称: string;
  描述: string;
  主角评价?: string;
  placeholder: boolean;
};
