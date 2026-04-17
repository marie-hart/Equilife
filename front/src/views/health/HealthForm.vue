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

            <v-col cols="12">
              <div class="text-caption font-weight-bold mb-2 mt-2 ms-1" style="color: #7B5B3E">
                TYPE DE SOIN *
              </div>
              <div class="pt-1">
                <v-text-field
                  v-model="searchCareTypeQuery"
                  placeholder="Rechercher ou sélectionner..."
                  prepend-inner-icon="mdi-magnify"
                  density="compact"
                  variant="outlined"
                  color="#2E4B36"
                  rounded="lg"
                  hide-details
                  class="mb-3"
                />

                <div
                  v-if="filteredFavoriteCareTypes.length"
                  class="d-flex flex-wrap ga-2 mb-3"
                >
                  <v-chip
                    v-for="favoriteType in filteredFavoriteCareTypes"
                    :key="`favorite-${favoriteType.categoryKey}-${favoriteType.name}`"
                    rounded="xl"
                    size="small"
                    variant="flat"
                    class="text-body-2 font-weight-medium px-3"
                    :style="{
                      backgroundColor: form.careDescription === favoriteType.name ? '#2E4B36' : '#F2EEE7',
                      color: form.careDescription === favoriteType.name ? '#FFFFFF' : '#3E342A',
                      border: form.careDescription === favoriteType.name ? 'none' : '1px solid #E2D7C8',
                    }"
                    @click="selectCareType(favoriteType.name, favoriteType.categoryKey)"
                  >
                    {{ favoriteType.name }}
                  </v-chip>
                </div>

                <v-expansion-panels
                  v-model="openedCareTypeGroups"
                  multiple
                  variant="accordion"
                  class="mt-1 mb-4"
                >
                  <v-expansion-panel
                    v-for="group in filteredCareTypeGroups"
                    :key="group.key"
                    :value="group.key"
                    elevation="0"
                    class="bg-transparent"
                    :style="{ borderBottom: '1px solid #E2D7C8' }"
                  >
                    <v-expansion-panel-title class="px-2 py-3">
                      <span class="font-weight-bold" style="color: #554338">
                        {{ group.title }}
                      </span>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="pt-1 pb-1 px-0">
                      <v-list density="comfortable" class="py-0 bg-transparent">
                        <v-list-item
                          v-for="type in group.types"
                          :key="`${group.key}-${type}`"
                          rounded="lg"
                          class="ps-2 pe-2"
                          :active="form.careDescription === type"
                          color="#2E4B36"
                          @click="selectCareType(type, group.key)"
                        >
                          <template #title>
                            <div class="d-flex align-center">
                              <span
                                class="d-inline-flex align-center justify-start"
                                style="width: 12px; min-width: 12px;"
                              >
                                <v-icon
                                  v-if="isCustomCareType(type)"
                                  size="14"
                                  color="#C4B5A5"
                                  style="transform: translateX(-2px);"
                                  @click.stop="deleteCustomCareType(type, group.key)"
                                >
                                  mdi-close
                                </v-icon>
                              </span>
                              <span class="ms-2">{{ type }}</span>
                            </div>
                          </template>
                          <template #append>
                            <div class="d-flex align-center">
                              <v-icon
                                size="18"
                                :color="isCareTypeFavorite(type) ? '#B23A48' : '#C4B5A5'"
                                @click.stop="setCareTypeFavorite(type, group.key, !isCareTypeFavorite(type))"
                              >
                                {{ isCareTypeFavorite(type) ? "mdi-heart" : "mdi-heart-outline" }}
                              </v-icon>
                            </div>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

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
              </div>
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
            
            <v-col cols="12">
              <v-divider class="my-2" style="border-color: #E2D7C8" />
              <div class="text-caption font-weight-bold mb-2 mt-4 ms-1" style="color: #7B5B3E">
                PRODUITS UTILISÉS
              </div>
              <v-select
                v-model="form.productIds"
                :items="productOptions"
                label="Sélectionner un ou plusieurs produits (optionnel)"
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
import { toDateInputValue } from "@/libs/date";
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
const event = ref<Event | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const snackbar = ref({ show: false, message: "", color: "success" });
const selectedAttachment = ref<File | null>(null);
const existingAttachmentPath = ref<string>("");
const existingAttachmentName = ref<string>("");
const removeExistingAttachment = ref(false);
const searchCareTypeQuery = ref("");
const openedCareTypeGroups = ref<string[]>([]);
const selectedCareTypeCategoryKey = ref("");
const favoriteCareTypeNames = ref<Set<string>>(new Set());
const isCreateCareTypeDialogOpen = ref(false);
const isCreatingCareType = ref(false);
const newCareTypeName = ref("");
const newCareTypeNameError = ref("");
const customCareTypeNames = ref<Set<string>>(new Set());
const CARE_TYPE_FAVORITES_STORAGE_KEY = "equilife_care_type_favorites";
const CARE_TYPE_CUSTOM_STORAGE_KEY = "equilife_custom_care_types";
const AUTH_TOKEN_STORAGE_KEY = "equilife_token";

const isEdit = computed(() => Boolean(route.name === 'HealthEdit'));

const form = ref({
    horseIds: [] as string[],
    productIds: [] as string[],
    careDescription: "",
    date: "",
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "months" as RecurrenceUnit,
    note: "",
});

type CareTypeGroup = {
    key: string;
    title: string;
    types: string[];
};

type FavoriteCareType = {
    name: string;
    categoryKey: string;
    categoryTitle: string;
};

const defaultCareTypeGroups: CareTypeGroup[] = [
    {
        key: "sante-generale",
        title: "Santé générale",
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
        title: "Pieds & maréchalerie",
        types: [
            "Maréchalerie",
            "Parage",
            "Ferrure",
            "Abcès du pied",
        ],
    },
    {
        key: "locomotion-corps",
        title: "Locomotion & corps",
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
        title: "Peau & soins externes",
        types: [
            "Soin de plaie",
            "Dermite",
            "Gale de boue",
            "Infection cutanée",
        ],
    },
    {
        key: "urgence-pathologie",
        title: "Urgence / pathologie",
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

const normalizeCareTypeName = (name: string) => name.trim().toLowerCase();

const defaultCareTypeNameSet = new Set(
    ([] as string[]).concat(...defaultCareTypeGroups.map((g) => g.types.map(normalizeCareTypeName))),
);

const isCustomCareType = (name: string) =>
    customCareTypeNames.value.has(normalizeCareTypeName(name));

const loadLocalFavoriteCareTypes = (): Set<string> => {
    try {
        const raw = localStorage.getItem(CARE_TYPE_FAVORITES_STORAGE_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return new Set();
        return new Set(
            parsed
                .map((value) => (typeof value === "string" ? normalizeCareTypeName(value) : ""))
                .filter(Boolean),
        );
    } catch {
        return new Set();
    }
};

const persistLocalFavoriteCareTypes = (favorites: Set<string>) => {
    localStorage.setItem(
        CARE_TYPE_FAVORITES_STORAGE_KEY,
        JSON.stringify(Array.from(favorites)),
    );
};

type LocalCustomCareType = {
    name: string;
    category: string;
};

const loadLocalCustomCareTypes = (): LocalCustomCareType[] => {
    try {
        const raw = localStorage.getItem(CARE_TYPE_CUSTOM_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((value) => ({
                name: typeof value?.name === "string" ? value.name.trim() : "",
                category: typeof value?.category === "string" ? value.category.trim() : "",
            }))
            .filter((value) => value.name && value.category);
    } catch {
        return [];
    }
};

const persistLocalCustomCareTypes = (customTypes: LocalCustomCareType[]) => {
    localStorage.setItem(CARE_TYPE_CUSTOM_STORAGE_KEY, JSON.stringify(customTypes));
};

const upsertLocalCustomCareType = (name: string, category: string) => {
    const normalizedName = normalizeCareTypeName(name);
    const existing = loadLocalCustomCareTypes().filter(
        (item) => normalizeCareTypeName(item.name) !== normalizedName,
    );
    existing.push({ name: name.trim(), category: category.trim() });
    persistLocalCustomCareTypes(existing);
};

const removeLocalCustomCareType = (name: string) => {
    const normalizedName = normalizeCareTypeName(name);
    const next = loadLocalCustomCareTypes().filter(
        (item) => normalizeCareTypeName(item.name) !== normalizedName,
    );
    persistLocalCustomCareTypes(next);
};

const careTypeGroups = ref<CareTypeGroup[]>(
    buildDefaultCareTypeGroups(),
);

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

const filteredCareTypeGroups = computed(() => {
    const query = searchCareTypeQuery.value.trim().toLowerCase();
    if (!query) return careTypeGroups.value;

    return careTypeGroups.value
        .map((group) => ({
            ...group,
            types: group.types.filter((type) => type.toLowerCase().includes(query)),
        }))
        .filter((group) => group.types.length > 0);
});

const filteredFavoriteCareTypes = computed<FavoriteCareType[]>(() => {
    const favoriteSet = favoriteCareTypeNames.value;
    if (!favoriteSet.size) return [];

    const query = searchCareTypeQuery.value.trim().toLowerCase();
    const favorites: FavoriteCareType[] = [];

    careTypeGroups.value.forEach((group) => {
        group.types.forEach((type) => {
            const normalizedType = normalizeCareTypeName(type);
            if (!favoriteSet.has(normalizedType)) return;
            if (query && !type.toLowerCase().includes(query)) return;
            favorites.push({
                name: type,
                categoryKey: group.key,
                categoryTitle: group.title,
            });
        });
    });

    return favorites
        .sort((a, b) => a.name.localeCompare(b.name, "fr"))
        .slice(0, 5);
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
        date: toDateInputValue(event.event_date),
        isRecurring: Boolean(event.reminder_enabled) && (hasMonthly || hasYearly || hasDaily),
        recurrenceInterval,
        recurrenceUnit,
        note: event.description || "",
    };
    const matchedGroup = careTypeGroups.value.find((group) =>
        group.types.some((type) => type.toLowerCase() === (event.name || "").toLowerCase()),
    );
    selectedCareTypeCategoryKey.value =
        matchedGroup?.key || event.category || "";
    openedCareTypeGroups.value = [];
    existingAttachmentPath.value = event.attachment_path || "";
    existingAttachmentName.value = event.attachment_name || "";
    selectedAttachment.value = null;
    removeExistingAttachment.value = false;
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

const selectCareType = (type: string, categoryKey?: string) => {
    form.value.careDescription = type;
    if (categoryKey) {
        selectedCareTypeCategoryKey.value = categoryKey;
    }
    fieldErrors.value = {
        ...fieldErrors.value,
        careDescription: "",
    };
};

const isCareTypeFavorite = (type: string) =>
    favoriteCareTypeNames.value.has(normalizeCareTypeName(type));

const setCareTypeFavorite = async (
    name: string,
    categoryKey: string,
    isFavorite: boolean,
) => {
    const normalizedName = normalizeCareTypeName(name);
    const applyFavoriteLocally = () => {
        const nextSet = new Set(favoriteCareTypeNames.value);
        if (isFavorite) {
            nextSet.add(normalizedName);
        } else {
            nextSet.delete(normalizedName);
        }
        favoriteCareTypeNames.value = nextSet;
        persistLocalFavoriteCareTypes(nextSet);
    };

    const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    if (!hasToken) {
        applyFavoriteLocally();
        return;
    }

    try {
        await eventsApi.toggleCareTypeFavorite({
            name,
            category: categoryKey,
            is_favorite: isFavorite,
        });
        applyFavoriteLocally();
    } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
            applyFavoriteLocally();
            return;
        }
        logger.error("Error toggling care type favorite:", error);
        snackbar.value = {
            show: true,
            message: "Impossible de mettre a jour les favoris pour le moment.",
            color: "error",
        };
    }
};

const deleteCustomCareType = async (name: string, categoryKey: string) => {
    const normalized = normalizeCareTypeName(name);
    const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
    if (hasToken) {
        try {
            await eventsApi.deleteCareType(name);
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                snackbar.value = {
                    show: true,
                    message: "Ce type est deja utilise dans un ou plusieurs soins.",
                    color: "warning",
                };
                return;
            }
            if (status !== 401) {
                logger.error("Error deleting care type:", error);
                snackbar.value = {
                    show: true,
                    message: "Impossible de supprimer ce type.",
                    color: "error",
                };
                return;
            }
        }
    }
    const group = careTypeGroups.value.find((g) => g.key === categoryKey);
    if (group) {
        group.types = group.types.filter((t) => normalizeCareTypeName(t) !== normalized);
    }
    const nextCustom = new Set(customCareTypeNames.value);
    nextCustom.delete(normalized);
    customCareTypeNames.value = nextCustom;
    const nextFav = new Set(favoriteCareTypeNames.value);
    nextFav.delete(normalized);
    favoriteCareTypeNames.value = nextFav;
    persistLocalFavoriteCareTypes(nextFav);
    if (normalizeCareTypeName(form.value.careDescription) === normalized) {
        form.value.careDescription = "";
    }
    removeLocalCustomCareType(name);
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
    const localFavorites = loadLocalFavoriteCareTypes();
    const localCustomCareTypes = loadLocalCustomCareTypes();
    const favoriteSet = new Set<string>();
    const customSet = new Set<string>();
    careTypes.forEach((careType) => {
        addCareTypeToGroup(careType.name, careType.category);
        if (careType.is_favorite) {
            favoriteSet.add(normalizeCareTypeName(careType.name));
        }
        if (!defaultCareTypeNameSet.has(normalizeCareTypeName(careType.name))) {
            customSet.add(normalizeCareTypeName(careType.name));
        }
    });
    localCustomCareTypes.forEach((careType) => {
        addCareTypeToGroup(careType.name, careType.category);
        if (!defaultCareTypeNameSet.has(normalizeCareTypeName(careType.name))) {
            customSet.add(normalizeCareTypeName(careType.name));
        }
    });
    localFavorites.forEach((favorite) => favoriteSet.add(favorite));
    favoriteCareTypeNames.value = favoriteSet;
    customCareTypeNames.value = customSet;
    persistLocalFavoriteCareTypes(favoriteSet);
};

const loadCareTypes = async () => {
    try {
        const careTypes = await eventsApi.getCareTypes();
        applyPersistedCareTypes(careTypes);
    } catch (error) {
        logger.error("Error loading care types:", error);
        careTypeGroups.value = buildDefaultCareTypeGroups();
        favoriteCareTypeNames.value = loadLocalFavoriteCareTypes();
        const localCustoms = loadLocalCustomCareTypes();
        const customSet = new Set<string>();
        localCustoms.forEach((careType) => {
            addCareTypeToGroup(careType.name, careType.category);
            if (!defaultCareTypeNameSet.has(normalizeCareTypeName(careType.name))) {
                customSet.add(normalizeCareTypeName(careType.name));
            }
        });
        customCareTypeNames.value = customSet;
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

    const applyCreatedCareTypeLocally = (name: string, category: string) => {
        addCareTypeToGroup(name, category);
        customCareTypeNames.value = new Set([
            ...customCareTypeNames.value,
            normalizeCareTypeName(name),
        ]);
        upsertLocalCustomCareType(name, category);
        selectCareType(name, category);
        closeCreateCareTypeDialog();
        snackbar.value = {
            show: true,
            message: "Type de soin enregistré.",
            color: "success",
        };
    };

    try {
        isCreatingCareType.value = true;
        const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
        if (!hasToken) {
            applyCreatedCareTypeLocally(trimmedName, newCareTypeCategoryKey.value);
            return;
        }
        const createdCareType = await eventsApi.createCareType({
            name: trimmedName,
            category: newCareTypeCategoryKey.value,
        });
        applyCreatedCareTypeLocally(createdCareType.name, createdCareType.category);
    } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
            applyCreatedCareTypeLocally(trimmedName, newCareTypeCategoryKey.value);
            return;
        }
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
            category: selectedCareTypeCategoryKey.value || undefined,
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

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            horsesStore.loadHorses(),
            loadProducts(),
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

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
</style>