export interface Event {
    id: string;
    name: string;
    description?: string;
    event_date: Date;
    reminder_enabled: boolean;
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
    event_date: string;
    reminder_enabled?: boolean;
    reminder_interval_months?: number;
    reminder_interval_years?: number;
}
export interface UpdateEventDto {
    name?: string;
    description?: string;
    event_date?: string;
    reminder_enabled?: boolean;
    reminder_interval_months?: number;
    reminder_interval_years?: number;
}
export interface Material {
    id: string;
    name: string;
    description?: string;
    last_purchase_date?: Date;
    purchase_interval_months?: number;
    purchase_interval_years?: number;
    estimated_cost?: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateMaterialDto {
    name: string;
    description?: string;
    last_purchase_date?: string;
    purchase_interval_months?: number;
    purchase_interval_years?: number;
    estimated_cost?: number;
}
export interface UpdateMaterialDto {
    name?: string;
    description?: string;
    last_purchase_date?: string;
    purchase_interval_months?: number;
    purchase_interval_years?: number;
    estimated_cost?: number;
    is_active?: boolean;
}
//# sourceMappingURL=index.d.ts.map