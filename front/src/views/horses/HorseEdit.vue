<template>
    <HorseForm :horse-id="horseId" />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router"
import HorseForm from '@/components/HorseForm.vue';

const route = useRoute()

const horseId = route.params.id as string

</script>