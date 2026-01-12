import { Dialog } from './type';

function parseDialogsFromMessage(message: string): Dialog[] {
  const content = message.match(/<(galgame)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/im)![2];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (json_error) {
    try {
      parsed = YAML.parse(content);
    } catch (yaml_error) {
      const json_message = json_error instanceof Error ? json_error.message : String(json_error);
      const yaml_message = yaml_error instanceof Error ? yaml_error.message : String(yaml_error);
      throw new Error(
        `数据解析失败: 既不是有效的 JSON 也不是有效的 YAML.\n内容: ${content}\nJSON 错误: ${json_message}\nYAML 错误: ${yaml_message}`,
      );
    }
  }

  try {
    return z.array(Dialog).min(1).parse(parsed, { reportInput: true });
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
  const dialogs = ref<Dialog[]>(parseDialogsFromMessage(getChatMessages(getCurrentMessageId())?.[0]?.message ?? ''));

  const current_index = ref(0);
  const is_ended = ref(false);
  const current_dialog = computed(() => dialogs.value[current_index.value]);
  const history_dialogs = computed(() => dialogs.value.slice(0, current_index.value + 1));

  const dialog_opened = ref(true);
  const history_opened = ref(false);

  function advance() {
    if (is_ended.value) {
      return;
    }

    const next_index = current_index.value + 1;
    if (next_index >= dialogs.value.length) {
      is_ended.value = true;
      return;
    }

    current_index.value = next_index;
  }

  function restart() {
    current_index.value = 0;
    is_ended.value = false;
  }

  return {
    dialogs,

    current_index,
    is_ended,
    current_dialog,
    history_dialogs,

    dialog_opened,
    history_opened,
    advance,
    restart,
  };
});
