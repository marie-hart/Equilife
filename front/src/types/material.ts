export interface Material {
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
