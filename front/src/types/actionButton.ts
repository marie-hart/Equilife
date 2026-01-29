import { RouteLocationRaw } from "vue-router";

export type ActionButton = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    to: RouteLocationRaw | void;
};

export type SelectedKind = "event" | null;
