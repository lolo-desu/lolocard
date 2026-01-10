import style from './样式加载.css?raw';

export function initStyle() {
  $('<div>').attr('script_id', getScriptId()).append($('<style>').text(style)).appendTo('head');
  return { destroy: () => $(`head > div[script_id=${getScriptId()}]`).remove() };
}
