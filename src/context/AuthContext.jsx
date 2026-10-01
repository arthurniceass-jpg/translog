import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * AuthContext — autenticação do TransLog.
 *
 * AV1: mock LOCAL (usuários e sessão guardados no localStorage) apenas para
 * prototipar as telas de login/cadastro. NÃO é autenticação de verdade.
 * AV2: será substituído por login real na API Spring Boot (JWT + rota protegida).
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useLocalStorage("translog:usuarios", []);
  const [sessao, setSessao] = useLocalStorage("translog:sessao", null);

  function cadastrar({ nome, email, senha }) {
    const emailNorm = email.trim().toLowerCase();
    if (usuarios.some((u) => u.email === emailNorm)) {
      return { ok: false, error: "Já existe uma conta com este e-mail." };
    }
    const novo = { nome: nome.trim(), email: emailNorm, senha };
    setUsuarios((lista) => [...lista, novo]);
    setSessao({ nome: novo.nome, email: novo.email });
    return { ok: true };
  }

  function entrar({ email, senha }) {
    const emailNorm = email.trim().toLowerCase();
    const u = usuarios.find((x) => x.email === emailNorm && x.senha === senha);
    if (!u) return { ok: false, error: "E-mail ou senha inválidos." };
    setSessao({ nome: u.nome, email: u.email });
    return { ok: true };
  }

  function sair() {
    setSessao(null);
  }

  return (
    <AuthContext.Provider value={{ usuario: sessao, autenticado: !!sessao, cadastrar, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
