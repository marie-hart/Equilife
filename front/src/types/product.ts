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
  purchase_date?: string;
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
  brand?: string;
  note?: string;

  purchase_date?: string;
  quantity_purchased?: number;
  needs_repurchase?: boolean;
  daily_usage?: number;
  unit?: ProductUnit;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name: string;
  category: ProductCategory;
  brand?: string;
  note?: string;

  purchase_date?: string;
  quantity_purchased?: number;
  daily_usage?: number;
  unit?: ProductUnit;
}