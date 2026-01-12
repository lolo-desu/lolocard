import { useConfigStore } from '../store';

export function initForceGalgameInterface() {
  waitGlobalInitialized('Mvu').then(() => {
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
      if (useConfigStore().config.始终启用galgame界面) {
        _.set(variables, 'stat_data.世界.下一回合界面选择', 'galgame');
      }
    });
  });
  return { destroy: () => {} };
}
