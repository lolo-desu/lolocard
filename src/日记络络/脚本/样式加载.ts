export {};

function get_style(): string {
  return _.get(getVariables({ type: 'script', script_id: getScriptId() }), '样式加载', '');
}

function extract_style_node(style: string) {
  return $('<style>').attr('id', `script_custom_style-${getScriptId()}`).text(style);
}

function reappend_styles(node: JQuery) {
  const $head = $('head');
  $head.find(`#script_custom_style-${getScriptId()}`).remove();
  $head.append(node);
}

$(() => {
  const style = get_style();
  const style_node = extract_style_node(style);
  reappend_styles(style_node);
});
