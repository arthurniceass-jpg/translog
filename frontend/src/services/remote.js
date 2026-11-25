import { http } from "./http";
import { session } from "./session";

/** Adaptador REAL: conversa com a API Spring Boot (contrato em backend/README.md). */
export const remote = {
  modo: "api",

  auth: {
    async cadastrar(dados) {
      const r = await http("/auth/cadastro", { method: "POST", body: dados, auth: false });
      session.save(r.token, r.usuario);
      return r.usuario;
    },
    async entrar(dados) {
      const r = await http("/auth/login", { method: "POST", body: dados, auth: false });
      session.save(r.token, r.usuario);
      return r.usuario;
    },
    me: () => http("/auth/me"),
    sair: () => session.clear(),
  },

  acompanhamento: {
    detalhe: (id) => http(`/ocorrencias/${id}/acompanhamento`),
    atualizar: (id, dados) => http(`/ocorrencias/${id}/acompanhamento`, { method: "PUT", body: dados }),
    anexar(id, arquivo) {
      const body = new FormData();
      body.append("arquivo", arquivo);
      return http(`/ocorrencias/${id}/anexos`, { method: "POST", body });
    },
    baixar: (id, anexoId) => http(`/ocorrencias/${id}/anexos/${anexoId}`, { blob: true }),
    excluir: (id, anexoId) => http(`/ocorrencias/${id}/anexos/${anexoId}`, { method: "DELETE" }),
  },

  listar: (recurso) => http(`/${recurso}`),
  criar: (recurso, dados) => http(`/${recurso}`, { method: "POST", body: dados }),
  atualizar: (recurso, id, dados) => http(`/${recurso}/${id}`, { method: "PUT", body: dados }),
  remover: (recurso, id) => http(`/${recurso}/${id}`, { method: "DELETE" }),
};
