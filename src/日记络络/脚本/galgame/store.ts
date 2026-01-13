import { partialParse } from 'openai-partial-json-parser';
import { Dialog } from './type';

function parseDialogsFromMessage(message: string): { dialogs: Dialog[]; type: 'full' | 'partial' | 'error' } {
  message = message.replace('<StatusPlaceHolderImpl/>', '');
  const full_match = message.match(/<(galgame)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/im);
  const partial_match = message.match(/<(galgame)>(?!.*<\/\1>)\s*(?:```[^\n]*\n)?(.*?)\s*(?:```.*)?$/is);
  const content = full_match?.[2] ?? partial_match?.[2] ?? '';

  let parsed: unknown;
  try {
    parsed = partialParse(content);
  } catch (json_error) {
    try {
      parsed = YAML.parse(content);
    } catch (yaml_error) {
      const json_message = json_error instanceof Error ? json_error.message : String(json_error);
      const yaml_message = yaml_error instanceof Error ? yaml_error.message : String(yaml_error);
      return {
        dialogs: [
          {
            speaker: '系统提示',
            speech: `数据解析失败: 既不是有效的 JSON 也不是有效的 YAML.\n内容: ${content}\nJSON 错误: ${json_message}\nYAML 错误: ${yaml_message}`,
            background: '',
            characters: [],
          },
        ],
        type: 'error',
      };
    }
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
    return {
      dialogs: [
        {
          speaker: '系统提示',
          speech: `加载对话数据失败：${error instanceof Error ? error.message : String(error)}`,
          background: '',
          characters: [],
        },
      ],
      type: 'error',
    };
  }
}

function parseOptionsFromMessage(message: string): string[] {
  const FULL_REGEX = /<(roleplay_options)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/im;
  const PARTIAL_REGEX = /<(roleplay_options)>(?!.*<\/\1>)\s*(?:```[^\n]*\n)?(.*?)\s*(?:```.*)?$/is;
  const content = message.match(FULL_REGEX)?.[2] ?? message.match(PARTIAL_REGEX)?.[2] ?? '';

  return [...content.matchAll(/(.+?)[:：]\s*(.+)/gm)].map(match =>
    match[2].replace(/^\$\{(.+)\}$/, '$1').replace(/^「(.+)」$/, '$1'),
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

  const dialog_opened = ref(true);
  const history_opened = ref(false);

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
