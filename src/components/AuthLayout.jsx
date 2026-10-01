import { Logo } from "./Logo";

/** Casca das telas de autenticação: fundo navy + cartão branco centralizado. */
export function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-head">
          <Logo onDark={false} />
        </div>
        <h1 className="auth-title">{titulo}</h1>
        {subtitulo && <p className="auth-sub">{subtitulo}</p>}
        {children}
      </div>
    </div>
  );
}
