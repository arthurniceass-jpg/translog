# Módulo Dashboard (Gabriel Fernando)

Módulo **somente leitura** com os indicadores da operação. Todas as agregações acontecem no banco
(`COUNT`/`GROUP BY` via `JdbcTemplate`), sem carregar registros para a memória e sem depender das
entidades dos módulos de Motorista/Ocorrência.

## Endpoint

`GET /api/dashboard/resumo` — exige JWT (`Authorization: Bearer ...`), como todas as rotas `/api/**`.

Resposta (contrato fixo usado pelos gráficos do front):

```json
{
  "totais": { "veiculos": 6, "motoristas": 5, "ocorrencias": 5, "ocorrenciasAbertas": 2, "veiculosDisponiveis": 3 },
  "veiculosPorStatus": { "Disponível": 3, "Em uso": 2, "Manutenção": 1 },
  "motoristasPorStatus": { "Disponível": 2, "Em viagem": 2, "Inativo": 1 },
  "ocorrenciasPorStatus": { "Aberta": 2, "Em análise": 1, "Resolvida": 2 },
  "ocorrenciasPorTipo": { "Manutenção": 2, "Acidente": 1, "Atraso": 1, "Outro": 1 }
}
```

Regras:

- as chaves dos mapas são os **rótulos com acento** (`Rotulado.getRotulo()`);
- **todas** as constantes do enum aparecem, inclusive com valor `0`, na ordem de declaração do enum;
- `ocorrenciasAbertas` conta somente `status = 'ABERTA'` (as "Em análise" não entram);
- `veiculosDisponiveis` conta somente `status = 'DISPONIVEL'`.

Arquivos: `DashboardController`, `DashboardService`, `DashboardRepository`, `dto/ResumoResponse` e
`DashboardApiTest` (teste por **delta**: o H2 é compartilhado entre as classes de teste).

## Histórico de ocorrências

A tela de Histórico (`frontend/src/pages/Historico.jsx`) usa `GET /api/ocorrencias` com
`q`/`status`/`tipo`/`de`/`ate`, ordenado por `data DESC` (empate por `id DESC`) — contrato já previsto
no módulo de Ocorrência. A tela resolve a placa e o nome do motorista no front a partir das listas de
veículos e motoristas já carregadas, então **não é necessário** expor `placa`/`nomeMotorista` nem
duplicar o endpoint no dashboard.

Observação para o time (possível melhoria futura, não bloqueia a AV2): se a listagem de ocorrências
passar a ser paginada, a tela de Histórico vai precisar da placa/nome na própria resposta (ou de um
`include=veiculo,motorista`) para não fazer N chamadas. Enquanto a lista vier completa, o contrato atual
atende. Se o módulo de Ocorrência for alterado, alinhar com o Guilherme Aguiar antes de mudar o payload.
