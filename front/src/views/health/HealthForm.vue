<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="pb-10">
    <v-container class="px-4">
      
      <div class="d-flex align-center justify-space-between mb-6 mt-2">
        <div>
          <h1 class="text-h4 font-weight-black mb-0" style="color: #2E4B36; font-family: 'Playfair Display', serif;">
            {{ isEdit ? "Modifier" : "Nouveau soin" }}
          </h1>
          <div style="width: 40px; height: 3px; background-color: #7B5B3E; border-radius: 2px;"></div>
        </div>
         <v-btn 
          variant="text" 
          icon="mdi-close"
          color="#2E4B36"
          @click="goBack"
        ></v-btn>
      </div>

      <v-card variant="flat" rounded="xl" class="pa-4 shadow-subtle border-light bg-white">
        <v-skeleton-loader v-if="isLoading" type="article, actions" />
        
        <v-form v-else @submit.prevent="handleSubmit">
          <v-row dense>
            <v-col cols="12">
              <div class="text-caption font-weight-bold mb-2 ms-1" style="color: #7B5B3E">IDENTITÉ</div>
              <v-select
                v-model="form.horseIds"
                :items="horseOptions"
                label="Choisir le(s) cheval/chevaux *"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                :multiple="!isEdit"
                chips
                closable-chips
                :error-messages="fieldErrors.horseIds ? [fieldErrors.horseIds] : undefined"
              />
            </v-col>
            
            <v-col cols="12">
               <div class="text-caption font-weight-bold mb-2 mt-2 ms-1" style="color: #7B5B3E">DÉTAILS DU SOIN</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption font-weight-bold mb-2 mt-2 ms-1" style="color: #7B5B3E">
                TYPE DE SOIN *
              </div>
              <v-card variant="outlined" rounded="lg" class="pa-3 border-light">
                <v-text-field
                  v-model="careTypeSearch"
                  placeholder="Rechercher ou sélectionner..."
                  prepend-inner-icon="mdi-magnify"
                  density="comfortable"
                  variant="outlined"
                  color="#2E4B36"
                  rounded="lg"
                  hide-details
                  class="mb-3"
                />

                <div class="text-caption font-weight-bold mb-2" style="color: #7B5B3E">
                  Types favoris
                </div>
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip
                    v-for="type in favoriteCareTypes"
                    :key="`favorite-${type}`"
                    size="small"
                    rounded="pill"
                    :variant="form.careDescription === type ? 'flat' : 'tonal'"
                    :color="form.careDescription === type ? '#2E4B36' : undefined"
                    :class="form.careDescription === type ? 'text-white' : ''"
                    @click="selectCareType(type)"
                  >
                    {{ type }}
                  </v-chip>
                </div>

                <div
                  v-for="group in filteredCareTypeGroups"
                  :key="group.key"
                  class="mb-3"
                >
                  <div class="text-body-2 font-weight-bold mb-1" style="color: #554338">
                    {{ group.title }}
                  </div>
                  <v-list density="comfortable" class="py-0 bg-transparent">
                    <v-list-item
                      v-for="type in group.types"
                      :key="`${group.key}-${type}`"
                      rounded="lg"
                      :active="form.careDescription === type"
                      active-color="#2E4B36"
                      @click="selectCareType(type)"
                    >
                      <template #title>{{ type }}</template>
                      <template #append>
                        <v-icon size="18" color="#7B5B3E">mdi-chevron-right</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>

                <v-alert
                  v-if="!filteredCareTypeGroups.length"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                  class="mb-3"
                >
                  Aucun type trouvé pour cette recherche.
                </v-alert>

                <v-btn
                  block
                  variant="text"
                  color="#2E4B36"
                  class="text-none font-weight-bold justify-start"
                  prepend-icon="mdi-plus-circle-outline"
                  @click="onCreateCareTypeClick"
                >
                  Créer un nouveau type
                </v-btn>
              </v-card>
              <div
                v-if="form.careDescription"
                class="text-caption mt-2 ms-1"
                style="color: #554338"
              >
                Type sélectionné: <strong>{{ form.careDescription }}</strong>
              </div>
              <div
                v-if="fieldErrors.careDescription"
                class="text-caption mt-1 ms-1"
                style="color: #B00020"
              >
                {{ fieldErrors.careDescription }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-combobox
                v-model="form.category"
                :items="careCategoryOptions"
                label="Catégorie *"
                placeholder="Ex: Maladie"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                clearable
                :error-messages="fieldErrors.category ? [fieldErrors.category] : undefined"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="form.productIds"
                :items="productOptions"
                label="Produits utilisés (optionnel)"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                multiple
                chips
                closable-chips
                clearable
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <DatePickerField
                v-model="form.date"
                label="Date du soin *"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                :error-messages="fieldErrors.date ? [fieldErrors.date] : undefined"
              />
            </v-col>
            
            <v-col cols="12" class="mt-2">
              <div class="pa-4 rounded-xl bg-grey-lighten-5 border-light">
                <RecurrenceFields
                  v-model="recurrence"
                  :units="recurrenceUnits"
                  :checkbox-md="12"
                  :fields-md="6"
                />
              </div>
            </v-col>
            
            <v-col cols="12" class="mt-4">
              <v-textarea
                v-model="form.note"
                label="Notes & Observations"
                placeholder="Comment s'est déroulé le soin ? Un conseil du pro ?"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                rows="3"
                hide-details
                @keydown.enter.prevent
              />
            </v-col>

            <v-col cols="12">
              <v-file-input
                label="Pièce jointe (compte rendu, ordonnance, etc.)"
                density="comfortable"
                variant="outlined"
                color="#2E4B36"
                rounded="lg"
                prepend-icon="mdi-paperclip"
                accept=".pdf,.doc,.docx,image/*"
                show-size
                clearable
                @update:model-value="onAttachmentChange"
              />
              <div v-if="attachmentDisplayName" class="d-flex align-center flex-wrap ga-3 mt-2">
                <a
                  v-if="existingAttachmentPath && !selectedAttachment && !removeExistingAttachment"
                  :href="attachmentHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-caption font-weight-bold"
                  style="color: #2E4B36; text-decoration: underline;"
                >
                  {{ attachmentDisplayName }}
                </a>
                <span v-else class="text-caption font-weight-bold" style="color: #2E4B36;">
                  {{ attachmentDisplayName }}
                </span>
                <v-checkbox
                  v-if="isEdit && existingAttachmentPath && !selectedAttachment"
                  v-model="removeExistingAttachment"
                  label="Supprimer la PJ existante"
                  density="compact"
                  hide-details
                  color="#B00020"
                />
              </div>
            </v-col>
          </v-row>
          
          <div class="d-flex flex-column ga-2 mt-8 mb-6">
            <v-btn
              block
              size="large"
              variant="flat"
              color="#2E4B36"
              rounded="xl"
              class="text-none font-weight-black shadow-subtle"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              {{ isEdit ? "Enregistrer les modifications" : "Enregistrer le soin" }}
            </v-btn>
            
            <v-btn 
              block
              variant="text" 
              color="#554338"
              class="text-none font-weight-bold"
              @click="goBack"
            >
              Annuler
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="lg" elevation="10">
        {{ snackbar.message }}
      </v-snackbar>

      <v-dialog v-model="isCreateCareTypeDialogOpen" max-width="520">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold" style="color: #2E4B36">
            Créer un type de soin
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newCareTypeName"
              label="Nom du type *"
              placeholder="Ex: Drainage lymphatique"
              density="comfortable"
              variant="outlined"
              color="#2E4B36"
              rounded="lg"
              :error-messages="newCareTypeNameError ? [newCareTypeNameError] : undefined"
            />
            <v-select
              v-model="newCareTypeCategoryKey"
              :items="careTypeCategoryOptions"
              item-title="title"
              item-value="value"
              label="Catégorie *"
              density="comfortable"
              variant="outlined"
              color="#2E4B36"
              rounded="lg"
            />
          </v-card-text>
          <v-card-actions class="px-6 pb-5">
            <v-spacer />
            <v-btn variant="text" color="#554338" class="text-none" @click="closeCreateCareTypeDialog">
              Annuler
            </v-btn>
            <v-btn
              variant="flat"
              color="#2E4B36"
              rounded="lg"
              class="text-none font-weight-bold"
              :loading="isCreatingCareType"
              :disabled="isCreatingCareType"
              @click="createCustomCareType"
            >
              Ajouter
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsApi } from "@/api/events";
import { DatePickerField, RecurrenceFields } from "@/components";
import { productApi } from "@/api/product";
import { filesBaseUrl } from "@/api/client";
import { logger } from "@/services/LoggerService";
import type { Product, Event, RecurrenceUnit, CreateEventDto, CareType } from "@/types";
import { fromDateInputValue, toDateInputValue } from "@/libs/date";
import { useHorsesStore } from "@/stores/HorsesStore";
import { useEventsStore } from "@/stores/EventsStore";
import { validateRequiredFieldsMap } from "@/utils/validation";

const route = useRoute();
const router = useRouter();
const horsesStore = useHorsesStore();
const eventsStore = useEventsStore();

const isLoading = ref(true);
const isSubmitting = ref(false);
const products = ref<Product[]>([]);
const careCategoryOptions = ref<string[]>([]);
const event = ref<Event | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });
const selectedAttachment = ref<File | null>(null);
const existingAttachmentPath = ref<string>("");
const existingAttachmentName = ref<string>("");
const removeExistingAttachment = ref(false);
const careTypeSearch = ref("");
const isCreateCareTypeDialogOpen = ref(false);
const isCreatingCareType = ref(false);
const newCareTypeName = ref("");
const newCareTypeNameError = ref("");

const isEdit = computed(() => Boolean(route.name === 'HealthEdit'));

const form = ref({
    horseIds: [] as string[],
    productIds: [] as string[],
    careDescription: "",
    category: "",
    date: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
    note: "",
});

const DEFAULT_CARE_CATEGORIES = [
    "Maladie",
    "Bobo",
    "Soins courants",
    "Cures",
] as const;

type CareTypeGroup = {
    key: string;
    title: string;
    types: string[];
};

const defaultCareTypeGroups: CareTypeGroup[] = [
    {
        key: "sante-generale",
        title: "🩺 Santé générale",
        types: [
            "Consultation vétérinaire",
            "Vaccination",
            "Vermifuge",
            "Analyse (prise de sang, etc.)",
            "Médication",
            "Dentiste",
        ],
    },
    {
        key: "pieds-marechalerie",
        title: "🦶 Pieds & maréchalerie",
        types: [
            "Maréchalerie",
            "Parage",
            "Ferrure",
            "Abcès du pied",
        ],
    },
    {
        key: "locomotion-corps",
        title: "💪 Locomotion & corps",
        types: [
            "Ostéopathie",
            "Shiatsu",
            "Kinésithérapie",
            "Massage",
            "Boiterie",
        ],
    },
    {
        key: "peau-soins-externes",
        title: "🧴 Peau & soins externes",
        types: [
            "Soin de plaie",
            "Dermite",
            "Gale de boue",
            "Infection cutanée",
        ],
    },
    {
        key: "urgence-pathologie",
        title: "🚑 Urgence / pathologie",
        types: [
            "Colique",
            "Bouchon",
            "Blessure",
            "Suivi maladie",
        ],
    },
];

const formatCareTypeCategoryTitle = (key: string) => {
    const existing = defaultCareTypeGroups.find((group) => group.key === key);
    if (existing) return existing.title;
    return key
        .split("-")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ");
};

const buildDefaultCareTypeGroups = (): CareTypeGroup[] =>
    defaultCareTypeGroups.map((group) => ({
        ...group,
        types: [...group.types],
    }));

const careTypeGroups = ref<CareTypeGroup[]>(
    buildDefaultCareTypeGroups(),
);

const favoriteCareTypes = [
    "Maréchalerie",
    "Vermifuge",
    "Ostéopathie",
    "Vaccination",
];

const filteredCareTypeGroups = computed(() => {
    const query = careTypeSearch.value.trim().toLowerCase();
    if (!query) return careTypeGroups.value;
    return careTypeGroups.value
        .map((group) => ({
            ...group,
            types: group.types.filter((type) => type.toLowerCase().includes(query)),
        }))
        .filter((group) => group.types.length > 0);
});

const careTypeCategoryOptions = computed(() =>
    careTypeGroups.value.map((group) => ({
        title: group.title,
        value: group.key,
    })),
);

const newCareTypeCategoryKey = ref(careTypeGroups.value[0]?.key || "");

const horseOptions = computed(() =>
    horsesStore.horses.map((horse) => ({ title: horse.name, value: horse.id })),
);

const productOptions = computed(() => {
    return products.value
        .filter((p) => p.is_active)
        .map((p) => ({
            title: `${p.name} ${p.brand ? `(${p.brand})` : ''}`,
            value: p.id
        }));
});

const recurrenceUnits = [
    { title: "Jours", value: "days" },
    { title: "Mois", value: "months" },
    { title: "Ans", value: "years" },
];

const recurrence = computed({
    get: () => ({
        isRecurring: form.value.isRecurring,
        recurrenceInterval: form.value.recurrenceInterval,
        recurrenceUnit: form.value.recurrenceUnit,
    }),
    set: (value) => {
        form.value = { ...form.value, ...value };
    },
});

const fillForm = (event: Event) => {
    const hasMonthly = Boolean(event.reminder_interval_months);
    const hasYearly = Boolean(event.reminder_interval_years);
    const hasDaily = Boolean(event.reminder_interval_days);
    
    const recurrenceUnit: RecurrenceUnit = hasYearly ? "years" : hasMonthly ? "months" : "days";
    const recurrenceInterval = hasYearly 
        ? event.reminder_interval_years || 1 
        : hasMonthly ? event.reminder_interval_months || 1 
        : event.reminder_interval_days || 1;

    form.value = {
        horseIds: [event.horse_id || ""],
        productIds:
            event.product_ids && event.product_ids.length > 0
                ? [...event.product_ids]
                : event.product_id
                  ? [event.product_id]
                  : [],
        careDescription: event.name || "",
        category: event.category || "",
        date: toDateInputValue(event.event_date),
        isRecurring: Boolean(event.reminder_enabled) && (hasMonthly || hasYearly || hasDaily),
        recurrenceInterval,
        recurrenceUnit,
        note: event.description || "",
    };
    existingAttachmentPath.value = event.attachment_path || "";
    existingAttachmentName.value = event.attachment_name || "";
    selectedAttachment.value = null;
    removeExistingAttachment.value = false;
    careTypeSearch.value = event.name || "";
};

const attachmentHref = computed(() => {
    if (!existingAttachmentPath.value) return "";
    if (/^https?:\/\//i.test(existingAttachmentPath.value)) {
        return existingAttachmentPath.value;
    }
    const path = existingAttachmentPath.value.startsWith("/")
        ? existingAttachmentPath.value
        : `/${existingAttachmentPath.value}`;
    if (/^https?:\/\//i.test(filesBaseUrl)) {
        return `${filesBaseUrl.replace(/\/+$/, "")}${path}`;
    }
    return path;
});

const attachmentDisplayName = computed(() => {
    if (selectedAttachment.value) return selectedAttachment.value.name;
    if (existingAttachmentName.value) return existingAttachmentName.value;
    if (existingAttachmentPath.value) {
        return existingAttachmentPath.value.split("/").pop() || "Pièce jointe";
    }
    return "";
});

const onAttachmentChange = (value: File | File[] | null) => {
    const file = Array.isArray(value) ? value[0] : value;
    selectedAttachment.value = file || null;
    if (file) {
        removeExistingAttachment.value = false;
    }
};

const selectCareType = (type: string) => {
    form.value.careDescription = type;
    fieldErrors.value = {
        ...fieldErrors.value,
        careDescription: "",
    };
};

const onCreateCareTypeClick = () => {
    isCreateCareTypeDialogOpen.value = true;
    newCareTypeNameError.value = "";
    newCareTypeCategoryKey.value = careTypeGroups.value[0]?.key || "";
};

const closeCreateCareTypeDialog = () => {
    isCreateCareTypeDialogOpen.value = false;
    newCareTypeName.value = "";
    newCareTypeNameError.value = "";
    newCareTypeCategoryKey.value = careTypeGroups.value[0]?.key || "";
};

const addCareTypeToGroup = (name: string, categoryKey: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    let targetGroup = careTypeGroups.value.find((group) => group.key === categoryKey);
    if (!targetGroup) {
        targetGroup = {
            key: categoryKey,
            title: formatCareTypeCategoryTitle(categoryKey),
            types: [],
        };
        careTypeGroups.value = [...careTypeGroups.value, targetGroup];
    }

    const alreadyExists = targetGroup.types.some(
        (type) => type.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (alreadyExists) return;

    targetGroup.types = [...targetGroup.types, trimmedName].sort((a, b) =>
        a.localeCompare(b, "fr"),
    );
};

const applyPersistedCareTypes = (careTypes: CareType[]) => {
    careTypeGroups.value = buildDefaultCareTypeGroups();
    careTypes.forEach((careType) => {
        addCareTypeToGroup(careType.name, careType.category);
    });
};

const loadCareTypes = async () => {
    try {
        const careTypes = await eventsApi.getCareTypes();
        applyPersistedCareTypes(careTypes);
    } catch (error) {
        logger.error("Error loading care types:", error);
        careTypeGroups.value = buildDefaultCareTypeGroups();
    }
};

const createCustomCareType = async () => {
    const trimmedName = newCareTypeName.value.trim();
    if (!trimmedName) {
        newCareTypeNameError.value = "Le nom du type est requis.";
        return;
    }

    if (!newCareTypeCategoryKey.value) {
        newCareTypeNameError.value = "Catégorie invalide.";
        return;
    }

    try {
        isCreatingCareType.value = true;
        const createdCareType = await eventsApi.createCareType({
            name: trimmedName,
            category: newCareTypeCategoryKey.value,
        });
        addCareTypeToGroup(createdCareType.name, createdCareType.category);
        selectCareType(createdCareType.name);
        careTypeSearch.value = "";
        closeCreateCareTypeDialog();
        snackbar.value = {
            show: true,
            message: "Type de soin enregistré.",
            color: "success",
        };
    } catch (error) {
        logger.error("Error creating care type:", error);
        newCareTypeNameError.value = "Impossible de créer ce type pour le moment.";
    } finally {
        isCreatingCareType.value = false;
    }
};

const handleSubmit = async () => {
    const { errors, firstError } = await validateRequiredFieldsMap([
        { key: "horseIds", label: "au moins un cheval", value: form.value.horseIds?.length ? form.value.horseIds[0] : "" },
        { key: "careDescription", label: "le type de soin", value: form.value.careDescription?.trim() },
        { key: "category", label: "la catégorie", value: form.value.category?.trim() },
        { key: "date", label: "la date du soin", value: form.value.date },
    ]);
    fieldErrors.value = errors;
    if (firstError) {
        snackbar.value = { show: true, message: firstError, color: "error" };
        return;
    }

    try {
        isSubmitting.value = true;

        const localDate = new Date(form.value.date);

    localDate.setHours(12, 0, 0);

        const basePayload = {
            name: form.value.careDescription.trim(),
            event_date: localDate.toISOString(),
            product_id: form.value.productIds[0] || undefined,
            product_ids: form.value.productIds.length
                ? [...form.value.productIds]
                : undefined,
            category: form.value.category.trim(),
            // En édition, on envoie explicitement une chaîne vide pour permettre
            // la suppression effective d'une note déjà existante.
            description: isEdit.value
                ? form.value.note.trim()
                : form.value.note.trim() || undefined,
            is_care: true,
            
            reminder_enabled: form.value.isRecurring,
            reminder_interval_days: form.value.isRecurring && form.value.recurrenceUnit === 'days' ? form.value.recurrenceInterval : 0,
            reminder_interval_months: form.value.isRecurring && form.value.recurrenceUnit === 'months' ? form.value.recurrenceInterval : 0,
            reminder_interval_years: form.value.isRecurring && form.value.recurrenceUnit === 'years' ? form.value.recurrenceInterval : 0,
        };

        if (isEdit.value) {
            const idToUpdate = route.params.id as string;

            if (!idToUpdate || idToUpdate === "undefined") {
                throw new Error("ID du soin manquant dans l'URL");
            }

            await eventsStore.updateEvent(idToUpdate, {
                ...basePayload,
                horse_id: form.value.horseIds[0],
            });
            if (selectedAttachment.value) {
                await eventsApi.uploadAttachment(idToUpdate, selectedAttachment.value);
            } else if (removeExistingAttachment.value && existingAttachmentPath.value) {
                await eventsApi.deleteAttachment(idToUpdate);
            }
            if (form.value.horseIds[0]) {
                horsesStore.sethorseId(form.value.horseIds[0]);
            }

            snackbar.value = {
                show: true,
                message: "Soin mis à jour.",
                color: "success",
            };
        } else {
            const createdEvents = await Promise.all(
                form.value.horseIds.map((horseId) =>
                    eventsStore.createEvent({
                        ...basePayload,
                        horse_id: horseId,
                    } as CreateEventDto),
                ),
            );
            if (selectedAttachment.value) {
                await Promise.all(
                    createdEvents.map((createdEvent) =>
                        eventsApi.uploadAttachment(createdEvent.id, selectedAttachment.value as File),
                    ),
                );
            }
            if (form.value.horseIds[0]) {
                horsesStore.sethorseId(form.value.horseIds[0]);
            }
            snackbar.value = {
                show: true,
                message: "Soin(s) ajouté(s).",
                color: "success",
            };
        }

        setTimeout(() => goBack(), 1000);

    } catch (error) {
        logger.error("Error saving event:", error);
        snackbar.value = { 
            show: true, 
            message: "Erreur lors de l'enregistrement.", 
            color: "error" 
        };
    } finally {
        isSubmitting.value = false;
    }
};

const goBack = () =>
    router.push({
        name: "HealthView",
        query: { forceHorseFilter: "all" },
    });

const loadProducts = async () => {
    try {
        products.value = await productApi.getAll(false);
    } catch (error) {
        logger.error("Error loading products:", error);
    }
};

const loadCareCategories = async () => {
    try {
        const [events, history] = await Promise.all([
            eventsStore.fetchEvents(),
            eventsStore.fetchCareHistory(),
        ]);
        const dynamic = [
            ...events
                .filter((item) => item.is_care)
                .map((item) => item.category?.trim())
                .filter((value): value is string => Boolean(value)),
            ...history
                .map((item) => item.category?.trim())
                .filter((value): value is string => Boolean(value)),
        ];
        const merged = new Set<string>([...DEFAULT_CARE_CATEGORIES, ...dynamic]);
        careCategoryOptions.value = Array.from(merged).sort((a, b) =>
            a.localeCompare(b, "fr"),
        );
    } catch (error) {
        logger.error("Error loading care categories:", error);
        careCategoryOptions.value = [...DEFAULT_CARE_CATEGORIES];
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            horsesStore.loadHorses(),
            loadProducts(),
            loadCareCategories(),
            loadCareTypes(),
        ]);

        if (isEdit.value) {
            const id = route.params.id as string;
            const fetchedEvent = await eventsApi.getById(id);
            event.value = fetchedEvent;
            
            fillForm(fetchedEvent); 
        } else {
            const preselected = horsesStore.horseId && horsesStore.horseId !== "all" ? horsesStore.horseId : null;
            if (preselected) form.value.horseIds = [preselected];
        }
    } catch (error) {
        logger.error("Erreur au montage:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>