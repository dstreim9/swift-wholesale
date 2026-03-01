import { useState, useEffect, useMemo } from "react";
import { fetchShopifyProducts, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Minus, ShoppingCart, Loader2, Package, TrendingUp, AlertTriangle, ChevronDown, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const fmt = (n: string | number) => parseFloat(String(n)).toFixed(2);

const DashboardPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lightboxImg, setLightboxImg] = useState<{ url: string; alt: string } | null>(null);
  const { addItem, isLoading: cartLoading, items: cartItems } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await fetchShopifyProducts(50);
        setProducts(prods);
      } catch {
        toast({ title: "Fout", description: "Kon producten niet laden.", variant: "destructive" });
      }
      try {
        const { data } = await supabase.functions.invoke("shopify-inventory");
        if (data?.inventory) setInventory(data.inventory);
      } catch {
        console.warn("Inventory fetch failed, using fallback");
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  const filtered = useMemo(
    () => products.filter((p) =>
      p.node.title.toLowerCase().includes(search.toLowerCase()) ||
      p.node.handle.toLowerCase().includes(search.toLowerCase())
    ),
    [products, search]
  );

  const getStock = (variantId: string) => {
    if (variantId in inventory) return inventory[variantId];
    return null;
  };

  const getMax = (variantId: string) => {
    const stock = getStock(variantId);
    if (stock == null) return 50; // fallback
    const inCart = cartItems.find(i => i.variantId === variantId)?.quantity || 0;
    return Math.max(0, stock - inCart);
  };

  const setQty = (id: string, val: number, max: number) => {
    const clamped = Math.min(Math.max(0, val), max);
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
  };

  const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);

  const handleAddToCart = async () => {
    for (const [variantId, qty] of selectedItems) {
      const product = products.find((p) => p.node.variants.edges.some((v) => v.node.id === variantId));
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e5ea] px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-wide">Catalogus</h1>
            <p className="text-sm text-[#888] mt-1">Bekijk prijzen, marges en voorraad per maat</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm bg-[#f7f8fa] rounded-lg px-3 py-2">
              <Package className="w-3.5 h-3.5 text-[#888]" />
              <span className="font-bold text-foreground">{totalProducts}</span>
              <span className="text-[#888]">producten</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-[#f0faf0] rounded-lg px-3 py-2 text-success">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-bold">{inStock}</span>
              <span>op voorraad</span>
            </div>
            {outOfStock > 0 && (
              <div className="flex items-center gap-2 text-sm bg-red-50 rounded-lg px-3 py-2 text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-bold">{outOfStock}</span>
                <span>uitverkocht</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <Input placeholder="Zoek op productnaam..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-[#e2e5ea] rounded-lg bg-[#f7f8fa]" />
        </div>
      </div>

      {/* Product Cards */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#888]">Geen producten gevonden</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => {
              const variants = product.node.variants.edges;
              const imageUrl = product.node.images.edges[0]?.node.url;
              const imageAlt = product.node.images.edges[0]?.node.altText || product.node.title;
              const anyAvailable = variants.some(v => {
                const stock = getStock(v.node.id);
                return v.node.availableForSale && (stock == null || stock > 0);
              });
              const isOpen = expanded[product.node.id] ?? false;
              const selectedCount = variants.filter(v => (quantities[v.node.id] || 0) > 0).length;
              const totalQty = variants.reduce((s, v) => s + (quantities[v.node.id] || 0), 0);
              const firstVariant = variants[0]?.node;
              const inkoop = firstVariant ? parseFloat(firstVariant.price.amount) : 0;

              return (
                <div key={product.node.id} className={`bg-white rounded-[10px] border border-[#e2e5ea] shadow-sm overflow-hidden transition-all ${!anyAvailable ? "opacity-50" : ""}`}>
                  {/* Collapsed product header */}
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#f7f8fa] transition-colors"
                    onClick={() => toggleExpand(product.node.id)}
                  >
                    {/* Image - clickable for lightbox */}
                    <div
                      className="w-12 h-12 bg-[#f5f5f5] rounded-lg flex-shrink-0 overflow-hidden cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (imageUrl) setLightboxImg({ url: imageUrl, alt: imageAlt });
                      }}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#ccc]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{product.node.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#888]">{variants.length} {variants.length === 1 ? "variant" : "maten"}</span>
                        <span className="text-xs text-[#ccc]">·</span>
                        <span className="text-xs font-medium text-primary">vanaf €{fmt(inkoop)}</span>
                        {!anyAvailable && (
                          <>
                            <span className="text-xs text-[#ccc]">·</span>
                            <span className="text-xs font-medium text-destructive">Uitverkocht</span>
                          </>
                        )}
                      </div>
                    </div>

                    {selectedCount > 0 && (
                      <Badge className="bg-[#e8f0fe] text-primary border-0 font-mono text-xs flex-shrink-0">
                        {totalQty}× in {selectedCount} {selectedCount === 1 ? "maat" : "maten"}
                      </Badge>
                    )}

                    <span className="text-[#888] flex-shrink-0">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </div>

                  {/* Expanded size table */}
                  {isOpen && (
                    <div className="border-t border-[#e2e5ea]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#f7f8fa]">
                            <th className="text-left streim-label px-5 py-2.5 w-[20%]">Maat</th>
                            <th className="text-right streim-label px-4 py-2.5">Inkoopprijs</th>
                            <th className="text-right streim-label px-4 py-2.5">Adviesprijs</th>
                            <th className="text-right streim-label px-4 py-2.5">Marge</th>
                            <th className="text-center streim-label px-4 py-2.5">Voorraad</th>
                            <th className="text-center streim-label px-4 py-2.5 w-[150px]">Aantal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map(({ node: v }) => {
                            const vInkoop = parseFloat(v.price.amount);
                            const verkoop = v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null;
                            const marge = verkoop ? ((verkoop - vInkoop) / verkoop * 100) : null;
                            const qty = quantities[v.id] || 0;
                            const stock = getStock(v.id);
                            const hasStock = stock != null;
                            const isAvailable = v.availableForSale && (stock == null || stock > 0);
                            const max = getMax(v.id);
                            const sizeLabel = v.selectedOptions.map(o => o.value).join(" / ");

                            return (
                              <tr
                                key={v.id}
                                className={`border-b border-[#e8eaee] last:border-b-0 transition-colors ${
                                  isAvailable ? "hover:bg-[#f7f8fa]" : "opacity-40 bg-[#fafafa]"
                                } ${qty > 0 ? "bg-[#e8f0fe]" : ""}`}
                              >
                                <td className="px-5 py-2.5">
                                  <Badge variant={isAvailable ? "outline" : "secondary"} className={`text-xs font-medium ${isAvailable ? "border-[#e2e5ea]" : ""}`}>
                                    {sizeLabel || v.title}
                                  </Badge>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <span className="text-sm font-semibold text-foreground">€{fmt(vInkoop)}</span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  {verkoop ? <span className="text-sm text-[#555]">€{fmt(verkoop)}</span> : <span className="text-xs text-[#888]">—</span>}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  {marge !== null ? (
                                    <Badge variant="outline" className={`font-mono text-xs ${marge >= 40 ? "border-success/30 text-success" : marge >= 20 ? "border-warning/30 text-warning" : "border-destructive/30 text-destructive"}`}>
                                      {marge.toFixed(0)}%
                                    </Badge>
                                  ) : <span className="text-xs text-[#888]">—</span>}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  {!isAvailable ? (
                                    <Badge variant="destructive" className="text-[10px] font-semibold text-uppercase-tracking">Uitverkocht</Badge>
                                  ) : hasStock ? (
                                    <span className={`text-sm font-mono font-medium ${stock! <= 5 ? "text-warning" : "text-foreground"}`}>{stock}</span>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] border-success/30 text-success">Op voorraad</Badge>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  {isAvailable ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-[#e2e5ea]" onClick={() => setQty(v.id, qty - 1, max)} disabled={qty === 0}>
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={max}
                                        value={qty}
                                        onChange={(e) => setQty(v.id, parseInt(e.target.value) || 0, max)}
                                        className="w-14 h-7 text-center text-sm font-mono rounded-md border-[#e2e5ea] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-[#e2e5ea]" onClick={() => setQty(v.id, qty + 1, max)} disabled={qty >= max}>
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : <span className="text-xs text-[#888] text-center block">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating action bar */}
      {selectedItems.length > 0 && (
        <div className="border-t border-[#e2e5ea] bg-white px-6 py-3 animate-fade-in shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#888]">
              <span className="font-semibold text-foreground">{selectedItems.length}</span> variant(en) ·{" "}
              <span className="font-semibold text-foreground">{selectedItems.reduce((s, [, q]) => s + q, 0)}</span> stuks
            </p>
            <Button onClick={handleAddToCart} className="wholesale-gradient border-0 text-white rounded-lg" disabled={cartLoading}>
              {cartLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              Toevoegen aan winkelwagen
            </Button>
          </div>
        </div>
      )}

      {/* Image lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
        <DialogContent className="max-w-3xl p-0 bg-white border border-[#e2e5ea] rounded-xl overflow-hidden">
          {lightboxImg && (
            <div className="relative">
              <img src={lightboxImg.url} alt={lightboxImg.alt} className="w-full h-auto max-h-[80vh] object-contain" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
                onClick={() => setLightboxImg(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
