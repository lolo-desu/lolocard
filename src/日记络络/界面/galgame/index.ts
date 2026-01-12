import { createPinia } from 'pinia';
import App from './App.vue';
import './tailwind.css';

$(() => {
  createApp(App).use(createPinia()).mount('#app');
});
