# TransLog — Sistema de Gestão de Transporte

Sistema para uma empresa de transporte controlar **veículos**, **motoristas** e
**ocorrências** em um só lugar. Projeto Evolutivo da disciplina de Front-end Frameworks
(React · JavaScript · Vite), equipe interdisciplinar com Back-end — **Opção B** (API própria).

> **AV1:** protótipo com dados locais (JSON + `localStorage`).
> **AV2:** front-end integrado à API Spring Boot da equipe, com login JWT e rotas protegidas.

---

## Problema e público
Empresas de transporte precisam acompanhar a frota, os condutores e as ocorrências
da operação. Hoje isso costuma ficar espalhado em planilhas. O **TransLog** centraliza
esse controle numa interface simples. **Público:** funcionários responsáveis pela
organização e acompanhamento dos veículos.

## Integrantes e contribuição
| Integrante | Papel | Contribuição |
|---|---|---|
| Arthur Niceas | Front-end / Back-end | AV1: estrutura, navegação e módulos. AV2: camada de serviços, autenticação no front, novo layout, base da API (auth JWT + módulo Veículos) |
| Guilherme Aguiar | Front-end / Back-end | AV2: módulo de Ocorrências na API (filtros e regras) |
| Gabriel Fernando | Integração / Gerência | AV2: Dashboard/Histórico na API e integração front/back |
| Lucas Cardoso | UX / Documentação | AV2: documentação da API, testes de aceitação e revisão de UX |
| Guilherme Juarez | Banco de dados / Back-end | AV2: módulo de Motoristas na API e modelagem/índices |

Como a equipe tem 5 integrantes, o escopo inclui **2 funcionalidades verticais adicionais**:
**Dashboard** (painel de indicadores) e **Histórico** (relatório com filtros e exportação CSV).

## Funcionalidades
- **Login e cadastro** — formulário validado, mensagens de erro (credencial inválida, servidor fora do ar), sessão com JWT e logout.
- **Visão geral** — finalidade do sistema, indicadores e ocorrências recentes.
- **Veículos** — listar, cadastrar, editar, excluir, buscar (placa/marca/modelo) e filtrar por status.
- **Motoristas** — listar, cadastrar, editar, excluir, buscar (nome/CNH) e filtrar por status.
- **Ocorrências** — listar, cadastrar, editar, excluir, ver detalhes, buscar e filtrar por status e tipo.
- **Dashboard** — indicadores e gráficos por status, tipo e mês.
- **Histórico** — ocorrências agrupadas por mês, filtros por status/tipo/período e exportação CSV.
- **Estados da interface** — carregamento (skeleton), sucesso (aviso), lista vazia, erro com **Tentar de novo**.

## Rotas da aplicação
| Rota | Página | Acesso |
|---|---|---|
| `/entrar` · `/cadastro` | Login e cadastro | público |
| `/` | Visão geral | protegida |
| `/veiculos` · `/veiculos/novo` · `/veiculos/:id/editar` | Veículos (lista / cadastro / edição) | protegida |
| `/motoristas` · `/motoristas/novo` · `/motoristas/:id/editar` | Motoristas | protegida |
| `/ocorrencias` · `/ocorrencias/nova` · `/ocorrencias/:id` · `/ocorrencias/:id/editar` | Ocorrências (lista / cadastro / detalhe / edição) | protegida |
| `/dashboard` | Dashboard de indicadores | protegida |
| `/historico` | Histórico com filtros | protegida |

Rotas protegidas sem sessão redirecionam para `/entrar` (`components/ProtectedRoute.jsx`).

## Tecnologias
- **Front-end:** React 19 (componentes funcionais), JavaScript, Vite, React Router, CSS tradicional
  (`src/styles/`), `fetch` concentrado em `src/services/`, estado global com Context API.
- **Back-end:** Spring Boot 4.1 / Java 21, Spring Security com JWT, Spring Data JPA, Flyway,
  H2 (desenvolvimento) e PostgreSQL (produção), Swagger/OpenAPI.

## Estrutura do repositório
```
frontend/          front-end (React + Vite)
  src/
    components/    peças reutilizáveis (Layout, Field, Badge, Charts...)
    context/       estado global (Auth, Data, Toast)
    pages/         uma página por rota
    services/      acesso à API com fetch (http, remote) e contingência (local)
    data/          dados de contingência em JSON
    styles/        CSS dividido por responsabilidade
    lib/           funções puras (formatação, CSV)
backend/           API Spring Boot (detalhes em backend/README.md)
```

## Como executar
Pré-requisitos: Java 21 para o back-end e Node.js 20+ para o front-end.

**Back-end:**
```bash
cd backend
./mvnw spring-boot:run     # http://localhost:8080 · Swagger em /swagger-ui.html
./mvnw verify              # roda os testes
```

**Front-end** (precisa do Node 20+):
```bash
cd frontend
npm install
cp .env.example .env.local   # configure VITE_API_URL=http://localhost:8080/api
npm run dev                  # http://localhost:5173
```
Sem `VITE_API_URL`, o front usa o modo demo local. Usuário de demonstração: **admin@translog.com / admin123** (também dá para criar uma conta).

## Dados e persistência
- **Com a API (`VITE_API_URL` definida):** os dados vêm do back-end. Em desenvolvimento a API usa
  banco H2 em memória com dados iniciais, que voltam ao estado original quando ela reinicia.
- **Sessão:** o token JWT e os dados públicos do usuário (nome e e-mail) ficam no `localStorage`
  (`translog:token`, `translog:usuario`). A senha **nunca** é armazenada.
- **Contingência (sem `VITE_API_URL`):** os dados iniciais vêm de `src/data/*.json` e as alterações
  são gravadas no `localStorage` (`translog:demo:*`). As contas do modo demo guardam só o hash da senha.

## Contrato da API (AV2)

A URL-base é configurada em `VITE_API_URL`; as rotas abaixo são relativas a `/api`. A API usa JSON e campos em português. As rotas `/api/**` exigem `Authorization: Bearer <token>`, exceto cadastro, login, Swagger e `/actuator/health`. Os endpoints listados foram conferidos nos controllers atuais; detalhes adicionais constam em [`backend/README.md`](backend/README.md).

### Autenticação

| Método | Rota | Corpo | Respostas documentadas |
|---|---|---|---|
| POST | `/api/auth/cadastro` | `{nome, email, senha}` | `201` `{token, usuario:{id,nome,email}}`; `400` validação; `409` e-mail duplicado |
| POST | `/api/auth/login` | `{email, senha}` | `200` `{token, usuario:{id,nome,email}}`; `400` validação; `401` credenciais inválidas |
| GET | `/api/auth/me` | — | `200` `{id, nome, email}`; `401` token inválido |

### Veículos

| Método | Rota | Corpo | Respostas documentadas |
|---|---|---|---|
| GET | `/api/veiculos?q=&status=` | — | `200` lista |
| GET | `/api/veiculos/{id}` | — | `200` veículo; `404` não encontrado |
| POST | `/api/veiculos` | `{placa, marca, modelo, ano, status}` | `201` criado; `400` validação; `409` placa duplicada |
| PUT | `/api/veiculos/{id}` | Os mesmos campos do POST | `200` atualizado; `400` validação; `404` não encontrado; `409` conflito |
| DELETE | `/api/veiculos/{id}` | — | `204` removido; `409` se houver ocorrências vinculadas |

Placas aceitas: `ABC1234` ou `ABC1D23`; hífen e letras minúsculas são normalizados. O ano permitido vai de 1950 até o ano atual + 1. Status: `Disponível`, `Em uso` ou `Manutenção`. A busca considera placa, marca e modelo; ordenação por ID decrescente.

### Ocorrências

| Método | Rota | Corpo | Respostas documentadas |
|---|---|---|---|
| GET | `/api/ocorrencias?q=&status=&tipo=&de=&ate=` | — | `200` lista filtrada |
| GET | `/api/ocorrencias/{id}` | — | `200` ocorrência; `404` não encontrada |
| POST | `/api/ocorrencias` | `{titulo, tipo, descricao, data, status, veiculoId, motoristaId}`; motorista pode ser omitido ou `null` | `201` criada; `400` validação ou vínculo inválido |
| PUT | `/api/ocorrencias/{id}` | Os mesmos campos do POST | `200` atualizada; `400` validação ou vínculo inválido; `404` não encontrada |
| DELETE | `/api/ocorrencias/{id}` | — | `204` removida; `404` não encontrada |

Tipos: `Manutenção`, `Acidente`, `Atraso` e `Outro`. Status: `Aberta`, `Em análise` e `Resolvida`. Busca parcial, sem distinção entre maiúsculas e minúsculas, por título/descrição. Filtros combináveis por busca, status, tipo e período; datas inclusivas; ordenação por data e ID decrescentes. Título (até 160 caracteres), descrição (até 2000), tipo, data, status e veículo são obrigatórios. Data futura e vínculo para veículo ou motorista inexistente são inválidos.

### Dashboard

| Método | Rota | Corpo | Respostas documentadas |
|---|---|---|---|
| GET | `/api/dashboard/resumo` | — | `200` `{totais, veiculosPorStatus, motoristasPorStatus, ocorrenciasPorStatus, ocorrenciasPorTipo}`; `401` não autenticado |

Em `totais`, o DTO atual contém `veiculos`, `motoristas`, `ocorrencias`, `ocorrenciasAbertas` e `veiculosDisponiveis`. O endpoint está presente em `DashboardController`; o README do backend ainda o identifica como “a implementar”, divergência que deve ser reconciliada pelos responsáveis da API.

### Motoristas e Histórico

O README do backend marca Motoristas como “a implementar” e não há controller de motorista no código atual. Os endpoints de motorista oferecidos pelo front não são confirmados como API e não são listados como contrato. O Histórico é uma tela front-end sobre os dados de ocorrências; não há endpoint específico de Histórico nos controllers examinados.

Erros de validação usam `{timestamp, status, error, message, path, fieldErrors}`; `fieldErrors` aparece em erros de validação. Sem token ou com token inválido, a API responde `401` e o front encerra a sessão e volta ao login.

## Evolução da AV1 para a AV2
| AV1 (antes) | AV2 (agora) |
|---|---|
| Dados em JSON local + `localStorage` | API Spring Boot; H2 em desenvolvimento e PostgreSQL em produção |
| Login simulado no `localStorage` | Login com JWT e rotas protegidas |
| Validação somente no front-end | Validação no front-end e no back-end, com mensagens em português |
| Sem persistência no servidor | Persistência gerenciada por Flyway; PostgreSQL no perfil de produção |
| Sem testes de API | Testes de API com JUnit, MockMvc e H2 por `./mvnw verify` |

## Limitações e contingência
- **Motoristas:** o front contém as telas, mas o README do backend marca o módulo como “a implementar” e o controller não existe no código consultado. Disponibilidade da API: A confirmar.
- **Dashboard:** `GET /api/dashboard/resumo` existe no controller, embora o README do backend ainda o marque como “a implementar”; alinhar a documentação do backend.
- **Falhas por recurso:** a interface mostra erro com **Tentar de novo** e outros módulos continuam funcionando.
- **Histórico:** filtros e exportação CSV são da interface; endpoint próprio não está documentado.
- **Servidor fora do ar:** o login mostra "Não foi possível conectar ao servidor"; quem já estava logado
  continua na sessão e vê o erro na página, nunca uma tela em branco.
- **Contingência para a apresentação:** sem `VITE_API_URL`, o front roda com os dados locais de
  `src/data/` (mesma estrutura da API), indicado pelo selo **Modo demo** no topo.
- **Banco de desenvolvimento:** o H2 em memória volta aos dados iniciais quando a API reinicia.

## Uso de inteligência artificial
A equipe usou um assistente de IA como apoio. Ele ajudou a gerar a camada de serviços do
front, o novo layout em CSS, os gráficos do dashboard e a base da API Spring Boot (autenticação JWT e
o módulo de veículos, que serve de modelo para os outros). Também foi usado para revisar o código e
rodar testes de ponta a ponta. Todo o código foi **revisado, testado e ajustado** pela equipe, que
sabe explicar cada parte. Decisões de arquitetura, modelo de dados e requisitos seguem o enunciado
da disciplina.
