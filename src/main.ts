import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";

import hljs from 'highlight.js';
import CodeEditor from 'simple-code-editor';

import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

import ConfirmPopup from "primevue/confirmpopup";
import Toast from "primevue/toast";
import Button from "primevue/button";
import RadioButton from "primevue/radiobutton";
import FloatLabel from "primevue/floatlabel";
import Password from "primevue/password";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import Drawer from "primevue/drawer";
import PanelMenu from "primevue/panelmenu";
import Panel from "primevue/panel";
import Card from "primevue/card";
import Badge from "primevue/badge";
import Skeleton from "primevue/skeleton";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);

app.provide('hljs', hljs);

app.component('CodeEditor', CodeEditor)
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{gray.50}",
      100: "{gray.100}",
      200: "{gray.200}",
      300: "{gray.300}",
      400: "{gray.400}",
      500: "{gray.500}",
      600: "{gray.600}",
      700: "{gray.700}",
      800: "{gray.800}",
      900: "{gray.900}",
      950: "{gray.950}",
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
  },
  ripple: true,
});
app.directive("ripple", Ripple);
app.use(ConfirmationService);
app.use(ToastService);

app.component("ConfirmPopup", ConfirmPopup);
app.component("Toast", Toast);
app.component("Card", Card);
app.component("Button", Button);
app.component("RadioButton", RadioButton);
app.component("FloatLabel", FloatLabel);
app.component("Password", Password);
app.component("IconField", IconField);
app.component("InputIcon", InputIcon);
app.component("InputText", InputText);
app.component("InputNumber", InputNumber);
app.component("Checkbox", Checkbox);
app.component("Textarea", Textarea);
app.component("Select", Select);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Dialog", Dialog);
app.component("Drawer", Drawer);
app.component("PanelMenu", PanelMenu);
app.component("Panel", Panel);
app.component("Badge", Badge);
app.component("DataView", DataView);
app.component("Skeleton", Skeleton);
app.component("Accordion", Accordion);
app.component("AccordionPanel", AccordionPanel);
app.component("AccordionHeader", AccordionHeader);
app.component("AccordionContent", AccordionContent);

app.mount("#app");
