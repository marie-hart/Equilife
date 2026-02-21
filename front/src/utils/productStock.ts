import type { Product } from "@/types";

const STOCK_MANAGED_TYPES = ["Granulés", "Complément"];

export const isStockManaged = (product: Product) =>
  STOCK_MANAGED_TYPES.includes(product.category);

export const getEndDate = (product: Product): Date | null => {
  if (!isStockManaged(product)) return null;
  if (!product.purchase_date || !product.quantity_purchased || !product.daily_usage)
    return null;

  const start = new Date(product.purchase_date);
  const totalDays = product.quantity_purchased / product.daily_usage;

  const end = new Date(start);
  end.setDate(start.getDate() + totalDays);

  return end;
};

export const getRemainingDays = (product: Product): number | null => {
  const end = getEndDate(product);
  if (!end) return null;

  const diff = Math.ceil(
    (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff > 0 ? diff : 0;
};

export const getStockStatus = (
  product: Product
): "rupture" | "low" | "ok" | "manual" => {
  if (!isStockManaged(product)) return "manual";

  const remaining = getRemainingDays(product);
  if (remaining === null) return "ok";

  if (remaining <= 0) return "rupture";
  if (remaining <= 14) return "low";

  return "ok";
};