import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCirclePlus,
  faCalendarDays,
  faTimeline,
  faListCheck,
  faBowlFood,
  faHorse,
  faHouse,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "./styles/Global.css"; 
import "vuetify/styles";
import App from "./App.vue";
import router from "./router";

library.add(
  faCirclePlus,
  faCalendarDays,
  faTimeline,
  faListCheck,
  faBowlFood,
  faHorse,
  faHouse,
  faPen,
  faTrash
);

const vuetify = createVuetify();

createApp(App)
  .component("font-awesome-icon", FontAwesomeIcon)
  .use(router)
  .use(vuetify)
  .mount("#app");
