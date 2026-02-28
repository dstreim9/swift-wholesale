const DocumentFooter = () => (
  <div className="border-t border-[#ddd] pt-4 mt-6 flex justify-between text-[10.5px] text-[#888] print:mt-4 print:pt-3">
    <div>
      <p><span className="font-bold text-[#555]">Bank:</span> ABN Amro</p>
      <p><span className="font-bold text-[#555]">IBAN:</span> NL20ABNA0110719298</p>
      <p><span className="font-bold text-[#555]">SWIFT:</span> ABNANL2A</p>
    </div>
    <div>
      <p><span className="font-bold text-[#555]">Reg. No.:</span> 85681563</p>
      <p><span className="font-bold text-[#555]">VAT ID:</span> NL863705832B01</p>
    </div>
    <div>
      <p className="font-bold text-[#555]">STREIM STUDIO B.V.</p>
      <p>Keizersgracht 572, 1017 EM Amsterdam</p>
    </div>
  </div>
);

export default DocumentFooter;
