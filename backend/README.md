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

### Motoristas (a implementar — ver `src/main/java/br/com/translog/motorista/README.md`)
`id, nome, cpf (11 dígitos), cnh (11 dígitos), categorias ["A".."E"], telefone (10–11 dígitos), status "Disponível" | "Em viagem" | "Inativo"`.
Categorias ficam na tabela auxiliar `motorista_categorias` (uma linha por categoria).

### Ocorrências (a implementar — ver `src/main/java/br/com/translog/ocorrencia/README.md`)
`id, titulo, tipo "Manutenção" | "Acidente" | "Atraso" | "Outro", descricao, data (yyyy-MM-dd), status "Aberta" | "Em análise" | "Resolvida", veiculoId, motoristaId|null`.
Filtros: `q, status, tipo, de, ate`.

### Dashboard (a implementar)
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
  ocorrencia/  TODO (README + enums prontos)
src/main/resources/
  db/migration/V1__schema_inicial.sql   todas as tabelas (usuarios, veiculos, motoristas, motorista_categorias, ocorrencias)
  db/seed/V100__dados_demonstracao.sql  só no perfil dev
```

### Como criar um módulo novo (copiando `veiculo/`)
1. Crie o pacote `br.com.translog.<modulo>` e copie os arquivos de `veiculo/` trocando os nomes.
2. A **tabela já existe** em `V1__schema_inicial.sql`. Se precisar mudar o schema, crie `V2__...sql` (nunca edite a V1).
3. Enum com acento: copie `StatusVeiculo` (rótulo no JSON, nome do enum no banco).
4. Validação em português nos DTOs (`@NotBlank(message = "...")`) — vira `fieldErrors` automaticamente.
5. Erros: lance `NotFoundException` (404), `ConflictException` (409) ou `ValorInvalidoException` (400).
6. Escreva `<Modulo>ApiTest` copiando `VeiculoApiTest` e rode `./mvnw verify`.

## Git
Branch `feature/<modulo>` → commits convencionais em português (`feat: ...`, `fix: ...`) → Pull Request para `main`.
Rode `./mvnw verify` antes de abrir o PR.
