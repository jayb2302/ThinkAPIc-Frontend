import { definePreset } from "@primeuix/themes";
import Ripple from "primevue/ripple";
import Aura from "@primeuix/themes/aura";

import Avatar from "primevue/avatar";
import Chip from "primevue/chip";
import DatePicker from "primevue/datepicker";
import Card from "primevue/card";
import RadioButton from "primevue/radiobutton";
import Password from "primevue/password";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import ToggleSwitch from "primevue/toggleswitch";
import Checkbox from "primevue/checkbox";
import Textarea from "primevue/textarea";
import Drawer from "primevue/drawer";
import Popover from "primevue/popover";
import Panel from "primevue/panel";
import Badge from "primevue/badge";
import DataView from "primevue/dataview";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";

import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

// PrimeVue Components
import Divider from "primevue/divider";
import ProgressBar from "primevue/progressbar";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import ConfirmPopup from "primevue/confirmpopup";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import PanelMenu from "primevue/panelmenu";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import FloatLabel from "primevue/floatlabel";
import Tabs from "primevue/tabs";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import TabList from "primevue/tablist";

import type { App } from "vue";

export function registerPrimeVue(app: App) {
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
  app.use(ToastService);
  app.use(ConfirmationService);
  app.directive("ripple", Ripple);

  app.component("Avatar", Avatar);
  app.component("Chip", Chip);
  app.component("Divider", Divider);
  app.component("Button", Button);
  app.component("Dialog", Dialog);
  app.component("ProgressBar", ProgressBar);
  app.component("Toast", Toast);
  app.component("ConfirmPopup", ConfirmPopup);
  app.component("InputText", InputText);
  app.component("ToggleSwitch", ToggleSwitch);
  app.component("Select", Select);
  app.component("Skeleton", Skeleton);
  app.component("PanelMenu", PanelMenu);
  app.component("DataTable", DataTable);
  app.component("Column", Column);
  app.component("FloatLabel", FloatLabel);
  app.component("Tabs", Tabs);
  app.component("TabPanel", TabPanel);
  app.component("TabList", TabList);
  app.component("TabView", TabView);
  app.component("DatePicker", DatePicker);
  app.component("Card", Card);
  app.component("RadioButton", RadioButton);
  app.component("Password", Password);
  app.component("IconField", IconField);
  app.component("InputIcon", InputIcon);
  app.component("InputNumber", InputNumber);
  app.component("Checkbox", Checkbox);
  app.component("Textarea", Textarea);
  app.component("Drawer", Drawer);
  app.component("Popover", Popover);
  app.component("Panel", Panel);
  app.component("Badge", Badge);
  app.component("DataView", DataView);
  app.component("Accordion", Accordion);
  app.component("AccordionPanel", AccordionPanel);
  app.component("AccordionHeader", AccordionHeader);
  app.component("AccordionContent", AccordionContent);
  app.component("Tab", Tab);
  app.component("TabPanels", TabPanels);
}
