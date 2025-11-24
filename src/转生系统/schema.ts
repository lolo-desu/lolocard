import { z } from 'zod';

export const Schema = z.object({
  世界: z.object({
    当前时间: z.string(),
    当前地点: z.string(),
  }),

  主角: z.object({
    姓名: z.string(),
    性别: z.string(),
    年龄: z.coerce
      .number()
      .or(z.templateLiteral([z.coerce.number(), z.literal('岁')]).transform(value => parseInt(value)))
      .or(z.literal('待初始化')),
    外貌: z.object({
      描述: z.string(),
      主角评价: z.string(),
    }),
    能力面板: z.record(
      z.enum(['力量', '敏捷', '体质', '感知', '意志', '魅力']),
      z.object({
        数值: z.coerce.number().or(z.literal('待初始化')),
        主角评价: z.string(),
      }),
    ),
    装备栏: z.record(
      z.enum(['主手', '副手', '防具', '饰品']),
      z.object({
        装备: z.string(),
        主角评价: z.string(),
      }),
    ),
    物品栏: z.record(
      z.string(),
      z.object({
        描述: z.string(),
        主角评价: z.string(),
      }),
    ),
    持有能力: z.record(
      z.string(),
      z.object({
        描述: z.string(),
        主角评价: z.string(),
      }),
    ),
    当前状态: z.record(
      z.string(),
      z.object({
        类型: z.enum(['增益', '减益']),
        持续时间: z.string(),
        触发条件: z.string(),
        描述: z.string(),
        主角评价: z.string(),
      }),
    ),
  }),

  系统状态: z.object({
    可用积分: z.coerce.number().or(z.literal('待初始化')),
    对主角可见形象: z.string(),
    玩家ID: z.string(),
    玩家本轮操作日志: z.array(z.string()),
  }),

  商品列表: z.record(
    z.string(),
    z.object({
      描述: z.string(),
      主角评价: z.string(),
      积分价格: z.coerce.number().or(z.literal('待初始化')),
    }),
  ),

  任务列表: z.record(
    z.string(),
    z.object({
      类型: z.enum(['主线', '支线', '每日', '临危受命']),
      说明: z.string(),
      目标: z.string(),
      奖励: z.string(),
      惩罚: z.string(),
    }),
  ),
});
export type Schema = z.output<typeof Schema>;
export const TASK_TYPES = ['主线', '支线', '每日', '临危受命'] as const;
