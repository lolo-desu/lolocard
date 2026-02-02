import { compare } from 'compare-versions';

const CHARACTER_NAME = '作为异世界的系统' as const;

export async function checkUpdate() {
  const current_version = (await getCharacter(CHARACTER_NAME)).version.trim() || '0.0.0';
  const latest_version = await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/转生系统/index.yaml')
    .then(response => response.text())
    .then(text => _.get(YAML.parse(text), '版本', '0.0.0'))
    .catch(() => '0.0.0');
  if (compare(current_version, latest_version, '>=')) {
    return;
  }
  await importRawCharacter(
    CHARACTER_NAME,
    await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/转生系统/作为异世界的系统.png').then(
      response => response.blob(),
    ),
  );
  toastr.success(`角色卡已自动更新到 'v${latest_version}'`, CHARACTER_NAME);
}
