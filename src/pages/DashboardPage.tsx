import { useState, useEffect, useMemo } from "react";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Search, Plus, Minus, ShoppingCart, Loader2, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (amount: string | number) => {
  return parseFloat(String(amount)).toFixed(2);
};

const DashboardPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchShopifyProducts(50)
      .then(setProducts)
      .catch(() => toast({ title: "Fout", description: "Kon producten niet laden.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.node.title.toLowerCase().includes(search.toLowerCase()) ||
        p.node.handle.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  const setQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);

  const handleAddToCart = async () => {
    for (const [variantId, qty] of selectedItems) {
      const product = products.find((p) =>
        p.node.variants.edges.some((v) => v.node.id === variantId)
      );
      if (!product) continue;
      const variant = product.node.variants.edges.find((v) => v.node.id === variantId)?.node;
      if (!variant || !variant.availableForSale) continue;

      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: qty,
        selectedOptions: variant.selectedOptions || [],
      });
    }
    setQuantities({});
    toast({ title: `${selectedItems.length} product(en) toegevoegd`, description: "Items zijn aan je winkelwagen toegevoegd." });
  };

  // Stats
  const totalProducts = products.length;
  const inStock = products.filter(p => p.node.variants.edges[0]?.node.availableForSale).length;
  const outOfStock = totalProducts - inStock;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b bg-card px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground text-uppercase-tracking">Catalogus</h1>
            <p className="text-sm text-muted-foreground mt-1">Bekijk prijzen, marges en voorraad</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border px-3 py-1.5">
              <Package className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{totalProducts}</span> producten
            </div>
            <div className="flex items-center gap-2 text-sm text-success border border-border px-3 py-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-medium">{inStock}</span> op voorraad
            </div>
            {outOfStock > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive border border-border px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">{outOfStock}</span> uitverkocht
              </div>
            )}
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op productnaam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Geen producten gevonden</div>
        ) : (
          <div className="bg-card border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-3 w-[35%]">Product</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-3">Inkoopprijs</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-3">Verkoopprijs</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-3">Marge</th>
                  <th className="text-center text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-3">Voorraad</th>
                  <th className="text-center text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-3 w-[160px]">Aantal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const variant = product.node.variants.edges[0]?.node;
                  if (!variant) return null;

                  const imageUrl = product.node.images.edges[0]?.node.url;
                  const inkoopprijs = parseFloat(variant.price.amount);
                  const verkoopprijs = variant.compareAtPrice ? parseFloat(variant.compareAtPrice.amount) : null;
                  const marge = verkoopprijs ? ((verkoopprijs - inkoopprijs) / verkoopprijs * 100) : null;
                  const stock = variant.quantityAvailable;
                  const isAvailable = variant.availableForSale;
                  const qty = quantities[variant.id] || 0;

                  return (
                    <tr
                      key={product.node.id}
                      className={`border-b last:border-b-0 transition-colors ${
                        isAvailable ? "hover:bg-muted/30" : "opacity-50 bg-muted/10"
                      } ${qty > 0 ? "bg-primary/[0.03]" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted flex-shrink-0 overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.node.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-sm text-foreground block truncate">{product.node.title}</span>
                            {variant.title !== "Default Title" && (
                              <span className="text-xs text-muted-foreground">{variant.title}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-foreground">
                          €{formatPrice(inkoopprijs)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {verkoopprijs ? (
                          <span className="text-sm text-muted-foreground">
                            €{formatPrice(verkoopprijs)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {marge !== null ? (
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs ${
                              marge >= 40
                                ? "border-success/30 text-success"
                                : marge >= 20
                                ? "border-warning/30 text-warning"
                                : "border-destructive/30 text-destructive"
                            }`}
                          >
                            {marge.toFixed(0)}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!isAvailable ? (
                          <Badge variant="destructive" className="text-[10px] font-semibold text-uppercase-tracking">
                            Uitverkocht
                          </Badge>
                        ) : stock !== null && stock !== undefined ? (
                          <span className={`text-sm font-mono font-medium ${
                            stock <= 5 ? "text-warning" : "text-foreground"
                          }`}>
                            {stock}
                          </span>
                        ) : (
                          <span className="text-sm text-success">✓</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isAvailable ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQty(variant.id, -1)}
                              disabled={qty === 0}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={stock ?? undefined}
                              value={qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const max = stock ?? Infinity;
                                setQty(variant.id, Math.min(val, max));
                              }}
                              className="w-14 h-7 text-center text-sm font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                const max = stock ?? Infinity;
                                if (qty < max) updateQty(variant.id, 1);
                              }}
                              disabled={stock !== null && stock !== undefined && qty >= stock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground text-center block">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating action bar */}
      {selectedItems.length > 0 && (
        <div className="border-t bg-card px-6 py-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedItems.length}</span> product(en) ·{" "}
              <span className="font-semibold text-foreground">
                {selectedItems.reduce((sum, [, q]) => sum + q, 0)}
              </span>{" "}
              stuks geselecteerd
            </p>
            <Button onClick={handleAddToCart} className="wholesale-gradient border-0 text-primary-foreground" disabled={cartLoading}>
              {cartLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              Toevoegen aan winkelwagen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
