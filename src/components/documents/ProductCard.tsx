import SizeBar from "./SizeBar";

export interface GroupedProduct {
  productTitle: string;
  imageUrl: string | null;
  sku: string | null;
  unitPrice: number;
  totalPcs: number;
  totalEur: number;
  sizes: Record<string, number>; // { "41": 1, "42": 2 }
}

interface ProductCardProps {
  product: GroupedProduct;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => (
  <div className="border border-[#e2e5ea] rounded-[10px] mb-4 overflow-hidden bg-white print:break-inside-avoid print:mb-3">
    {/* Top: Image + Details + Summary */}
    <div className="flex items-center px-4 py-3.5 gap-4">
      {/* Product image */}
      <div className="shrink-0 w-[120px] h-[90px] bg-[#f5f5f5] rounded-lg overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productTitle}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ccc] text-xs">
            No image
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[#1a5fb4] font-bold mb-0.5">
          #{index}
        </p>
        <p className="text-[15px] font-bold text-[#1a1a1a] truncate">
          {product.productTitle}
        </p>
        <p className="text-[11px] text-[#888] mt-1">
          {product.sku && (
            <>
              <span className="font-semibold text-[#666]">SKU:</span> {product.sku}
              <span className="mx-1.5 text-[#ccc]">•</span>
            </>
          )}
          <span className="font-semibold text-[#666]">Unit Price:</span> € {product.unitPrice.toFixed(2)}
        </p>
      </div>

      {/* Summary */}
      <div className="shrink-0 text-right flex flex-col gap-1">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-[#888] font-semibold">Pairs</span>
          <span className="text-[15px] font-bold text-[#1a1a1a]">{product.totalPcs}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-[#888] font-semibold">Total</span>
          <span className="text-[16px] font-bold text-[#1a5fb4]">€ {product.totalEur.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Size bar */}
    <SizeBar sizes={product.sizes} />
  </div>
);

export default ProductCard;
