const MAPA = {
  // veículos
  "Disponível": "success",
  "Em uso": "primary",
  "Manutenção": "warn",
  // motoristas
  "Em viagem": "primary",
  "Inativo": "neutral",
  // ocorrências
  "Aberta": "danger",
  "Em análise": "warn",
  "Resolvida": "success",
};

export function statusVariant(status) {
  return MAPA[status] || "neutral";
}
