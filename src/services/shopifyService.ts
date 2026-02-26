/**
 * Shopify Admin API Service
 * 
 * Dit bestand bevat de functies voor communicatie met de Shopify Admin API.
 * Vul hieronder je Shopify API credentials in wanneer je de koppeling maakt.
 * 
 * CONFIGURATIE:
 * - SHOPIFY_STORE_URL: bijv. "https://jouw-winkel.myshopify.com"
 * - SHOPIFY_ACCESS_TOKEN: Admin API access token (genereer via Shopify Admin > Apps > Develop Apps)
 * - API_VERSION: Shopify API versie, bijv. "2024-01"
 */

// TODO: Vervang deze waarden met je Shopify credentials
const SHOPIFY_CONFIG = {
  storeUrl: "", // bijv. "https://jouw-winkel.myshopify.com"
  accessToken: "", // Shopify Admin API access token
  apiVersion: "2024-01",
};

export interface ShopifyProduct {
  id: string;
  title: string;
  sku: string;
  image: string;
  retailPrice: number;
  wholesalePrice: number;
  inventory: number;
  category: string;
}

export interface DraftOrderLineItem {
  productId: string;
  quantity: number;
}

export interface DraftOrderResult {
  id: string;
  name: string;
  totalPrice: number;
  status: string;
}

/**
 * Haal producten op uit de Shopify catalogus.
 * 
 * TODO: Implementeer de daadwerkelijke Shopify API call:
 * GET /admin/api/{version}/products.json
 * 
 * Headers:
 *   X-Shopify-Access-Token: {accessToken}
 */
export async function fetchProducts(): Promise<ShopifyProduct[]> {
  // TODO: Vervang deze mock data met een echte API call naar Shopify
  // const response = await fetch(
  //   `${SHOPIFY_CONFIG.storeUrl}/admin/api/${SHOPIFY_CONFIG.apiVersion}/products.json`,
  //   {
  //     headers: {
  //       "X-Shopify-Access-Token": SHOPIFY_CONFIG.accessToken,
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
  // const data = await response.json();
  // return mapShopifyProducts(data.products);

  // Mock data - wordt vervangen door echte API data
  return Promise.resolve(getMockProducts());
}

/**
 * Maak een draft order aan in Shopify.
 * 
 * TODO: Implementeer de daadwerkelijke Shopify API call:
 * POST /admin/api/{version}/draft_orders.json
 * 
 * Body:
 * {
 *   "draft_order": {
 *     "line_items": [{ "variant_id": ..., "quantity": ... }],
 *     "customer": { "id": ... }
 *   }
 * }
 */
export async function createDraftOrder(
  lineItems: DraftOrderLineItem[],
  _customerId?: string
): Promise<DraftOrderResult> {
  // TODO: Vervang met echte Shopify API call
  // const response = await fetch(
  //   `${SHOPIFY_CONFIG.storeUrl}/admin/api/${SHOPIFY_CONFIG.apiVersion}/draft_orders.json`,
  //   {
  //     method: "POST",
  //     headers: {
  //       "X-Shopify-Access-Token": SHOPIFY_CONFIG.accessToken,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       draft_order: {
  //         line_items: lineItems.map((item) => ({
  //           variant_id: item.productId,
  //           quantity: item.quantity,
  //         })),
  //       },
  //     }),
  //   }
  // );
  // return await response.json();

  console.log("Draft order aangemaakt met items:", lineItems);
  
  return Promise.resolve({
    id: `draft_${Date.now()}`,
    name: `#D${Math.floor(Math.random() * 10000)}`,
    totalPrice: 0,
    status: "open",
  });
}

// ===== MOCK DATA =====

function getMockProducts(): ShopifyProduct[] {
  return [
    {
      id: "1",
      title: "Wireless Bluetooth Headphones Pro",
      sku: "WBH-PRO-001",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
      retailPrice: 149.99,
      wholesalePrice: 89.99,
      inventory: 250,
      category: "Audio",
    },
    {
      id: "2",
      title: "USB-C Docking Station 12-in-1",
      sku: "USB-DS-012",
      image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=80&h=80&fit=crop",
      retailPrice: 89.99,
      wholesalePrice: 53.99,
      inventory: 180,
      category: "Accessoires",
    },
    {
      id: "3",
      title: "Ergonomisch Draadloos Toetsenbord",
      sku: "EDK-WL-003",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop",
      retailPrice: 129.99,
      wholesalePrice: 77.99,
      inventory: 120,
      category: "Randapparatuur",
    },
    {
      id: "4",
      title: "27\" 4K IPS Monitor",
      sku: "MON-4K-027",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop",
      retailPrice: 449.99,
      wholesalePrice: 269.99,
      inventory: 45,
      category: "Monitors",
    },
    {
      id: "5",
      title: "Portable SSD 1TB USB 3.2",
      sku: "SSD-1TB-005",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=80&h=80&fit=crop",
      retailPrice: 109.99,
      wholesalePrice: 65.99,
      inventory: 320,
      category: "Opslag",
    },
    {
      id: "6",
      title: "Webcam 4K met Autofocus",
      sku: "WC-4K-006",
      image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&h=80&fit=crop",
      retailPrice: 79.99,
      wholesalePrice: 47.99,
      inventory: 200,
      category: "Accessoires",
    },
    {
      id: "7",
      title: "Noise Cancelling Earbuds",
      sku: "NCE-BT-007",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=80&h=80&fit=crop",
      retailPrice: 199.99,
      wholesalePrice: 119.99,
      inventory: 175,
      category: "Audio",
    },
    {
      id: "8",
      title: "Draadloze Gaming Muis",
      sku: "DGM-WL-008",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop",
      retailPrice: 69.99,
      wholesalePrice: 41.99,
      inventory: 290,
      category: "Randapparatuur",
    },
  ];
}
