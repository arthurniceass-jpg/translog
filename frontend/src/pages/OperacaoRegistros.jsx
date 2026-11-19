import { useEffect, useRef, useState } from "react";
import { useData } from "../context/data";
import { useToast } from "../context/toast";
import { useFiltros } from "../hooks/useFiltros";
import { useRelogioFrota } from "../hooks/useRelogioFrota";
import { REGISTROS_OPERACIONAIS } from "../data/registrosOperacionais";
import { normalizarBusca } from "../lib/format";
import { PageHeader } from "../components/PageHeader";
import { ListResults } from "../components/ListResults";
import { SearchBar } from "../components/SearchBar";
import { RegistroOperacionalForm } from "../components/RegistroOperacionalForm";
import { ResumoCustos } from "../components/ResumoCustos";
import { EmptyState } from "../components/EmptyState";
import { ErroCarga } from "../components/Loading";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Icon } from "../components/Icons";
import { Badge } from "../components/Badge";

const VARIANTES = {
  Vencida: "danger", Vencido: "danger", Atrasada: "danger", Próxima: "warn",
  "Em execução": "primary", "Em andamento": "primary", Concluída: "success", Válido: "success",
};

export function OperacaoRegistros({ recurso }) {
  const config = REGISTROS_OPERACIONAIS[recurso];
  const dados = useData();
  const { registros, carregando, carregandoOperacao, falhas, recarregar } = dados;
  const { ler, alterar, limpar } = useFiltros();
  const agora = useRelogioFrota();
  const toast = useToast();
  const formRef = useRef(null);
  const novoRef = useRef(null);
  const [excluir, setExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const lista = dados[recurso];
  const busca = ler("q");
  const filtroStatus = ler("status", config.status);
  const editando = ler("editar");
  const criando = !editando && ler("novo") === "1";
  const item = lista.find((r) => String(r.id) === editando);
  const exibindoForm = Boolean(criando || item);
  const termo = normalizarBusca(busca);
  const mesUrl = ler("mes");
  const mes = /^\d{4}-(0[1-9]|1[0-2])$/.test(mesUrl) && mesUrl >= "1900-01" ? mesUrl : agora.slice(0, 7);
  const veiculoId = ler("veiculo");
  const registrosNoPeriodo = recurso === "abastecimentos"
    ? lista.filter((r) => r.data.startsWith(mes) && (!veiculoId || String(r.veiculoId) === veiculoId)) : lista;
  const visiveis = registrosNoPeriodo.map((registro) => ({ id: registro.id, ...config.linha(registro, dados, agora) }))
    .filter((linha) => (!filtroStatus || linha.status === filtroStatus || linha.statusRegistro === filtroStatus)
      && (!termo || normalizarBusca([linha.identidade, linha.nota, ...linha.valores].join(" ")).includes(termo)));
  const requisitoIndisponivel = config.dependencias.some((r) => falhas.includes(r));

  useEffect(() => {
    if (exibindoForm) formRef.current?.focus();
  }, [exibindoForm, editando]);

  function fecharFormulario() {
    alterar(editando ? "editar" : "novo", "");
    requestAnimationFrame(() => novoRef.current?.focus());
  }

  async function salvar(pedido) {
    const operacao = registros(recurso);
    if (item) await operacao.atualizar(item.id, pedido);
    else await operacao.criar(pedido);
    fecharFormulario();
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await registros(recurso).remover(excluir.id);
      toast.sucesso("Registro excluído.");
      if (String(excluir.id) === editando) fecharFormulario();
    } catch (erro) {
      toast.erro(erro.message);
    } finally {
      setExcluindo(false);
      setExcluir(null);
    }
  }

  return (
    <>
      <PageHeader titulo={config.titulo} sub={config.subtitulo}
        voltar={recurso === "documentos" ? { to: "/alertas", label: "Alertas" } : undefined}>
        <button ref={novoRef} type="button" className="btn btn-primary" onClick={() => alterar("novo", "1")}
          disabled={exibindoForm || carregando || carregandoOperacao || falhas.includes(recurso) || requisitoIndisponivel}>
          <Icon name="plus" size={17} /> {config.novo}
        </button>
        {recurso === "manutencoes" && <button type="button" className="btn btn-outline"
          aria-pressed={filtroStatus === "Em execução"}
          onClick={() => alterar("status", filtroStatus === "Em execução" ? "" : "Em execução")}>
          Em oficina{carregandoOperacao || falhas.includes(recurso) ? "" : ` (${new Set(lista.filter((m) => m.status === "EM_EXECUCAO").map((m) => m.veiculoId)).size})`}
        </button>}
      </PageHeader>

      {requisitoIndisponivel && <ErroCarga mensagem="Não foi possível carregar os cadastros necessários para editar." onTentar={recarregar} />}
      {exibindoForm && <div className="operacao-form-area" ref={formRef} tabIndex={-1}>
        <RegistroOperacionalForm key={item?.id || "novo"} config={config} item={item} dados={dados} agora={agora}
          onSalvar={salvar} onCancelar={fecharFormulario} />
      </div>}
      {editando && !item && !carregandoOperacao && !falhas.includes(recurso) && (
        <div className="alert alert-danger"><span role="alert">Registro não encontrado.</span><button className="btn btn-outline btn-sm" onClick={fecharFormulario}>Fechar</button></div>
      )}

      {!exibindoForm && recurso === "abastecimentos" && (
        <ResumoCustos mes={mes} alterarMes={(v) => alterar("mes", v)} veiculoId={veiculoId} alterarVeiculo={(v) => alterar("veiculo", v)} />
      )}

      {recurso === "abastecimentos" && <h2 className="section-heading">Abastecimentos registrados</h2>}
      <div className="toolbar" role="group" aria-label="Busca e filtros">
        <div className="grow"><SearchBar value={busca} onChange={(v) => alterar("q", v)} placeholder={`Buscar ${config.plural}…`} /></div>
        {config.status && <select className="select" aria-label="Filtrar por status" value={filtroStatus} onChange={(e) => alterar("status", e.target.value)}>
          <option value="">Todos os status</option>
          {config.status.map((status) => <option key={status}>{status}</option>)}
        </select>}
      </div>

      <ListResults total={registrosNoPeriodo.length} quantidade={visiveis.length} singular={config.singular} plural={config.plural}
        icon={config.icon} carregando={carregandoOperacao || carregando}
        erro={falhas.includes(recurso) ? `Não foi possível carregar ${config.plural}.` : ""}
        onTentar={recarregar} onLimpar={limpar}
        vazio={<EmptyState icon={config.icon} titulo={`Nenhum registro de ${config.plural}`}
          texto={recurso === "abastecimentos" ? "Altere o mês ou o veículo para consultar outros abastecimentos." : "Os registros adicionados aparecem aqui."} /> }>
        <div className="table-wrap">
          <table className="table stack">
            <thead><tr>{config.colunas.map((coluna) => <th key={coluna}>{coluna}</th>)}<th className="text-right">Ações</th></tr></thead>
            <tbody>{visiveis.map((linha) => (
              <tr key={linha.id}>
                <td className="cell-first" data-label={config.colunas[0]}>
                  <strong className="operacao-identidade">{linha.identidade}</strong>
                  {linha.nota && <small className="operacao-nota">{linha.nota}</small>}
                </td>
                {linha.valores.map((valor, i) => <td key={config.colunas[i + 1]} data-label={config.colunas[i + 1]}>{valor || "—"}</td>)}
                {linha.status && <td data-label="Status"><Badge variant={VARIANTES[linha.status]}>{linha.status}</Badge></td>}
                <td className="cell-actions">
                  <div className="actions">
                    <button type="button" className="icon-btn" title="Editar" aria-label={`Editar ${linha.identidade}`}
                      onClick={() => alterar("editar", String(linha.id))} disabled={requisitoIndisponivel || criando}><Icon name="edit" size={17} /></button>
                    <button type="button" className="icon-btn danger" title="Excluir" aria-label={`Excluir ${linha.identidade}`}
                      onClick={() => setExcluir(linha)}><Icon name="trash" size={17} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </ListResults>

      <ConfirmDialog aberto={Boolean(excluir)} titulo="Excluir registro"
        mensagem={excluir ? `Excluir “${excluir.identidade}”? Esta ação não pode ser desfeita.` : ""}
        carregando={excluindo} onConfirmar={confirmarExclusao} onCancelar={() => setExcluir(null)} />
    </>
  );
}
