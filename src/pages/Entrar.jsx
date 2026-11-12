import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Entrar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar, autenticado, modo } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/" replace />;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar() {
    const e = {};
    if (!form.email.trim()) e.email = "Informe o e-mail.";
    else if (!EMAIL_RE.test(form.email)) e.email = "E-mail inválido.";
    if (!form.senha) e.senha = "Informe a senha.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFalha("");
    if (!validar()) return;
    setEnviando(true);
    try {
      await entrar(form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setFalha(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Acesse o painel de gestão da sua frota.">
      <form onSubmit={handleSubmit} noValidate>
        {falha && <div className="alert alert-danger">{falha}</div>}
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={erros.email} required placeholder="voce@empresa.com" />
        <Field label="Senha" name="senha" type="password" autoComplete="current-password" value={form.senha} onChange={handleChange} error={erros.senha} required placeholder="Sua senha" />
        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando && <span className="spinner" />} Entrar
        </button>
      </form>
      <p className="auth-switch">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
      {modo === "demo" && (
        <div className="demo-box">
          <b>Modo demo</b> — sem back-end conectado. Use <b>admin@translog.com</b> / <b>admin123</b>{" "}
          <button type="button" onClick={() => setForm({ email: "admin@translog.com", senha: "admin123" })}>
            preencher
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
