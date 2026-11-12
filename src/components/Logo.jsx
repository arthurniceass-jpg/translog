/**
 * Logo do TransLog: ícone de caminhão em quadrado azul + nome.
 * `onDark` inverte as cores para uso sobre fundo azul/escuro.
 */
export function Logo({ onDark = false }) {
  const fundo = onDark ? "#ffffff" : "var(--primary)";
  const traco = onDark ? "var(--primary-dark)" : "#ffffff";

  return (
    <div className="logo">
      <svg className="logo-mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={fundo} />
        <path d="M6 11h12v10H6zM18 14h4.5l3.5 3.5V21H18z" fill={traco} />
        <circle cx="11" cy="22" r="2.4" fill={fundo} stroke={traco} strokeWidth="1.6" />
        <circle cx="22" cy="22" r="2.4" fill={fundo} stroke={traco} strokeWidth="1.6" />
      </svg>
      <span className={"logo-text" + (onDark ? " on-dark" : "")}>
        Trans<span>Log</span>
      </span>
    </div>
  );
}
