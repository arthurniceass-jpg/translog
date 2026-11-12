import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Cadastro() {
  const navigate = useNavigate();
  const { cadastrar, autenticado } = useAuth();

  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
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
    if (!form.nome.trim()) e.nome = "Informe o nome.";
    if (!form.email.trim()) e.email = "Informe o e-mail.";
    else if (!EMAIL_RE.test(form.email)) e.email = "E-mail inválido.";
    if (!form.senha) e.senha = "Informe a senha.";
    else if (form.senha.length < 6) e.senha = "Mínimo de 6 caracteres.";
    if (form.confirmar !== form.senha) e.confirmar = "As senhas não conferem.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFalha("");
    if (!validar()) return;
    setEnviando(true);
    try {
      await cadastrar({ nome: form.nome, email: form.email, senha: form.senha });
      navigate("/", { replace: true });
    } catch (err) {
      setErros(err.fieldErrors || {});
      setFalha(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Cadastre-se para gerenciar a frota no TransLog.">
      <form onSubmit={handleSubmit} noValidate>
        {falha && <div className="alert alert-danger">{falha}</div>}
        <Field label="Nome" name="nome" autoComplete="name" value={form.nome} onChange={handleChange} error={erros.nome} required placeholder="Seu nome" />
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={erros.email} required placeholder="voce@empresa.com" />
        <Field label="Senha" name="senha" type="password" autoComplete="new-password" value={form.senha} onChange={handleChange} error={erros.senha} required placeholder="Mínimo 6 caracteres" />
        <Field label="Confirmar senha" name="confirmar" type="password" autoComplete="new-password" value={form.confirmar} onChange={handleChange} error={erros.confirmar} required placeholder="Repita a senha" />
        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          {enviando && <span className="spinner" />} Criar conta
        </button>
      </form>
      <p className="auth-switch">
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
