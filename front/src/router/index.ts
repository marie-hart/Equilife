import { createRouter, createWebHistory } from "vue-router";
import Activities from "@/views/activities/ActivityView.vue";
import ActivityForm from "@/views/activities/ActivityForm.vue";
import ActivityDetails from "@/views/activities/ActivityDetails.vue";
import Dashboard from "@/views/TheDashboard.vue";
import Feeding from "@/views/feeding/FeedingView.vue";
import FeedingEdit from "@/views/feeding/FeedingEdit.vue"
import FeedingCreate from "@/views/feeding/FeedingCreate.vue";
import Horses from "@/views/horses/HorseView.vue";
import HorseCreate from "@/views/horses/HorseCreate.vue";
import HorseEdit from "@/views/horses/HorseEdit.vue";
import HorseDetails from "@/views/horses/HorseDetails.vue";
import Health from "@/views/health/HealthView.vue";
import HealthForm from "@/views/health/HealthForm.vue";
import Products from "@/views/products/ProductView.vue";
import ProductCreate from "@/views/products/ProductCreate.vue";
import ProductDetails from "@/views/products/ProductDetails.vue"
import ProductEdit from "@/views/products/ProductEdit.vue";
import Reminders from "@/views/reminders/ReminderView.vue";
import ReminderCreate from "@/views/reminders/ReminderCreate.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Dashboard",
            redirect: () => {
                // récupère l'UUID stocké ou sélectionné
                const storedHorseId = localStorage.getItem("selectedHorseId"); // ou getStoredHorseId()
                if (storedHorseId) {
                  return `/horses/${storedHorseId}/dashboard`;
                }
                // si aucun cheval sélectionné, redirige vers liste chevaux
                return "/horses";
              },
           
        },
        {
            path: "/horses/:id/reminders",
            name: "Reminders",
            component: Reminders,
        },
        {
            path: "/horses/:id/reminders/new",
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
            component: HorseCreate,
        },
        {
            path: "/horses/:id/edit",
            name: "HorseEdit",
            component: HorseEdit,
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
            name: "HealthCreate",
            component: HealthForm,
        },
        {
            path: "/health/:id/edit",
            name: "HealthEdit",
            component: HealthForm,
        },
        {
            path: "/horses/:id/activities",
            name: "HorseActivities",
            component: Activities,
        },
        {
            path: "/horses/:id/activities/new",
            name: "ActivityCreate",
            component: ActivityForm,
        },
        {
            path: "/activities/:id/edit",
            name: "ActivityEdit",
            component: ActivityForm,
        },
         {
            path: "/events/:id",
            name: "ActivityDetails",
            component: ActivityDetails,
        },
        {
            path: "/horses/:id/feeding",
            name: "FeedingView",
            component: Feeding,
        },
        {
            path: "/horses/:id/feeding/new",
            name: "FeedingCreate",
            component: FeedingCreate,
        },
        {
            path: "/horses/:id/rations/:rationId/edit",
            name: "FeedingEdit",
            component: FeedingEdit,
        },
        {
            path: "/horses/:id/products",
            name: "Products",
            component: Products,
        },
        {
            path: "/horses/:id/product/new",
            name: "ProductCreate",
            component: ProductCreate,
        },
        {
            path: "/product/:id",
            name: "ProductDetails",
            component: ProductDetails,
        },
        {
            path: "/product/:id/edit",
            name: "ProductEdit",
            component: ProductEdit,
        },
    ],
});

export default router;
