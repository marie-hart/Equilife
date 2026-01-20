<template>
  <div class="page">
    <main class="pa-4">
      <div class="d-flex align-center justify-space-between ga-4 mb-6">
        <v-card-title class="ma-0 text-h5">Documents</v-card-title>
        <v-btn class="primary-btn" color="primary" variant="flat" @click="goToDocumentCreate">
          <v-icon icon="mdi-plus" class="me-2" />
          Ajouter
        </v-btn>
      </div>
          <div class="d-flex flex-column ga-4">
            <v-card class="section-card" variant="outlined">
              <v-card-title class="text-subtitle-1">Filtres</v-card-title>
              <v-card-text class="pt-3">
                <v-row dense>
                  <v-col cols="12" md="6" lg="3">
                  <v-select
                    v-model="selectedHorseId"
                    :items="horseFilterOptions"
                    label="Cheval"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                  <v-col cols="12" md="6" lg="3">
                  <v-text-field
                    v-model="searchQuery"
                    label="Rechercher par titre"
                    density="compact"
           
                  />
                  </v-col>
                  <v-col cols="12" md="6" lg="3">
                  <v-select
                    v-model="selectedTag"
                    :items="filterTagOptions"
                    label="Tags"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                  <v-col cols="12" md="6" lg="3">
                  <v-select
                    v-model="sortBy"
                    :items="sortOptions"
                    label="Trier par"
                    density="compact"
                    variant="outlined"
                  />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <div>
              <div class="text-subtitle-1 mb-2">Liste des documents</div>
              <div class="pt-2">
                <v-list v-if="displayDocuments.length" density="compact" class="d-flex flex-column ga-2">
                  <v-list-item v-for="doc in displayDocuments" :key="doc.id" class="rounded-lg bg-grey-lighten-4">
                    <v-row class="w-100 align-center" dense>
                      <v-col cols="4" class="text-caption text-grey-darken-1 d-md-none">
                        {{ doc.document_date ? formatDateMobile(doc.document_date) : '-' }}
                      </v-col>
                      <v-col cols="6" class="d-md-none">
                        <div class="text-subtitle-2">{{ doc.title }}</div>
                        <div class="text-body-2 text-grey-darken-1">
                          <span v-if="doc.tag">{{ tagLabel(doc.tag) }}</span>
                          <span v-else>-</span>
                          <v-chip v-if="doc.is_demo" size="x-small" variant="flat" color="grey-lighten-3" class="ml-2">
                        Exemple
                      </v-chip>
                        </div>
                        <div v-if="doc.note" class="text-caption text-grey-darken-1">{{ doc.note }}</div>
                      </v-col>
                      <v-col cols="2" class="d-md-none text-right">
                      <ActionButtons
                        mode="auto"
                        button-size="x-small"
                        menu-button-size="x-small"
                        :actions="getDocumentActions(doc)"
                      />
                      </v-col>

                      <v-col cols="2" class="text-caption text-grey-darken-1 d-none d-md-block">
                        {{ doc.document_date ? formatDateLong(doc.document_date) : '-' }}
                      </v-col>
                      <v-col cols="3" class="text-subtitle-2 d-none d-md-block">
                        {{ doc.title }}
                        <v-chip v-if="doc.is_demo" size="x-small" variant="flat" color="grey-lighten-3" class="ml-2">
                          Exemple
                        </v-chip>
                      </v-col>
                      <v-col cols="2" class="text-body-2 text-grey-darken-1 d-none d-md-block">
                        <span v-if="doc.tag">{{ tagLabel(doc.tag) }}</span>
                        <span v-else>-</span>
                      </v-col>
                      <v-col cols="3" class="text-body-2 text-grey-darken-1 d-none d-md-block">
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
          </div>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
        {{ snackbar.message }}
      </v-snackbar>

      <v-dialog v-model="isPreviewOpen" max-width="900">
        <v-card>
          <v-card-title>Aperçu du document</v-card-title>
          <v-card-text>
            <div v-if="previewDoc" class="preview-content">
              <img
                v-if="isImage(previewDoc)"
                :src="getDocumentUrl(previewDoc)"
                :alt="previewDoc.title"
                class="preview-image"
              />
              <iframe
                v-else-if="isPdf(previewDoc)"
                :src="getDocumentUrl(previewDoc)"
                class="preview-frame"
              />
              <div v-else class="text-body-2 text-grey-darken-1">
                Ce type de fichier ne peut pas être prévisualisé.
                <a :href="getDocumentUrl(previewDoc)" target="_blank">Ouvrir</a>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isPreviewOpen = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isShareFallbackOpen" max-width="360">
        <v-card>
          <v-card-title>Partager</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                :disabled="!shareFallbackDoc"
                :href="mailLink"
                @click="isShareFallbackOpen = false"
              >
                <template #prepend>
                  <v-icon icon="mdi-email-outline" />
                </template>
                <v-list-item-title>Email</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!shareFallbackDoc"
                :href="smsLink"
                @click="isShareFallbackOpen = false"
              >
                <template #prepend>
                  <v-icon icon="mdi-message-text-outline" />
                </template>
                <v-list-item-title>SMS</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!shareFallbackDoc"
                :href="whatsappLink"
                target="_blank"
                rel="noopener"
                @click="isShareFallbackOpen = false"
              >
                <template #prepend>
                  <v-icon icon="mdi-whatsapp" />
                </template>
                <v-list-item-title>WhatsApp</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!shareFallbackDoc"
                :href="telegramLink"
                target="_blank"
                rel="noopener"
                @click="isShareFallbackOpen = false"
              >
                <template #prepend>
                  <v-icon icon="mdi-telegram" />
                </template>
                <v-list-item-title>Telegram</v-list-item-title>
              </v-list-item>
              <v-list-item
                :disabled="!shareFallbackDoc"
                :href="messengerLink"
                target="_blank"
                rel="noopener"
                @click="isShareFallbackOpen = false"
              >
                <template #prepend>
                  <v-icon icon="mdi-facebook-messenger" />
                </template>
                <v-list-item-title>Messenger</v-list-item-title>
              </v-list-item>
              <v-list-item :disabled="!shareFallbackDoc" @click="copyShareLink">
                <template #prepend>
                  <v-icon icon="mdi-content-copy" />
                </template>
                <v-list-item-title>Copier le lien</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="isShareFallbackOpen = false">Fermer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { documentsApi } from '../../api/documents'
import { horsesApi } from '../../api/horses'
import { ActionButtons } from '../../components'
import { getStoredHorseId } from '../../utils/horseProfile'
import type { Document, Horse } from '../../types'

type DocumentTag =
  | 'carte_immatriculation'
  | 'certificats'
  | 'ordonnances'
  | 'factures'
  | 'assurance'
  | 'autres'

const route = useRoute()
const router = useRouter()
const horseId = computed(() => route.params.id as string | undefined)
type DocumentListItem = Document & { is_demo?: boolean }
type DocumentAction = {
  key: string
  title: string
  icon: string
  color?: string
  disabled: boolean
  href?: string
  target?: string
  download?: boolean
  onClick?: () => void
}

const horses = ref<Horse[]>([])
const documents = ref<DocumentListItem[]>([])
const isPreviewOpen = ref(false)
const previewDoc = ref<DocumentListItem | null>(null)
const isShareFallbackOpen = ref(false)
const shareFallbackDoc = ref<DocumentListItem | null>(null)
const selectedTag = ref<'all' | DocumentTag>('all')
const sortBy = ref<'date_desc' | 'date_asc' | 'tag_asc' | 'tag_desc'>('date_desc')
const searchQuery = ref('')
const selectedHorseId = ref<string>('all')
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const tagOptions = [
  { title: "Carte d'immatriculation", value: 'carte_immatriculation' },
  { title: 'Certificats', value: 'certificats' },
  { title: 'Ordonnances', value: 'ordonnances' },
  { title: 'Factures', value: 'factures' },
  { title: 'Assurance', value: 'assurance' },
  { title: 'Autres', value: 'autres' },
]

const filterTagOptions = [{ title: 'Tous', value: 'all' }, ...tagOptions]

const sortOptions = [
  { title: 'Date (récent)', value: 'date_desc' },
  { title: 'Date (ancien)', value: 'date_asc' },
  { title: 'Tag (A→Z)', value: 'tag_asc' },
  { title: 'Tag (Z→A)', value: 'tag_desc' },
]

const horseOptions = computed(() =>
  horses.value.map((horse) => ({ title: horse.name, value: horse.id }))
)

const horseFilterOptions = computed(() => [
  { title: 'Tous les chevaux', value: 'all' },
  ...horseOptions.value,
])

const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatDateMobile = (dateString: string): string => {
  const date = new Date(dateString)
  const currentYear = new Date().getFullYear()
  const monthShort = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  return date.getFullYear() !== currentYear
    ? `${date.getDate()} ${monthShort} ${date.getFullYear()}`
    : `${date.getDate()} ${monthShort}`
}

const tagLabel = (tag: DocumentTag): string =>
  tagOptions.find((option) => option.value === tag)?.title ?? tag

const getDocumentUrl = (doc: DocumentListItem): string => {
  if (doc.file_path.startsWith('http')) return doc.file_path
  return `${window.location.origin}${doc.file_path}`
}

const getExtension = (doc: DocumentListItem): string => {
  const parts = doc.file_path.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

const isImage = (doc: DocumentListItem): boolean => {
  const ext = getExtension(doc)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

const isPdf = (doc: DocumentListItem): boolean => getExtension(doc) === 'pdf'

const openPreview = (doc: DocumentListItem) => {
  previewDoc.value = doc
  isPreviewOpen.value = true
}

const getDocumentActions = (doc: DocumentListItem): DocumentAction[] => [
  {
    key: 'view',
    title: 'Voir',
    icon: 'mdi-eye',
    disabled: Boolean(doc.is_demo),
    onClick: () => openPreview(doc),
  },
  {
    key: 'share',
    title: 'Partager',
    icon: 'mdi-share-variant',
    disabled: Boolean(doc.is_demo),
    onClick: () => handleShare(doc),
  },
  {
    key: 'download',
    title: 'Télécharger',
    icon: 'mdi-download',
    disabled: Boolean(doc.is_demo),
    href: getDocumentUrl(doc),
    target: '_blank',
    download: true,
  },
  {
    key: 'delete',
    title: 'Supprimer',
    icon: 'mdi-trash-can',
    color: 'error',
    disabled: Boolean(doc.is_demo),
    onClick: () => deleteDocument(doc),
  },
]

const shareUrl = computed(() =>
  shareFallbackDoc.value ? getDocumentUrl(shareFallbackDoc.value) : ''
)

const shareText = computed(() =>
  shareFallbackDoc.value ? `${shareFallbackDoc.value.title} ${shareUrl.value}`.trim() : ''
)

const mailLink = computed(
  () =>
    `mailto:?subject=${encodeURIComponent(shareFallbackDoc.value?.title ?? '')}&body=${encodeURIComponent(shareText.value)}`
)

const smsLink = computed(() => `sms:?body=${encodeURIComponent(shareText.value)}`)

const whatsappLink = computed(() => `https://wa.me/?text=${encodeURIComponent(shareText.value)}`)

const telegramLink = computed(
  () =>
    `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`
)

const messengerLink = computed(() => `https://m.me/?text=${encodeURIComponent(shareText.value)}`)

const handleShare = async (doc: DocumentListItem) => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
  const url = getDocumentUrl(doc)
      await navigator.share({
        title: doc.title,
        text: `${doc.title} ${url}`.trim(),
        url,
      })
      return
    } catch (error) {
      // User cancelled or share failed; fallback options are still useful.
    }
  }

  shareFallbackDoc.value = doc
  isShareFallbackOpen.value = true
}

const copyShareLink = async () => {
  if (!shareFallbackDoc.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    snackbar.value = {
      show: true,
      message: 'Lien copié.',
      color: 'success',
    }
  } catch (error) {
    console.warn('Clipboard copy failed.', error)
    snackbar.value = {
      show: true,
      message: 'Impossible de copier le lien.',
      color: 'warning',
    }
  } finally {
    isShareFallbackOpen.value = false
  }
}

const goToDocumentCreate = () => {
  const id = horseId.value
  if (id) {
    router.push({ name: 'HorseDocumentCreate', params: { id } })
    return
  }
  router.push('/horses')
}

const loadDocuments = async () => {
  try {
    const horseFilter =
      selectedHorseId.value !== 'all' ? selectedHorseId.value : undefined
    documents.value = await documentsApi.getAll(horseFilter)
  } catch (error) {
    console.error('Error loading documents:', error)
  }
}

const loadHorses = async () => {
  try {
    horses.value = await horsesApi.getAll()
  } catch (error) {
    console.error('Error loading horses:', error)
  }
}

const setHorseFromRoute = () => {
  if (horseId.value) {
    selectedHorseId.value = horseId.value
    return
  }
  const storedHorseId = getStoredHorseId()
  if (storedHorseId) {
    selectedHorseId.value = storedHorseId
  }
}

const deleteDocument = async (doc: DocumentListItem) => {
  try {
    await documentsApi.delete(doc.id)
    documents.value = documents.value.filter((item) => item.id !== doc.id)
    snackbar.value = {
      show: true,
      message: 'Document supprimé.',
      color: 'success',
    }
  } catch (error) {
    console.error('Error deleting document:', error)
    snackbar.value = {
      show: true,
      message: 'Suppression impossible.',
      color: 'error',
    }
  }
}

const filteredDocuments = computed<DocumentListItem[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const byTag =
    selectedTag.value === 'all'
      ? documents.value
      : documents.value.filter((doc) => doc.tag === selectedTag.value)
  const bySearch = query
    ? byTag.filter((doc) => doc.title.toLowerCase().includes(query))
    : byTag
  const sorted = [...bySearch].sort((a, b) => {
    if (sortBy.value === 'date_asc' || sortBy.value === 'date_desc') {
      const aDate = a.document_date ? new Date(a.document_date).getTime() : 0
      const bDate = b.document_date ? new Date(b.document_date).getTime() : 0
      return sortBy.value === 'date_asc' ? aDate - bDate : bDate - aDate
    }
    const aTag = a.tag || ''
    const bTag = b.tag || ''
    return sortBy.value === 'tag_asc' ? aTag.localeCompare(bTag) : bTag.localeCompare(aTag)
  })
  return sorted as DocumentListItem[]
})

const demoDocuments = computed<DocumentListItem[]>(() => [
  {
    id: 'demo-1',
    horse_id: horseId.value || 'demo',
    title: "Certificat vétérinaire",
    document_date: new Date().toISOString(),
    tag: 'certificats',
    file_path: '/uploads/documents/demo.pdf',
    note: 'Exemple de document PDF.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_demo: true,
  },
  {
    id: 'demo-2',
    horse_id: horseId.value || 'demo',
    title: "Facture maréchal",
    document_date: new Date().toISOString(),
    tag: 'factures',
    file_path: '/uploads/documents/demo.jpg',
    note: 'Exemple de document image.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_demo: true,
  },
])

const displayDocuments = computed<DocumentListItem[]>(() =>
  filteredDocuments.value.length ? filteredDocuments.value : demoDocuments.value
)

watch(selectedHorseId, () => {
  loadDocuments()
})

onMounted(async () => {
  await loadHorses()
  setHorseFromRoute()
  await loadDocuments()
})
</script>

<style scoped>
.preview-content {
  min-height: 300px;
}

.preview-frame {
  width: 100%;
  min-height: 600px;
  border: none;
}

.preview-image {
  width: 100%;
  border-radius: 8px;
}
</style>
