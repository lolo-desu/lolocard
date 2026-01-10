import { useConfigStore } from '../store';
import light_css from './亮色.css?raw';
import dark_css from './暗色.css?raw';

export function injectStyle() {
  const store = useConfigStore();
  const get_css = () => (store.config.样式主题 === '暗色' ? dark_css : light_css);

  $(`<div>`).attr('script_id', getScriptId()).append(`<style roleplay_options>${get_css()}</style>`).appendTo('head');

  const stop = watch(
    () => store.config.样式主题,
    () => $(`head > div[script_id="${getScriptId()}"]`).find('style[roleplay_options]').text(get_css()),
  );
  return {
    destroy: () => {
      stop();
      $(`head > div[script_id="${getScriptId()}"]`).remove();
    },
  };
}
