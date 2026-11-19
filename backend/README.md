# TransLog API (back-end)

API REST do TransLog — gestão de **veículos**, **motoristas** e **ocorrências** — em **Spring Boot 4.1 / Java 21**,
com JWT, Flyway e Swagger. O front (React/Vite) fica em `../frontend`.

## Rodar local (sem instalar nada além do Java 21)

```bash
cd backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

- Perfil padrão = `dev`: banco **H2 em memória** + dados de demonstração (os mesmos do front).
- Usuário de demonstração: **admin@translog.com / admin123**
- API em `http://localhost:8080` · Swagger em `http://localhost:8080/swagger-ui.html`
- Testes: `./mvnw verify`

Com Postgres (perfil `prod`): copie `.env.example` para `.env`, preencha `JWT_SECRET` e `DB_PASSWORD` e rode `docker compose up --build` (sobe banco + API) ou defina as variáveis abaixo e rode
`SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run`. O perfil `prod` **não** carrega dados de demonstração.

## Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `8080` | porta HTTP |
| `JWT_SECRET` | — (dev gera uma chave aleatória a cada execução) | **obrigatório em prod**, mínimo 32 caracteres |
| `JWT_EXPIRACAO_MINUTOS` | `120` | validade do token |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | origens permitidas, separadas por vírgula |
| `DATABASE_URL` | — | prod: `jdbc:postgresql://host:5432/translog` |
| `DB_USER` / `DB_PASSWORD` | — | prod: credenciais do Postgres |

## Contrato da API

Base `/api`, JSON, campos em pt-BR, ids numéricos. Toda rota exige `Authorization: Bearer <token>`, exceto
`/api/auth/cadastro`, `/api/auth/login`, Swagger e `/actuator/health`.

### Auth
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/api/auth/cadastro` | `{nome, email, senha(min 6)}` | `201 {token, usuario:{id,nome,email}}` · `409` e-mail duplicado |
| POST | `/api/auth/login` | `{email, senha}` | `200` igual ao cadastro · `401` "E-mail ou senha inválidos." |
| GET | `/api/auth/me` | — | `{id, nome, email}` |

### Veículos (módulo pronto — referência)
`GET /api/veiculos?q=&status=` · `GET /{id}` · `POST` (201) · `PUT /{id}` · `DELETE /{id}` (204)

```json
{ "id": 1, "placa": "ABC1D23", "marca": "Volvo", "modelo": "FH 540", "ano": 2021, "status": "Disponível" }
```
- `placa`: `ABC1234` ou `ABC1D23` (hífen e minúsculas são normalizados), única → `409`
- `ano`: 1950 até ano atual + 1
- `status`: `"Disponível"` | `"Em uso"` | `"Manutenção"`
- `q` busca em placa/marca/modelo; lista ordenada por `id` decrescente
- excluir veículo com ocorrências → `409`

### Motoristas (detalhes em `src/main/java/br/com/translog/motorista/README.md`)
`id, nome, cpf (11 dígitos), cnh (11 dígitos), categorias ["A".."E"], telefone (10–11 dígitos), status "Disponível" | "Em viagem" | "Inativo"`.
Categorias ficam na tabela auxiliar `motorista_categorias` (uma linha por categoria).

### Ocorrências (implementado — ver `src/main/java/br/com/translog/ocorrencia/README.md`)
`id, titulo, tipo "Manutenção" | "Acidente" | "Atraso" | "Outro", descricao, data (yyyy-MM-dd), status "Aberta" | "Em análise" | "Resolvida", veiculoId, motoristaId|null`.

`GET /api/ocorrencias?q=&status=&tipo=&de=&ate=` · `GET /{id}` · `POST` (201) · `PUT /{id}` · `DELETE /{id}` (204).

- Título obrigatório (máx. 160), descrição obrigatória (máx. 2000), tipo, data, status e veículo obrigatórios.
- `q` busca parcialmente em título/descrição sem distinguir maiúsculas de minúsculas.
- Filtros combináveis: `q`, `status`, `tipo`, `de`, `ate`; datas inclusivas; ordenação por `data DESC, id DESC`.
- Veículo ou motorista informado inexistente → `400` com o erro no campo (`fieldErrors`); motorista pode ser omitido ou `null`.
- Data no futuro → `400` (`fieldErrors.data`).
- `de > ate`, data mal formatada ou enum inválido → `400`.
- Funciona sem o módulo de motoristas: valida o ID diretamente na tabela já criada pela V1.

### Dashboard (detalhes em `src/main/java/br/com/translog/dashboard/README.md`)
`GET /api/dashboard/resumo` → contagens por status/tipo de veículos, motoristas e ocorrências.

### Formato de erro (todos os erros)
```json
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "Dados inválidos. Verifique os campos informados.",
  "path": "/api/veiculos", "fieldErrors": { "placa": "Placa inválida. Use ABC1234 ou ABC1D23." } }
```
`fieldErrors` só aparece em erros de validação (400).

## Arquitetura (camadas)

```
controller  →  service  →  repository  →  banco (Flyway)
   │             │
 DTOs         regras de negócio + exceções (NotFound/Conflict/ValorInvalido)
```

```
src/main/java/br/com/translog/
  config/      SecurityConfig (JWT stateless), CorsConfig, OpenApiConfig, *Properties
  common/      ApiError, GlobalExceptionHandler, exceções, Rotulado (enums com acento)
  auth/        cadastro/login/me, JwtService, Usuario
  veiculo/     MÓDULO DE REFERÊNCIA completo (entity, repository, service, controller, dto/, mapper)
  motorista/   TODO (README + enum pronto)
  ocorrencia/  CRUD, filtros combináveis, validação de vínculos, DTOs e mapper
src/main/resources/
  db/migration/V1__schema_inicial.sql   todas as tabelas (usuarios, veiculos, motoristas, motorista_categorias, ocorrencias)
  db/seed/V100__dados_demonstracao.sql  só no perfil dev
```

### Como criar um módulo novo (copiando `veiculo/`)
1. Crie o pacote `br.com.translog.<modulo>` e copie os arquivos de `veiculo/` trocando os nomes.
2. A **tabela já existe** em `V1__schema_inicial.sql`. Se precisar mudar o schema, crie `V2__...sql` (nunca edite a V1).
3. Enum com acento: copie `StatusVeiculo` (rótulo no JSON, nome do enum no banco).
4. Validação em português nos DTOs (`@NotBlank(message = "...")`) — vira `fieldErrors` automaticamente.
5. Erros: lance `NotFoundException` (404), `ConflictException` (409) ou `ValorInvalidoException` (400; passe o nome do campo para o formulário destacá-lo).
6. Escreva `<Modulo>ApiTest` copiando `VeiculoApiTest` e rode `./mvnw verify`.

## Git
Branch `feature/<modulo>` → commits convencionais em português (`feat: ...`, `fix: ...`) → Pull Request para `main`.
Rode `./mvnw verify` antes de abrir o PR.

## API de operação da frota

A migração `V101__operacao_frota.sql` preserva cadastros existentes e roda depois dos dados opcionais de demonstração da versão 100. Ela adiciona a quilometragem opcional ao veículo. Um PUT antigo de veículo que omite esse campo preserva o valor já cadastrado.

- `/api/manutencoes`, `/api/viagens`, `/api/abastecimentos` e `/api/documentos` oferecem listagem, criação, atualização e exclusão. Datas sem horário usam `YYYY-MM-DD`; horários de viagem são locais de Brasília, no formato `YYYY-MM-DDTHH:mm`. A agenda considera os intervalos previstos e libera as reservas canceladas.
- `GET /api/acompanhamentos` lista o acompanhamento para a fila de alertas. `GET /api/responsaveis` retorna identificador e nome dos usuários. `GET /api/resolucoes` lista os tempos medidos para ocorrências atualmente resolvidas e com abertura registrada.
- `GET/PUT /api/ocorrencias/{id}/acompanhamento` consulta ou modifica prazo, responsável e prioridade. A consulta inclui histórico e metadados dos anexos. O CRUD original de ocorrências mantém o mesmo contrato.
- `POST /api/ocorrencias/{id}/anexos` usa multipart com a parte `arquivo`. `GET/DELETE /api/ocorrencias/{id}/anexos/{anexoId}` baixa ou exclui o anexo associado. O download exige a sessão JWT e a exclusão da ocorrência remove seus anexos e histórico.

Os esquemas de requisição e resposta ficam no Swagger. Execute `./mvnw verify` em `backend/` para rodar a suíte de API, incluindo a disputa concorrente de agenda e a validação de anexos.
