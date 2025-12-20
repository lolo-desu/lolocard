import { Schema } from '../schema';

export const useDataStore = defineStore(
  'data',
  errorCatched(() => {
    const message_id = getCurrentMessageId();

    const data = ref(Schema.parse(_.get(getVariables({ type: 'message', message_id }), 'stat_data', {})));

    watchDebounced(
      data,
      new_data => {
        const parsed = Schema.parse(new_data);
        if (!_.isEqual(parsed, new_data)) {
          data.value = parsed;
        }
        updateVariablesWith(
          variables => {
            _.set(variables, 'stat_data', parsed);
            return variables;
          },
          { type: 'message', message_id },
        );
      },
      { deep: true, debounce: 500 },
    );

    return { data };
  }),
);
