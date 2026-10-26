/** Static, locally rendered trust cues; no image, icon or animation dependency. */
export function FreeBadge() {
  return <span className="free-badge">
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path d="m6.5 10 2.2 2.2 4.8-5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span>Free Forever - No Credit Card Required</span>
  </span>;
}

export default function SiteBenefits({ showMobileBadge = true }: { showMobileBadge?: boolean }) {
  return <div className="site-benefits">
    {showMobileBadge && <div className="benefits-mobile-badge"><FreeBadge /></div>}
    <ul className="benefits-list" aria-label="Calculator benefits">
      <li>
        <span className="benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" focusable="false"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>
        </span>
        <span>100% Free</span>
      </li>
      <li>
        <span className="benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" focusable="false"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" /></svg>
        </span>
        <a href="/privacy.html" title="Calculations run locally in your browser. Read our privacy policy.">Private &amp; Secure</a>
      </li>
      <li>
        <span className="benefit-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" focusable="false"><path d="m13 2-9 12h7l-1 8 10-13h-7z" /></svg>
        </span>
        <span>Instant Results</span>
      </li>
    </ul>
  </div>;
}
