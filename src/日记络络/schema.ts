export const Schema = z.object({
  世界: z.object({
    当前星期: z.string(),
    当前日期: z.string(),
    当前时间阶段: z.number().prefault(1),
    下次响应界面选择判断: z
      .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
      .prefault(0)
      .catch(0),
    当前主线事件ID: z.string().prefault('无').catch('无'),
    当前主线事件阶段: z.number().prefault(0).catch(0),
    当前主线故事大纲: z.string().prefault('无').catch('无'),
    主线事件冷却计数: z.number().prefault(0).catch(0),
  }),
  络络: z.object({
    亲密度: z.number(),
    阅读日记数量: z.number().int().nonnegative(),
    拥有联系方式: z.boolean().prefault(false),
  }),
});
