import type { RouteLocationRaw } from "vue-router";

export interface Horse {
    id: string;
    name: string;
    sex?: "Jument" | "Hongre" | "Etalon";
    breed?: string;
    coat?: string;
    birth_date?: string;
    age?: number;
    stable_location?: string;
    feed?: string;
    additional_info?: string;
    photo_path?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateHorseDto {
    name: string;
    sex?: "Jument" | "Hongre" | "Etalon";
    breed?: string;
    coat?: string;
    birth_date?: string;
    stable_location?: string;
    feed?: string;
    additional_info?: string;
}

export interface UpdateHorseDto {
    name: string;
    sex?: "Jument" | "Hongre" | "Etalon";
    breed?: string;
    coat?: string;
    birth_date?: string;
    stable_location?: string;
    feed?: string;
    additional_info?: string;
}

export type HorseAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    to?: RouteLocationRaw;
    onClick?: () => void;
};