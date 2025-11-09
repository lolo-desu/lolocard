import { destroy_panel, init_panel } from './panel';
import { bootstrapVariableManager, teardownVariableManager } from './store';

$(() => {
  init_panel();
  bootstrapVariableManager();
});

$(window).on('pagehide', () => {
  destroy_panel();
  teardownVariableManager();
});
