import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Navigate, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ChevronUp, CheckCircle, Clock, Truck, XCircle, Package, FileText } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "In afwachting" },
  { value: "confirmed", label: "Bevestigd" },
  { value: "shipped", label: "Verzonden" },
  { value: "delivered", label: "Afgeleverd" },
  { value: "cancelled", label: "Geannuleerd" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "In afwachting", color: "bg-orange-50 text-[#e65100]", icon: Clock },
  confirmed: { label: "Bevestigd", color: "bg-[#f0faf0] text-success", icon: CheckCircle },
  shipped: { label: "Verzonden", color: "bg-[#e8f0fe] text-primary", icon: Truck },
  delivered: { label: "Afgeleverd", color: "bg-[#f0faf0] text-success", icon: CheckCircle },
  cancelled: { label: "Geannuleerd", color: "bg-red-50 text-destructive", icon: XCircle },
};

const AdminOrdersPage = () => {
  const navigate = useNavigate();
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

  if (authLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-white border-b border-[#e2e5ea] px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-wide">Orderbeheer</h1>
        <p className="text-sm text-[#888]">{orders.length} bestelling(en)</p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-[#888]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nog geen bestellingen</p>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-white rounded-[10px] border border-[#e2e5ea] shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#f7f8fa] transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Order #{order.order_number} — {order.company_name || order.email}
                    </p>
                    <p className="text-xs text-[#888]">
                      {order.contact_name} • {new Date(order.created_at).toLocaleDateString("nl-NL")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">€{parseFloat(order.total_price).toFixed(2)}</span>
                    <Badge className={`${status.color} border-0 gap-1 rounded-md font-semibold text-[11px]`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#888]" /> : <ChevronDown className="w-4 h-4 text-[#888]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#e2e5ea] px-5 py-4 space-y-4 animate-fade-in">
                    {/* Order items */}
                    <div className="space-y-2">
                      {orderItems[order.id]?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 px-3 bg-[#f7f8fa] rounded-lg">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.product_title} className="w-10 h-10 rounded-lg object-cover bg-[#f5f5f5]" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product_title}</p>
                            {item.variant_title && item.variant_title !== "Default Title" && (
                              <p className="text-xs text-[#888]">{item.variant_title}</p>
                            )}
                          </div>
                          <span className="text-sm text-[#888]">{item.quantity}x €{parseFloat(item.unit_price).toFixed(2)}</span>
                          <span className="text-sm font-semibold text-primary">€{parseFloat(item.total_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer info */}
                    <div className="bg-[#f7f8fa] rounded-lg p-4">
                      <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Klantgegevens</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-[#888] text-xs font-semibold">E-mail:</span> <span className="font-medium">{order.email}</span></div>
                        <div><span className="text-[#888] text-xs font-semibold">Telefoon:</span> <span className="font-medium">{order.phone || "-"}</span></div>
                        <div className="col-span-2"><span className="text-[#888] text-xs font-semibold">Adres:</span> <span className="font-medium">{order.shipping_address}, {order.shipping_postal_code} {order.shipping_city}</span></div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="bg-orange-50 border border-[#e65100]/10 rounded-lg p-3 text-sm">
                        <span className="text-[#e65100] font-semibold text-xs">Klant opmerking:</span>
                        <p className="text-foreground mt-0.5">{order.notes}</p>
                      </div>
                    )}

                    {/* Document buttons */}
                    <div className="border-t border-[#e8eaee] pt-3">
                      <Button
                        size="sm"
                        className="wholesale-gradient border-0 rounded-lg gap-1.5"
                        onClick={() => navigate(`/admin/orders/${order.id}/documents`)}
                      >
                        <FileText className="w-4 h-4" />
                        Documenten (Factuur / Order Confirmation)
                      </Button>
                    </div>

                    {/* Admin controls */}
                    <div className="bg-[#f7f8fa] rounded-lg p-4 space-y-3">
                      <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Admin Controls</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#555]">Status:</span>
                        <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                          <SelectTrigger className="w-48 border-[#e2e5ea] rounded-lg bg-white">
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
                        className="text-sm border-[#e2e5ea] rounded-lg bg-white"
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
