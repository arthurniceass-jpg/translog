import { ApiError } from "./errors";
import { session } from "./session";
import veiculosSeed from "../data/veiculos.json";
import motoristasSeed from "../data/motoristas.json";
import { apagarAnexo, armazenarAnexo, baixarAnexo, listarAnexos } from "./anexosDemo";
import { horarioComparavel } from "../lib/operacao";
import { operacaoDemo } from "../data/operacaoDemo";
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
  ...operacaoDemo,
  veiculos: () => veiculosSeed.map((v, i) => ({ ...v, id: num(v.id), quilometragem: 87500 + i * 3000 })),
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

/**
 * Contas do modo demo. A senha NUNCA é guardada: só o hash SHA-256 dela.
 * (o hash abaixo é de "admin123", a credencial de demonstração mostrada no login)
 */
const K_CONTAS = "translog:demo:contas";
localStorage.removeItem("translog:demo:usuarios"); // formato antigo, que guardava a senha

function contas() {
  return ler(K_CONTAS, () => [
    { id: 1, nome: "Administrador", email: "admin@translog.com", senhaHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" },
  ]);
}

async function hashSenha(senha) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(senha));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
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

function validarOperacao(recurso, dados, id) {
  if (dados.veiculoId && !lerRecurso("veiculos").some((v) => v.id === dados.veiculoId)) {
    throw new ApiError("Veículo não encontrado.", { status: 400, fieldErrors: { veiculoId: "Veículo não encontrado." } });
  }
  if (dados.motoristaId && !lerRecurso("motoristas").some((m) => m.id === dados.motoristaId)) {
    throw new ApiError("Motorista não encontrado.", { status: 400, fieldErrors: { motoristaId: "Motorista não encontrado." } });
  }
  if (recurso === "documentos" && lerRecurso(recurso).some((d) => d.id !== id
      && ((dados.veiculoId && d.veiculoId === dados.veiculoId) || (dados.motoristaId && d.motoristaId === dados.motoristaId)))) {
    throw new ApiError("Já existe um documento para este cadastro.", { status: 409 });
  }
  if (recurso === "viagens" && dados.status !== "CANCELADA") {
    const conflitos = lerRecurso(recurso).filter((v) => v.id !== id && v.status !== "CANCELADA"
      && horarioComparavel(v.partida) < horarioComparavel(dados.chegadaPrevista)
      && horarioComparavel(v.chegadaPrevista) > horarioComparavel(dados.partida));
    const campo = ["veiculoId", "motoristaId"].find((c) => conflitos.some((v) => v[c] === dados[c]));
    if (campo) {
      const mensagem = campo === "veiculoId" ? "O veículo já está reservado nesse período." : "O motorista já está reservado nesse período.";
      throw new ApiError(mensagem, { status: 409, fieldErrors: { [campo]: mensagem } });
    }
  }
}

function dadosAcompanhamento(id) {
  const ocorrencia = lerRecurso("ocorrencias").find((o) => o.id === id);
  if (!ocorrencia) throw new ApiError("Ocorrência não encontrada.", { status: 404 });
  return lerRecurso("acompanhamentos").find((a) => a.ocorrenciaId === id)
    || { ocorrenciaId: id, prioridade: "NORMAL" };
}

function registrarSituacao(ocorrenciaId, anterior, novoStatus) {
  if (anterior === novoStatus) return;
  const registros = lerRecurso("situacoes");
  const id = (registros.at(-1)?.id || 0) + 1;
  gravar(chaveDe("situacoes"), [...registros, {
    id, ocorrenciaId, anterior, novoStatus,
    autor: session.getUser()?.nome, registradoEm: new Date().toISOString(),
  }]);
}

function resolucoesDemo() {
  const registros = lerRecurso("situacoes");
  return lerRecurso("ocorrencias").filter((o) => o.status === "Resolvida").flatMap((o) => {
    const eventos = registros.filter((r) => r.ocorrenciaId === o.id);
    const inicio = eventos.find((r) => r.anterior === null && r.novoStatus !== "Resolvida");
    const fim = eventos.findLast((r) => r.novoStatus === "Resolvida");
    if (!inicio || !fim) return [];
    return [{ ocorrenciaId: o.id, resolvidaEm: fim.registradoEm, segundos: Math.floor((Date.parse(fim.registradoEm) - Date.parse(inicio.registradoEm)) / 1000) }];
  });
}

export const local = {
  modo: "demo",

  auth: {
    async cadastrar({ nome, email, senha }) {
      const lista = contas();
      const mail = email.trim().toLowerCase();
      if (lista.some((u) => u.email === mail)) throw new ApiError("Já existe uma conta com este e-mail.", { status: 409 });
      const novo = { id: Date.now(), nome: nome.trim(), email: mail, senhaHash: await hashSenha(senha) };
      gravar(K_CONTAS, [...lista, novo]);
      const usuario = { id: novo.id, nome: novo.nome, email: novo.email };
      session.save("demo-token", usuario);
      return atraso(usuario);
    },
    async entrar({ email, senha }) {
      const mail = email.trim().toLowerCase();
      const hash = await hashSenha(senha);
      const u = contas().find((x) => x.email === mail && x.senhaHash === hash);
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

  acompanhamento: {
    async detalhe(id) {
      id = Number(id);
      return {
        dados: dadosAcompanhamento(id),
        historico: lerRecurso("situacoes").filter((s) => s.ocorrenciaId === id).reverse(),
        anexos: await listarAnexos(id),
      };
    },
    async atualizar(id, dados) {
      id = Number(id);
      dadosAcompanhamento(id);
      const registro = { ...dados, ocorrenciaId: id };
      gravar(chaveDe("acompanhamentos"), [...lerRecurso("acompanhamentos").filter((a) => a.ocorrenciaId !== id), registro]);
      return atraso(registro);
    },
    async anexar(id, arquivo) {
      dadosAcompanhamento(Number(id));
      return armazenarAnexo(Number(id), arquivo);
    },
    baixar: (id, anexoId) => baixarAnexo(Number(id), anexoId),
    excluir: (id, anexoId) => apagarAnexo(Number(id), anexoId),
  },

  async listar(recurso) {
    if (recurso === "responsaveis") return atraso(contas().map(({ id, nome }) => ({ id, nome })));
    if (recurso === "resolucoes") return atraso(resolucoesDemo());
    return atraso([...lerRecurso(recurso)].sort((a, b) => b.id - a.id));
  },

  async criar(recurso, dados) {
    const lista = lerRecurso(recurso);
    const limpo = recurso === "veiculos" ? { ...dados, placa: String(dados.placa).toUpperCase() } : dados;
    validarUnicos(recurso, lista, limpo, null);
    validarOperacao(recurso, limpo, null);
    const novo = { ...limpo, id: Math.max(0, ...lista.map((i) => i.id)) + 1 };
    gravar(chaveDe(recurso), [...lista, novo]);
    if (recurso === "ocorrencias") registrarSituacao(novo.id, null, novo.status);
    return atraso(novo);
  },

  async atualizar(recurso, id, dados) {
    const lista = lerRecurso(recurso);
    const alvo = lista.find((i) => String(i.id) === String(id));
    if (!alvo) throw new ApiError("Registro não encontrado.", { status: 404 });
    const limpo = recurso === "veiculos" ? { ...dados, placa: String(dados.placa).toUpperCase() } : dados;
    validarUnicos(recurso, lista, limpo, alvo.id);
    validarOperacao(recurso, limpo, alvo.id);
    if (recurso === "veiculos" && limpo.quilometragem == null) delete limpo.quilometragem;
    const atualizado = { ...alvo, ...limpo, id: alvo.id };
    gravar(chaveDe(recurso), lista.map((i) => (i.id === alvo.id ? atualizado : i)));
    if (recurso === "ocorrencias") registrarSituacao(alvo.id, alvo.status, atualizado.status);
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
    const referencias = recurso === "veiculos" ? ["viagens", "manutencoes", "abastecimentos", "documentos"]
      : recurso === "motoristas" ? ["viagens", "documentos"] : [];
    const campo = recurso === "veiculos" ? "veiculoId" : "motoristaId";
    if (referencias.some((r) => lerRecurso(r).some((item) => item[campo] === alvo.id))) {
      throw new ApiError("O cadastro possui registros operacionais vinculados.", { status: 409 });
    }
    if (recurso === "ocorrencias") {
      for (const anexo of await listarAnexos(alvo.id)) await apagarAnexo(alvo.id, anexo.id);
      for (const r of ["acompanhamentos", "situacoes"]) {
        gravar(chaveDe(r), lerRecurso(r).filter((a) => a.ocorrenciaId !== alvo.id));
      }
    }
    gravar(chaveDe(recurso), lista.filter((i) => i.id !== alvo.id));
    return atraso(null);
  },
};
