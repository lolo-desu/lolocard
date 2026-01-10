import assets from './资源预载.json';

export function initPreloads() {
  $('<div>')
    .attr('script_id', getScriptId())
    .append(
      assets.map(asset =>
        $('<link>').attr({
          rel: 'preload',
          as: 'image',
          href: asset,
        }),
      ),
    )
    .appendTo('head');
  return { destroy: () => $(`head > div[script_id=${getScriptId()}]`).remove() };
}
