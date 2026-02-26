import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { X, Trash2, Plus, Minus, AlertTriangle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const MINIMUM_ORDER_VALUE = 250;

const CartPanel = () => {
  const { items, isLoading, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const total = totalPrice();
  const meetsMinimum = total >= MINIMUM_ORDER_VALUE;

  const handlePlaceOrder = async () => {
    if (!meetsMinimum || !user) return;
    setPlacing(true);

    try {
      // Get profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending" as const,
          total_price: total,
          notes,
          company_name: profile?.company_name || "",
          contact_name: profile?.contact_name || "",
          email: profile?.email || user.email || "",
          phone: profile?.phone || "",
          shipping_address: profile?.address || "",
          shipping_city: profile?.city || "",
          shipping_postal_code: profile?.postal_code || "",
          shipping_country: profile?.country || "NL",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        shopify_product_id: item.product.node.id,
        shopify_variant_id: item.variantId,
        product_title: item.product.node.title,
        variant_title: item.variantTitle,
        quantity: item.quantity,
        unit_price: parseFloat(item.price.amount),
        total_price: parseFloat(item.price.amount) * item.quantity,
        image_url: item.product.node.images.edges[0]?.node.url || "",
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      toast({ title: "Bestelling geplaatst!", description: `Order #${order.order_number} is succesvol aangemaakt.` });
      clearCart();
      setIsOpen(false);
      setNotes("");
    } catch (err) {
      console.error(err);
      toast({ title: "Fout bij bestelling", description: "Er is iets misgegaan. Probeer het opnieuw.", variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      {/* Trigger button in header */}
      <Button variant="outline" className="relative" onClick={() => setIsOpen(true)}>
        <Package className="w-4 h-4 mr-2" />
        Winkelwagen
        {totalItems() > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-cart-bounce">
            {totalItems()}
          </span>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Winkelwagen ({items.length})
            </SheetTitle>
          </SheetHeader>

          {/* Items */}
          <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Je winkelwagen is leeg</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                  {item.product.node.images.edges[0]?.node && (
                    <img
                      src={item.product.node.images.edges[0].node.url}
                      alt={item.product.node.title}
                      className="w-12 h-12 rounded-md object-cover bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.node.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)} per stuk
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.price.currencyCode} {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                    </p>
                    <button onClick={() => removeItem(item.variantId)} className="text-destructive hover:text-destructive/80 transition-colors">
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
              <Textarea
                placeholder="Opmerkingen bij je bestelling..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm"
                rows={2}
              />

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
                <span className="text-sm text-muted-foreground">Totaal</span>
                <span className="text-xl font-bold text-foreground">€{total.toFixed(2)}</span>
              </div>

              <Button className="w-full wholesale-gradient border-0" disabled={!meetsMinimum || placing || isLoading} onClick={handlePlaceOrder}>
                {placing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Plaats Bestelling
              </Button>

              <Button variant="ghost" className="w-full text-sm" onClick={clearCart}>
                Winkelwagen legen
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CartPanel;
