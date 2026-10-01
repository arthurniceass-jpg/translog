# TransLog — Sistema de Gestão de Transporte

Protótipo front-end (AV1) de um sistema para uma empresa de transporte controlar
**veículos**, **motoristas** e **ocorrências** em um só lugar. Projeto Evolutivo da
disciplina de Front-end Frameworks (React · JavaScript · Vite).

> **AV1:** protótipo com dados locais + `localStorage` (sem back-end).
> **AV2 (futuro):** integração com a API Spring Boot, autenticação e rotas protegidas.

---

## Problema e público
Empresas de transporte precisam acompanhar a frota, os condutores e as ocorrências
da operação. Hoje isso costuma ficar espalhado em planilhas. O **TransLog** centraliza
esse controle numa interface simples. **Público:** funcionários responsáveis pela
organização e acompanhamento dos veículos.

## Integrantes e contribuição
| Integrante | Papel | Contribuição |
|---|---|---|
| Arthur Niceas | Front-end / Back-end| Estrutura, navegação, módulos Veículos/Motoristas/Ocorrências, Dashboard e Histórico |
| Guilherme Aguiar | Front-end / Back-end | API Spring Boot (AV2), melhorias e revisão do front-endno|
| Gabriel Fernando | Integração / Gerência | Integração front/back e gestão do projeto (AV2) |
| Lucas Cardoso | UX / Documentação | Interface, experiência de uso e documentação |
| Guilherme Juarez | Banco de dados / Back-end | Modelagem de dados e back-end (AV2) |

## Funcionalidades (AV1)
- **Início** — finalidade do sistema + indicadores (nº de veículos, motoristas e ocorrências abertas).
- **Veículos** — listar, cadastrar, editar, excluir, buscar (placa/modelo) e filtrar por status.
- **Motoristas** — listar, cadastrar, editar, excluir, buscar (nome/CNH) e filtrar por status.
- **Ocorrências** — listar, cadastrar, editar, excluir, **ver detalhes**, buscar e filtrar por **status e tipo**.
- **Dashboard** — painel de indicadores com distribuições por status/tipo.
- **Histórico** — consulta de ocorrências com filtros por status, tipo e período.
- Mensagens condicionais (lista vazia, validação, sucesso), confirmação ao excluir e persistência no `localStorage`.

## Rotas da aplicação
| Rota | Página |
|---|---|
| `/` | Início |
| `/veiculos` · `/veiculos/novo` · `/veiculos/:id/editar` | Veículos (lista / cadastro / edição) |
| `/motoristas` · `/motoristas/novo` · `/motoristas/:id/editar` | Motoristas |
| `/ocorrencias` · `/ocorrencias/nova` · `/ocorrencias/:id` · `/ocorrencias/:id/editar` | Ocorrências (lista / cadastro / detalhe / edição) |
| `/dashboard` | Dashboard de indicadores |
| `/historico` | Histórico com filtros |

## Tecnologias
React (componentes funcionais) · JavaScript · Vite · React Router · CSS tradicional (`src/index.css`).
Estado global com **Context API** (`DataContext`) + hooks nativos. Sem Redux/Zustand/Axios.

## Como executar
```bash
npm install
npm run dev
```
Abra o endereço mostrado no terminal (por padrão `http://localhost:5173`).
Para gerar a versão de produção: `npm run build`.

## Dados e persistência
- **Dados iniciais:** arquivos locais em `src/data/` (`veiculos.json`, `motoristas.json`, `ocorrencias.json`).
- **Persistência:** na primeira execução os dados vêm do JSON; qualquer alteração
  (adicionar/editar/excluir) é gravada no **`localStorage`** e sobrevive ao recarregar a página (F5).
- Chaves usadas: `translog:veiculos`, `translog:motoristas`, `translog:ocorrencias`.
- Para restaurar os dados iniciais, limpe o `localStorage` do navegador.

## Estrutura de pastas
```
src/
  components/   Layout, SearchBar, EmptyState, Badge, Field, ConfirmDialog
  pages/        Home, Veiculos/VeiculoForm, Motoristas/MotoristaForm,
                Ocorrencias/OcorrenciaForm/OcorrenciaDetalhe, Dashboard, Historico
  context/      DataContext (estado + CRUD + persistência)
  hooks/        useLocalStorage
  data/         dados locais em JSON
```

## Contrato da API (AV2)
_A ser definido no checkpoint de integração. A API Spring Boot exporá autenticação e
operações de leitura/criação/alteração de veículos, motoristas e ocorrências._

## Evolução da AV1 para a AV2
_A ser preenchido na AV2 (tabela: dados locais → API, sem auth → login e rota protegida, etc.)._

## Limitações e contingência
- Não há back-end nesta entrega (AV1); todos os dados são locais.
- Sem autenticação nesta fase (obrigatória apenas na AV2).
- A contingência de dados locais (JSON) já reflete a estrutura que a interface consome.

## Uso de inteligência artificial
Parte do código foi gerada com auxílio de IA (assistente de programação) e então
**revisada, testada e ajustada** pela equipe, que compreende e sabe explicar cada parte.
A IA foi usada para acelerar a escrita de componentes repetitivos (formulários, listas)
e para revisão. As decisões de arquitetura, o modelo de dados e os requisitos seguem o
enunciado da disciplina.
