import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import Timeline from "@/views/Timeline.vue";
import Agenda from "@/views/Agenda.vue";
import Horses from "@/views/Horses.vue";
import HorseForm from "@/views/HorseForm.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: Dashboard,
    },
    {
      path: "/timeline",
      name: "Timeline",
      component: Timeline,
    },
    {
      path: "/agenda",
      name: "Agenda",
      component: Agenda,
    },
    {
      path: "/horses",
      name: "Horses",
      component: Horses,
    },
    {
      path: "/horses/new",
      name: "HorseCreate",
      component: HorseForm,
    },
    {
      path: "/horses/:id/edit",
      name: "HorseEdit",
      component: HorseForm,
    },
    {
      path: "/horses/:id",
      name: "HorseDashboard",
      redirect: (to) => `/horses/${to.params.id}/dashboard`,
    },
    {
      path: "/horses/:id/dashboard",
      name: "HorseDashboardView",
      component: Dashboard,
    },
  ],
});

export default router;
