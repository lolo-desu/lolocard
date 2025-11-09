import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { deteleportStyle, teleportStyle } from './util';
import Panel from './panel.vue';

const app = createApp(Panel);

export function init_panel() {
  teleportStyle();

  const $container = $('<div>').attr('script_id', getScriptId());
  $('#extensions_settings2').append($container);

  app.use(createPinia()).mount($container[0]);
}

export function destroy_panel() {
  app.unmount();

  $(`#extensions_settings2 > div[script_id="${getScriptId()}"]`).remove();

  deteleportStyle();
}
