import { RouteLocationRaw } from "vue-router";
import { RecurrenceUnit } from "./ui";

export type ProductFormValue = {
    name: string;
    category: string;
    brand: string;
    note: string;
    isRecurring: boolean;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
    needs_repurchase?: boolean;
};

export type ProductAction = {
    key: string;
    title: string;
    icon: string;
    color?: string;
    disabled: boolean;
    to?: RouteLocationRaw
    onClick?: () => void;
};

export interface Product {
    id: string;
    name: string;
    description?: string;
    category?: "Aliment" | "Complément" | "Soin" | "Matériels" | "Autres";
    brand?: string;
    note?: string;
    last_purchase_date?: string;
    purchase_interval_months?: number;
    purchase_interval_years?: number;
    estimated_cost?: number;
    horse_id?: string;
    used_for_horses?: string[];
    needs_repurchase?: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    category?: "Aliment" | "Complément" | "Soin" | "Matériels" | "Autres";
    brand?: string;
    note?: string;
    last_purchase_date?: string;
    purchase_interval_months?: number;
    purchase_interval_years?: number;
    estimated_cost?: number;
    horse_id?: string;
    used_for_horses?: string[];
    needs_repurchase?: boolean;
}
