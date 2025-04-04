import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'


import hljs from 'highlight.js';
import CodeEditor from 'simple-code-editor';


const pinia = createPinia()
const app = createApp(App)

app.provide('hljs', hljs);

app.component('CodeEditor', CodeEditor)



app.use(router)
app.use(pinia)
app.mount('#app')