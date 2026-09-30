/**
 * Badge colorido reutilizável para exibir status.
 * Passe `variant` (neutral | success | warn | danger | primary)
 * ou use o helper statusVariant() abaixo para mapear status conhecidos.
 */
export function Badge({ children, variant = "neutral" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

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
