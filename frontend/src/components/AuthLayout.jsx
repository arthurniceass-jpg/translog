import { useEffect } from "react";
import { Logo } from "./Logo";

export function AuthLayout({ titulo, subtitulo, children }) {
  useEffect(() => {
    document.title = `${titulo} | TransLog`;
  }, [titulo]);

  return (
    <main className="auth-screen">
      <div className="auth-visual">
        <div className="auth-visual-brand"><Logo /></div>
        <div className="auth-visual-copy">
          <p className="auth-visual-title">Gestão de frota</p>
          <p>Veículos, motoristas e ocorrências em um só painel.</p>
        </div>
      </div>
      <section className="auth-form-side" aria-labelledby="auth-title">
        <div className="auth-card" key={titulo}>
          <h1 className="auth-title" id="auth-title">{titulo}</h1>
          {subtitulo && <p className="auth-sub">{subtitulo}</p>}
          {children}
        </div>
      </section>
    </main>
  );
}
