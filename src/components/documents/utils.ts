import type { GroupedProduct } from "./ProductCard";

export interface OrderItem {
  id: string;
  product_title: string;
  variant_title: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  order_number: number;
  status: string;
  total_price: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
}

/**
 * Groups order items by product_title, collecting sizes and quantities
 * into a size-bar friendly structure.
 */
export function groupOrderItems(items: OrderItem[]): GroupedProduct[] {
  const groups: Record<string, GroupedProduct> = {};

  for (const item of items) {
    const key = item.product_title;

    if (!groups[key]) {
      groups[key] = {
        productTitle: item.product_title,
        imageUrl: item.image_url,
        sku: item.sku,
        unitPrice: item.unit_price,
        totalPcs: 0,
        totalEur: 0,
        sizes: {},
      };
    }

    const group = groups[key];
    group.totalPcs += item.quantity;
    group.totalEur += item.total_price;

    // Extract size from variant_title (e.g. "41", "42", "Size / 42", etc.)
    const sizeStr = extractSize(item.variant_title);
    if (sizeStr) {
      group.sizes[sizeStr] = (group.sizes[sizeStr] || 0) + item.quantity;
    }
  }

  return Object.values(groups);
}

/**
 * Extract a numeric shoe size from variant_title.
 * Handles formats like "41", "Size: 42", "42 / Black", "EU 43", etc.
 */
function extractSize(variantTitle: string | null): string | null {
  if (!variantTitle || variantTitle === "Default Title") return null;
  // Find a number between 35 and 50 (shoe size range)
  const match = variantTitle.match(/\b(3[5-9]|4[0-9]|50)\b/);
  return match ? match[1] : variantTitle;
}

/**
 * Format a date string to Dutch locale
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a date string for English documents
 */
export function formatDateEn(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Calculate due date (14 days from order date)
 */
export function getDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 14);
  return formatDateEn(date.toISOString());
}
