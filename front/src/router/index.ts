import { createRouter, createWebHistory } from "vue-router";
import { nextTick } from "vue";
import LoginView from "@/views/auth/LoginView.vue";
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
import HealthForm from "@/views/health/HealthForm.vue";
import Products from "@/views/products/ProductView.vue";
import ProductCreate from "@/views/products/ProductCreate.vue";
import ProductDetails from "@/views/products/ProductDetails.vue"
import ProductEdit from "@/views/products/ProductEdit.vue";
import Reminders from "@/views/reminders/ReminderView.vue";
import ReminderCreate from "@/views/reminders/ReminderCreate.vue";
import { HealthView } from "@/views/health";
import { FeedingDetails } from "@/views/feeding";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useAuthStore } from "@/stores/AuthStore";
import { getStoredHorseId } from "@/libs/horseProfile";

/** Routes that require a horse to be selected (store). Redirect to /horses if none. */
const ROUTES_REQUIRING_HORSE = new Set([
    "HorseDetails", "HorseEdit", "Reminders", "ReminderCreate", "HorseDashboardView",
    "HealthView", "HealthCreate", "HorseActivities", "ActivityCreate",
    "FeedingView", "FeedingCreate", "FeedingEdit", "FeedingDetails",
    "Products", "ProductCreate",
]);

function requiresHorse(name: string) {
    return ROUTES_REQUIRING_HORSE.has(name);
}

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior() {
        return { top: 0 };
    },
    routes: [
        {
            path: "/login",
            name: "Login",
            component: LoginView,
            meta: { public: true },
        },
        {
            path: "/",
            name: "Dashboard",
            redirect: () => {
                const storedHorseId = getStoredHorseId();
                if (storedHorseId) return "/dashboard";
                return "/horses";
            },
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
            component: HorseCreate,
        },
        {
            path: "/horse/edit",
            name: "HorseEdit",
            component: HorseEdit,
        },
        {
            path: "/horse/details",
            name: "HorseDetails",
            component: HorseDetails,
        },
        {
            path: "/dashboard",
            name: "HorseDashboardView",
            component: Dashboard,
        },
        {
            path: "/health",
            name: "HealthView",
            component: HealthView,
        },
        {
            path: "/health/new",
            name: "HealthCreate",
            component: HealthForm,
        },
        {
            path: "/health/:id/edit",
            name: "HealthEdit",
            component: HealthForm,
        },
        {
            path: "/health/:id",
            name: "HealthDetails",
            component: () => import("@/views/health/HealthDetails.vue"),
        },
        {
            path: "/activities",
            name: "HorseActivities",
            component: Activities,
        },
        {
            path: "/activities/new",
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
            path: "/feeding",
            name: "FeedingView",
            component: Feeding,
        },
        {
            path: "/feeding/new",
            name: "FeedingCreate",
            component: FeedingCreate,
        },
        {
            path: "/rations/:rationId/edit",
            name: "FeedingEdit",
            component: FeedingEdit,
        },
        {
            path: "/rations/:rationId",
            name: "FeedingDetails",
            component: FeedingDetails
        },
        {
            path: "/products",
            name: "Products",
            component: Products,
        },
        {
            path: "/products/new",
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
        // Redirections pour les anciennes URLs (id cheval dans le path) → store + nouvelle URL
        { path: "/horses/:id", redirect: (to) => ({ path: "/dashboard", query: to.params.id ? { horseId: to.params.id as string } : undefined }) },
        { path: "/horses/:id/dashboard", redirect: (to) => ({ path: "/dashboard", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/details", redirect: (to) => ({ path: "/horse/details", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/edit", redirect: (to) => ({ path: "/horse/edit", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/reminders", redirect: (to) => ({ path: "/reminders", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/reminders/new", redirect: (to) => ({ path: "/reminders/new", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/health", redirect: (to) => ({ path: "/health", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/health/new", redirect: (to) => ({ path: "/health/new", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/activities", redirect: (to) => ({ path: "/activities", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/activities/new", redirect: (to) => ({ path: "/activities/new", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/feeding", redirect: (to) => ({ path: "/feeding", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/feeding/new", redirect: (to) => ({ path: "/feeding/new", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/products", redirect: (to) => ({ path: "/products", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/product/new", redirect: (to) => ({ path: "/products/new", query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/rations/:rationId", redirect: (to) => ({ path: `/rations/${to.params.rationId}`, query: { horseId: to.params.id as string } }) },
        { path: "/horses/:id/rations/:rationId/edit", redirect: (to) => ({ path: `/rations/${to.params.rationId}/edit`, query: { horseId: to.params.id as string } }) },
    ],
});

// Remonte en haut à chaque changement de page (v-main scrollable)
router.afterEach(async () => {
    await nextTick();
    const scroller = document.querySelector(".v-main__scroller");
    if (scroller) scroller.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo(0, 0);
});

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();
    if (authStore.authRequired === null) {
        await authStore.checkAuthStatus();
    }
    if (to.meta.public) {
        if (authStore.authRequired === true && authStore.isAuthenticated) {
            next({ name: "Dashboard" });
        } else {
            next();
        }
        return;
    }
    if (authStore.authRequired === true && !authStore.isAuthenticated) {
        next({ name: "Login" });
        return;
    }

    const store = useHorsesStore();
    const horseIdFromQuery = to.query.horseId as string | undefined;
    if (horseIdFromQuery) {
        store.sethorseId(horseIdFromQuery);
        const { horseId: _, ...restQuery } = to.query;
        router.replace({ path: to.path, query: restQuery });
        next(false);
        return;
    }
    if (to.name && requiresHorse(to.name as string)) {
        const id = store.horseId;
        if (!id || id === "all") {
            next({ name: "Horses" });
            return;
        }
    }
    next();
});

export default router;
