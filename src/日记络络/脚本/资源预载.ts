export {};

function get_preloads(): string[] {
  return _.get(getVariables({ type: 'script', script_id: getScriptId() }), '资源预载', []);
}

function extract_preloads_node(preloads: string[]) {
  return $('<div>')
    .attr('id', `script_preload-${getScriptId()}`)
    .append(preloads.map(preload => $('<link>').attr('rel', 'preload').attr('href', preload).attr('as', 'image')));
}

function reappend_preloads(node: JQuery) {
  const $head = $('head');
  $head.find(`#script_preload-${getScriptId()}`).remove();
  $head.append(node);
}

$(() => {
  const preloads = get_preloads();
  const preloads_node = extract_preloads_node(preloads);
  reappend_preloads(preloads_node);
});
