import { createApp } from 'vue';
import App from './App.vue';

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
