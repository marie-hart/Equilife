export interface Event {
  id: string;
  name: string;
  description?: string;
  event_date: string;
  horse_id?: string;
  reminder_enabled: boolean;
  reminder_interval_months?: number;
  reminder_interval_years?: number;
  last_reminder_date?: string;
  next_reminder_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventDto {
  name: string;
  description?: string;
  event_date: string;
  horse_id?: string;
  reminder_enabled?: boolean;
  reminder_interval_months?: number;
  reminder_interval_years?: number;
}
