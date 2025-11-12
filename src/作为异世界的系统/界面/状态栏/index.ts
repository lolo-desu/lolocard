import { createApp } from 'vue';
import App from './App.vue';

declare const $: (callback: () => void) => void;

const ROOT_ID = 'isekai-status-app';

function ensureRoot(): HTMLElement {
  const existing = document.getElementById(ROOT_ID);
  if (existing) {
    return existing;
  }
  const container = document.createElement('div');
  container.id = ROOT_ID;
  document.body.appendChild(container);
  return container;
}

function bootstrap() {
  const root = ensureRoot();
  const app = createApp(App);
  app.mount(root);
}

$(() => {
  bootstrap();
});
