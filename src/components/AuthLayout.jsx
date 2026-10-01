import { Logo } from "./Logo";

/**
 * Casca das telas de autenticação (split-screen):
 * - esquerda: painel da marca (navy + slogan)  [some no celular]
 * - direita: cartão branco com o formulário
 */
export function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth-screen">
      {/* Painel da marca */}
      <aside className="auth-visual">
        <div className="auth-visual-top">
          <Logo onDark />
        </div>
        <div className="auth-visual-main">
          <p className="auth-eyebrow">Sua carga em boas mãos, sempre.</p>
          <h2 className="auth-hero">
            Transporte seguro,<br />ágil e <span className="grad">eficiente</span>.
          </h2>
          <p className="auth-hero-sub">
            A TransLog conecta destinos e impulsiona o seu negócio com
            soluções logísticas sob medida.
          </p>
        </div>
        <div className="auth-visual-foot">Movendo o seu mundo.</div>
      </aside>

      {/* Formulário */}
      <main className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-brand">
            <Logo onDark={false} />
          </div>
          <h1 className="auth-title">{titulo}</h1>
          {subtitulo && <p className="auth-sub">{subtitulo}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
