export const Character = z.object({
  id: z.string(),
  tachie: z.string(),
});
export type Character = z.infer<typeof Character>;

const 日记络络专用 = z
  .object({
    speaker: z.string(),
    speech: z.string(),
    background: z.string(),
    tachie: z.string(),
  })
  .transform(data => {
    return { ..._.omit(data, 'tachie'), characters: [{ id: '络络', tachie: data.tachie }] };
  });

export const Dialog = z
  .union([
    日记络络专用,
    z.object({
      speaker: z.string(),
      speech: z.string().transform(text => text.replace(/^「(.+)」$/, '“$1”').replace(/^"(.+)"$/, '“$1”')),
      background: z.string(),
      characters: z.array(Character).prefault([]).catch([]),
    }),
  ])
  .transform(data => {
    // 虽然影响其他组件无法对独白、旁白进行特殊处理，但这样的处理确实是我们想要的
    if (data.speaker === '独白') {
      data.speaker = substitudeMacros('<user>');
      data.speech = data.speech.startsWith('（') || data.speech.startsWith('(') ? data.speech : `（${data.speech}）`;
    }
    if (data.speaker === '独白' || data.speaker === '旁白') {
      data.speaker = '';
    }
    return data;
  });
export type Dialog = z.infer<typeof Dialog>;
