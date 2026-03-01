import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Printer, FileText, ClipboardCheck } from "lucide-react";
import OrderConfirmation from "@/components/documents/OrderConfirmation";
import Invoice from "@/components/documents/Invoice";
import type { Order, OrderItem } from "@/components/documents/utils";

type DocTab = "confirmation" | "invoice";

const OrderDocumentPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DocTab>("confirmation");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const [orderRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId!).single(),
      supabase.from("order_items").select("*").eq("order_id", orderId!),
    ]);
    if (orderRes.data) setOrder(orderRes.data as unknown as Order);
    if (itemsRes.data) setItems(itemsRes.data as unknown as OrderItem[]);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-[#888]">Order niet gevonden.</p>
        <Button variant="outline" className="border-[#e2e5ea] rounded-lg" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Terug
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar - hidden when printing */}
      <div className="bg-white border-b border-[#e2e5ea] px-6 py-3 flex items-center justify-between print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")} className="text-[#888] hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Terug
          </Button>
          <div className="h-6 w-px bg-[#e2e5ea]" />
          <h1 className="text-sm font-bold text-foreground">
            Order #{order.order_number} — <span className="text-primary">{order.company_name}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex bg-[#f7f8fa] rounded-lg p-0.5 mr-3 border border-[#e2e5ea]">
            <button
              onClick={() => setActiveTab("confirmation")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "confirmation"
                  ? "bg-white text-primary shadow-sm border border-[#e2e5ea]"
                  : "text-[#888] hover:text-foreground"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Order Confirmation
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "invoice"
                  ? "bg-white text-primary shadow-sm border border-[#e2e5ea]"
                  : "text-[#888] hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Factuur
            </button>
          </div>

          {/* Print button */}
          <Button size="sm" onClick={handlePrint} className="wholesale-gradient border-0 rounded-lg gap-1.5">
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Document preview */}
      <div className="flex-1 overflow-auto bg-[#f0f1f3] print:bg-white print:overflow-visible">
        <div
          ref={printRef}
          className="max-w-[960px] mx-auto my-8 bg-white shadow-lg rounded-xl print:shadow-none print:rounded-none print:my-0 print:max-w-none"
        >
          {activeTab === "confirmation" ? (
            <OrderConfirmation order={order} items={items} />
          ) : (
            <Invoice order={order} items={items} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDocumentPage;
