import { ApiError } from "./errors";

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open("translog-anexos", 1);
    pedido.onupgradeneeded = () => {
      const anexos = pedido.result.createObjectStore("anexos", { keyPath: "id", autoIncrement: true });
      anexos.createIndex("ocorrenciaId", "ocorrenciaId");
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function transacao(modo, executar) {
  const banco = await abrirBanco();
  try {
    return await new Promise((resolve, reject) => {
      const tx = banco.transaction("anexos", modo);
      const pedido = executar(tx.objectStore("anexos"));
      tx.oncomplete = () => resolve(pedido.result);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    banco.close();
  }
}

export const listarAnexos = async (ocorrenciaId) =>
  (await transacao("readonly", (anexos) => anexos.index("ocorrenciaId").getAll(ocorrenciaId)))
    .map(({ id, nome, tipo, tamanho, enviadoEm }) => ({ id, nome, tipo, tamanho, enviadoEm })).reverse();

export async function armazenarAnexo(ocorrenciaId, arquivo) {
  const prefixo = new Uint8Array(await arquivo.slice(0, 8).arrayBuffer());
  const temPrefixo = (bytes) => bytes.every((byte, i) => prefixo[i] === byte);
  const tipo = temPrefixo([37, 80, 68, 70, 45]) ? "application/pdf"
    : temPrefixo([137, 80, 78, 71, 13, 10, 26, 10]) ? "image/png"
    : temPrefixo([255, 216, 255]) ? "image/jpeg" : "";
  if (!tipo || arquivo.size > 5 * 1024 * 1024) {
    throw new ApiError("Envie um PDF, PNG ou JPEG de até 5 MB.", { status: 400 });
  }
  const dados = { nome: arquivo.name, tipo, tamanho: arquivo.size, enviadoEm: new Date().toISOString() };
  const id = await transacao("readwrite", (anexos) => {
    const pedido = anexos.index("ocorrenciaId").count(ocorrenciaId);
    pedido.onsuccess = () => {
      if (pedido.result < 10) anexos.add({ ...dados, ocorrenciaId, arquivo });
    };
    return pedido;
  });
  if (id >= 10) throw new ApiError("Esta ocorrência já possui 10 anexos.", { status: 409 });
  return (await listarAnexos(ocorrenciaId))[0];
}

async function obterAnexo(ocorrenciaId, id) {
  const registro = await transacao("readonly", (anexos) => anexos.get(id));
  if (!registro || registro.ocorrenciaId !== ocorrenciaId) {
    throw new ApiError("Anexo não encontrado.", { status: 404 });
  }
  return registro;
}

export async function baixarAnexo(ocorrenciaId, id) {
  return (await obterAnexo(ocorrenciaId, id)).arquivo;
}

export async function apagarAnexo(ocorrenciaId, id) {
  await obterAnexo(ocorrenciaId, id);
  await transacao("readwrite", (anexos) => anexos.delete(id));
}
