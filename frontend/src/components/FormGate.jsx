import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { TableSkeleton } from "./Loading";

/**
 * Guarda de formulário de edição: espera os dados chegarem da API e mostra
 * "não encontrado" só quando o registro realmente não existe.
 * Uso: <FormGate editando={!!id} existente={obj} voltar="/veiculos" rotulo="Veículo">...</FormGate>
 */
export function FormGate({ editando, existente, voltar, rotulo, children }) {
  const { carregando } = useData();
  const navigate = useNavigate();

  if (editando && carregando) {
    return <div className="card form-card"><TableSkeleton linhas={5} /></div>;
  }
  if (editando && !existente) {
    return (
      <div className="card card-pad form-card">
        <p>{rotulo} não encontrado(a).</p>
        <button className="btn btn-outline mt" onClick={() => navigate(voltar)}>Voltar</button>
      </div>
    );
  }
  return children;
}
