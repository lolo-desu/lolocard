import { Schema } from '../../schema';

export const useDataStore = defineStore('data', () => {
  const data = ref(
    Schema.parse(_.get(getVariables({ type: 'message', message_id: getCurrentMessageId() }), 'stat_data', {})),
  );

  watchEffect(() => {
    updateVariablesWith(
      variables => {
        _.set(variables, 'stat_data', klona(data.value));
        return variables;
      },
      { type: 'message', message_id: getCurrentMessageId() },
    );
  });

  // 强制日志置空
  data.value.系统状态.玩家本轮操作日志 = [];
  const log = (string: string) => {
    data.value.系统状态.玩家本轮操作日志.push(string);
  };

  return { data, log };
});
