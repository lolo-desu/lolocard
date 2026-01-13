import { useConfigStore } from '../store';

export function initForceGalgameInterface() {
  waitGlobalInitialized('Mvu').then(() => {
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
      if (useConfigStore().config.始终使用galgame界面) {
        _.set(variables, 'stat_data.世界.下一回合界面选择', 'galgame');
      }
    });
    eventOn(tavern_events.GENERATION_STARTED, async () => {
      if (useConfigStore().config.始终使用galgame界面) {
        updateVariablesWith(variables => _.set(variables, 'stat_data.世界.下一回合界面选择', 'galgame'), {
          type: 'message',
        });
      }
    });
  });
  return { destroy: () => {} };
}
