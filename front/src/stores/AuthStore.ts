import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi, type AuthMode } from "@/api/auth";

const TOKEN_KEY = "equilife_token";
const USER_EMAIL_KEY = "equilife_user_email";

/** Si true, la connexion est obligatoire même si l’API annonce auth désactivée (serveur doit quand même exposer login). */
const VITE_REQUIRE_LOGIN =
    import.meta.env.VITE_REQUIRE_LOGIN === "true";

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
    const authRequired = ref<boolean | null>(null);
    const authMode = ref<AuthMode | null>(null);
    const userEmail = ref<string | null>(localStorage.getItem(USER_EMAIL_KEY));

    const isAuthenticated = computed(() => Boolean(token.value));
    const isAuthKnown = computed(() => authRequired.value !== null);

    /** Connexion obligatoire pour accéder à l’app (API ou variable d’environnement). */
    const mustLogin = computed(() => {
        if (authRequired.value === null) return false;
        return authRequired.value === true || VITE_REQUIRE_LOGIN;
    });

    function setToken(value: string | null) {
        token.value = value;
        if (value) {
            localStorage.setItem(TOKEN_KEY, value);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    function setUserEmail(email: string | null) {
        userEmail.value = email;
        if (email) {
            localStorage.setItem(USER_EMAIL_KEY, email);
        } else {
            localStorage.removeItem(USER_EMAIL_KEY);
        }
    }

    async function checkAuthStatus() {
        try {
            const status = await authApi.getStatus();
            authRequired.value = status.authRequired;
            authMode.value = status.authMode;
            if (status.authMode === "user" && token.value) {
                try {
                    const me = await authApi.getMe();
                    setUserEmail(me.email);
                } catch {
                    // Token expiré / invalide : le client HTTP gère souvent le 401
                }
            }
        } catch {
            // En production : ne pas ouvrir l’app si le statut d’auth n’est pas vérifiable
            authRequired.value = import.meta.env.DEV ? false : true;
            authMode.value = "none";
        }
        return mustLogin.value;
    }

    async function loginWithPassword(email: string, password: string) {
        const data = await authApi.loginWithPassword(email, password);
        setToken(data.token);
        setUserEmail(data.user.email);
        return true;
    }

    async function register(email: string, password: string) {
        const data = await authApi.register(email, password);
        setToken(data.token);
        setUserEmail(data.user.email);
        return true;
    }

    function logout() {
        setToken(null);
        setUserEmail(null);
    }

    function getToken() {
        return token.value;
    }

    return {
        token,
        authRequired,
        authMode,
        userEmail,
        mustLogin,
        isAuthenticated,
        isAuthKnown,
        setToken,
        setUserEmail,
        checkAuthStatus,
        loginWithPassword,
        register,
        logout,
        getToken,
    };
});
