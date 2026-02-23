import { RouteLocationRaw } from "vue-router";

export type ProductCategory =
  | "Granulés"
  | "Complément"
  | "Friandises"
  | "Équipement"
  | "Pharmacie"
  | "Autres";

export type ProductUnit = "kg" | "g" | "L";

export type StockNotification = {
  product_id: string;
  title: string;
  body: string;
};


export type ProductFormValue = {
  name: string;
  category: ProductCategory;
  brand?: string;
  note?: string;

  // Stock (uniquement si Granulés / Complément)
  last_purchase_date?: string;
  quantity_purchased?: number;
  daily_usage?: number;
  unit?: ProductUnit;
};

export type ProductAction = {
  key: string;
  title: string;
  icon: string;
  color?: string;
  disabled: boolean;
  to?: RouteLocationRaw;
  onClick?: () => void;
};

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string | null;
  note: string | null;
  description?: string;

  // Noms alignés sur le Backend / SQL
  last_purchase_date: string | null; 
  purchase_interval_months: number | null;
  purchase_interval_years?: number;
  estimated_cost?: number;
  needs_repurchase: boolean;
  
  // Champs pour le suivi de stock (si géré côté front)
  quantity_purchased?: number;
  daily_usage?: number;
  unit?: ProductUnit;

  horse_id: string | null;
  is_active: boolean | null;
}

// Pour la création, on utilise les mêmes noms
export interface CreateProductDto {
  name: string;
  category: ProductCategory;
  brand?: string;
  note?: string;
  description?: string;
  last_purchase_date?: string;
  purchase_interval_months?: number;
  estimated_cost?: number;
  horse_id: string | null;
  // Champs stock
  quantity_purchased?: number;
  daily_usage?: number;
  unit?: ProductUnit;
}