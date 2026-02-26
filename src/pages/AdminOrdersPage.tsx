import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ChevronUp, CheckCircle, Clock, Truck, XCircle, Package } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "In afwachting" },
  { value: "confirmed", label: "Bevestigd" },
  { value: "shipped", label: "Verzonden" },
  { value: "delivered", label: "Afgeleverd" },
  { value: "cancelled", label: "Geannuleerd" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "In afwachting", color: "bg-warning/10 text-warning", icon: Clock },
  confirmed: { label: "Bevestigd", color: "bg-success/10 text-success", icon: CheckCircle },
  shipped: { label: "Verzonden", color: "bg-primary/10 text-primary", icon: Truck },
  delivered: { label: "Afgeleverd", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "Geannuleerd", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const AdminOrdersPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

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

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", orderId);
    if (error) {
      toast({ title: "Fout", description: "Kon status niet bijwerken.", variant: "destructive" });
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast({ title: "Status bijgewerkt" });
    }
  };

  const updateAdminNotes = async (orderId: string, adminNotes: string) => {
    await supabase.from("orders").update({ admin_notes: adminNotes }).eq("id", orderId);
  };

  if (authLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Orderbeheer</h1>
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
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Order #{order.order_number} — {order.company_name || order.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.contact_name} • {new Date(order.created_at).toLocaleDateString("nl-NL")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">€{parseFloat(order.total_price).toFixed(2)}</span>
                    <Badge className={`${status.color} border-0 gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-4 animate-fade-in">
                    {/* Order items */}
                    <div className="space-y-2">
                      {orderItems[order.id]?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.product_title} className="w-10 h-10 rounded object-cover bg-muted" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product_title}</p>
                            {item.variant_title && item.variant_title !== "Default Title" && (
                              <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{item.quantity}x €{parseFloat(item.unit_price).toFixed(2)}</span>
                          <span className="text-sm font-medium">€{parseFloat(item.total_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer info */}
                    <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                      <div><span className="text-muted-foreground">E-mail:</span> {order.email}</div>
                      <div><span className="text-muted-foreground">Telefoon:</span> {order.phone || "-"}</div>
                      <div className="col-span-2"><span className="text-muted-foreground">Adres:</span> {order.shipping_address}, {order.shipping_postal_code} {order.shipping_city}</div>
                    </div>

                    {order.notes && (
                      <div className="text-sm border-t pt-3">
                        <span className="text-muted-foreground">Klant opmerking:</span> {order.notes}
                      </div>
                    )}

                    {/* Admin controls */}
                    <div className="border-t pt-3 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Status:</span>
                        <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Admin notities..."
                        defaultValue={order.admin_notes || ""}
                        onBlur={(e) => updateAdminNotes(order.id, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
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

export default AdminOrdersPage;
