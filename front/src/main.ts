import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faClock,
    faHeartPulse,
    faHouseChimneyMedical,
    faBell,
    faCirclePlus,
    faCalendarDays,
    faEllipsis,
    faFileLines,
    faTimeline,
    faListCheck,
    faBowlFood,
    faBoxOpen,
    faHorse,
    faHouse,
    faPen,
    faTrash,
    faBook,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/Global.css";
import "vuetify/styles";
import App from "@/App.vue";
import router from "@/router";
import { UI_BREAKPOINTS, VUETIFY_THRESHOLDS } from "@/ui/breakpoints";

library.add(
    faClock,
    faHeartPulse,
    faHouseChimneyMedical,
    faBell,
    faCirclePlus,
    faCalendarDays,
    faEllipsis,
    faFileLines,
    faTimeline,
    faListCheck,
    faBowlFood,
    faBoxOpen,
    faHorse,
    faHouse,
    faPen,
    faTrash,
    faBook,
    faTriangleExclamation,
);

const vuetify = createVuetify({
    display: {
        thresholds: VUETIFY_THRESHOLDS,
        mobileBreakpoint: UI_BREAKPOINTS.tabletMin,
    },
    theme: {
        defaultTheme: "light",
        themes: {
            light: {
                colors: {
                    primary: "#2F4F2F",
                    secondary: "#E8E4DA",
                    surface: "#FAFAF8",
                },
            },
        },
    },
});

createApp(App)
    .component("font-awesome-icon", FontAwesomeIcon)
    .use(router)
    .use(vuetify)
    .mount("#app");
