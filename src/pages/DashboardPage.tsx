import { useState, useEffect, useMemo } from "react";
import { fetchProducts, type ShopifyProduct } from "@/services/shopifyService";
import { useCartStore } from "@/stores/cartStore";
import { Search, Filter, Plus, Minus, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DashboardPage = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem, toggleCart, totalItems } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === "all" || p.category === category;
        return matchSearch && matchCategory;
      }),
    [products, search, category]
  );

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const setQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);

  const handleAddToCart = () => {
    let added = 0;
    selectedItems.forEach(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      if (product) {
        addItem(product, qty);
        added++;
      }
    });
    setQuantities({});
    toast({
      title: `${added} product(en) toegevoegd`,
      description: "Items zijn aan je winkelwagen toegevoegd.",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Productcatalogus</h1>
            <p className="text-sm text-muted-foreground">{products.length} producten beschikbaar</p>
          </div>
          <Button variant="outline" className="relative" onClick={toggleCart}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Winkelwagen
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-cart-bounce">
                {totalItems()}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op productnaam of SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "Alle categorieën" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Categorie</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Voorraad</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Retailprijs</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Wholesale</th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Aantal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-10 h-10 rounded-md object-cover bg-muted"
                      />
                      <span className="font-medium text-sm text-foreground">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{product.sku}</code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${product.inventory < 50 ? "text-destructive" : "text-success"}`}>
                      {product.inventory}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-muted-foreground line-through">
                      €{product.retailPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-foreground">
                      €{product.wholesalePrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQty(product.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        min={0}
                        value={quantities[product.id] || 0}
                        onChange={(e) => setQty(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQty(product.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating action bar */}
      {selectedItems.length > 0 && (
        <div className="border-t bg-card px-6 py-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedItems.length}</span> product(en) geselecteerd
            </p>
            <Button onClick={handleAddToCart} className="wholesale-gradient border-0">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Voeg selectie toe aan winkelwagen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
