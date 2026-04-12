import { RouteLocationRaw } from "vue-router";
import type { Event } from "./"

export type ActivityType =
    | "travail monté"
    | "travail à pied"
    | "balade"
    | "longe"
    | "repos"
    | "autre";

export type ActivityAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    to?: RouteLocationRaw
    onClick?: () => void;
};

export type ActivityGroup = {
    key: string;
    label: string;
    items: Event[];
};

export type IntensityValue = "legere" | "normale" | "soutenue";

export interface CreateEventDto {
    name: string;
    description?: string;
    event_date: string;
    horse_id?: string;
    product_id?: string;
    product_ids?: string[];
    category?: string;
    is_care?: boolean;
    reminder_type?: "soin" | "activité" | "alimentation" | "autres";
    activity_type?: string;
    activity_duration_minutes?: number;
    activity_intensity?: "legere" | "normale" | "soutenue";
    activity_comment?: string;
    reminder_enabled?: boolean;
    reminder_interval_days?: number;
    reminder_interval_months?: number;
    reminder_interval_years?: number;
}
