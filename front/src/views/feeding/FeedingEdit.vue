<template>
    <FeedingForm :ration-id="rationId"/>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router"
import FeedingForm from '@/components/FeedingForm.vue';

const route = useRoute()

const rationId = route.params.id as string

</script>
