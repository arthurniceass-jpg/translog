# TransLog — Sistema de Gestão de Transporte

Sistema para uma empresa de transporte controlar **veículos**, **motoristas** e
**ocorrências** em um só lugar. Projeto Evolutivo da disciplina de Front-end Frameworks.

- **AV1:** protótipo front-end com dados locais.
- **AV2 (atual):** front-end integrado a uma **API Spring Boot** com login JWT.

## Integrantes
| Integrante | Papel |
|---|---|
| Arthur Niceas | Front-end / Back-end |
| Guilherme Aguiar | Front-end / Back-end |
| Gabriel Fernando | Integração / Gerência |
| Lucas Cardoso | UX / Documentação |
| Guilherme Juarez | Banco de dados / Back-end |

## Estrutura do repositório
```
/                  front-end (React + Vite)
  src/
    components/    peças reutilizáveis (Layout, Field, Badge, Charts...)
    context/       estado global (Auth, Data, Toast)
    pages/         uma página por rota
    services/      acesso à API (http, remote, local/demo)
    styles/        CSS dividido por responsabilidade
    lib/           funções puras (formatação, CSV)
backend/           API Spring Boot (veja backend/README.md)
docs/              prompts e documentação da equipe
```

## Como rodar o front-end
```bash
npm install
npm run dev          # http://localhost:5173
```
Sem configuração, roda em **modo demo** (dados no `localStorage`, sem back-end).
Login demo: `admin@translog.com` / `admin123`.

Para usar a API, copie `.env.example` para `.env.local` e defina:
```
VITE_API_URL=http://localhost:8080/api
```

## Como rodar o back-end
```bash
cd backend
./mvnw spring-boot:run     # http://localhost:8080  (Swagger em /swagger-ui.html)
./mvnw verify              # roda os testes
```
Detalhes, variáveis de ambiente e contrato dos endpoints em [`backend/README.md`](backend/README.md).

## Funcionalidades
- **Autenticação:** cadastro, login, sessão com JWT e rotas protegidas.
- **Veículos, Motoristas e Ocorrências:** listar, cadastrar, editar, excluir, buscar e filtrar.
- **Visão geral e Dashboard:** indicadores e gráficos da operação.
- **Histórico:** ocorrências por mês, com filtros por status, tipo e período, e exportação CSV.

## Evolução da AV1 para a AV2
| Tema | AV1 | AV2 |
|---|---|---|
| Dados | JSON + `localStorage` | API REST (Spring Boot + JPA) |
| Login | mock local | JWT com BCrypt |
| Erros | mensagens locais | erros da API, inclusive por campo |
| Carregamento | instantâneo | skeletons e tentativa de novo |

## Status da integração com a API
| Módulo | Back-end | Responsável |
|---|---|---|
| Autenticação | pronto | Arthur |
| Veículos | pronto (módulo de referência) | Arthur |
| Motoristas | pendente | Guilherme Juarez |
| Ocorrências | pendente | Guilherme Aguiar |
| Dashboard / integração | pendente | Gabriel Fernando |
| Documentação e testes de aceitação | pendente | Lucas Cardoso |

Os prompts prontos para cada um estão em [`docs/PROMPTS-EQUIPE.md`](docs/PROMPTS-EQUIPE.md).
Enquanto um módulo não existe na API, o front mostra um aviso de carregamento
e os demais módulos continuam funcionando.

## Uso de inteligência artificial
Parte do código foi gerada com auxílio de IA (assistente de programação) e depois
**revisada, testada e ajustada** pela equipe, que compreende e sabe explicar cada parte.
Decisões de arquitetura, modelo de dados e requisitos seguem o enunciado da disciplina.
