import { partialParse } from 'openai-partial-json-parser';
import { Dialog } from './type';

const PARTIAL_REGEX = /<(galgame)>(?!.*<\/\1>)\s*(?:```[^\n]*\n)?(.*?)\s*(?:```.*)?$/is;
const FULL_REGEX = /<(galgame)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/im;

function parseDialogsFromMessage(message: string): Dialog[] {
  message = message.replace('<StatusPlaceHolderImpl/>', '');
  const content = message.match(FULL_REGEX)?.[2] ?? message.match(PARTIAL_REGEX)?.[2] ?? '';

  let parsed: unknown;
  try {
    parsed = partialParse(content);
  } catch (json_error) {
    try {
      parsed = YAML.parse(content);
    } catch (yaml_error) {
      const json_message = json_error instanceof Error ? json_error.message : String(json_error);
      const yaml_message = yaml_error instanceof Error ? yaml_error.message : String(yaml_error);
      return [
        {
          speaker: '系统提示',
          speech: `数据解析失败: 既不是有效的 JSON 也不是有效的 YAML.\n内容: ${content}\nJSON 错误: ${json_message}\nYAML 错误: ${yaml_message}`,
          background: '',
          characters: [],
        },
      ];
    }
  }

  try {
    // TODO: 只去除尾部的
    return z
      .array(Dialog.or(z.literal('failed')).catch('failed'))
      .min(1)
      .parse(parsed, { reportInput: true })
      .filter(dialog => dialog !== 'failed');
  } catch (error) {
    return [
      {
        speaker: '系统提示',
        speech: `加载对话数据失败：${error instanceof Error ? error.message : String(error)}`,
        background: '',
        characters: [],
      },
    ];
  }
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
  const loadDialogs = (message: string) => {
    const new_dialogs = parseDialogsFromMessage(message);
    if (during_streaming.value && new_dialogs.length === 1 && new_dialogs[0].speaker === '系统提示') {
      return;
    }
    dialogs.value = new_dialogs;
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
    loadDialogs,

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
