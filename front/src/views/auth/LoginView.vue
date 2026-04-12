<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="d-flex align-center justify-center pa-4">
    <div v-if="!ready" class="d-flex justify-center py-16">
      <v-progress-circular indeterminate color="#2E4B36" size="48" />
    </div>
    <v-card v-else max-width="420" width="100%" class="pa-6 rounded-xl shadow-subtle">
      <div class="text-center mb-6">
        <v-img src="/equilife.png" alt="EquiLife" height="64" contain class="mx-auto mb-4" />
        <h1 class="text-h5 font-weight-bold" style="color: #2E4B36;">Connexion</h1>
        <p class="text-body-2 text-grey-darken-1 mt-1">E-mail et mot de passe</p>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="email"
          label="E-mail"
          type="email"
          autocomplete="username"
          variant="outlined"
          color="#2E4B36"
          rounded="lg"
          density="comfortable"
          :error-messages="error ? [error] : undefined"
          :disabled="isSubmitting"
        />
        <v-text-field
          v-model="password"
          label="Mot de passe"
          type="password"
          autocomplete="current-password"
          variant="outlined"
          color="#2E4B36"
          rounded="lg"
          density="comfortable"
          class="mt-2"
          :disabled="isSubmitting"
        />

        <v-btn
          type="submit"
          block
          size="large"
          color="#2E4B36"
          variant="flat"
          rounded="xl"
          class="text-none font-weight-bold mt-4"
          :loading="isSubmitting"
          :disabled="!email.trim() || !password || isSubmitting"
        >
          Se connecter
        </v-btn>

        <div class="text-center mt-4">
          <router-link
            to="/register"
            class="text-body-2 text-decoration-none"
            style="color: #2E4B36;"
          >
            Créer un compte
          </router-link>
        </div>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";
import { useHorsesStore } from "@/stores/HorsesStore";

const router = useRouter();
const authStore = useAuthStore();
const horsesStore = useHorsesStore();

const ready = ref(false);
const email = ref("");
const password = ref("");
const error = ref("");
const isSubmitting = ref(false);

onMounted(async () => {
    if (authStore.authMode === null) {
        await authStore.checkAuthStatus();
    }
    if (authStore.authMode === "none" && !authStore.mustLogin) {
        router.replace({ name: "Dashboard" });
        return;
    }
    if (authStore.isAuthenticated && authStore.mustLogin) {
        router.replace({ name: "Dashboard" });
        return;
    }
    ready.value = true;
});

const handleSubmit = async () => {
    error.value = "";
    if (!email.value.trim() || !password.value) return;
    isSubmitting.value = true;
    try {
        await authStore.loginWithPassword(email.value, password.value);
        await horsesStore.loadHorses();
        router.replace({ name: "HorseDashboardView" });
    } catch (err: unknown) {
        const ax = err as { response?: { data?: { error?: string } } };
        error.value = ax?.response?.data?.error || "Erreur de connexion";
    } finally {
        isSubmitting.value = false;
    }
};
</script>
