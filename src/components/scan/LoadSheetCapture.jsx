export default function LoadSheetCapture({ objectUrl, onBack }) {
  return (
    <div className="viewfinder" id="scanViewfinder">
      {objectUrl ? (
        <img id="scanSheetPreview" className="scan-sheet-preview" src={objectUrl} alt="Load sheet" style={{ display: 'block' }} />
      ) : (
        <div className="bol-mock">
          <div className="bh">MASTER UNIFORM STRAIGHT BILL OF LADING — UNITED ROAD</div>
          <div className="bm">CARRIER: United Road · ORIGIN: BNSF ORILLIA – RENTON WA · LOAD: 041625-09</div>
          <div className="bcols"><span>VIN#</span><span>MODEL</span><span>DEALER</span><span>LOC</span></div>
          <div className="brow"><span className="bv">4T1G11AK8PU123481</span><span>CAMRY XSE V6</span><span>05210-WA</span><span className="bl">T042</span></div>
          <div className="brow"><span className="bv">2T3P1RFV8PW847263</span><span>RAV4 XLE PREM</span><span>05210-WA</span><span className="bl">T043</span></div>
          <div className="brow"><span className="bv">3TMLB5JN3SM178449</span><span>TACOMA TRD 4X4</span><span>05318-WA</span><span className="bl">T071</span></div>
          <div className="brow" style={{ borderBottom: 'none' }}><span style={{ color: '#888' }}>+ 6 more VINs…</span></div>
        </div>
      )}
      <div className="scan-frame">
        <div className="sc tl" /><div className="sc tr" /><div className="sc bl" /><div className="sc br" />
        <div className="scan-line" />
      </div>
    </div>
  );
}
