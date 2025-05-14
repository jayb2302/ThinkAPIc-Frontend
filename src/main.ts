import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

import hljs from 'highlight.js';
import CodeEditor from 'simple-code-editor';
import { registerPrimeVue } from './plugins/primevue';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.provide('hljs', hljs);
app.component('CodeEditor', CodeEditor);

registerPrimeVue(app);

app.mount('#app');
