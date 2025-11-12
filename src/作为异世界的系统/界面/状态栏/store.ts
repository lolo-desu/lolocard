import { Data } from '../../data';

export const useDataStore = defineStore('data', () => {
  const data = ref(
    Data.parse(_.get(getVariables({ type: 'message', message_id: getCurrentMessageId() }), 'stat_data', {})),
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

  return { data };
});
