<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="d-flex align-center justify-center pa-4">
    <v-card max-width="400" class="pa-6 rounded-xl shadow-subtle">
      <div class="text-center mb-6">
        <v-img src="/equilife.png" alt="EquiLife" height="64" contain class="mx-auto mb-4" />
        <h1 class="text-h5 font-weight-bold" style="color: #2E4B36;">Connexion</h1>
        <p class="text-body-2 text-grey-darken-1 mt-1">Entrez votre code d'accès</p>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="pin"
          label="Code PIN"
          type="password"
          inputmode="numeric"
          autocomplete="one-time-code"
          variant="outlined"
          color="#2E4B36"
          rounded="lg"
          density="comfortable"
          :error-messages="error ? [error] : undefined"
          :disabled="isSubmitting"
          autofocus
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
          :disabled="!pin.trim() || isSubmitting"
        >
          Se connecter
        </v-btn>
      </v-form>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";

const router = useRouter();
const authStore = useAuthStore();

const pin = ref("");
const error = ref("");
const isSubmitting = ref(false);

const handleSubmit = async () => {
    error.value = "";
    if (!pin.value.trim()) return;
    isSubmitting.value = true;
    try {
        await authStore.login(pin.value);
        router.replace({ name: "Dashboard" });
    } catch (err: any) {
        error.value = err?.response?.data?.error || "Erreur de connexion";
    } finally {
        isSubmitting.value = false;
    }
};
</script>
