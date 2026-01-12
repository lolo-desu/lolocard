import { useConfigStore } from '../store';

export function initForceGalgameInterface() {
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
    if (useConfigStore().config.始终使用galgame界面) {
      _.set(variables, '世界.下一回合界面选择', 'galgame');
    }
  });
  return { destroy: () => {} };
}
