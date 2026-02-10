import { RouteLocationRaw } from "vue-router";

export type CareStatus = "past" | "today" | "upcoming";

export type CareAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    to?: RouteLocationRaw
    onClick?: () => void;
};