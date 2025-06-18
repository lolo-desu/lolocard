import { BattleLogEntry } from '../models/battle'; // 导入模型
import { Character, Status } from '../models/character'; // 导入模型
import { Skill } from '../models/skill'; // 导入模型

/**
 * 更新角色信息的显示
 * @param type 'player' 或 'enemy'
 * @param character 角色数据
 */
function updateCharacterInfo(type: 'player' | 'enemy', character: Character): void {
  const infoDiv = $(`#${type}-info`);
  if (infoDiv.length === 0) return;

  const attributes = character.attributes;
  const statusNames = character.status.map(s => s.name).join(', ');

  infoDiv.html(`
        <h3>${character.name}</h3>
        <div class="status-bar hp">
            <div class="bar-fill" style="width: ${(attributes.hp / attributes.maxHp) * 100}%;"></div>
        </div>
        <span>HP: ${attributes.hp} / ${attributes.maxHp}</span>
        <div class="status-bar mp">
            <div class="bar-fill" style="width: ${(attributes.mp / attributes.maxMp) * 100}%;"></div>
        </div>
        <span>MP: ${attributes.mp} / ${attributes.maxMp}</span>
        <div class="status-effects">
            状态: ${statusNames || '无'}
        </div>
    `);
}

/**
 * 向战斗日志添加条目
 * @param logEntry 日志条目数据
 */
function addLogEntry(logEntry: BattleLogEntry): void {
  const battleLog = $('#battle-log');
  if (battleLog.length === 0) return;

  let entryClass = 'log-entry';
  if (logEntry.actionType === 'system') {
    entryClass += ' system-message';
  } else if (logEntry.actorId === 'player') {
    // 假设玩家 ID 固定为 'player'
    entryClass += ' player-action';
  } else {
    entryClass += ' enemy-action';
  }

  // 使用 description 作为基础，可以根据结构化数据进一步丰富显示
  let messageHtml = `[回合 ${logEntry.turn}] ${logEntry.description}`;
  // 示例：为伤害、治疗、暴击添加样式
  if (logEntry.damageDealt) {
    messageHtml = messageHtml.replace(
      logEntry.damageDealt.toString(),
      `<span class="damage">${logEntry.damageDealt}</span>`,
    );
  }
  if (logEntry.healingDone) {
    messageHtml = messageHtml.replace(
      logEntry.healingDone.toString(),
      `<span class="heal">${logEntry.healingDone}</span>`,
    );
  }
  if (logEntry.isCritical) {
    // 假设描述中包含能标识暴击的词
    messageHtml = messageHtml.replace('暴击', '<span class="critical">暴击</span>');
  }

  const entry = $(`<div class="${entryClass}"></div>`).html(messageHtml);
  battleLog.append(entry);
  battleLog.scrollTop(battleLog[0].scrollHeight);
}

/**
 * 更新技能列表
 * @param skills 技能数组
 */
function updateSkillList(skills: Skill[]): void {
  const skillListDiv = $('#skill-list');
  if (skillListDiv.length === 0) return;

  skillListDiv.empty();
  skills.forEach(skill => {
    const skillButton = $(
      `<button class="skill-button" data-skill-id="${skill.id}">${skill.name} (MP: ${skill.mpCost})</button>`,
    );
    skillListDiv.append(skillButton);
  });
}

/**
 * 显示战斗结果
 * @param message 结果消息
 */
function showBattleResult(message: string): void {
  const battleResultDiv = $('#battle-result');
  if (battleResultDiv.length === 0) return;

  battleResultDiv.html(`<h2>${message}</h2><button id="continue-plot-button">继续剧情</button>`);
  battleResultDiv.show();
  $('.battle-controls').hide();
}

// --- 示例数据和初始化 --- (后续会由战斗引擎和通信模块驱动)
const samplePlayerStatus: Status[] = [{ id: 's001', name: '力量提升', description: '攻击力少量上升', duration: 3 }];
const sampleEnemyStatus: Status[] = [{ id: 's002', name: '中毒', description: '每回合损失少量HP', duration: 5 }];

const samplePlayerSkills: Skill[] = [
  {
    id: 'sk001',
    name: '火焰球',
    description: '造成少量火属性伤害',
    mpCost: 10,
    type: 'attack',
    targetType: 'single',
    effects: [{ type: 'damage', value: 15 }],
  },
  {
    id: 'sk002',
    name: '治疗术',
    description: '恢复少量HP',
    mpCost: 15,
    type: 'heal',
    targetType: 'single',
    effects: [{ type: 'heal', value: 20 }],
  },
  {
    id: 'sk003',
    name: '英勇打击',
    description: '造成物理伤害',
    mpCost: 5,
    type: 'attack',
    targetType: 'single',
    effects: [{ type: 'damage', value: 10 }],
  },
];

const samplePlayer: Character = {
  id: 'player',
  name: '英雄',
  type: 'player',
  attributes: { hp: 85, maxHp: 100, mp: 40, maxMp: 50, strength: 12, defense: 8, speed: 10, intelligence: 9 },
  skills: samplePlayerSkills,
  status: samplePlayerStatus,
};

const sampleEnemy: Character = {
  id: 'enemy01',
  name: '史莱姆王',
  type: 'enemy',
  attributes: { hp: 120, maxHp: 120, mp: 20, maxMp: 20, strength: 10, defense: 10, speed: 5, intelligence: 3 },
  skills: [], // 敌人技能暂不在此示例中处理
  status: sampleEnemyStatus,
};

const sampleLog: BattleLogEntry[] = [
  { turn: 1, actorId: 'system', actorName: '系统', actionType: 'system', description: '战斗开始！史莱姆王出现了！' },
  {
    turn: 1,
    actorId: 'player',
    actorName: '英雄',
    actionType: 'skill',
    skillName: '火焰球',
    targetId: 'enemy01',
    targetName: '史莱姆王',
    description: '英雄对史莱姆王使用了火焰球，造成 15 点伤害。',
    damageDealt: 15,
  },
  {
    turn: 1,
    actorId: 'enemy01',
    actorName: '史莱姆王',
    actionType: 'attack',
    targetId: 'player',
    targetName: '英雄',
    description: '史莱姆王撞向英雄，造成 8 点伤害。',
    damageDealt: 8,
  },
  {
    turn: 2,
    actorId: 'player',
    actorName: '英雄',
    actionType: 'attack',
    targetId: 'enemy01',
    targetName: '史莱姆王',
    description: '英雄发动了攻击，造成 18 点<span class="critical">暴击</span>伤害！',
    damageDealt: 18,
    isCritical: true,
  },
  {
    turn: 2,
    actorId: 'enemy01',
    actorName: '史莱姆王',
    actionType: 'system',
    description: '史莱姆王因为中毒，受到了 5 点伤害。',
    damageDealt: 5,
  }, // 状态伤害
  {
    turn: 2,
    actorId: 'player',
    actorName: '英雄',
    actionType: 'skill',
    skillName: '治疗术',
    targetId: 'player',
    targetName: '英雄',
    description: '英雄对自己使用了治疗术，恢复了 20 点HP。',
    healingDone: 20,
  },
];

$(document).ready(() => {
  updateCharacterInfo('player', samplePlayer);
  updateCharacterInfo('enemy', sampleEnemy);
  updateSkillList(samplePlayerSkills);

  // 显示示例日志
  sampleLog.forEach(log => addLogEntry(log));

  // 绑定事件监听 (这里的逻辑后续会被战斗引擎接管)
  $('.battle-controls').on('click', '.action-button', function () {
    const action = $(this).data('action');
    const log: BattleLogEntry = {
      turn: 3, // 假设是第3回合
      actorId: 'player',
      actorName: '英雄',
      actionType: action,
      description: `英雄选择了 ${$(this).text()}`,
    };
    addLogEntry(log);

    // 模拟敌人回合和战斗结束
    setTimeout(() => {
      const enemyLog: BattleLogEntry = {
        turn: 3,
        actorId: 'enemy01',
        actorName: '史莱姆王',
        actionType: 'attack',
        targetId: 'player',
        targetName: '英雄',
        description: '史莱姆王发动了最终一击！',
        damageDealt: 50, // 假设高伤害
        isCritical: true, // 假设暴击
      };
      addLogEntry(enemyLog);
      if (Math.random() > 0.3) {
        showBattleResult('胜利！');
      } else {
        showBattleResult('失败...');
      }
    }, 1000);
  });

  $('.battle-controls').on('click', '.skill-button', function () {
    const skillId = $(this).data('skill-id');
    const skill = samplePlayerSkills.find(s => s.id === skillId);
    if (!skill) return;

    const log: BattleLogEntry = {
      turn: 3, // 假设是第3回合
      actorId: 'player',
      actorName: '英雄',
      actionType: 'skill',
      skillName: skill.name,
      description: `英雄使用了技能：${skill.name}`,
    };
    addLogEntry(log);

    // 模拟敌人回合和战斗结束
    setTimeout(() => {
      const enemyLog: BattleLogEntry = {
        turn: 3,
        actorId: 'enemy01',
        actorName: '史莱姆王',
        actionType: 'attack',
        targetId: 'player',
        targetName: '英雄',
        description: '史莱姆王发动了反击！',
        damageDealt: 12,
      };
      addLogEntry(enemyLog);
      showBattleResult('战斗结束！');
    }, 1000);
  });

  $('#battle-result').on('click', '#continue-plot-button', function () {
    toastr.info('继续剧情...（此处将与SillyTavern交互）');
    // TODO: 实现与SillyTavern的交互逻辑
    $('#battle-container').hide(); // 隐藏战斗界面
  });
});
