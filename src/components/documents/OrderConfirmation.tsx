import DocumentHeader from "./DocumentHeader";
import DocumentFooter from "./DocumentFooter";
import ProductCard from "./ProductCard";
import SignatureBlock from "./SignatureBlock";
import { groupOrderItems, formatDateEn } from "./utils";
import type { Order, OrderItem } from "./utils";

interface OrderConfirmationProps {
  order: Order;
  items: OrderItem[];
}

const OrderConfirmation = ({ order, items }: OrderConfirmationProps) => {
  const grouped = groupOrderItems(items);
  const totalPcs = grouped.reduce((sum, g) => sum + g.totalPcs, 0);
  const subtotal = parseFloat(String(order.total_price));
  const btw = subtotal * 0.21;
  const totalIncl = subtotal + btw;

  return (
    <div className="bg-white text-[#1a1a1a] font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[13px] leading-relaxed max-w-[960px] mx-auto p-10 print:p-0 print:max-w-none">
      <DocumentHeader />

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#1a5fb4] tracking-[2px] uppercase mb-6 print:mb-5">
        Order Confirmation
      </h1>

      {/* Info row */}
      <div className="flex justify-between bg-[#f7f8fa] rounded-lg px-5 py-4 mb-7 print:mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Customer</p>
          <p className="text-[15px] font-bold">{order.company_name || "—"}</p>
          {order.contact_name && <p className="text-xs text-[#555]">{order.contact_name}</p>}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Order No.</p>
          <p className="text-[15px] font-bold">F{new Date(order.created_at).getFullYear()}-{String(order.order_number).padStart(3, "0")}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Date</p>
          <p className="text-[15px] font-bold">{formatDateEn(order.created_at)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Total Pairs</p>
          <p className="text-[15px] font-bold">{totalPcs}</p>
        </div>
      </div>

      {/* Product cards */}
      {grouped.map((product, i) => (
        <ProductCard key={product.productTitle} product={product} index={i + 1} />
      ))}

      {/* Totals */}
      <div className="flex justify-end my-6 print:my-4">
        <table className="w-[320px]">
          <tbody>
            <tr className="text-[#555]">
              <td className="py-1.5 px-3 text-[13px]">Subtotal (excl. BTW)</td>
              <td className="py-1.5 px-3 text-right font-semibold">€ {subtotal.toFixed(2)}</td>
            </tr>
            <tr className="text-[#555]">
              <td className="py-1.5 px-3 text-[13px]">BTW 21%</td>
              <td className="py-1.5 px-3 text-right font-semibold">€ {btw.toFixed(2)}</td>
            </tr>
            <tr className="border-t-[2.5px] border-[#1a5fb4]">
              <td className="pt-3 px-3 text-[17px] font-extrabold text-[#1a5fb4]">Total (incl. BTW)</td>
              <td className="pt-3 px-3 text-right text-[17px] font-extrabold text-[#1a5fb4]">€ {totalIncl.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <SignatureBlock />

      {/* Terms */}
      <div className="bg-[#f7f8fa] rounded-lg px-5 py-4 mt-8 print:mt-6">
        <h3 className="text-[11px] uppercase tracking-widest text-[#1a5fb4] font-bold mb-2">
          Terms & Conditions
        </h3>
        <p className="text-[11.5px] text-[#555] mb-0.5">Payment due within 14 days of order confirmation date.</p>
        <p className="text-[11.5px] text-[#555] mb-0.5">Prices are wholesale (WHS) and quoted in EUR.</p>
        <p className="text-[11.5px] text-[#555]">Delivery subject to stock availability.</p>
      </div>

      <DocumentFooter />
    </div>
  );
};

export default OrderConfirmation;
