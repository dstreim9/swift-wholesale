const ALL_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];

interface SizeBarProps {
  sizes: Record<string, number>; // e.g. { "41": 1, "42": 2, "43": 2 }
}

const SizeBar = ({ sizes }: SizeBarProps) => (
  <div className="bg-[#f7f8fa] px-4 py-2.5 border-t border-[#e8eaee] print:py-2">
    <table className="w-full border-collapse">
      <tbody>
        <tr>
          <td className="text-left font-bold text-[#888] text-[10px] uppercase tracking-wider w-10 pr-2">Size</td>
          {ALL_SIZES.map((sz) => (
            <td key={sz} className="text-center font-bold text-[#555] text-[11px] min-w-[28px] py-1">
              {sz}
            </td>
          ))}
        </tr>
        <tr>
          <td className="text-left font-bold text-[#888] text-[10px] uppercase tracking-wider w-10 pr-2">Qty</td>
          {ALL_SIZES.map((sz) => {
            const qty = sizes[String(sz)];
            return (
              <td
                key={sz}
                className={`text-center text-[13px] font-bold min-w-[28px] py-1 ${
                  qty ? "text-[#1a5fb4] bg-[#e8f0fe] rounded" : "text-[#ccc] font-normal"
                }`}
              >
                {qty || "–"}
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  </div>
);

export default SizeBar;
