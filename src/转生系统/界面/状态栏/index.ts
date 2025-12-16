import App from './App.vue';
import './global.css';

$(async () => {
  await waitGlobalInitialized('Mvu');
  const app = createApp(App);
  app.use(createPinia());
  app.mount('#app');
});
