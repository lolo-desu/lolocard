import { waitUntil } from 'async-wait-until';
import { initGalgame } from './galgame/index';
import './misc/mvu';
import './misc/世界书强制自定义排序';
import './misc/变量结构';
import { initForceGalgameInterface } from './misc/强制galgame界面';
import { initButtons } from './misc/按钮';
import { checkUpdate } from './misc/更新角色卡';
import { initStyle } from './misc/样式加载';
import { initPrefetches } from './misc/资源预载';
import { useConfigStore } from './store';
import { initRoleplayOptions } from './选择框/index';

const pinia = createPinia();
setActivePinia(pinia);

$(async () => {
  await waitUntil(() => getCharWorldbookNames('current').primary !== null);
  await waitGlobalInitialized('Mvu');
  await checkUpdate();
  await useConfigStore()._wait_init;

  const destroy_list: Array<() => void> = [];
  destroy_list.push(initGalgame().destroy);
  destroy_list.push(initForceGalgameInterface().destroy);
  destroy_list.push(initButtons().destroy);
  destroy_list.push(initStyle().destroy);
  destroy_list.push(initPrefetches().destroy);
  destroy_list.push(initRoleplayOptions().destroy);

  $(window).on('pagehide', () => destroy_list.forEach(destory => destory()));
});
