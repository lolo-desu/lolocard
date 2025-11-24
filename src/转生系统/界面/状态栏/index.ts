import App from './App.vue';

$(async () => {
  await waitGlobalInitialized('Mvu');
  const app = createApp(App);
  app.use(createPinia());
  app.mount('#app');
});
