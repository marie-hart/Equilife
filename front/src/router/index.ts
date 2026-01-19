import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import Health from "@/views/Health.vue";
import Activities from "@/views/Activities.vue";
import Documents from "@/views/Documents.vue";
import Reminders from "@/views/Reminders.vue";
import ReminderCreate from "@/views/ReminderCreate.vue";
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
      path: "/reminders",
      name: "Reminders",
      component: Reminders,
    },
    {
      path: "/reminders/new",
      name: "ReminderCreate",
      component: ReminderCreate,
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
    {
      path: "/horses/:id/health",
      name: "HorseHealth",
      component: Health,
    },
    {
      path: "/horses/:id/activities",
      name: "HorseActivities",
      component: Activities,
    },
    {
      path: "/horses/:id/documents",
      name: "HorseDocuments",
      component: Documents,
    },
  ],
});

export default router;
