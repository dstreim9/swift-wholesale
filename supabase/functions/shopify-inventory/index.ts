import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE = "streim.myshopify.com";
const API_VERSION = "2025-01";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing Shopify token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all products with inventory data (paginated)
    const inventory: Record<string, number> = {};
    let pageInfo: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = pageInfo
        ? pageInfo
        : `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/products.json?limit=250&fields=id,variants`;

      const res = await fetch(url, {
        headers: { "X-Shopify-Access-Token": token },
      });

      if (!res.ok) {
        const text = await res.text();
        return new Response(JSON.stringify({ error: `Shopify API error: ${res.status}`, details: text }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await res.json();

      for (const product of data.products || []) {
        for (const variant of product.variants || []) {
          const gid = `gid://shopify/ProductVariant/${variant.id}`;
          inventory[gid] = variant.inventory_quantity ?? 0;
        }
      }

      // Check for next page
      const linkHeader = res.headers.get("link");
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        pageInfo = match ? match[1] : null;
        hasMore = !!pageInfo;
      } else {
        hasMore = false;
      }
    }

    return new Response(JSON.stringify({ inventory }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
