export interface Event {
    id: string;
    name: string;
    description?: string;
    attachment_path?: string;
    attachment_name?: string;
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
    reminder_enabled: boolean;
    reminder_interval_days?: number;
    reminder_interval_months?: number;
    reminder_interval_years?: number;
    last_reminder_date?: string;
    next_reminder_date?: string;
    created_at: string;
    updated_at: string;
}

export interface CareHistoryEntry {
    id: string;
    original_event_id?: string;
    horse_id: string;
    product_id?: string;
    category?: string;
    name: string;
    description?: string;
    event_date: string;
    care_status: "done";
    created_at: string;
}

export interface CareType {
    id: string;
    user_id: string;
    name: string;
    category: string;
    created_at: string;
    updated_at: string;
}
