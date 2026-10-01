import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Entrar() {
  const navigate = useNavigate();
  const { entrar } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState("");

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

  function handleSubmit(e) {
    e.preventDefault();
    setFalha("");
    if (!validar()) return;
    const r = entrar(form);
    if (!r.ok) {
      setFalha(r.error);
      return;
    }
    navigate("/");
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Acesse o painel de gestão da sua frota.">
      <form onSubmit={handleSubmit} noValidate>
        {falha && <div className="alert alert-danger">{falha}</div>}
        <Field label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} error={erros.email} required placeholder="voce@empresa.com" />
        <Field label="Senha" name="senha" type="password" value={form.senha} onChange={handleChange} error={erros.senha} required placeholder="••••••••" />
        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.25rem" }}>Entrar</button>
      </form>
      <p className="auth-switch">
        Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </AuthLayout>
  );
}
