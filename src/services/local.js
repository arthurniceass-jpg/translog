import { ApiError } from "./errors";
import { session } from "./session";
import veiculosSeed from "../data/veiculos.json";
import motoristasSeed from "../data/motoristas.json";
import ocorrenciasSeed from "../data/ocorrencias.json";

/**
 * Adaptador DEMO: mesma interface do adaptador remoto, mas guarda tudo no
 * localStorage. É usado quando VITE_API_URL está vazio (ex.: apresentação
 * sem back-end). Reproduz as regras principais da API (placa única,
 * veículo com ocorrência não pode ser excluído, e-mail único).
 */
const num = (id) => Number(String(id).replace(/\D/g, ""));
const atraso = (valor) => new Promise((ok) => setTimeout(() => ok(valor), 120));

const SEEDS = {
  veiculos: () => veiculosSeed.map((v) => ({ ...v, id: num(v.id) })),
  motoristas: () =>
    motoristasSeed.map((m) => ({
      ...m,
      id: num(m.id),
      categorias: m.categorias || (m.categoria ? m.categoria.split(",") : []),
      cpf: m.cpf.replace(/\D/g, ""),
      telefone: m.telefone.replace(/\D/g, ""),
    })),
  ocorrencias: () =>
    ocorrenciasSeed.map((o) => ({
      ...o,
      id: num(o.id),
      veiculoId: num(o.veiculoId),
      motoristaId: o.motoristaId ? num(o.motoristaId) : null,
    })),
};

function ler(chave, seed) {
  try {
    const bruto = localStorage.getItem(chave);
    if (bruto !== null) return JSON.parse(bruto);
  } catch {
    /* cai no seed */
  }
  const inicial = seed();
  localStorage.setItem(chave, JSON.stringify(inicial));
  return inicial;
}
const gravar = (chave, lista) => localStorage.setItem(chave, JSON.stringify(lista));
const chaveDe = (recurso) => `translog:demo:${recurso}`;
const lerRecurso = (recurso) => ler(chaveDe(recurso), SEEDS[recurso]);

function usuarios() {
  return ler("translog:demo:usuarios", () => [
    { id: 1, nome: "Administrador", email: "admin@translog.com", senha: "admin123" },
  ]);
}

function validarUnicos(recurso, lista, dados, idAtual) {
  if (recurso === "veiculos") {
    const placa = String(dados.placa).toUpperCase();
    if (lista.some((v) => v.placa === placa && v.id !== idAtual)) {
      throw new ApiError("Já existe um veículo com esta placa.", { status: 409, fieldErrors: { placa: "Placa já cadastrada." } });
    }
  }
  if (recurso === "motoristas") {
    if (lista.some((m) => m.cpf === dados.cpf && m.id !== idAtual))
      throw new ApiError("CPF já cadastrado.", { status: 409, fieldErrors: { cpf: "CPF já cadastrado." } });
    if (lista.some((m) => m.cnh === dados.cnh && m.id !== idAtual))
      throw new ApiError("CNH já cadastrada.", { status: 409, fieldErrors: { cnh: "CNH já cadastrada." } });
  }
}

export const local = {
  modo: "demo",

  auth: {
    async cadastrar({ nome, email, senha }) {
      const lista = usuarios();
      const mail = email.trim().toLowerCase();
      if (lista.some((u) => u.email === mail)) throw new ApiError("Já existe uma conta com este e-mail.", { status: 409 });
      const novo = { id: Date.now(), nome: nome.trim(), email: mail, senha };
      gravar("translog:demo:usuarios", [...lista, novo]);
      const usuario = { id: novo.id, nome: novo.nome, email: novo.email };
      session.save("demo-token", usuario);
      return atraso(usuario);
    },
    async entrar({ email, senha }) {
      const mail = email.trim().toLowerCase();
      const u = usuarios().find((x) => x.email === mail && x.senha === senha);
      if (!u) throw new ApiError("E-mail ou senha inválidos.", { status: 401 });
      const usuario = { id: u.id, nome: u.nome, email: u.email };
      session.save("demo-token", usuario);
      return atraso(usuario);
    },
    async me() {
      const u = session.getUser();
      if (!u) throw new ApiError("Sessão expirada.", { status: 401 });
      return u;
    },
    sair: () => session.clear(),
  },

  async listar(recurso) {
    return atraso([...lerRecurso(recurso)].sort((a, b) => b.id - a.id));
  },

  async criar(recurso, dados) {
    const lista = lerRecurso(recurso);
    const limpo = recurso === "veiculos" ? { ...dados, placa: String(dados.placa).toUpperCase() } : dados;
    validarUnicos(recurso, lista, limpo, null);
    const novo = { ...limpo, id: Math.max(0, ...lista.map((i) => i.id)) + 1 };
    gravar(chaveDe(recurso), [...lista, novo]);
    return atraso(novo);
  },

  async atualizar(recurso, id, dados) {
    const lista = lerRecurso(recurso);
    const alvo = lista.find((i) => String(i.id) === String(id));
    if (!alvo) throw new ApiError("Registro não encontrado.", { status: 404 });
    const limpo = recurso === "veiculos" ? { ...dados, placa: String(dados.placa).toUpperCase() } : dados;
    validarUnicos(recurso, lista, limpo, alvo.id);
    const atualizado = { ...alvo, ...limpo, id: alvo.id };
    gravar(chaveDe(recurso), lista.map((i) => (i.id === alvo.id ? atualizado : i)));
    return atraso(atualizado);
  },

  async remover(recurso, id) {
    const lista = lerRecurso(recurso);
    const alvo = lista.find((i) => String(i.id) === String(id));
    if (!alvo) throw new ApiError("Registro não encontrado.", { status: 404 });
    const ocs = lerRecurso("ocorrencias");
    if (recurso === "veiculos" && ocs.some((o) => o.veiculoId === alvo.id))
      throw new ApiError("Este veículo possui ocorrências vinculadas e não pode ser excluído.", { status: 409 });
    if (recurso === "motoristas" && ocs.some((o) => o.motoristaId === alvo.id))
      throw new ApiError("Este motorista possui ocorrências vinculadas e não pode ser excluído.", { status: 409 });
    gravar(chaveDe(recurso), lista.filter((i) => i.id !== alvo.id));
    return atraso(null);
  },
};
