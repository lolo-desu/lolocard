import { compare } from 'compare-versions';
import { CHARACTER_NAME, WORLDBOOK_NAME } from '../constant';

export async function checkUpdate() {
  const version =
    (await getWorldbook(WORLDBOOK_NAME)).find(entry => entry.name === '版本号')?.content.trim() ?? '0.0.0';
  if (
    compare(
      version,
      await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/世界书/版本号.txt')
        .then(response => response.text())
        .then(text => text.trim())
        .catch(() => '0.0.0'),
      '>=',
    )
  ) {
    return;
  }
  if (compare(getTavernVersion(), '4.3.18', '<')) {
    toastr.warning('检测到角色卡有更新，但酒馆助手版本过低，无法自动更新', '白化蓝染的日记本')
    return;
  }
  await importRawCharacter(
    CHARACTER_NAME,
    await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/白化蓝染的日记本.png').then(
      response => response.blob(),
    ),
  );
  toastr.success('角色卡自动更新成功, 准备刷新页面以生效...', '白化蓝染的日记本');
  setTimeout(() => triggerSlash('/reload-page'), 3000);
}
