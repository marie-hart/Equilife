<template>
    <HorseForm :horse-id="horseId ?? undefined" />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import HorseForm from "@/components/HorseForm.vue";
import { useHorsesStore } from "@/stores/HorsesStore";

const { horseId } = storeToRefs(useHorsesStore());
</script>