const STREIM_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 100">
  <text x="0" y="80" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="90" font-weight="800" fill="#1a5fb4" letter-spacing="8">STREIM</text>
</svg>`)}`;

const DocumentHeader = () => (
  <div className="flex justify-between items-start mb-8 border-b-[2.5px] border-[#1a5fb4] pb-5 print:mb-6 print:pb-4">
    <div>
      <img src={STREIM_LOGO_SVG} alt="STREIM" className="h-12 print:h-10" />
      <p className="text-[10px] text-[#888] mt-1 tracking-widest uppercase">The Legacy</p>
    </div>
    <div className="text-right text-[11.5px] text-[#555] leading-relaxed">
      <p className="font-semibold text-[#1a1a1a] text-xs">STREIM STUDIO B.V.</p>
      <p>Keizersgracht 572</p>
      <p>1017 EM Amsterdam</p>
      <p>www.streim.nl</p>
      <p>daniel@streim.nl</p>
    </div>
  </div>
);

export default DocumentHeader;
