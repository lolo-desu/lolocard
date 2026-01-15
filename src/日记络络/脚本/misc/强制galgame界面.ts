import start_0 from '../../第一条消息/0.txt?raw';
import start_1_galgame from '../../第一条消息/1_galgame.txt?raw';
import start_1_normal from '../../第一条消息/1_normal.txt?raw';
import start_2_galgame from '../../第一条消息/2_galgame.txt?raw';
import start_2_normal from '../../第一条消息/2_normal.txt?raw';
import start_3_galgame from '../../第一条消息/3_galgame.txt?raw';
import start_3_normal from '../../第一条消息/3_normal.txt?raw';
import start_4_galgame from '../../第一条消息/4_galgame.txt?raw';
import start_4_normal from '../../第一条消息/4_normal.txt?raw';
import { useConfigStore } from '../store';

export function initForceGalgameInterface() {
  const store = useConfigStore();

  const normal_starts: string[] = [start_0, start_1_normal, start_2_normal, start_3_normal, start_4_normal];
  const galgame_starts: string[] = [start_0, start_1_galgame, start_2_galgame, start_3_galgame, start_4_galgame];

  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
    if (store.config.始终使用galgame界面) {
      _.set(variables, 'stat_data.世界.下一回合界面选择', 'galgame');
    }
  });
  eventOn(tavern_events.GENERATION_STARTED, async () => {
    if (store.config.始终使用galgame界面) {
      updateVariablesWith(variables => _.set(variables, 'stat_data.世界.下一回合界面选择', 'galgame'), {
        type: 'message',
      });
    }
  });

  const replaceStarts = (use_galgame: boolean) => {
    if (getLastMessageId() <= 1) {
      setChatMessages([{ message_id: 0, swipes: use_galgame ? galgame_starts : normal_starts }]);
      if (!use_galgame) {
        updateVariablesWith(variables => _.set(variables, 'stat_data.世界.下一回合界面选择', '纯文字尾附立绘'), {
          type: 'message',
        });
      }
    }
  };
  const stop = watch(() => store.config.始终使用galgame界面, replaceStarts, { immediate: true });
  eventOn(tavern_events.CHAT_CHANGED, () => replaceStarts(store.config.始终使用galgame界面));

  return {
    destroy: () => {
      stop();
    },
  };
}
