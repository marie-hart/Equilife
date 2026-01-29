// Types pour les événements
export interface Event {
    id: string;
    name: string;
    description?: string;
    event_date: Date;
    horse_id?: string;
    product_id?: string;
    is_care?: boolean;
    reminder_type?: "soin" | "activité" | "alimentation" | "autres";
    activity_type?: string;
    activity_duration_minutes?: number;
    activity_intensity?: "legere" | "normale" | "soutenue";
    activity_comment?: string;
    reminder_enabled: boolean;
    reminder_interval_days?: number;
    reminder_interval_months?: number;
    reminder_interval_years?: number;
    last_reminder_date?: Date;
    next_reminder_date?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface CreateEventDto {
    name: string;
    description?: string;
    event_date: string; // Format: YYYY-MM-DD
    horse_id?: string;
    product_id?: string;
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

export interface UpdateEventDto {
    name?: string;
    description?: string;
    event_date?: string;
    horse_id?: string;
    product_id?: string;
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

// Types pour le matériel
export interface Material {
    id: string;
    name: string;
    description?: string;
    category?: "Aliment" | "Complément" | "Soin" | "Matériels" | "Autres";
    brand?: string;
    note?: string;
    last_purchase_date?: Date;
    purchase_interval_months?: number;
    purchase_interval_years?: number;
    estimated_cost?: number;
    horse_id?: string;
    used_for_horses?: string[];
    needs_repurchase?: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateMaterialDto {
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

export interface UpdateMaterialDto {
    name?: string;
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
    is_active?: boolean;
}

// Types pour les chevaux
export interface Horse {
    id: string;
    name: string;
    nickname?: string;
    sex?: "Jument" | "Hongre" | "Etalon";
    breed?: string;
    coat?: string;
    birth_date?: Date;
    age?: number; // Calculé automatiquement depuis birth_date
    stable_location?: string;
    feed?: string;
    additional_info?: string;
    photo_path?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateHorseDto {
    name: string;
    nickname?: string;
    sex?: "Jument" | "Hongre" | "Etalon";
    breed?: string;
    coat?: string;
    birth_date?: string; // Format: YYYY-MM-DD
    stable_location?: string;
    feed?: string;
    additional_info?: string;
}

export interface UpdateHorseDto {
    name?: string;
    nickname?: string;
    sex?: "Jument" | "Hongre" | "Etalon";
    breed?: string;
    coat?: string;
    birth_date?: string;
    stable_location?: string;
    feed?: string;
    additional_info?: string;
}

// Types pour les documents
export interface Document {
    id: string;
    horse_id: string;
    title: string;
    document_date?: Date;
    tag?:
        | "carte_immatriculation"
        | "certificats"
        | "ordonnances"
        | "factures"
        | "assurance"
        | "autres";
    file_path: string;
    note?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateDocumentDto {
    horse_id: string;
    title: string;
    document_date?: string;
    tag?:
        | "carte_immatriculation"
        | "certificats"
        | "ordonnances"
        | "factures"
        | "assurance"
        | "autres";
    file_path: string;
    note?: string;
}

// Types pour les rations
export interface Ration {
    id: string;
    horse_id: string;
    name: string;
    start_date?: Date;
    end_date?: Date;
    note?: string;
    is_active: boolean;
    items: RationItem[];
    created_at: Date;
    updated_at: Date;
}

export interface RationItem {
    id: string;
    ration_id: string;
    product_id?: string;
    quantity?: string;
    frequency: string[];
    type?: "aliment" | "complement" | "autre";
    created_at: Date;
    updated_at: Date;
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

export interface UpdateRationDto {
    name?: string;
    start_date?: string;
    end_date?: string;
    note?: string;
    is_active?: boolean;
    items?: Array<{
        product_id?: string;
        quantity?: string;
        frequency?: string[];
        type?: "aliment" | "complement" | "autre";
    }>;
}
