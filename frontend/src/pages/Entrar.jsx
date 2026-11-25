import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { AuthLayout } from "../components/AuthLayout";
import { Icon } from "../components/Icons";
import { PasswordField } from "../components/PasswordField";
import { Field } from "../components/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Entrar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar, autenticado, modo } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const { erros, mostrar, limpar } = useErrosCampos();
  const [falha, setFalha] = useState("");
  const [enviando, setEnviando] = useState("");

  const destino = location.state?.from || "/";
  if (autenticado) return <Navigate to={destino} replace />;

  function handleChange(e) {
    const { name, value } = e.target;
    limpar(name);
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar(formulario) {
    const e = {};
    if (!form.email.trim()) e.email = "Informe o e-mail.";
    else if (!EMAIL_RE.test(form.email)) e.email = "E-mail inválido.";
    if (!form.senha) e.senha = "Informe a senha.";
    mostrar(e, formulario);
    return Object.keys(e).length === 0;
  }

  async function iniciarSessao(dados, origem = "login") {
    setFalha("");
    setEnviando(origem);
    try {
      await entrar(dados);
      navigate(destino, { replace: true });
    } catch (err) {
      setFalha(err.message);
      setEnviando("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFalha("");
    if (!enviando && validar(e.currentTarget)) iniciarSessao(form);
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Use o e-mail e a senha da sua conta.">
      <form aria-busy={Boolean(enviando)} onSubmit={handleSubmit} noValidate>
        {falha && <div className="alert alert-danger" role="alert">{falha}</div>}
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={erros.email} required placeholder="voce@empresa.com" />
        <PasswordField name="senha" autoComplete="current-password" value={form.senha} onChange={handleChange} error={erros.senha} required placeholder="Sua senha" />
        <button type="submit" className="btn btn-primary btn-block" disabled={Boolean(enviando)}>
          {enviando === "login" ? <><span className="spinner" /> Entrando…</> : <>Entrar <Icon name="arrow" size={17} /></>}
        </button>
      </form>
      <p className="auth-switch">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
      {modo === "demo" && (
        <div className="demo-box">
          <button
            type="button"
            className="btn btn-outline btn-block"
            disabled={Boolean(enviando)}
            onClick={() => {
              mostrar({});
              iniciarSessao({ email: "admin@translog.com", senha: "admin123" }, "demo");
            }}
          >
            {enviando === "demo" ? <><span className="spinner" /> Abrindo demonstração…</> : "Acessar demonstração"}
          </button>
          <p>Veja o painel com dados de exemplo.</p>
        </div>
      )}
    </AuthLayout>
  );
}
