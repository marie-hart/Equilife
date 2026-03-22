import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/api/auth";

const TOKEN_KEY = "equilife_token";

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(sessionStorage.getItem(TOKEN_KEY));
    const authRequired = ref<boolean | null>(null);

    const isAuthenticated = computed(() => Boolean(token.value));
    const isAuthKnown = computed(() => authRequired.value !== null);

    function setToken(value: string | null) {
        token.value = value;
        if (value) {
            sessionStorage.setItem(TOKEN_KEY, value);
        } else {
            sessionStorage.removeItem(TOKEN_KEY);
        }
    }

    async function checkAuthStatus() {
        try {
            const status = await authApi.getStatus();
            authRequired.value = status.authRequired;
            return status.authRequired;
        } catch {
            authRequired.value = false;
            return false;
        }
    }

    async function login(pin: string) {
        const { token: newToken } = await authApi.login(pin);
        setToken(newToken);
        return true;
    }

    function logout() {
        setToken(null);
    }

    function getToken() {
        return token.value;
    }

    return {
        token,
        authRequired,
        isAuthenticated,
        isAuthKnown,
        setToken,
        checkAuthStatus,
        login,
        logout,
        getToken,
    };
});
