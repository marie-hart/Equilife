<template>
    <div v-if="hasActions" class="action-buttons" @click.stop>
        <template v-if="mode === 'inline'">
            <v-btn
                v-for="action in inlineActions"
                :key="action.key"
                :icon="showIcon && !showLabel"
                :color="action.color"
                :disabled="action.disabled"
                :size="buttonSize"
                :variant="buttonVariant"
                :to="action.to"
                :target="action.target"
                :download="action.download"
                :aria-label="action.title"
                :title="action.title"
                @click="runAction(action, $event)"
            >
                <v-icon
                    v-if="showIcon"
                    :icon="action.icon"
                    :color="action.color"
                />
                <span v-if="showLabel">{{ action.title }}</span>
            </v-btn>
        </template>
        <template v-else>
            <template v-if="enabledActions.length > 1">
                <v-menu>
                    <template #activator="{ props }">
                        <v-btn
                            icon
                            :variant="menuButtonVariant"
                            v-bind="props"
                            aria-label="Actions"
                            title="Actions"
                            @click.stop
                            @mousedown.stop
                        >
                            <v-icon :icon="menuIcon" />
                        </v-btn>
                    </template>
                    <v-list :density="listDensity">
                        <v-list-item
                            v-for="action in actions"
                            :key="action.key"
                            :disabled="action.disabled"
                            :to="action.to"
                            :target="action.target"
                            :download="action.download"
                            @click="runAction(action, $event)"
                        >
                            <template #prepend>
                                <v-icon
                                    :icon="action.icon"
                                    :color="action.color"
                                />
                            </template>
                            <v-list-item-title>{{
                                action.title
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <template v-else-if="enabledActions.length === 1">
                <v-btn
                    :icon="enabledActions[0].icon"
                    :color="enabledActions[0].color"
                    :disabled="enabledActions[0].disabled"
                    :size="buttonSize"
                    :variant="buttonVariant"
                    :to="enabledActions[0].to"
                    :target="enabledActions[0].target"
                    :download="enabledActions[0].download"
                    :aria-label="enabledActions[0].title"
                    :title="enabledActions[0].title"
                    @click="runAction(enabledActions[0], $event)"
                />
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

type ActionButton = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled?: boolean;
    to?: RouteLocationRaw;
    target?: string;
    download?: boolean;
    onClick?: () => void;
};

type ButtonVariant =
    | "flat"
    | "outlined"
    | "plain"
    | "text"
    | "elevated"
    | "tonal";
type ButtonSize = "x-small" | "small" | "default" | "large" | "x-large";
type ListDensity = "default" | "comfortable" | "compact";

const props = withDefaults(
    defineProps<{
        actions: ActionButton[];
        mode?: "inline" | "auto";
        buttonSize?: ButtonSize;
        buttonVariant?: ButtonVariant;
        menuIcon?: string;
        menuButtonSize?: ButtonSize;
        menuButtonVariant?: ButtonVariant;
        listDensity?: ListDensity;
        showDisabled?: boolean;
        showLabel?: boolean;
        showIcon?: boolean;
    }>(),
    {
        mode: "inline",
        buttonSize: "x-small",
        buttonVariant: "text",
        menuIcon: "mdi-dots-vertical",
        menuButtonSize: "x-small",
        menuButtonVariant: "text",
        listDensity: "compact",
        showDisabled: true,
        showLabel: false,
        showIcon: true,
    },
);

const enabledActions = computed(() =>
    props.actions.filter((action) => !action.disabled),
);
const hasActions = computed(() => props.actions.length > 0);
const inlineActions = computed(() =>
    props.showDisabled ? props.actions : enabledActions.value,
);
const showLabel = computed(() => props.showLabel);
const showIcon = computed(() => props.showIcon);

const runAction = (action?: ActionButton, event?: Event) => {
    if (event) {
        event.stopPropagation();
    }
    if (action?.onClick) {
        event?.preventDefault();
        action.onClick();
    }
};
</script>
