# Módulo Motorista

Implementado no padrão de `../veiculo/`. Tabelas `motoristas` e `motorista_categorias` vêm da migration
`V1__schema_inicial.sql`; a `V2__motoristas_indices.sql` só acrescenta CHECKs (CPF/CNH/telefone só com
dígitos e categoria A..E) — nenhum índice novo se justificou, e a V1 não foi alterada.

- `Motorista` — entidade; categorias via `@ElementCollection` (EAGER) em `motorista_categorias`.
- `MotoristaRepository` — `JpaSpecificationExecutor` + `@EntityGraph` na listagem (evita N+1);
  `contarOcorrencias` em SQL nativo para bloquear exclusão sem acoplar o módulo de ocorrências.
- `MotoristaMapper` — entidade <-> DTO; normaliza categorias (maiúscula, sem repetição, ordenadas).
- `MotoristaRequest` / `MotoristaResponse` — records; validação em português vira `fieldErrors`.
- `MotoristaService` — regras: CPF/CNH únicos (409), 404, exclusão bloqueada com ocorrências (409).
- `MotoristaController` — `/api/motoristas`, tudo protegido por JWT.
- `MotoristaApiTest` — CRUD, filtros, validações, conflitos, 404 e 401.

## Contrato (fixo — o front já depende dele)

| Campo | Tipo | Regra |
|---|---|---|
| id | number | gerado |
| nome | string | obrigatório, máx. 120 |
| cpf | string | 11 dígitos, **só números** (o front remove a máscara), único |
| cnh | string | 11 dígitos, só números, única |
| categorias | string[] | ao menos 1 de `"A".."E"`, sem repetição |
| telefone | string | 10 a 11 dígitos, só números |
| status | string | `"Disponível"`, `"Em viagem"` ou `"Inativo"` |

Endpoints: `GET /api/motoristas?q=&status=`, `GET /{id}`, `POST` (201), `PUT /{id}`, `DELETE /{id}` (204).
`q` casa nome, CNH ou CPF (parcial, sem diferenciar maiúscula/minúscula); a lista vem por `id` DESC.
