<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="d-flex align-center justify-center pa-4">
    <v-card max-width="420" width="100%" class="pa-6 rounded-xl shadow-subtle">
      <div class="text-center mb-6">
        <v-img src="/equilife.png" alt="EquiLife" height="64" contain class="mx-auto mb-4" />
        <h1 class="text-h5 font-weight-bold" style="color: #2E4B36;">Créer un compte</h1>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="email"
          label="E-mail"
          type="email"
          autocomplete="email"
          variant="outlined"
          color="#2E4B36"
          rounded="lg"
          density="comfortable"
          :error-messages="fieldErrors.email"
          :disabled="isSubmitting"
        />
        <v-text-field
          v-model="password"
          label="Mot de passe"
          type="password"
          autocomplete="new-password"
          variant="outlined"
          color="#2E4B36"
          rounded="lg"
          density="comfortable"
          class="mt-2"
          hint="8 caractères minimum, 1 majuscule, 1 caractère spécial"
          persistent-hint
          :error-messages="fieldErrors.password"
          :disabled="isSubmitting"
        />
        <v-text-field
          v-model="passwordConfirm"
          label="Confirmer le mot de passe"
          type="password"
          autocomplete="new-password"
          variant="outlined"
          color="#2E4B36"
          rounded="lg"
          density="comfortable"
          class="mt-2"
          :disabled="isSubmitting"
        />

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          {{ error }}
        </v-alert>

        <v-btn
          type="submit"
          block
          size="large"
          color="#2E4B36"
          variant="flat"
          rounded="xl"
          class="text-none font-weight-bold mt-4"
          :loading="isSubmitting"
          :disabled="!canSubmit || isSubmitting"
        >
          S'inscrire
        </v-btn>

        <div class="text-center mt-4">
          <router-link
            to="/login"
            class="text-body-2 text-decoration-none"
            style="color: #2E4B36;"
          >
            Déjà un compte ? Connexion
          </router-link>
        </div>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const error = ref("");
const isSubmitting = ref(false);
const fieldErrors = ref<{ email?: string[]; password?: string[] }>({});

function validatePasswordClient(pw: string): string | null {
    if (pw.length < 8) return "Au moins 8 caractères";
    if (!/[A-Z]/.test(pw)) return "Au moins une majuscule";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Au moins un caractère spécial";
    return null;
}

const canSubmit = computed(() => {
    return (
        email.value.trim().length > 0 &&
        password.value.length > 0 &&
        passwordConfirm.value.length > 0
    );
});

onMounted(async () => {
    if (authStore.authMode === null) {
        await authStore.checkAuthStatus();
    }
    if (authStore.authMode !== "user") {
        router.replace({ name: "Login" });
    }
});

const handleSubmit = async () => {
    error.value = "";
    fieldErrors.value = {};

    if (password.value !== passwordConfirm.value) {
        error.value = "Les mots de passe ne correspondent pas";
        return;
    }

    const pwErr = validatePasswordClient(password.value);
    if (pwErr) {
        fieldErrors.value = { password: [pwErr] };
        return;
    }

    isSubmitting.value = true;
    try {
        await authStore.register(email.value, password.value);
        router.replace({ name: "Dashboard" });
    } catch (err: unknown) {
        const ax = err as {
            response?: { data?: { error?: string } };
            message?: string;
        };
        const msg =
            ax?.response?.data?.error ||
            ax?.message ||
            "Inscription impossible";
        error.value = msg;
        if (import.meta.env.DEV) {
            console.error("[register]", err);
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>
