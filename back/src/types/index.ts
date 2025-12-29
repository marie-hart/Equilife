// Types pour les événements
export interface Event {
  id: string;
  name: string;
  description?: string;
  event_date: Date;
  horse_id?: string;
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
  event_date: string; // Format: YYYY-MM-DD
  horse_id?: string;
  reminder_enabled?: boolean;
  reminder_interval_months?: number;
  reminder_interval_years?: number;
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  event_date?: string;
  horse_id?: string;
  reminder_enabled?: boolean;
  reminder_interval_months?: number;
  reminder_interval_years?: number;
}

// Types pour le matériel
export interface Material {
  id: string;
  name: string;
  description?: string;
  last_purchase_date?: Date;
  purchase_interval_months?: number;
  purchase_interval_years?: number;
  estimated_cost?: number;
  horse_id?: string;
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
  horse_id?: string;
}

export interface UpdateMaterialDto {
  name?: string;
  description?: string;
  last_purchase_date?: string;
  purchase_interval_months?: number;
  purchase_interval_years?: number;
  estimated_cost?: number;
  horse_id?: string;
  is_active?: boolean;
}

// Types pour les chevaux
export interface Horse {
  id: string;
  name: string;
  breed?: string;
  birth_date?: Date;
  age?: number; // Calculé automatiquement depuis birth_date
  additional_info?: string;
  photo_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateHorseDto {
  name: string;
  breed?: string;
  birth_date?: string; // Format: YYYY-MM-DD
  additional_info?: string;
}

export interface UpdateHorseDto {
  name?: string;
  breed?: string;
  birth_date?: string;
  additional_info?: string;
}
