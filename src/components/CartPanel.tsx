import { useCartStore } from "@/stores/cartStore";
import { createDraftOrder } from "@/services/shopifyService";
import { X, Trash2, Plus, Minus, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MINIMUM_ORDER_VALUE = 250;

const CartPanel = () => {
  const { items, isOpen, setCartOpen, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const { toast } = useToast();
  const total = totalPrice();
  const meetsMinimum = total >= MINIMUM_ORDER_VALUE;

  const handlePlaceOrder = async () => {
    if (!meetsMinimum) return;

    const lineItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const result = await createDraftOrder(lineItems);
      toast({
        title: "Bestelling geplaatst!",
        description: `Order ${result.name} is succesvol aangemaakt.`,
      });
      clearCart();
      setCartOpen(false);
    } catch {
      toast({
        title: "Fout bij bestelling",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/20 z-40 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Winkelwagen</h2>
            <span className="text-sm text-muted-foreground">({items.length})</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Je winkelwagen is leeg</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background animate-fade-in"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-12 h-12 rounded-md object-cover bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.product.title}</p>
                  <p className="text-xs text-muted-foreground">€{item.product.wholesalePrice.toFixed(2)} per stuk</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-semibold text-foreground">
                    €{(item.product.wholesalePrice * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            {!meetsMinimum && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Minimale bestelwaarde niet bereikt</p>
                  <p className="text-xs text-muted-foreground">
                    Nog €{(MINIMUM_ORDER_VALUE - total).toFixed(2)} nodig (minimum €{MINIMUM_ORDER_VALUE.toFixed(2)})
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Totaal (wholesale)</span>
              <span className="text-xl font-bold text-foreground">€{total.toFixed(2)}</span>
            </div>

            <Button
              className="w-full wholesale-gradient border-0"
              disabled={!meetsMinimum}
              onClick={handlePlaceOrder}
            >
              Plaats Bestelling
            </Button>

            <Button variant="ghost" className="w-full text-sm" onClick={clearCart}>
              Winkelwagen legen
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
