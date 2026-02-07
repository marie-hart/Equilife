<template>
    <v-card variant="flat" class="rounded-xl w-100 h-100">
        <v-card-title>
            <div class="d-flex align-center justify-space-between ga-3">
                <div class="d-inline-flex align-center ga-2">
                    <svg
                        v-if="icon === 'alarm-clock'"
                        class="alarm-clock-icon"
                        viewBox="0 0 64 64"
                        width="1em"
                        height="1em"
                        aria-hidden="true"
                    >
                        <g fill="currentColor">
                            <path
                                d="M20 16c-5 2-8 6-9 12l6 2c.7-4.3 3.2-7.2 7-8.8L20 16z"
                            />
                            <path
                                d="M44 16c5 2 8 6 9 12l-6 2c-.7-4.3-3.2-7.2-7-8.8L44 16z"
                            />
                            <circle cx="32" cy="36" r="18" />
                            <rect x="18" y="50" width="8" height="6" rx="3" />
                            <rect x="38" y="50" width="8" height="6" rx="3" />
                        </g>
                        <g fill="#ffffff">
                            <rect x="30" y="26" width="4" height="14" rx="2" />
                            <rect
                                x="32"
                                y="36"
                                width="10"
                                height="4"
                                rx="2"
                                transform="rotate(45 32 36)"
                            />
                        </g>
                    </svg>

                    <font-awesome-icon v-else :icon="icon" />

                    <span>{{ title }}</span>
                </div>

                <v-btn
                    v-if="showAdd"
                    icon="mdi-plus"
                    size="small"
                    :style="{
                        backgroundColor: '#f2e8dc',
                        color: '#554338'
                    }"
                    @click.stop.prevent="emit('add')"
                />
            </div>
        </v-card-title>

        <v-card-text>
            <slot />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    icon: string;
    showAdd?: boolean;
    addIcon?: string;
}>();

const emit = defineEmits<{
    (event: "add"): void;
}>();
</script>

<style scoped>
.alarm-clock-icon {
    font-size: 1.35em;
    vertical-align: -0.125em;
}
</style>
