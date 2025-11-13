import { z } from 'zod';

export const Schema = z.object({
  世界: z.object({
    当前时间: z.coerce.string(),
    当前地点: z.coerce.string(),
  }),

  主角: z.object({
    姓名: z.coerce.string(),
    性别: z.coerce.string(),
    年龄: z.union([z.coerce.number(), z.literal('待初始化')]),
    外貌: z.object({
      描述: z.coerce.string(),
      主角评价: z.coerce.string(),
    }),
    能力面板: z.object({
      力量: z
        .object({
          数值: z.union([z.union([z.coerce.number(), z.literal('待初始化')]), z.literal('待初始化')]),
          主角评价: z.coerce.string(),
        })
        .describe('体能与攻击能力，决定近战输出与负重'),
      敏捷: z
        .object({
          数值: z.union([z.coerce.number(), z.literal('待初始化')]),
          主角评价: z.coerce.string(),
        })
        .describe('移动、闪避与反应速度，影响先手与命中'),
      体质: z
        .object({
          数值: z.union([z.coerce.number(), z.literal('待初始化')]),
          主角评价: z.coerce.string(),
        })
        .describe('生命力与耐久度，决定抗性与恢复速度'),
      感知: z
        .object({
          数值: z.union([z.coerce.number(), z.literal('待初始化')]),
          主角评价: z.coerce.string(),
        })
        .describe('观察与洞察能力，影响侦查与魔力控制'),
      意志: z
        .object({
          数值: z.union([z.coerce.number(), z.literal('待初始化')]),
          主角评价: z.coerce.string(),
        })
        .describe('精神力与抗干扰能力，决定技能稳定性'),
      魅力: z
        .object({
          数值: z.union([z.coerce.number(), z.literal('待初始化')]),
          主角评价: z.coerce.string(),
        })
        .describe('影响交涉、统御与社交反馈的综合指标'),
    }),
    装备栏: z.object({
      主手: z.object({
        装备: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
      副手: z.object({
        装备: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
      防具: z.object({
        装备: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
      饰品: z.object({
        装备: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
    }),
    物品栏: z.record(
      z.coerce.string<string | number>().describe('物品名'),
      z.object({
        描述: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
    ),
    持有能力: z.record(
      z.coerce.string<string | number>().describe('物品名'),
      z.object({
        描述: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
    ),
    当前状态: z.record(
      z.coerce.string<string | number>().describe('状态名'),
      z.object({
        类型: z.enum(['增益', '减益']),
        持续时间: z.union([z.literal('永久'), z.coerce.string()]),
        触发条件: z.coerce.string(),
        描述: z.coerce.string(),
        主角评价: z.coerce.string(),
      }),
    ),
  }),

  系统状态: z.object({
    可用积分: z.union([z.coerce.number(), z.literal('待初始化')]),
    对主角可见形象: z.coerce.string(),
    玩家ID: z.coerce.string(),
  }),

  商品列表: z.record(
    z.coerce.string<string | number>().describe('商品名'),
    z.object({
      描述: z.coerce.string(),
      主角评价: z.coerce.string(),
      积分价格: z.union([z.coerce.number(), z.literal('待初始化')]),
    }),
  ),

  任务列表: z.record(
    z.coerce.string<string | number>().describe('任务名'),
    z.object({
      类型: z.enum(['主线', '支线', '每日', '临危受命']),
      说明: z.coerce.string(),
      目标: z.coerce.string(),
      奖励: z.coerce.string(),
      惩罚: z.coerce.string(),
    }),
  ),
});
export type Schema = z.output<typeof Schema>;
export const TASK_TYPES = ['主线', '支线', '每日', '临危受命'] as const;
