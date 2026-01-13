import { WORLDBOOK_NAME } from './constant';

const Config = z.object({
  主角性别: z.enum(['男', '女']).prefault('男'),
  样式主题: z.enum(['暗色', '亮色']).prefault('暗色'),
  选择框触发方式: z.enum(['直接发送', '覆盖输入']).prefault('直接发送'),
  始终使用galgame界面: z.boolean().prefault(false),
});
type Config = z.infer<typeof Config>;

export const useConfigStore = defineStore(
  'config',
  errorCatched(() => {
    const config = ref<Config>(Config.parse({}));

    const reloadConfig = async () => {
      const worldbook = await getWorldbook(WORLDBOOK_NAME);
      const getEntryState = (name: string) => worldbook.find(entry => entry.name.includes(name))?.enabled ?? false;

      const old_confg = klona(config.value);
      const new_config = Config.parse({
        主角性别: getEntryState('主角性别') ? '男' : '女',
        样式主题: getEntryState('样式主题') ? '暗色' : '亮色',
        选择框触发方式: getEntryState('选择框触发方式') ? '直接发送' : '覆盖输入',
        始终使用galgame界面: getEntryState('始终使用galgame界面') ? true : false,
      });
      if (!_.isEqual(new_config, old_confg)) {
        config.value = klona(new_config);
      }
      insertOrAssignVariables(klona(new_config), { type: 'chat' });
    };
    const _wait_init = reloadConfig();
    eventOn(tavern_events.WORLDINFO_UPDATED, async lorebook => {
      if (lorebook === WORLDBOOK_NAME) {
        await reloadConfig();
      }
    });
    eventOn(tavern_events.CHAT_CHANGED, async () => {
      await reloadConfig();
    });

    return { config: readonly(config), _wait_init };
  }),
);
