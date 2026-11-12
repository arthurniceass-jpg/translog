# Módulo Ocorrência — TODO (Guilherme Aguiar)

A tabela `ocorrencias` já existe (migration `V1__schema_inicial.sql`) e os enums `StatusOcorrencia` e
`TipoOcorrencia` estão prontos. **Falta implementar**, copiando o padrão de `../veiculo/`:

- [ ] `Ocorrencia` (entity; `veiculoId` obrigatório, `motoristaId` opcional — pode usar `@ManyToOne` ou ids simples)
- [ ] `OcorrenciaRepository` (filtros `q`, `status`, `tipo`, `de`, `ate`)
- [ ] `dto/OcorrenciaRequest`, `dto/OcorrenciaResponse`, `OcorrenciaMapper`
- [ ] `OcorrenciaService` — veículo inexistente → 404/400 com mensagem clara; motorista (se informado) idem
- [ ] `OcorrenciaController` em `/api/ocorrencias`
- [ ] Testes (`OcorrenciaApiTest`)

## Contrato (fixo)

| Campo | Tipo | Regra |
|---|---|---|
| id | number | gerado |
| titulo | string | obrigatório, máx. 160 |
| tipo | string | `"Manutenção"`, `"Acidente"`, `"Atraso"`, `"Outro"` |
| descricao | string | obrigatória, máx. 2000 |
| data | string | `yyyy-MM-dd` |
| status | string | `"Aberta"`, `"Em análise"`, `"Resolvida"` |
| veiculoId | number | obrigatório, deve existir |
| motoristaId | number \| null | opcional, se informado deve existir |

Endpoints: `GET /api/ocorrencias?q=&status=&tipo=&de=&ate=` (de/ate = `yyyy-MM-dd`, inclusivos),
`GET /{id}`, `POST` (201), `PUT /{id}`, `DELETE /{id}` (204).

Atenção: `VeiculoService.excluir` já bloqueia a exclusão de veículo com ocorrências (SQL nativo).
