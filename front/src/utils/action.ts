import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Event, ActionButton, SelectedKind } from "../types";



const router = useRouter();

const selectedKind = ref<SelectedKind>(null);
const selectedEvent = ref<Event | null>(null);
const deleteDialogOpen = ref(false);



const openEventDetails = (event: Event) => {
  router.push({ name: "EventDetails", params: { id: event.id } });
};

const openEventEdit = (event: Event) => {
  router.push({ name: "EventEdit", params: { id: event.id } });
};

export const deleteLabel = computed(() => {
  if (selectedKind.value === "event" && selectedEvent.value) {
    return selectedEvent.value.name;
  }
  return "";
});


const openEventDelete = (event: Event) => {
  selectedKind.value = "event";
  selectedEvent.value = event;
  deleteDialogOpen.value = true;
};

export const getEventActions = (event: Event): ActionButton[] => [
  {
    key: "view",
    title: "Voir",
    icon: "mdi-eye",
    disabled: false,
    onClick: () => openEventDetails(event),
  },
  {
    key: "edit",
    title: "Éditer",
    icon: "mdi-pencil",
    disabled: false,
    onClick: () => openEventEdit(event),
  },
  {
    key: "delete",
    title: "Supprimer",
    icon: "mdi-trash-can",
    color: "error",
    disabled: false,
    onClick: () => openEventDelete(event),
  },
];