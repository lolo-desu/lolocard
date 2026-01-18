import { mountStreamingMessages } from '@util/streaming';
import { useConfigStore } from '../store';
import App from './App.vue';
import Text from './Text.vue';

export function initGalgame(): { destroy: () => void } {
  const unmount_list: Array<() => void> = [];

  const filter = (_message_id: number, message: string) => message.includes('<galgame>');

  unmount_list.push(
    mountStreamingMessages(
      () => {
        // eslint-disable-next-line vue/one-component-per-file
        return createApp(Text, {
          transformer: (message: string) => {
            const index = message.lastIndexOf('<galgame>');
            return message.slice(0, index === -1 ? undefined : index).trim();
          },
        });
      },
      { host: 'div', filter },
    ).unmount,
  );

  unmount_list.push(
    mountStreamingMessages(
      () => {
        return createApp(App)
          .provide('input_method', () => useConfigStore().config.选择框触发方式)
          .use(createPinia());
      },
      { filter },
    ).unmount,
  );

  unmount_list.push(
    mountStreamingMessages(
      () => {
        // eslint-disable-next-line vue/one-component-per-file
        return createApp(Text, {
          transformer: (message: string) => {
            const index = message.lastIndexOf('</galgame>');
            if (index === -1) {
              return '';
            }
            return message
              .slice(index + 10)
              .replace(/<(roleplay_options)>(?:(?!.*<\/\1>)(?:(?!<\1>).)*$|(?:(?!<\1>).)*<\/\1?>)/gis, '')
              .trim();
          },
        });
      },
      { host: 'div', filter },
    ).unmount,
  );

  return {
    destroy: () => {
      unmount_list.forEach(unmount => unmount());
    },
  };
}
