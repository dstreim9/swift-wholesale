import DocumentHeader from "./DocumentHeader";
import DocumentFooter from "./DocumentFooter";
import ProductCard from "./ProductCard";
import { groupOrderItems, formatDateEn, getDueDate } from "./utils";
import type { Order, OrderItem } from "./utils";

interface InvoiceProps {
  order: Order;
  items: OrderItem[];
}

const Invoice = ({ order, items }: InvoiceProps) => {
  const grouped = groupOrderItems(items);
  const totalPcs = grouped.reduce((sum, g) => sum + g.totalPcs, 0);
  const subtotal = parseFloat(String(order.total_price));
  const btw = subtotal * 0.21;
  const totalIncl = subtotal + btw;
  const invoiceNumber = `F${new Date(order.created_at).getFullYear()}-${String(order.order_number).padStart(3, "0")}`;
  const dueDate = getDueDate(order.created_at);

  return (
    <div className="bg-white text-[#1a1a1a] font-[Helvetica_Neue,Helvetica,Arial,sans-serif] text-[13px] leading-relaxed max-w-[960px] mx-auto p-10 print:p-0 print:max-w-none">
      <DocumentHeader />

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#1a5fb4] tracking-[2px] uppercase mb-6 print:mb-5">
        Factuur / Invoice
      </h1>

      {/* Info row */}
      <div className="flex justify-between bg-[#f7f8fa] rounded-lg px-5 py-4 mb-7 print:mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Customer</p>
          <p className="text-[15px] font-bold">{order.company_name || "—"}</p>
          {order.contact_name && <p className="text-xs text-[#555]">{order.contact_name}</p>}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Invoice No.</p>
          <p className="text-[15px] font-bold">{invoiceNumber}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Date</p>
          <p className="text-[15px] font-bold">{formatDateEn(order.created_at)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-0.5">Payment Terms</p>
          <p className="text-[15px] font-bold">14 Days</p>
          <span className="inline-block bg-orange-50 text-orange-700 text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wide mt-1">
            Due: {dueDate}
          </span>
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
        <table className="w-[340px] bg-[#f7f8fa] rounded-lg overflow-hidden">
          <tbody>
            <tr className="text-[#555] border-b border-[#e8eaee]">
              <td className="py-2.5 px-4 text-[13px]">Subtotal (excl. 21% BTW)</td>
              <td className="py-2.5 px-4 text-right font-semibold">€ {subtotal.toFixed(2)}</td>
            </tr>
            <tr className="text-[#555] border-b border-[#e8eaee]">
              <td className="py-2.5 px-4 text-[13px]">BTW 21%</td>
              <td className="py-2.5 px-4 text-right font-semibold">€ {btw.toFixed(2)}</td>
            </tr>
            <tr className="bg-[#e8f0fe]">
              <td className="py-3 px-4 text-[17px] font-extrabold text-[#1a5fb4]">Totaal / Total</td>
              <td className="py-3 px-4 text-right text-[17px] font-extrabold text-[#1a5fb4]">€ {totalIncl.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment details */}
      <div className="mt-8 print:mt-5 print:break-inside-avoid">
        <h3 className="text-xs uppercase tracking-widest text-[#1a5fb4] font-bold mb-3">
          Payment Details
        </h3>
        <div className="flex gap-6">
          <div className="flex-1 bg-[#f7f8fa] rounded-lg px-5 py-4">
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-[#888] font-semibold">Bank</span>
              <span className="font-semibold">ABN Amro</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-[#888] font-semibold">Account holder</span>
              <span className="font-semibold">STREIM STUDIO B.V.</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-[#888] font-semibold">IBAN</span>
              <span className="font-semibold">NL20ABNA0110719298</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#888] font-semibold">SWIFT / BIC</span>
              <span className="font-semibold">ABNANL2A</span>
            </div>
          </div>
          <div className="flex-1 bg-[#f7f8fa] rounded-lg px-5 py-4">
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-[#888] font-semibold">Reference</span>
              <span className="font-semibold">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-[#888] font-semibold">Amount due</span>
              <span className="font-semibold text-[#1a5fb4] text-sm">€ {totalIncl.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#888] font-semibold">Due date</span>
              <span className="font-semibold text-orange-700">{dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      <DocumentFooter />

      <p className="text-center mt-5 text-[10px] text-[#bbb] tracking-wide">
        Please reference {invoiceNumber} with your payment.
      </p>
    </div>
  );
};

export default Invoice;
