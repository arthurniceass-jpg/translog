# Módulo Ocorrência — Guilherme Aguiar

Implementado seguindo as camadas controller → service → repository, com DTOs record e mapper.
A entidade usa os IDs dos vínculos e respeita o schema da migration V1, sem alterações no banco.
Todas as rotas exigem JWT (`Authorization: Bearer <token>`).

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

POST e PUT recebem os campos da tabela acima, exceto `id`. A resposta é plana, sem campos extras;
`motoristaId` é devolvido como `null` quando não há vínculo. Título e descrição têm espaços externos removidos.

## Filtros e ordenação

Todos os filtros são opcionais e combináveis por interseção, com `Specification`:

- `q`: busca parcial em título ou descrição, sem distinguir maiúsculas de minúsculas. Espaços externos
  são ignorados; `%`, `_` e `\` são tratados como texto literal.
- `status` e `tipo`: aceitam os rótulos com acento, seguindo o padrão dos enums do projeto.
- `de` e `ate`: datas ISO (`yyyy-MM-dd`), inclusivas; cada limite pode ser usado sozinho.
- Ordenação: `data DESC, id DESC`, inclusive sem filtros.

Exemplo: `GET /api/ocorrencias?q=pátio&status=Em%20análise&tipo=Manutenção&de=2026-09-01&ate=2026-09-30`
(codifique a URL em UTF-8 ao montar a requisição).

## Regras e erros

- Ocorrência inexistente: `404`, `Ocorrência não encontrada.`
- Veículo inexistente no POST ou PUT: `404`, `Veículo informado não existe.`
- Motorista informado e inexistente no POST ou PUT: `404`, `Motorista informado não existe.`
- Intervalo invertido: `400`, `A data inicial não pode ser maior que a final.`
- Datas mal formatadas ou enums inválidos: `400` no formato padrão do `GlobalExceptionHandler`.
- Campos obrigatórios e limites de tamanho: `400` com `fieldErrors` em português.
- Excluir veículo com ocorrência: `409`, pela regra existente em `VeiculoService`.

O módulo de motoristas ainda não é necessário para este módulo funcionar: a tabela `motoristas`
já existe na V1 e `OcorrenciaRepository.contarMotoristas` valida o ID com SQL nativo parametrizado.
Não há dependência de classes de motorista. Quando o módulo estiver disponível, os registros criados
por ele serão reconhecidos automaticamente. Até lá, é possível criar ocorrências sem motorista.

## Testes

Na pasta `backend/`, execute `./mvnw verify` (Java 21). A classe `OcorrenciaApiTest` cobre CRUD,
vínculos no POST/PUT, filtros isolados e combinados, ordenação, bordas inclusivas, erros de validação,
autenticação e o bloqueio da exclusão do veículo até a exclusão da ocorrência.

Os veículos são criados pela API. Motoristas de apoio são inseridos por SQL apenas nos testes,
pois a API de motoristas ainda não existe. Cada teste é transacional e tem seus dados revertidos.
