import { checkAndUpdateCharacter } from '@util/common';
import _ from 'lodash';
import { CHARACTER_NAME } from '../constant';

export async function checkUpdate() {
  await checkAndUpdateCharacter(
    CHARACTER_NAME,
    await fetch('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/index.yaml')
      .then(response => response.text())
      .then(text => _.get(YAML.parse(text), '版本', '0.0.0'))
      .catch(() => '0.0.0'),
    'https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/src/日记络络/白化蓝染的日记本.png',
  );
}
