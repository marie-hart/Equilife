<template>
    <div>
        <div class="text-subtitle-1 mb-2">Liste des documents</div>
        <div class="pt-2">
            <v-list
                v-if="documents.length"
                density="compact"
                class="d-flex flex-column ga-2"
            >
                <v-list-item
                    v-for="doc in documents"
                    :key="doc.id"
                    class="rounded-lg bg-grey-lighten-4"
                >
                    <v-row class="w-100 align-center" dense>
                        <v-col
                            cols="4"
                            class="text-caption text-grey-darken-1 d-md-none"
                        >
                            {{
                                doc.document_date
                                    ? formatDateMobile(doc.document_date)
                                    : "-"
                            }}
                        </v-col>
                        <v-col cols="6" class="d-md-none">
                            <div class="text-subtitle-2">{{ doc.title }}</div>
                            <div class="text-body-2 text-grey-darken-1">
                                <span v-if="doc.tag">{{
                                    tagLabel(doc.tag)
                                }}</span>
                                <span v-else>-</span>
                                <v-chip
                                    v-if="doc.is_demo"
                                    size="x-small"
                                    variant="flat"
                                    color="grey-lighten-3"
                                    class="ml-2"
                                >
                                    Exemple
                                </v-chip>
                            </div>
                            <div
                                v-if="doc.note"
                                class="text-caption text-grey-darken-1"
                            >
                                {{ doc.note }}
                            </div>
                        </v-col>
                        <v-col cols="2" class="d-md-none text-right">
                            <ActionButtons
                                mode="auto"
                                button-size="x-small"
                                menu-button-size="x-small"
                                :actions="getDocumentActions(doc)"
                            />
                        </v-col>

                        <v-col
                            cols="2"
                            class="text-caption text-grey-darken-1 d-none d-md-block"
                        >
                            {{
                                doc.document_date
                                    ? formatDateLong(doc.document_date)
                                    : "-"
                            }}
                        </v-col>
                        <v-col
                            cols="3"
                            class="text-subtitle-2 d-none d-md-block"
                        >
                            {{ doc.title }}
                            <v-chip
                                v-if="doc.is_demo"
                                size="x-small"
                                variant="flat"
                                color="grey-lighten-3"
                                class="ml-2"
                            >
                                Exemple
                            </v-chip>
                        </v-col>
                        <v-col
                            cols="2"
                            class="text-body-2 text-grey-darken-1 d-none d-md-block"
                        >
                            <span v-if="doc.tag">{{ tagLabel(doc.tag) }}</span>
                            <span v-else>-</span>
                        </v-col>
                        <v-col
                            cols="3"
                            class="text-body-2 text-grey-darken-1 d-none d-md-block"
                        >
                            <span v-if="doc.note">{{ doc.note }}</span>
                            <span v-else>-</span>
                        </v-col>
                        <v-col cols="auto" class="text-right d-none d-md-block">
                            <ActionButtons
                                class="d-flex align-center justify-end ga-2 flex-nowrap"
                                mode="inline"
                                button-size="x-small"
                                :actions="getDocumentActions(doc)"
                            />
                        </v-col>
                    </v-row>
                </v-list-item>
            </v-list>
            <p v-else class="empty-state">Aucun document pour le moment.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ActionButtons } from "@/components";
import { formatDateLong, formatDateMobile } from "@/libs/date";
import type { Document } from "@/types";

type DocumentTag =
    | "carte_immatriculation"
    | "certificats"
    | "ordonnances"
    | "factures"
    | "assurance"
    | "autres";

type DocumentListItem = Document & { is_demo?: boolean };

type DocumentAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    href?: string;
    target?: string;
    download?: boolean;
    onClick?: () => void;
};

defineProps<{
    documents: DocumentListItem[];
    getDocumentActions: (doc: DocumentListItem) => DocumentAction[];
    tagLabel: (tag: DocumentTag) => string;
}>();
</script>
