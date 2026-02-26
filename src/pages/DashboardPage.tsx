import { useState, useEffect, useMemo } from "react";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Search, Plus, Minus, ShoppingCart, Loader2, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: string | number) => parseFloat(String(n)).toFixed(2);

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
    () => products.filter((p) =>
      p.node.title.toLowerCase().includes(search.toLowerCase()) ||
      p.node.handle.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search]
  );

  const setQty = (id: string, val: number, max?: number | null) => {
    const clamped = max != null ? Math.min(Math.max(0, val), max) : Math.max(0, val);
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
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

  const totalProducts = products.length;
  const inStock = products.filter(p => p.node.variants.edges.some(v => v.node.availableForSale)).length;
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
            <p className="text-sm text-muted-foreground mt-1">Bekijk prijzen, marges en voorraad per maat</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border px-3 py-1.5">
              <Package className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{totalProducts}</span> producten
            </div>
            <div className="flex items-center gap-2 text-sm border border-border px-3 py-1.5 text-success">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-medium">{inStock}</span> op voorraad
            </div>
            {outOfStock > 0 && (
              <div className="flex items-center gap-2 text-sm border border-border px-3 py-1.5 text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">{outOfStock}</span> uitverkocht
              </div>
            )}
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Zoek op productnaam..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Geen producten gevonden</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((product) => {
              const variants = product.node.variants.edges;
              const imageUrl = product.node.images.edges[0]?.node.url;
              const anyAvailable = variants.some(v => v.node.availableForSale);
              const selectedCount = variants.filter(v => (quantities[v.node.id] || 0) > 0).length;
              const totalQty = variants.reduce((s, v) => s + (quantities[v.node.id] || 0), 0);

              return (
                <div key={product.node.id} className={`bg-card border overflow-hidden ${!anyAvailable ? "opacity-50" : ""}`}>
                  {/* Product header */}
                  <div className="flex items-center gap-4 px-5 py-4 border-b bg-muted/20">
                    <div className="w-12 h-12 bg-muted flex-shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.node.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{product.node.title}</h3>
                      <p className="text-xs text-muted-foreground">{variants.length} {variants.length === 1 ? "variant" : "maten"}</p>
                    </div>
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {totalQty} stuks in {selectedCount} {selectedCount === 1 ? "maat" : "maten"}
                      </Badge>
                    )}
                  </div>

                  {/* Size grid */}
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-5 py-2 w-[25%]">Maat</th>
                        <th className="text-right text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-2">Inkoopprijs</th>
                        <th className="text-right text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-2">Adviesprijs</th>
                        <th className="text-right text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-2">Marge</th>
                        <th className="text-center text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-2">Voorraad</th>
                        <th className="text-center text-[10px] font-semibold text-muted-foreground text-uppercase-tracking px-4 py-2 w-[150px]">Aantal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map(({ node: v }) => {
                        const inkoop = parseFloat(v.price.amount);
                        const verkoop = v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null;
                        const marge = verkoop ? ((verkoop - inkoop) / verkoop * 100) : null;
                        const qty = quantities[v.id] || 0;
                        const stock = v.quantityAvailable;
                        const hasStock = stock != null;
                        const isAvailable = v.availableForSale;
                        const sizeLabel = v.selectedOptions.map(o => o.value).join(" / ");

                        return (
                          <tr
                            key={v.id}
                            className={`border-b last:border-b-0 transition-colors ${
                              isAvailable ? "hover:bg-muted/20" : "opacity-40 bg-muted/5"
                            } ${qty > 0 ? "bg-primary/[0.03]" : ""}`}
                          >
                            <td className="px-5 py-2.5">
                              <Badge variant={isAvailable ? "outline" : "secondary"} className="text-xs font-medium">
                                {sizeLabel || v.title}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <span className="text-sm font-semibold text-foreground">€{fmt(inkoop)}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {verkoop ? (
                                <span className="text-sm text-muted-foreground">€{fmt(verkoop)}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {marge !== null ? (
                                <Badge
                                  variant="outline"
                                  className={`font-mono text-xs ${
                                    marge >= 40 ? "border-success/30 text-success"
                                    : marge >= 20 ? "border-warning/30 text-warning"
                                    : "border-destructive/30 text-destructive"
                                  }`}
                                >
                                  {marge.toFixed(0)}%
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {!isAvailable ? (
                                <Badge variant="destructive" className="text-[10px] font-semibold text-uppercase-tracking">
                                  Uitverkocht
                                </Badge>
                              ) : hasStock ? (
                                <span className={`text-sm font-mono font-medium ${
                                  stock <= 5 ? "text-warning" : "text-foreground"
                                }`}>
                                  {stock}
                                </span>
                              ) : (
                                <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                                  Op voorraad
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {isAvailable ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setQty(v.id, qty - 1, hasStock ? stock : null)}
                                    disabled={qty === 0}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={hasStock ? stock : undefined}
                                    value={qty}
                                    onChange={(e) => setQty(v.id, parseInt(e.target.value) || 0, hasStock ? stock : null)}
                                    className="w-14 h-7 text-center text-sm font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setQty(v.id, qty + 1, hasStock ? stock : null)}
                                    disabled={hasStock && qty >= stock}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Floating action bar */}
      {selectedItems.length > 0 && (
        <div className="border-t bg-card px-6 py-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedItems.length}</span> variant(en) ·{" "}
              <span className="font-semibold text-foreground">{selectedItems.reduce((s, [, q]) => s + q, 0)}</span> stuks
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
