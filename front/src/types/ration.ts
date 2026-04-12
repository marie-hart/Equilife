import { RouteLocationRaw } from "vue-router";

export interface RationItem {
    id: string;
    ration_id: string;
    product_id?: string;
    quantity?: string;
    unit?: "kg" | "L" | "g";
    frequency: string[];
    type?: "Granulés" | "Complément" | "Pharmacie" | "Autres";
    created_at: string;
    updated_at: string;
}

export interface Ration {
    id: string;
    horse_id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    note?: string;
    is_active: boolean;
    items: RationItem[];
    created_at: string;
    updated_at: string;
}

export type RationAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    to?: RouteLocationRaw
    onClick?: () => void;
};

export interface CreateRationDto {
    horse_id: string;
    name: string;
    start_date?: string | null;
    end_date?: string | null;
    note?: string;
    is_active?: boolean;
    items: Array<{
        product_id?: string;
        quantity?: string;
        frequency?: string[];
        type?: "Granulés" | "Complément" | "Pharmacie" | "Autres";
    }>;
}

export type MealKey = "matin" | "midi" | "soir";

export type MealItem = {
    id: string;
    name: string;
    subtitle: string;
};

export type MealGroup = {
    key: MealKey;
    label: string;
    items: MealItem[];
};


export type RationFormItem = {
    key: string;
    productId: string;
    quantity: string;
    unit: "kg" | "L" | "g";
    frequency: string[];
    type: "Granulés" | "Complément" | "Pharmacie" | "Autres";
};
