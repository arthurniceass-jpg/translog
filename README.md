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
**Back-end** (precisa do Java 21):
```bash
cd backend
./mvnw spring-boot:run     # http://localhost:8080 · Swagger em /swagger-ui.html
./mvnw verify              # roda os testes
```

**Front-end** (precisa do Node 20+):
```bash
cd frontend
npm install
cp .env.example .env.local   # e defina VITE_API_URL=http://localhost:8080/api
npm run dev                  # http://localhost:5173
```
Usuário de demonstração: **admin@translog.com / admin123** (também dá para criar uma conta).

## Dados e persistência
- **Com a API (`VITE_API_URL` definida):** os dados vêm do back-end. Em desenvolvimento a API usa
  banco H2 em memória com dados iniciais, que voltam ao estado original quando ela reinicia.
- **Sessão:** o token JWT e os dados públicos do usuário (nome e e-mail) ficam no `localStorage`
  (`translog:token`, `translog:usuario`). A senha **nunca** é armazenada.
- **Contingência (sem `VITE_API_URL`):** os dados iniciais vêm de `src/data/*.json` e as alterações
  são gravadas no `localStorage` (`translog:demo:*`). As contas do modo demo guardam só o hash da senha.

## Contrato da API
URL-base configurada em `VITE_API_URL` (lida só em `src/services/http.js`). JSON, campos em português.
Todas as rotas exigem `Authorization: Bearer <token>`, exceto cadastro e login.

| Método | Endpoint | Corpo | Resposta |
|---|---|---|---|
| POST | `/api/auth/cadastro` | `{nome, email, senha}` | `201 {token, usuario}` · `409` e-mail já usado |
| POST | `/api/auth/login` | `{email, senha}` | `200 {token, usuario}` · `401` credenciais inválidas |
| GET | `/api/auth/me` | — | `200 {id, nome, email}` · `401` token inválido |
| GET | `/api/veiculos?q=&status=` | — | `200 [veículo]` |
| GET | `/api/veiculos/{id}` | — | `200 veículo` · `404` |
| POST | `/api/veiculos` | `{placa, marca, modelo, ano, status}` | `201 veículo` · `400` validação · `409` placa duplicada |
| PUT | `/api/veiculos/{id}` | igual ao POST | `200 veículo` · `400` · `404` · `409` |
| DELETE | `/api/veiculos/{id}` | — | `204` · `409` se houver ocorrências vinculadas |

Exemplo de resposta (veículo):
```json
{ "id": 1, "placa": "ABC1D23", "marca": "Volvo", "modelo": "FH 540", "ano": 2021, "status": "Disponível" }
```
Exemplo de erro (todas as rotas):
```json
{ "status": 400, "error": "Bad Request", "message": "Dados inválidos. Verifique os campos informados.",
  "path": "/api/veiculos", "fieldErrors": { "placa": "Placa inválida. Use ABC1234 ou ABC1D23." } }
```
Sem token ou com token inválido, a API responde `401` e o front encerra a sessão e volta ao login.
Motoristas, ocorrências e dashboard seguem o mesmo padrão; o contrato completo está em
[`backend/README.md`](backend/README.md) e no Swagger.

## Evolução da AV1 para a AV2
| Aspecto | Situação na AV1 | Evolução na AV2 | Evidência |
|---|---|---|---|
| Dados | JSON local + `localStorage` | API REST Spring Boot | `src/services/remote.js`, `backend/` |
| Autenticação | não implementada (mock local) | login JWT, rota protegida, sessão restaurada no F5, logout | `context/AuthContext.jsx`, `components/ProtectedRoute.jsx` |
| Estados da interface | lista e vazio | carregamento, sucesso, vazio e erro com tentar de novo | `components/Loading.jsx`, `context/ToastContext.jsx` |
| Erros | só validação local | erros da API exibidos, inclusive por campo; 401 encerra a sessão | `services/http.js`, `services/errors.js` |
| Organização | páginas e componentes | páginas, serviços, contextos e estilos separados | `frontend/src/` |
| Interface | layout inicial | novo layout, gráficos no dashboard, histórico por mês | `src/styles/`, `pages/` |

## Limitações e contingência
- **Módulos em andamento:** na API, autenticação e veículos estão prontos; motoristas, ocorrências e
  dashboard estão sendo implementados pela equipe. Enquanto um módulo não existe, a página mostra o
  erro com **Tentar de novo** e o restante do sistema continua funcionando.
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
