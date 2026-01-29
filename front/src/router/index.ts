import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/TheDashboard.vue";
import Health from "@/views/health/HealthView.vue";
import Activities from "@/views/activities/ActivityView.vue";
import Documents from "@/views/documents/DocumentView.vue";
import Reminders from "@/views/reminders/ReminderView.vue";
import ReminderCreate from "@/views/reminders/ReminderCreate.vue";
import CareCreate from "@/views/health/HealthCreate.vue";
import ActivityCreate from "@/views/activities/ActivityCreate.vue";
import ActivityEdit from "@/views/activities/ActivityEdit.vue";
import DocumentCreate from "@/views/documents/DocumentCreate.vue";
import Feeding from "@/views/feeding/FeedingView.vue";
import FeedingCreate from "@/views/feeding/FeedingCreate.vue";
import FeedingEdit from "@/views/feeding/FeedingEdit.vue";
import Products from "@/views/products/ProductView.vue";
import ProductsCreate from "@/views/products/ProductsCreate.vue";
import Horses from "@/views/horses/HorseView.vue";
import HorseForm from "@/views/horses/HorseForm.vue";
import HorseDetails from "@/views/horses/HorseDetails.vue";
import EventDetails from "@/views/events/EventView.vue";
import EventEdit from "@/views/events/EventEdit.vue";
import MaterialDetails from "@/views/materials/MaterialView.vue";
import MaterialEdit from "@/views/materials/MaterialEdit.vue";

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
            path: "/horses/:id/details",
            name: "HorseDetails",
            component: HorseDetails,
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
            path: "/horses/:id/health/new",
            name: "HorseCareCreate",
            component: CareCreate,
        },
        {
            path: "/horses/:id/activities",
            name: "HorseActivities",
            component: Activities,
        },
        {
            path: "/horses/:id/activities/new",
            name: "HorseActivityCreate",
            component: ActivityCreate,
        },
        {
            path: "/activities/:id/edit",
            name: "ActivityEdit",
            component: ActivityEdit,
        },
        {
            path: "/horses/:id/documents",
            name: "HorseDocuments",
            component: Documents,
        },
        {
            path: "/horses/:id/documents/new",
            name: "HorseDocumentCreate",
            component: DocumentCreate,
        },
        {
            path: "/horses/:id/feeding",
            name: "HorseFeeding",
            component: Feeding,
        },
        {
            path: "/horses/:id/feeding/new",
            name: "HorseFeedingCreate",
            component: FeedingCreate,
        },
        {
            path: "/rations/:id/edit",
            name: "RationEdit",
            component: FeedingEdit,
        },
        {
            path: "/horses/:id/products",
            name: "HorseProducts",
            component: Products,
        },
        {
            path: "/horses/:id/products/new",
            name: "HorseProductCreate",
            component: ProductsCreate,
        },
        {
            path: "/events/:id",
            name: "EventDetails",
            component: EventDetails,
        },
        {
            path: "/events/:id/edit",
            name: "EventEdit",
            component: EventEdit,
        },
        {
            path: "/materials/:id",
            name: "MaterialDetails",
            component: MaterialDetails,
        },
        {
            path: "/materials/:id/edit",
            name: "MaterialEdit",
            component: MaterialEdit,
        },
    ],
});

export default router;
