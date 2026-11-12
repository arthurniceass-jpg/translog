/** Helpers de formatação (CPF, telefone, datas, iniciais). */
export const soNumeros = (t) => (t || "").replace(/\D/g, "");

export function mascararCPF(valor) {
  const d = soNumeros(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function mascararTelefone(valor) {
  const d = soNumeros(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const iniciais = (nome = "") =>
  nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";

export const dataBR = (iso) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("pt-BR") : "—");

export const mesAno = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export function saudacao(data = new Date()) {
  const h = data.getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export function contarPor(lista, chave) {
  return lista.reduce((acc, item) => {
    acc[item[chave]] = (acc[item[chave]] || 0) + 1;
    return acc;
  }, {});
}

/** Dispara o download de um CSV (separador ; e BOM para abrir certo no Excel). */
export function baixarCSV(nome, linhas) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + linhas.map((l) => l.map(esc).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nome });
  a.click();
  URL.revokeObjectURL(url);
}
