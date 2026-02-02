import { checkAndUpdateCharacter } from '@util/common';

$(async () => {
  await checkAndUpdateCharacter(
    '作为异世界的系统',
    await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/转生系统/index.yaml')
      .then(response => response.text())
      .then(text => _.get(YAML.parse(text), '版本', '0.0.0'))
      .catch(() => '0.0.0'),
    'https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/转生系统/作为异世界的系统.png',
  );
});
