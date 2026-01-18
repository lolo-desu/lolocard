import { parseString } from '@util/common';
import { Dialog } from './type';

function parseDialogsFromMessage(message: string): { dialogs: Dialog[]; type: 'full' | 'partial' | 'error' } {
  message = message.replace('<StatusPlaceHolderImpl/>', '');
  const full_match = message.match(/<(galgame)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/im);
  const partial_match = message.match(/<(galgame)>(?!.*<\/\1>)\s*(?:```[^\n]*\n)?(.*?)\s*(?:```.*)?$/is);
  const content = full_match?.[2] ?? partial_match?.[2] ?? '';

  const onError = (title: string, error: unknown) => {
    return {
      dialogs: [
        {
          speaker: '系统提示',
          speech: `${title}: ${error instanceof Error ? error.message : String(error)}`,
          background: '',
          characters: [],
        },
      ],
      type: 'error' as const,
    };
  };

  let parsed: unknown;
  try {
    parsed = parseString(content);
  } catch (error) {
    return onError('解析数据失败', error);
  }

  try {
    // TODO: 只去除尾部的
    return {
      dialogs: z
        .array(Dialog.or(z.literal('failed')).catch('failed'))
        .min(1)
        .parse(parsed, { reportInput: true })
        .filter(dialog => dialog !== 'failed'),
      type: full_match ? 'full' : 'partial',
    };
  } catch (error) {
    return onError('加载对话数据失败', error);
  }
}

function parseOptionsFromMessage(message: string): string[] {
  const FULL_REGEX = /<(roleplay_options)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/im;
  const PARTIAL_REGEX = /<(roleplay_options)>(?!.*<\/\1>)\s*(?:```[^\n]*\n)?(.*?)\s*(?:```.*)?$/is;
  const content = message.match(FULL_REGEX)?.[2] ?? message.match(PARTIAL_REGEX)?.[2] ?? '';

  return [...content.matchAll(/(.+?)[:：]\s*(.+)/gm)].map(match =>
    match[2]
      .replace(/^\$\{(.+)\}$/, '$1')
      .replace(/^「(.+)」$/, '“$1”')
      .replace(/^"(.+)"$/, '“$1”'),
  );
}

export const useGalgameStore = defineStore('galgame', () => {
  const dialogs = ref<Dialog[]>([
    {
      speaker: '系统提示',
      speech: '尚未加载消息',
      background: '',
      characters: [],
    },
  ]);
  const options = ref<string[]>([]);
  const loadMessage = (message: string) => {
    const { dialogs: new_dialogs, type } = parseDialogsFromMessage(message);
    if (during_streaming.value && type === 'error') {
      return;
    }
    if (!during_streaming.value && type === 'partial') {
      new_dialogs.push({
        speaker: '系统提示',
        speech: '消息截断了……请重新生成',
        background: '',
        characters: [],
      });
    }
    dialogs.value = new_dialogs;

    options.value = parseOptionsFromMessage(message);
  };

  const current_index = ref(0);
  const during_streaming = ref(false);
  const has_ended = ref(false);
  const current_dialog = computed(() => dialogs.value[current_index.value]);
  const history_dialogs = computed(() => dialogs.value.slice(0, current_index.value + 1));
  function advance() {
    if (has_ended.value) {
      return;
    }

    const next_index = current_index.value + 1;
    if (next_index >= dialogs.value.length) {
      if (!during_streaming.value) {
        has_ended.value = true;
      }
      return;
    }

    current_index.value = next_index;
  }
  function restart() {
    current_index.value = 0;
    has_ended.value = false;
  }

  const dialog_opened = ref(true);
  const history_opened = ref(false);

  return {
    dialogs,
    options,
    loadMessage,

    current_index,
    during_streaming,
    has_ended,
    current_dialog,
    history_dialogs,
    advance,
    restart,

    dialog_opened,
    history_opened,
  };
});
