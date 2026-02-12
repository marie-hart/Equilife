export interface RationItem {
    id: string;
    ration_id: string;
    product_id?: string;
    quantity?: string;
    frequency: string[];
    type?: "aliment" | "complement" | "autre";
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

export interface CreateRationDto {
    horse_id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    note?: string;
    is_active?: boolean;
    items: Array<{
        product_id?: string;
        quantity?: string;
        frequency?: string[];
        type?: "aliment" | "complement" | "autre";
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
    frequency: string[];
    type: "aliment" | "complement" | "autre";
};
