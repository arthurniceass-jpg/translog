import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useErrosCampos } from "../hooks/useErrosCampos";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { Field } from "../components/Field";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Cadastro() {
  const navigate = useNavigate();
  const { cadastrar, autenticado } = useAuth();

  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const { erros, mostrar, limpar } = useErrosCampos();
  const [falha, setFalha] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/" replace />;

  function handleChange(e) {
    const { name, value } = e.target;
    limpar(name);
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validar(formulario) {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe o nome.";
    if (!form.email.trim()) e.email = "Informe o e-mail.";
    else if (!EMAIL_RE.test(form.email)) e.email = "E-mail inválido.";
    if (!form.senha) e.senha = "Informe a senha.";
    else if (form.senha.length < 6) e.senha = "Mínimo de 6 caracteres.";
    if (form.confirmar !== form.senha) e.confirmar = "As senhas não conferem.";
    mostrar(e, formulario);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFalha("");
    const formulario = e.currentTarget;
    if (enviando || !validar(formulario)) return;
    setEnviando(true);
    try {
      await cadastrar({ nome: form.nome, email: form.email, senha: form.senha });
      navigate("/", { replace: true });
    } catch (err) {
      mostrar(err.fieldErrors || {}, formulario);
      setFalha(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Cadastre-se para gerenciar a frota no TransLog.">
      <form aria-busy={Boolean(enviando)} onSubmit={handleSubmit} noValidate>
        {falha && <div className="alert alert-danger" role="alert">{falha}</div>}
        <Field label="Nome" name="nome" autoComplete="name" value={form.nome} onChange={handleChange} error={erros.nome} required placeholder="Seu nome" />
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={erros.email} required placeholder="voce@empresa.com" />
        <PasswordField name="senha" autoComplete="new-password" value={form.senha} onChange={handleChange} error={erros.senha} required hint="Use pelo menos 6 caracteres." />
        <PasswordField label="Confirmação de senha" name="confirmar" autoComplete="new-password" value={form.confirmar} onChange={handleChange} error={erros.confirmar} required placeholder="Repita a senha" />
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
