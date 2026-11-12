import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services";
import { session } from "../services/session";

/**
 * AuthContext — autenticação do TransLog (AV2).
 * Login/cadastro vão para a API (JWT). Ao abrir o app com token salvo,
 * valida a sessão em /auth/me; qualquer 401 da API derruba a sessão.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => (session.getToken() ? session.getUser() : null));
  const [verificando, setVerificando] = useState(() => Boolean(session.getToken()));

  const sair = useCallback(() => {
    api.auth.sair();
    setUsuario(null);
  }, []);

  useEffect(() => {
    session.setUnauthorizedHandler(sair);
  }, [sair]);

  // Revalida o token salvo ao carregar a página
  useEffect(() => {
    if (!session.getToken()) return;
    let ativo = true;
    api.auth
      .me()
      .then((u) => ativo && setUsuario(u))
      .catch(() => ativo && sair())
      .finally(() => ativo && setVerificando(false));
    return () => {
      ativo = false;
    };
  }, [sair]);

  const entrar = useCallback(async (dados) => setUsuario(await api.auth.entrar(dados)), []);
  const cadastrar = useCallback(async (dados) => setUsuario(await api.auth.cadastrar(dados)), []);

  const value = useMemo(
    () => ({ usuario, autenticado: !!usuario, verificando, entrar, cadastrar, sair, modo: api.modo }),
    [usuario, verificando, entrar, cadastrar, sair],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
