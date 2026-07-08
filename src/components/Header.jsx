export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo">
          <svg className="logo__icon" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#2255E8" />
            <rect x="5" y="12" width="8" height="8.5" rx="1.5" fill="white" opacity="0.7" />
            <rect x="19" y="9" width="8" height="14" rx="1.5" fill="white" />
            <line x1="14" y1="14" x2="18" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="18" x2="18" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="logo__text">
            <span className="logo__name">Confrontino</span>
            <span className="logo__tagline">Schede tecniche a confronto</span>
          </div>
        </div>
        <p className="header-desc">
          Confronta smartphone, laptop e tablet incollando i dati tecnici.
          Scopri subito quale dispositivo eccelle in ogni caratteristica.
        </p>
      </div>
    </header>
  );
}
