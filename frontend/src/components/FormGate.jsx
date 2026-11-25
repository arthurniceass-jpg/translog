import { PageHeader } from "./PageHeader";
import { useData } from "../context/data";
import { ErroCarga, TableSkeleton } from "./Loading";

/**
 * Guarda de formulário de edição: espera os dados chegarem da API e mostra
 * "não encontrado" só quando o registro realmente não existe.
 * Uso: <FormGate editando={!!id} existente={obj} voltar="/veiculos" rotulo="Veículo">...</FormGate>
 */
export function FormGate({ editando, existente, voltar, rotulo, recurso, children }) {
  const { carregando, falhas, recarregar } = useData();
  const cabecalho = <PageHeader titulo={`Editar ${rotulo.toLowerCase()}`} voltar={{ to: voltar, label: "Voltar à lista" }} />;

  if (editando && carregando) {
    return <>{cabecalho}<div className="card form-card"><TableSkeleton linhas={5} /></div></>;
  }
  if (editando && falhas.includes(recurso)) {
    return <>{cabecalho}<ErroCarga mensagem={`Não foi possível carregar ${rotulo.toLowerCase()}.`} onTentar={recarregar} /></>;
  }
  if (editando && !existente) {
    return (
      <div className="card card-pad form-card">
        <PageHeader titulo="Registro não encontrado" voltar={{ to: voltar, label: "Voltar à lista" }} />
      </div>
    );
  }
  return children;
}
