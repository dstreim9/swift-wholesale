const SignatureBlock = () => (
  <div className="mt-10 flex gap-16 print:mt-8 print:break-inside-avoid">
    <div className="flex-1">
      <p className="text-[11px] uppercase tracking-widest text-[#888] font-semibold mb-16 print:mb-12">
        For and on behalf of STREIM STUDIO B.V.
      </p>
      <div className="border-b-[1.5px] border-[#1a1a1a] mb-1.5" />
      <p className="text-[11px] text-[#888]">Name / Signature / Date</p>
    </div>
    <div className="flex-1">
      <p className="text-[11px] uppercase tracking-widest text-[#888] font-semibold mb-16 print:mb-12">
        For and on behalf of the Buyer
      </p>
      <div className="border-b-[1.5px] border-[#1a1a1a] mb-1.5" />
      <p className="text-[11px] text-[#888]">Name / Signature / Date</p>
    </div>
  </div>
);

export default SignatureBlock;
