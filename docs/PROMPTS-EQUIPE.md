# Prompts da equipe — TransLog AV2

Como usar: cada integrante abre uma IA open source (Qwen Coder, DeepSeek, Llama...), **cola o "Contexto comum" + o prompt da sua parte**
e, quando a IA pedir (ou logo depois do prompt), **cola o conteúdo dos arquivos de referência** listados no prompt.
A IA não tem acesso ao repositório — o que não for colado, ela não enxerga. Leia e teste tudo que ela gerar antes de commitar.

Divisão:

| Quem | Parte | Branch |
|---|---|---|
| Guilherme Juarez | Módulo **Motorista** (+ modelagem/índices) | `feature/motorista` |
| Guilherme Aguiar | Módulo **Ocorrência** (filtros, regra do veículo) | `feature/ocorrencia` |
| Gabriel Fernando | **Dashboard/Histórico** (endpoints) + **integração front/back** | `feature/dashboard`, `feature/integracao` |
| Lucas Cardoso | **Documentação**, testes manuais de aceitação, revisão de UX/mensagens | `docs/av2` |

Ordem sugerida: Juarez e Aguiar trabalham em paralelo (um não depende do outro; só `VeiculoService.excluir` já está pronto para
bloquear exclusão com ocorrências). Gabriel começa a integração com Veículos/Auth (já prontos) e liga Motorista/Ocorrência
conforme forem sendo mergeados. Lucas acompanha todos.

---

## Contexto comum (colar SEMPRE antes do prompt da sua parte)

```text
Você é um engenheiro de software sênior em Java/Spring Boot. Vou pedir código para o projeto TransLog, um sistema de gestão de
transporte (veículos, motoristas e ocorrências). Você NÃO tem acesso ao repositório: trabalhe só com o que eu colar aqui.
Responda em português. Entregue arquivos COMPLETOS (não trechos), um bloco de código por arquivo, com o caminho no topo.
Não invente classes/métodos que não estejam nos arquivos que colei; se faltar algo, me peça o arquivo.

PROJETO
- Front-end: React + Vite (raiz do repo). Back-end: pasta backend/ — Spring Boot 4.1, Java 21, Maven, pacote br.com.translog.
- Dependências: spring-boot-starter-webmvc, data-jpa, validation, security + oauth2-resource-server (JWT HS256), flyway, H2 (dev/testes),
  PostgreSQL (prod), springdoc-openapi. SEM Lombok. Jackson 3 (pacote tools.jackson.*, mas as anotações continuam em com.fasterxml.jackson.annotation).
- Testes: JUnit 5 + MockMvc + H2 (perfil "test"), rodando com ./mvnw verify. Os testes estendem br.com.translog.ApiTestBase (já existe).

ARQUITETURA (obrigatória)
- Camadas: controller (fino: @Valid, delega, define status HTTP) → service (regras de negócio, @Transactional) → repository (Spring Data JPA).
- DTOs como records (Request/Response). A entidade JPA NUNCA sai na API. Conversão em um Mapper (@Component), sem MapStruct.
- Erros: lance NotFoundException (404), ConflictException (409) ou ValorInvalidoException (400) de br.com.translog.common.
  O GlobalExceptionHandler devolve o JSON padrão {timestamp,status,error,message,path,fieldErrors}. Não crie try/catch nos controllers.
- Validação com Bean Validation, mensagens EM PORTUGUÊS no próprio annotation (ex.: @NotBlank(message = "Informe o nome.")).
- Enums com acento: o JSON usa o rótulo ("Em viagem"), o banco guarda o nome do enum (EM_VIAGEM). Use o padrão da interface Rotulado
  (@JsonValue no getRotulo + @JsonCreator no método estático de()).
- Filtros opcionais: use JpaSpecificationExecutor + Specification (NUNCA JPQL com "(:p is null or ...)", quebra no PostgreSQL).
- O schema do banco é criado pelo Flyway em db/migration/V1__schema_inicial.sql e o Hibernate só VALIDA (ddl-auto=validate).
  Nomes de coluna/tabela devem bater com a V1. Se precisar alterar o schema, crie V2__descricao.sql — nunca edite a V1.
- Todas as rotas /api/** exigem JWT (Authorization: Bearer ...). Nos testes, comToken(...) do ApiTestBase já envia o token.

SCHEMA (V1) das tabelas relevantes
  veiculos(id BIGINT identity, placa VARCHAR(7) unique, marca, modelo, ano INT, status VARCHAR(20))
  motoristas(id, nome VARCHAR(120), cpf VARCHAR(11) unique, cnh VARCHAR(11) unique, telefone VARCHAR(11), status VARCHAR(20))
  motorista_categorias(motorista_id FK motoristas ON DELETE CASCADE, categoria VARCHAR(1), PK(motorista_id, categoria))
  ocorrencias(id, titulo VARCHAR(160), tipo VARCHAR(20), descricao VARCHAR(2000), data DATE, status VARCHAR(20),
              veiculo_id BIGINT NOT NULL FK veiculos, motorista_id BIGINT NULL FK motoristas)

GIT (regras do time)
- Nunca commitar direto na main. Crie a branch indicada na sua tarefa a partir da main atualizada (git pull).
- Commits pequenos, convencionais e em português, ex.: "feat: cria módulo de motoristas", "test: cobre filtro por status", "fix: ...", "docs: ...".
- Antes do PR rode ./mvnw verify dentro de backend/ (tem que passar). Abra Pull Request para a main descrevendo o que mudou e como testar.
- Não coloque senhas/segredos no código.
```

---

## 1) Guilherme Juarez — módulo Motorista (+ modelagem/índices)

**Arquivos de referência para colar na IA** (de `backend/src/main/java/br/com/translog/` e `backend/src/main/resources/`):
`veiculo/Veiculo.java`, `veiculo/StatusVeiculo.java`, `veiculo/VeiculoRepository.java`, `veiculo/VeiculoService.java`,
`veiculo/VeiculoController.java`, `veiculo/VeiculoMapper.java`, `veiculo/dto/VeiculoRequest.java`, `veiculo/dto/VeiculoResponse.java`,
`motorista/StatusMotorista.java`, `motorista/README.md`, `common/Rotulado.java`, `common/GlobalExceptionHandler.java`,
`db/migration/V1__schema_inicial.sql` e, dos testes, `ApiTestBase.java` e `veiculo/VeiculoApiTest.java`.

```text
TAREFA: implementar o módulo MOTORISTA do back-end, seguindo EXATAMENTE o padrão do módulo veiculo/ que colei (é o módulo de referência).
Pacote: br.com.translog.motorista. Branch: feature/motorista.

CONTRATO (fixo — o front já depende dele; não mude nomes de campos)
Base: /api/motoristas. JSON em pt-BR.
  { "id": 1, "nome": "Carlos Andrade", "cpf": "12345678901", "cnh": "01234567890",
    "categorias": ["E"], "telefone": "81999990001", "status": "Disponível" }
Regras:
- nome: obrigatório, máx. 120. cpf: exatamente 11 dígitos, SÓ NÚMEROS (o front remove a máscara), único.
  cnh: exatamente 11 dígitos, só números, única. telefone: 10 a 11 dígitos, só números.
- categorias: lista com pelo menos 1 item, cada um "A","B","C","D" ou "E", sem repetição (normalize para maiúscula e remova duplicatas).
  Persistir na tabela motorista_categorias com @ElementCollection + @CollectionTable(name="motorista_categorias", joinColumns=@JoinColumn(name="motorista_id"))
  + @Column(name="categoria"), fetch EAGER (listas pequenas). Cuide de evitar N+1 na listagem se possível (ex.: @EntityGraph).
- status: "Disponível" | "Em viagem" | "Inativo" (enum StatusMotorista já existe).
Endpoints:
  GET    /api/motoristas?q=&status=   lista (array simples) ordenada por id DESC; q casa nome, cnh ou cpf (case-insensitive, parcial); status filtra
  GET    /api/motoristas/{id}         404 "Motorista não encontrado."
  POST   /api/motoristas              201 + corpo
  PUT    /api/motoristas/{id}         200 + corpo
  DELETE /api/motoristas/{id}         204
- CPF duplicado → 409 "Já existe um motorista com este CPF."; CNH duplicada → 409 "Já existe um motorista com esta CNH." (no PUT, ignore o próprio id).
- Excluir motorista que tenha ocorrências → 409 "Não é possível excluir o motorista X: existem N ocorrência(s) vinculada(s) a ele."
  (use o mesmo truque do veículo: @Query nativa "select count(*) from ocorrencias where motorista_id = :id", sem depender da entidade Ocorrencia).
- Mensagens de validação em português; erros no formato padrão (fieldErrors por campo).

ENTREGUE (arquivos completos): Motorista.java, MotoristaRepository.java, MotoristaMapper.java, MotoristaService.java, MotoristaController.java,
dto/MotoristaRequest.java, dto/MotoristaResponse.java e src/test/java/br/com/translog/motorista/MotoristaApiTest.java.
Não altere a migration V1 nem arquivos de outros módulos. Se achar que falta um índice/constraint, proponha uma V2__ensure_indices.sql separada.

MODELAGEM/ÍNDICES (parte 2): revise o schema da V1 para motoristas e proponha (em V2__motoristas_indices.sql, compatível com PostgreSQL e H2) o que realmente
agrega: ex. índice em lower(nome) se fizer sentido, CHECK de formato de cpf/cnh/telefone (somente dígitos) e CHECK de categoria IN ('A','B','C','D','E').
Explique em 3 linhas o motivo de cada item e confirme que a migration roda no H2 (testes) — se um recurso só existir no PostgreSQL, deixe de fora.

CRITÉRIOS DE ACEITE
- CRUD completo funcionando; filtros q e status; categorias salvas e devolvidas como array.
- CPF/CNH duplicados → 409; exclusão com ocorrências → 409; id inexistente → 404; status inválido no filtro/corpo → 400 com mensagem útil.
- Sem token → 401.
CHECKLIST DE TESTE (MotoristaApiTest, MockMvc, um @Test por item): cria e lê; atualiza; exclui; lista filtrada por q; filtra por status;
validação 400 com fieldErrors (cpf curto, categoria vazia/ inválida, telefone curto); CPF duplicado 409; CNH duplicada 409;
exclusão bloqueada com ocorrência (insira via JdbcTemplate como no VeiculoApiTest); 404; 401 sem token.
Use CPF/CNH gerados aleatoriamente nos testes (o banco de teste é compartilhado entre as classes).
No final, liste os comandos git para a branch feature/motorista e o texto do PR.
```

---

## 2) Guilherme Aguiar — módulo Ocorrência (filtros + regra do veículo)

**Arquivos de referência para colar:** os mesmos do módulo veiculo (`Veiculo.java`, `StatusVeiculo.java`, `VeiculoRepository.java`, `VeiculoService.java`,
`VeiculoController.java`, `VeiculoMapper.java`, `dto/VeiculoRequest.java`, `dto/VeiculoResponse.java`) + `ocorrencia/StatusOcorrencia.java`,
`ocorrencia/TipoOcorrencia.java`, `ocorrencia/README.md`, `common/Rotulado.java`, `common/GlobalExceptionHandler.java`,
`db/migration/V1__schema_inicial.sql`, `ApiTestBase.java`, `veiculo/VeiculoApiTest.java`.
(Se o módulo Motorista do Juarez já estiver na main, cole também `Motorista.java` e `MotoristaRepository.java`; se não, use apenas `motoristaId` como Long e valide a existência com uma query nativa/`existsById` quando o repository existir.)

```text
TAREFA: implementar o módulo OCORRÊNCIA do back-end seguindo o padrão do módulo veiculo/ (referência). Pacote: br.com.translog.ocorrencia. Branch: feature/ocorrencia.

CONTRATO (fixo)
Base: /api/ocorrencias.
  { "id": 1, "titulo": "Colisão no pátio", "tipo": "Acidente", "descricao": "Colisão leve...", "data": "2026-09-20",
    "status": "Aberta", "veiculoId": 6, "motoristaId": 5 }          // motoristaId pode ser null
- titulo: obrigatório, máx. 160. descricao: obrigatória, máx. 2000. data: obrigatória, formato yyyy-MM-dd (LocalDate).
- tipo: "Manutenção" | "Acidente" | "Atraso" | "Outro" (enum TipoOcorrencia já existe). status: "Aberta" | "Em análise" | "Resolvida" (StatusOcorrencia já existe).
- veiculoId: OBRIGATÓRIO e deve existir → senão 404 com "Veículo informado não existe." (decisão: 404; mantenha consistente).
- motoristaId: OPCIONAL; se informado deve existir → senão 404 "Motorista informado não existe."
Endpoints:
  GET    /api/ocorrencias?q=&status=&tipo=&de=&ate=   array ordenado por data DESC, id DESC.
         q casa titulo ou descricao (parcial, case-insensitive); status e tipo aceitam os rótulos com acento ("Em análise");
         de/ate = yyyy-MM-dd, INCLUSIVOS; de > ate → 400 "A data inicial não pode ser maior que a final."; data mal formatada → 400.
  GET    /api/ocorrencias/{id}   404 "Ocorrência não encontrada."
  POST   → 201;  PUT /{id} → 200;  DELETE /{id} → 204.
Todos os filtros são opcionais e combináveis (use Specification, como em VeiculoService.listar — NÃO use JPQL com parâmetros nulos).
A resposta é plana (só ids). Opcional (bônus, só se não quebrar o contrato): campos extras veiculoPlaca e motoristaNome no Response para
o Histórico do front não precisar de várias chamadas — se fizer, avise e documente.

ENTREGUE (arquivos completos): Ocorrencia.java, OcorrenciaRepository.java, OcorrenciaMapper.java, OcorrenciaService.java, OcorrenciaController.java,
dto/OcorrenciaRequest.java, dto/OcorrenciaResponse.java, OcorrenciaApiTest.java (em src/test/java/br/com/translog/ocorrencia/).
Não altere a migration V1. Parse de de/ate: use @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate (trate a conversão inválida como 400).

CRITÉRIOS DE ACEITE
- CRUD completo; filtros combináveis; veículo inexistente rejeitado; motorista inexistente rejeitado; criar ocorrência sem motorista funciona.
- Depois de criar uma ocorrência para um veículo, DELETE /api/veiculos/{id} desse veículo devolve 409 (regra já implementada no VeiculoService — prove no teste).
CHECKLIST DE TESTE (OcorrenciaApiTest): cria com e sem motorista; lê; atualiza status "Aberta"→"Resolvida"; exclui;
filtros: por status, por tipo, por intervalo de datas (bordas inclusivas), por q, e combinados; de > ate → 400; veículo inexistente → 404;
motorista inexistente → 404; validação 400 com fieldErrors (titulo vazio, tipo ausente, data ausente, descricao vazia); tipo/status inválido → 400; 401 sem token.
Crie o veículo necessário pelo próprio teste via POST /api/veiculos (placa única).
No final, liste os comandos git para feature/ocorrencia e o texto do PR.
```

---

## 3a) Gabriel Fernando — Dashboard / Histórico (endpoints)

**Arquivos de referência para colar:** `veiculo/VeiculoController.java`, `veiculo/VeiculoService.java`, `veiculo/VeiculoRepository.java`,
`veiculo/StatusVeiculo.java`, `motorista/StatusMotorista.java`, `ocorrencia/StatusOcorrencia.java`, `ocorrencia/TipoOcorrencia.java`,
`common/GlobalExceptionHandler.java`, `ApiTestBase.java`, `veiculo/VeiculoApiTest.java`, `db/migration/V1__schema_inicial.sql`.
Pré-requisito: módulos Motorista e Ocorrência mergeados na main (ou faça por SQL nativo com `JdbcTemplate`/`@Query(nativeQuery=true)` para não depender deles).

```text
TAREFA: criar o módulo DASHBOARD do back-end (somente leitura). Pacote: br.com.translog.dashboard. Branch: feature/dashboard.

CONTRATO (fixo — o front monta os gráficos com isso)
GET /api/dashboard/resumo  (autenticado) →
{
  "totais": { "veiculos": 6, "motoristas": 5, "ocorrencias": 5, "ocorrenciasAbertas": 2, "veiculosDisponiveis": 3 },
  "veiculosPorStatus":     { "Disponível": 3, "Em uso": 2, "Manutenção": 1 },
  "motoristasPorStatus":   { "Disponível": 2, "Em viagem": 2, "Inativo": 1 },
  "ocorrenciasPorStatus":  { "Aberta": 2, "Em análise": 1, "Resolvida": 2 },
  "ocorrenciasPorTipo":    { "Manutenção": 2, "Acidente": 1, "Atraso": 1, "Outro": 1 }
}
- As chaves dos mapas são os RÓTULOS com acento e TODAS as chaves do enum aparecem, mesmo com valor 0 (preencha zeros).
- Use agregações no banco (GROUP BY via @Query), não carregue tudo na memória. Prefira queries JPQL/nativas com projeção em records/interfaces.
Arquivos: DashboardController, DashboardService, DashboardRepository (ou queries nas repositories dos módulos), dto/ResumoResponse.java
(records aninhados, Map<String,Long> com LinkedHashMap para manter a ordem), DashboardApiTest.

HISTÓRICO: o front já usa GET /api/ocorrencias com filtros q/status/tipo/de/ate (módulo do Aguiar). Verifique se esse endpoint atende a tela
de Histórico (ordenado por data DESC) e, se faltar algo (ex.: placa do veículo e nome do motorista na resposta), registre uma issue/combine com o Aguiar
em vez de duplicar endpoint.

CRITÉRIOS DE ACEITE: resposta idêntica ao contrato; zeros preenchidos; 401 sem token; teste cria dados conhecidos e confere as contagens
(o banco de teste é compartilhado entre classes: compare DELTAS — consulte antes e depois — em vez de valores absolutos).
No final, comandos git para feature/dashboard e texto do PR.
```

## 3b) Gabriel Fernando — integração front/back (ponta a ponta)

Esta parte é mais de **execução e diagnóstico** do que de gerar código. Cole o prompt abaixo junto com a saída/erro que você estiver vendo.

```text
CONTEXTO: front React+Vite (porta 5173) e API Spring Boot (porta 8080) do TransLog. O front lê a URL da API de import.meta.env.VITE_API_URL
(arquivo .env.local na raiz do front: VITE_API_URL=http://localhost:8080). A API usa JWT (Authorization: Bearer) e CORS liberado só para as origens
em CORS_ORIGINS (padrão http://localhost:5173). Formato de erro da API: {timestamp,status,error,message,path,fieldErrors}.
Login de demonstração (perfil dev, H2 com dados): admin@translog.com / admin123.

TAREFA: me guie para validar a integração ponta a ponta e diagnosticar qualquer falha. Quero um roteiro com comandos exatos:
1) subir a API (cd backend && ./mvnw spring-boot:run) e conferir http://localhost:8080/actuator/health e /swagger-ui.html;
2) criar .env.local, subir o front (npm run dev) e testar: cadastro, login, logout, rota protegida sem token, token expirado (simule apagando o token do localStorage);
3) CRUD de cada módulo pelo navegador, olhando a aba Network do DevTools (status, payload, resposta);
4) se aparecer erro de CORS (preflight OPTIONS bloqueado), explique como ler o erro e como ajustar CORS_ORIGINS para outra porta/origem;
5) se aparecer 401/403/409/400, como mapear para a mensagem mostrada na tela (o front exibe o campo "message" e "fieldErrors" por campo);
6) um checklist final "pronto para apresentar" (dados de demonstração, usuário de teste, ordem da demo).
Vou colar a seguir o erro/print do console ou o corpo da resposta de rede; analise e diga a causa mais provável e o ajuste mínimo.
Atenção: nada de chave/segredo real no repositório; o JWT_SECRET de produção vai em variável de ambiente.
```

Git da integração: branch `feature/integracao`, commits do tipo `feat: liga front à API` / `fix: ajusta CORS`; PR para a main com o roteiro de teste que você usou.

---

## 4) Lucas Cardoso — documentação, aceitação manual e revisão de UX

**Arquivos para colar:** `backend/README.md`, `README.md` (raiz), `backend/src/main/java/br/com/translog/veiculo/VeiculoController.java`,
`veiculo/dto/VeiculoRequest.java`, `common/GlobalExceptionHandler.java` e, se já existirem, os controllers de motorista/ocorrência.

```text
TAREFA 1 — Documentação (branch docs/av2). Reescreva as seções do README.md da raiz do projeto que estão como "A ser definido":
"Contrato da API (AV2)" e "Evolução da AV1 para a AV2". A segunda deve ser uma TABELA com as colunas "AV1 (antes)" → "AV2 (agora)":
dados em JSON local + localStorage → API Spring Boot + banco; login mock no localStorage → login real com JWT e rotas protegidas;
validação só no front → validação no front e no back (mensagens em português); sem persistência real → Flyway + Postgres; sem testes → testes de API.
O "Contrato da API" deve listar, por módulo, método, rota, corpo e códigos de resposta (200/201/204/400/401/404/409), usando EXATAMENTE as informações
do backend/README.md que colei. Atualize também "Limitações e contingência" (o que ainda não existe) e "Como executar" (back + front, VITE_API_URL).
Não invente endpoints. Se algo estiver ambíguo, liste as dúvidas no final em vez de chutar.

TAREFA 2 — OpenAPI. Para cada controller que colei, proponha anotações springdoc (io.swagger.v3.oas.annotations: @Tag, @Operation(summary), @ApiResponse)
em português, sem alterar a lógica. Entregue os arquivos completos alterados.

TAREFA 3 — Roteiro de testes manuais de aceitação (arquivo docs/TESTES-ACEITACAO.md): tabela com ID, pré-condição, passos, resultado esperado e coluna
"Passou? (S/N)". Cubra: cadastro/login/logout/rota protegida; CRUD de veículos, motoristas e ocorrências; busca e filtros; validações (campos vazios,
placa inválida, CPF com 10 dígitos, ano 1800, e-mail duplicado); exclusão de veículo com ocorrência (deve ser bloqueada com mensagem amigável);
responsividade no celular; mensagens de erro quando a API está fora do ar.

TAREFA 4 — Revisão de UX/mensagens: liste TODAS as mensagens de erro/validação que o usuário pode ver (as do backend estão nos arquivos colados) e proponha
ajustes de clareza e tom (curtas, sem jargão, em português do Brasil), mantendo o sentido. Tabela: "mensagem atual" → "sugestão" → "arquivo".
Qualquer mudança de texto no backend precisa ajustar também os testes que comparam a mensagem — avise quais.

Entregue em blocos separados por tarefa. Git: branch docs/av2; commits "docs: ..."; PR para a main.
```

---

## Prompt genérico — revisão de Pull Request

Qualquer integrante pode usar para revisar o PR de outro (cole o diff do PR — `git diff main...feature/x` — e, se der, os arquivos de referência de `veiculo/`).

```text
Você é um revisor de código sênior de Spring Boot 4 / Java 21. Revise o diff abaixo de um Pull Request do projeto TransLog.
Regras do projeto: camadas controller → service → repository; DTOs como records e entidade nunca exposta; erros via NotFoundException/ConflictException/
ValorInvalidoException (sem try/catch no controller); validação com mensagens em português; enums com rótulo acentuado no JSON e nome do enum no banco
(padrão Rotulado + @JsonCreator); filtros opcionais com Specification (nunca JPQL com parâmetros nulos); schema só via Flyway (sem editar a V1, sem ddl-auto);
sem Lombok; todas as rotas /api/** autenticadas; testes MockMvc estendendo ApiTestBase; commits convencionais em português.

Responda em português, neste formato:
1. RESUMO (2-3 linhas do que o PR faz).
2. BLOQUEANTES (bugs, quebra de contrato, vazamento de entidade/senha, SQL injection, rota sem proteção, regra de negócio faltando, teste que não prova nada) — com arquivo:linha e correção sugerida.
3. IMPORTANTES (N+1, falta de @Transactional, mensagens fora do padrão, validação faltando, nomes inconsistentes com o módulo veiculo/).
4. SUGESTÕES (legibilidade, simplificação) — curtas.
5. TESTES: o que está coberto e o que falta (compare com o checklist da tarefa).
6. VEREDITO: "Aprovar", "Aprovar com ajustes" ou "Pedir mudanças".
Seja específico e não invente problemas: se algo está certo, diga que está certo. Se faltar contexto, pergunte em vez de supor.

DIFF:
<cole aqui>
```

---

## Dicas rápidas para todos

- Rodar a API: `cd backend && ./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`) → `http://localhost:8080/swagger-ui.html`. Login: `admin@translog.com` / `admin123`.
- Rodar testes: `./mvnw verify`. Se a IA gerou código que não compila, cole o erro **inteiro** de volta nela.
- IA open source erra APIs do Spring Boot 4 (nomes de pacotes mudaram, Jackson agora é `tools.jackson`). Quando suspeitar, compare com os arquivos de `veiculo/`, que **já compilam e têm teste passando**.
- Conflito de merge: `git pull --rebase origin main` na sua branch e resolva; na dúvida, chame o Arthur.
