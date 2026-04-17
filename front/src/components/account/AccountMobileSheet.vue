<template>
  <div>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    content-class="rounded-t-xl"
  >
    <v-sheet color="#EDE4D8" class="pa-6 pb-8 rounded-t-xl">
      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="text-h6 font-weight-bold" style="color: #2e4b36;">Mon compte</h2>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          color="#2e4b36"
          @click="close"
        />
      </div>

      <p class="text-body-2 mb-1" style="color: #7b5b3e;">E-mail</p>
      <p class="text-body-1 font-weight-medium mb-6" style="color: #2e4b36;">
        {{ displayEmail }}
      </p>

      <p class="text-caption mb-2" style="color: #7b5b3e;">Changer le mot de passe</p>
      <v-text-field
        v-model="currentPassword"
        label="Mot de passe actuel"
        type="password"
        autocomplete="current-password"
        variant="outlined"
        color="#2e4b36"
        rounded="lg"
        density="comfortable"
        hide-details="auto"
        class="mb-2"
      />
      <v-text-field
        v-model="newPassword"
        label="Nouveau mot de passe"
        type="password"
        autocomplete="new-password"
        variant="outlined"
        color="#2e4b36"
        rounded="lg"
        density="comfortable"
        hint="8 caractères min., 1 majuscule, 1 caractère spécial"
        persistent-hint
        hide-details="auto"
        class="mb-2"
      />
      <v-text-field
        v-model="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        type="password"
        autocomplete="new-password"
        variant="outlined"
        color="#2e4b36"
        rounded="lg"
        density="comfortable"
        hide-details="auto"
        class="mb-4"
      />

      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        {{ formError }}
      </v-alert>

      <v-btn
        block
        color="#2e4b36"
        variant="flat"
        rounded="xl"
        class="text-none font-weight-bold mb-4"
        :loading="saving"
        :disabled="!canSave"
        @click="submitPassword"
      >
        Enregistrer le mot de passe
      </v-btn>

      <v-divider class="mb-4 opacity-25" />

      <div class="d-flex flex-wrap ga-3 mb-4">
        <v-btn
          variant="text"
          size="small"
          color="#7b5b3e"
          class="text-none px-0"
          :to="{ name: 'LegalNotice' }"
        >
          Mentions légales
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          color="#7b5b3e"
          class="text-none px-0"
          :to="{ name: 'PrivacyPolicy' }"
        >
          Confidentialité
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          color="#7b5b3e"
          class="text-none px-0"
          :to="{ name: 'TermsOfUse' }"
        >
          CGU
        </v-btn>
      </div>

      <v-btn
        block
        variant="outlined"
        color="#b00020"
        rounded="xl"
        class="text-none font-weight-bold"
        @click="onLogout"
      >
        Se déconnecter
      </v-btn>
    </v-sheet>
  </v-bottom-sheet>

  <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">
    {{ snack.text }}
  </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore";
import { authApi } from "@/api/auth";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const router = useRouter();
const authStore = useAuthStore();

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const formError = ref("");
const saving = ref(false);
const snack = ref({ show: false, text: "", color: "success" as string });

const displayEmail = computed(
    () => authStore.userEmail || "—",
);

const canSave = computed(() => {
    return (
        currentPassword.value.length > 0 &&
        newPassword.value.length > 0 &&
        confirmPassword.value.length > 0 &&
        !saving.value
    );
});

function close() {
    emit("update:modelValue", false);
}

function resetForm() {
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    formError.value = "";
}

watch(
    () => props.modelValue,
    (open) => {
        if (!open) {
            resetForm();
        }
    },
);

function validateClient(pw: string): string | null {
    if (pw.length < 8) return "Au moins 8 caractères";
    if (!/[A-Z]/.test(pw)) return "Au moins une majuscule";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Au moins un caractère spécial";
    return null;
}

async function submitPassword() {
    formError.value = "";
    if (newPassword.value !== confirmPassword.value) {
        formError.value = "Les nouveaux mots de passe ne correspondent pas";
        return;
    }
    const err = validateClient(newPassword.value);
    if (err) {
        formError.value = err;
        return;
    }
    saving.value = true;
    try {
        await authApi.changePassword(
            currentPassword.value,
            newPassword.value,
        );
        resetForm();
        snack.value = {
            show: true,
            text: "Mot de passe mis à jour",
            color: "success",
        };
    } catch (e: unknown) {
        const ax = e as { response?: { data?: { error?: string } } };
        formError.value =
            ax?.response?.data?.error || "Impossible de mettre à jour";
    } finally {
        saving.value = false;
    }
}

function onLogout() {
    close();
    authStore.logout();
    router.replace({ name: "Login" });
}
</script>
