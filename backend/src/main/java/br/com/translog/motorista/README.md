# Módulo Motorista — TODO (Guilherme Juarez)

A tabela `motoristas` e `motorista_categorias` já existem (migration `V1__schema_inicial.sql`) e o enum
`StatusMotorista` está pronto. **Falta implementar**, copiando o padrão de `../veiculo/`:

- [ ] `Motorista` (entity) — categorias via `@ElementCollection` na tabela `motorista_categorias` (uma linha por categoria A..E)
- [ ] `MotoristaRepository` (filtro `q` por nome/CNH/CPF + `status`)
- [ ] `dto/MotoristaRequest`, `dto/MotoristaResponse`, `MotoristaMapper`
- [ ] `MotoristaService` (CPF e CNH únicos → 409; excluir bloqueado se tiver ocorrências → 409)
- [ ] `MotoristaController` em `/api/motoristas`
- [ ] Testes (`MotoristaApiTest`, no estilo de `VeiculoApiTest`)

## Contrato (fixo — o front já depende dele)

| Campo | Tipo | Regra |
|---|---|---|
| id | number | gerado |
| nome | string | obrigatório, máx. 120 |
| cpf | string | 11 dígitos, **só números** (o front remove a máscara), único |
| cnh | string | 11 dígitos, só números, única |
| categorias | string[] | ao menos 1 de `"A".."E"` |
| telefone | string | 10 a 11 dígitos, só números |
| status | string | `"Disponível"`, `"Em viagem"` ou `"Inativo"` |

Endpoints: `GET /api/motoristas?q=&status=`, `GET /{id}`, `POST` (201), `PUT /{id}`, `DELETE /{id}` (204).
