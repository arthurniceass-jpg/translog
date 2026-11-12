/**
 * Sessão (token JWT + dados do usuário) guardada no localStorage.
 * Fica fora do React para o cliente HTTP conseguir ler o token.
 */
const K_TOKEN = "translog:token";
const K_USER = "translog:usuario";

let onUnauthorized = () => {};

export const session = {
  getToken: () => localStorage.getItem(K_TOKEN),
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(K_USER));
    } catch {
      return null;
    }
  },
  save(token, usuario) {
    localStorage.setItem(K_TOKEN, token);
    localStorage.setItem(K_USER, JSON.stringify(usuario));
  },
  clear() {
    localStorage.removeItem(K_TOKEN);
    localStorage.removeItem(K_USER);
  },
  /** O AuthContext registra aqui o que fazer quando a API devolver 401. */
  setUnauthorizedHandler(fn) {
    onUnauthorized = fn;
  },
  notifyUnauthorized: () => onUnauthorized(),
};
