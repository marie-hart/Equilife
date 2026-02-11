export interface Event {
    id: string;
    name: string;
    description?: string;
    event_date: string;
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
    last_reminder_date?: string;
    next_reminder_date?: string;
    created_at: string;
    updated_at: string;
}
