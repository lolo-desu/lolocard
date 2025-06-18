import { Skill } from './skill';

export interface Status {
  id: string;
  name: string;
  description: string;
  duration: number; // 持续回合数，-1 表示永久
  // 可以添加效果定义，例如影响哪些属性等
}

export interface CharacterAttributes {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  defense: number;
  speed: number;
  intelligence: number;
}

export interface Character {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'enemy';
  attributes: CharacterAttributes;
  skills: Skill[];
  status: Status[];
}
