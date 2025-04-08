import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

import PrimeVue from 'primevue/config';
import Ripple from 'primevue/ripple'
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'
import Button from "primevue/button"
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import PanelMenu from 'primevue/panelmenu'
import Panel from 'primevue/panel'


const pinia = createPinia()
const app = createApp(App)
const MyPreset = definePreset(Aura, {
  semantic: {
      primary: {
          50: '{gray.50}',
          100: '{gray.100}',
          200: '{gray.200}',
          300: '{gray.300}',
          400: '{gray.400}',
          500: '{gray.500}',
          600: '{gray.600}',
          700: '{gray.700}',
          800: '{gray.800}',
          900: '{gray.900}',
          950: '{gray.950}'
      }
  }
});

app.use(PrimeVue,{
  theme: {
      preset: MyPreset
  },
  ripple: true,
});
app.directive('ripple', Ripple); 
app.use(ConfirmationService);
app.use(ToastService);

app.component('ConfirmPopup', ConfirmPopup)
app.component('Toast', Toast)
app.component('Button', Button)
app.component('FloatLabel', FloatLabel)
app.component('Password', Password)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Checkbox', Checkbox)
app.component('Textarea', Textarea)
app.component('Select', Select)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dialog', Dialog)
app.component('PanelMenu', PanelMenu)
app.component('Panel', Panel)

app.use(router)
app.use(pinia)
app.mount('#app')