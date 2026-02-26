import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "In afwachting", color: "bg-warning/10 text-warning", icon: Clock },
  confirmed: { label: "Bevestigd", color: "bg-success/10 text-success", icon: CheckCircle },
  shipped: { label: "Verzonden", color: "bg-primary/10 text-primary", icon: Truck },
  delivered: { label: "Afgeleverd", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "Geannuleerd", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  const toggleOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
    }
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
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Bestelgeschiedenis</h1>
        <p className="text-sm text-muted-foreground">{orders.length} bestelling(en)</p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nog geen bestellingen</p>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-card rounded-lg border overflow-hidden">
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Order #{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">€{parseFloat(order.total_price).toFixed(2)}</span>
                    <Badge className={`${status.color} border-0 gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 py-3 space-y-2 animate-fade-in">
                    {orderItems[order.id]?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.product_title} className="w-10 h-10 rounded object-cover bg-muted" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.product_title}</p>
                          {item.variant_title && item.variant_title !== "Default Title" && (
                            <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{item.quantity}x</span>
                        <span className="text-sm font-medium text-foreground">€{parseFloat(item.total_price).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Opmerkingen: {order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
