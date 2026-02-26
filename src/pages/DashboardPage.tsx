import { useState, useEffect, useMemo } from "react";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Search, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
      if (!variant) continue;

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
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Productcatalogus</h1>
            <p className="text-sm text-muted-foreground">{products.length} producten beschikbaar</p>
          </div>
        </div>
        <div className="relative">
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
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Product</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Prijs</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Beschikbaar</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aantal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const variant = product.node.variants.edges[0]?.node;
                  if (!variant) return null;
                  const imageUrl = product.node.images.edges[0]?.node.url;

                  return (
                    <tr key={product.node.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={product.node.title}
                              className="w-10 h-10 rounded-md object-cover bg-muted"
                            />
                          )}
                          <span className="font-medium text-sm text-foreground">{product.node.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-foreground">
                          {variant.price.currencyCode} {parseFloat(variant.price.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${variant.availableForSale ? "text-success" : "text-destructive"}`}>
                          {variant.availableForSale ? "Op voorraad" : "Uitverkocht"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(variant.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            value={quantities[variant.id] || 0}
                            onChange={(e) => setQty(variant.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(variant.id, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
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
              <span className="font-semibold text-foreground">{selectedItems.length}</span> product(en) geselecteerd
            </p>
            <Button onClick={handleAddToCart} className="wholesale-gradient border-0" disabled={cartLoading}>
              {cartLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              Voeg selectie toe aan winkelwagen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
