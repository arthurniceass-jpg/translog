/**
 * Logo do TransLog: marca (T estilizado com estrada) + wordmark.
 * `onDark` ajusta as cores do texto para fundos escuros (sidebar).
 */
export function Logo({ onDark = true }) {
  return (
    <div className="logo">
      <svg className="logo-mark" viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
        <defs>
          <linearGradient id="tl-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2b8bff" />
            <stop offset="1" stopColor="#0b1f44" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#tl-grad)" />
        {/* barra superior do T */}
        <path d="M11 14 L39 14 L35 20.5 L15 20.5 Z" fill="#fff" />
        {/* haste do T */}
        <path d="M22 20.5 L30 20.5 L26.5 37 L19.5 37 Z" fill="#fff" />
        {/* faixa da estrada */}
        <line x1="25" y1="23" x2="23.5" y2="35" stroke="#007BFF" strokeWidth="1.6" strokeDasharray="2.4 2.4" strokeLinecap="round" />
      </svg>
      <span className={"logo-text" + (onDark ? " on-dark" : "")}>
        Trans<b>Log</b>
        <small>Sistema de Transportes</small>
      </span>
    </div>
  );
}
