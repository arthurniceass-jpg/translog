/**
 * Ícones SVG de traço (estilo linha), desenhados à mão em paths.
 * Uso: <Icon name="truck" /> — herda a cor do texto (currentColor).
 */
const PATHS = {
  home: (
    <>
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="8" r="3.2" />
      <path d="M19 20v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
      <path d="M15.5 5.1a3.2 3.2 0 0 1 0 6" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4 2.4 17.5A1.6 1.6 0 0 0 3.8 20h16.4a1.6 1.6 0 0 0 1.4-2.5L13.7 4a1.6 1.6 0 0 0-2.8 0z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="12" width="3" height="5" />
      <rect x="12" y="8" width="3" height="9" />
      <rect x="17" y="14" width="3" height="3" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <polyline points="12 7.5 12 12 15 13.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M22 12h-5l-2 3H9l-2-3H2" />
      <path d="M5.5 5.5 2 12v6a1.5 1.5 0 0 0 1.5 1.5h17A1.5 1.5 0 0 0 22 18v-6l-3.5-6.5A1.5 1.5 0 0 0 17.2 5H6.8a1.5 1.5 0 0 0-1.3.5z" />
    </>
  ),
  tool: (
    <>
      <path d="M14.5 6.5a4 4 0 0 0-5.3 5.1L4 17v3h3l5.4-5.2a4 4 0 0 0 5.1-5.3l-2.4 2.4-2.1-.6-.6-2.1z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </>
  ),
  login: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
};

export function Icon({ name, size = 20, className = "", strokeWidth = 1.8 }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}
