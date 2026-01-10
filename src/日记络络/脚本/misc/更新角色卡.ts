import { compare } from 'compare-versions';
import { CHARACTER_NAME, WORLDBOOK_NAME } from '../constant';

export async function checkUpdate() {
  const worldbook = await getWorldbook(WORLDBOOK_NAME);
  const is_new = worldbook.some(entry => entry.name.includes('样式主题'));
  if (is_new) {
    return;
  }
  await importRawCharacter(
    CHARACTER_NAME,
    await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/白化蓝染的日记本.png').then(
      response => response.blob(),
    ),
  );
  if (compare(getTavernVersion(), '4.3.18', '<')) {
    SillyTavern.saveWorldInfo(
      WORLDBOOK_NAME,
      JSON.parse(
        await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/世界书/日记络络.json').then(
          response => response.text(),
        ),
      ),
      true,
    );
  }
  toastr.success('角色卡自动更新成功, 准备刷新页面以生效...', '白化蓝染的日记本');
  setTimeout(() => triggerSlash('/reload-page'), 3000);
}
