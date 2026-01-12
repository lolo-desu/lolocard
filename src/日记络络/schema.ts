export const Schema = z
  .object({
    世界: z
      .object({
        当前时间: z.templateLiteral([z.coerce.number(), ':', z.coerce.number()]),
        _当前时间阶段: z.enum(['凌晨', '早晨', '上午', '中午', '下午', '晚上', '深夜']).optional(),
        当前日期: z.string(),
        当前星期: z.templateLiteral([z.literal('星期'), z.enum(['一', '二', '三', '四', '五', '六', '日'])]),
        是否需要上学: z.boolean().prefault(true),
        是否处于NSFW场景: z.boolean().prefault(false),
        下一回合界面选择: z.enum(['纯文字尾附立绘', '展示日记', 'galgame']).prefault('纯文字尾附立绘'),
      })
      .transform(data => {
        const minutes = data.当前时间
          .split(':')
          .map(Number)
          .reduce((sum, current) => sum * 60 + current, 0);
        if (minutes < 5 * 60) {
          data._当前时间阶段 = '凌晨';
        } else if (minutes < 6 * 60) {
          data._当前时间阶段 = '早晨';
        } else if (minutes < 12 * 60) {
          data._当前时间阶段 = '上午';
        } else if (minutes < 14 * 60) {
          data._当前时间阶段 = '中午';
        } else if (minutes < 17 * 60) {
          data._当前时间阶段 = '下午';
        } else if (minutes < 20 * 60) {
          data._当前时间阶段 = '晚上';
        } else {
          data._当前时间阶段 = '深夜';
        }
        if (data.当前星期 === '星期六' || data.当前星期 === '星期日') {
          data.是否需要上学 = false;
        }
        return data;
      }),
    主线事件: z
      .discriminatedUnion('当前状态', [
        z.object({
          当前状态: z.literal('无法触发'),
        }),
        z.object({
          当前状态: z.literal('冷却中'),
          剩余冷却回合数: z.coerce.number().nonnegative().prefault(20),
        }),
        z.object({
          当前状态: z.literal('进行中'),
          当前阶段: z.enum(['引入', '发展', '高潮', '结局']).prefault('引入'),
          主题: z.string(),
          描述: z.string(),
          大纲: z.object({
            引入: z.string(),
            发展: z.string(),
            高潮: z.string(),
            结局: z.string(),
          }),
        }),
      ])
      .prefault({
        当前状态: '无法触发',
      }),
    络络: z.object({
      亲密度: z.coerce.number().transform(v => _.clamp(v, 0, 100)),
      阅读日记数量: z.coerce.number().nonnegative().prefault(0),
      拥有联系方式: z.boolean().prefault(false),
    }),
  })
  .transform(data => {
    if (data.络络.亲密度 < 50) {
      data.主线事件.当前状态 = '无法触发';
    } else if (data.主线事件.当前状态 === '无法触发') {
      data.主线事件 = { 当前状态: '冷却中', 剩余冷却回合数: 0 };
    }
    return data;
  });
