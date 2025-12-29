export interface Material {
  id: string;
  name: string;
  description?: string;
  last_purchase_date?: string;
  purchase_interval_months?: number;
  purchase_interval_years?: number;
  estimated_cost?: number;
  horse_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
