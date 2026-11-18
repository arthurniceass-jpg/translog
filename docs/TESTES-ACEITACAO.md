# Testes de Aceitação — TransLog

## Objetivo

Registrar a execução manual dos principais fluxos do TransLog e verificar se a interface se comporta conforme as funcionalidades descritas no README e implementadas no projeto. Este roteiro não substitui os testes automatizados da API.

## Orientações de preenchimento

- Execute cada cenário e registre em “Resultado obtido” o que ocorreu, incluindo mensagens relevantes.
- Altere “Status” para “Aprovado”, “Reprovado” ou “Bloqueado”, conforme o resultado; mantenha “Não executado” enquanto não houver execução.
- Preencha “Passou? (S/N)” com “S” ou “N” após executar; deixe em branco enquanto o cenário não tiver sido executado.
- Use contas e registros de teste. Evite dados pessoais reais. Anote identificadores ou valores usados quando forem necessários para reproduzir o cenário.
- Cenários dependentes de recursos da API marcados “A confirmar” devem ser executados somente quando o recurso estiver disponível no ambiente. Não interprete “A confirmar” como resultado aprovado.
- Os testes deste documento não foram executados. Preencha o resumo final ao concluir a rodada.

## Ambiente utilizado nos testes

| Item | Valor registrado |
|---|---|
| Data e responsável pela execução | A confirmar |
| Front-end | A confirmar; execução local documentada em `http://localhost:5173` |
| API | A confirmar; execução local documentada em `http://localhost:8080` |
| Modo | A confirmar: com `VITE_API_URL`, API; sem essa variável, modo demo local |
| Navegador e versão | A confirmar |
| Dispositivo e tamanho da viewport | A confirmar em cada teste de responsividade |
| Versões de Node.js e Java | A confirmar; README indica Node 20+ e Java 21 para execução local |
| Conta de teste | A confirmar; no modo demo, o README documenta `admin@translog.com` / `admin123` |

## Cadastro de usuário

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| CAD-01 | Criar conta com dados válidos | Estar deslogado e na tela `/cadastro`; usar e-mail ainda não cadastrado | Informar nome, e-mail válido, senha com pelo menos 6 caracteres e confirmação igual; selecionar “Criar conta” | Conta criada, sessão autenticada e navegação para a área protegida inicial |  | Não executado |  |
| CAD-02 | Validar campos obrigatórios | Estar deslogado e na tela `/cadastro` | Deixar nome, e-mail, senha e confirmação vazios; enviar o formulário | Envio impedido e validações exibidas nos campos correspondentes |  | Não executado |  |
| CAD-03 | Recusar e-mail inválido e senhas inválidas | Estar deslogado e na tela `/cadastro` | Testar e-mail em formato inválido; testar senha com menos de 6 caracteres; testar confirmação diferente | Envio impedido e mensagem de validação correspondente exibida para cada campo inválido |  | Não executado |  |
| CAD-04 | Tratar e-mail já cadastrado | API disponível; possuir uma conta já cadastrada | Tentar cadastrar novamente usando o mesmo e-mail | Cadastro não concluído; erro informado pela API é apresentado no formulário. Texto exato da mensagem: A confirmar |  | Não executado |  |

## Login

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| LOG-01 | Entrar com credenciais válidas | Conta de teste existente; estar deslogado | Em `/entrar`, informar e-mail e senha válidos e enviar | Sessão iniciada e usuário direcionado à área protegida inicial ou à rota protegida que tentou acessar |  | Não executado |  |
| LOG-02 | Recusar credenciais inválidas | API disponível ou conta demo configurada; estar deslogado | Informar credenciais incorretas e enviar | Permanecer na tela de login e exibir uma mensagem de erro, sem autenticar |  | Não executado |  |
| LOG-03 | Validar e-mail e senha obrigatórios | Estar deslogado e na tela `/entrar` | Enviar com campos vazios; depois testar e-mail em formato inválido | Envio impedido e validações exibidas nos campos correspondentes |  | Não executado |  |
| LOG-04 | Usar preenchimento de demonstração | Modo demo e tela `/entrar` | Selecionar “preencher” na área Modo demo | Campos de e-mail e senha recebem as credenciais de demonstração indicadas na tela |  | Não executado |  |

## Logout

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| SAI-01 | Encerrar sessão pelo controle “Sair” | Usuário autenticado em uma página protegida | Acionar o controle “Sair” na navegação | Sessão encerrada e navegação para `/entrar` |  | Não executado |  |
| SAI-02 | Confirmar proteção após logout | Ter concluído SAI-01 | Digitar diretamente uma rota protegida, como `/veiculos` | Acesso não autenticado é redirecionado para `/entrar` |  | Não executado |  |

## Acesso a rotas protegidas

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| ROT-01 | Bloquear acesso direto à visão geral | Estar deslogado | Acessar `/` diretamente pela barra de endereço | Redirecionar para `/entrar` |  | Não executado |  |
| ROT-02 | Bloquear acesso direto às rotas de veículos e motoristas | Estar deslogado | Acessar `/veiculos`, `/veiculos/novo`, `/motoristas` e `/motoristas/novo`, uma rota por vez | Cada rota protegida solicita autenticação e direciona para `/entrar` |  | Não executado |  |
| ROT-03 | Bloquear acesso direto às rotas de ocorrências e análises | Estar deslogado | Acessar `/ocorrencias`, `/ocorrencias/nova`, `/ocorrencias/1`, `/ocorrencias/1/editar`, `/dashboard` e `/historico`, uma rota por vez | Cada rota protegida solicita autenticação e direciona para `/entrar` |  | Não executado |  |

## Veículos: criação, consulta, edição e exclusão

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| VEI-01 | Cadastrar veículo | Usuário autenticado | Em `/veiculos`, selecionar “Novo veículo”; preencher placa, marca, modelo, ano e status; cadastrar | Veículo aparece na listagem com os dados informados e indicação de sucesso |  | Não executado |  |
| VEI-02 | Consultar veículo na lista | Existir ao menos um veículo cadastrado | Abrir `/veiculos` e localizar o registro | Lista apresenta placa, marca/modelo, ano e status; contador reflete os resultados |  | Não executado |  |
| VEI-03 | Editar veículo | Existir veículo cadastrado | Acionar “Editar” no registro; alterar um ou mais campos; salvar alterações | Lista apresenta os dados atualizados e indicação de sucesso |  | Não executado |  |
| VEI-04 | Cancelar exclusão de veículo | Existir veículo cadastrado | Acionar “Excluir” e cancelar a confirmação | Diálogo fecha e veículo continua na lista |  | Não executado |  |
| VEI-05 | Confirmar exclusão de veículo | Existir veículo sem ocorrências vinculadas, para evitar o conflito documentado pela API | Acionar “Excluir” e confirmar | Veículo removido da lista e indicação de sucesso; caso a API recuse a remoção, registrar a mensagem e o status observado |  | Não executado |  |
| VEI-06 | Bloquear exclusão de veículo com ocorrência vinculada | Existir veículo associado a uma ocorrência | Na lista de veículos, acionar “Excluir” para esse veículo e confirmar | Exclusão é recusada; a ocorrência e o veículo permanecem; interface apresenta mensagem amigável de conflito |  | Não executado |  |

## Motoristas: criação, consulta, edição e exclusão

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| MOT-01 | Cadastrar motorista | Usuário autenticado; tela disponível no modo selecionado | Em `/motoristas`, selecionar “Novo motorista”; preencher nome, CPF, telefone, CNH, status e ao menos uma categoria; cadastrar | Motorista aparece na listagem com os dados informados e indicação de sucesso. Disponibilidade do endpoint na API: A confirmar |  | Não executado |  |
| MOT-02 | Consultar motorista na lista | Existir motorista cadastrado e módulo disponível | Abrir `/motoristas` e localizar o registro | Lista apresenta motorista, CNH, categorias e status; telefone também é exibido |  | Não executado |  |
| MOT-03 | Editar motorista | Existir motorista cadastrado e módulo disponível | Acionar “Editar” no registro; alterar dados; salvar alterações | Lista apresenta os dados atualizados e indicação de sucesso |  | Não executado |  |
| MOT-04 | Cancelar exclusão de motorista | Existir motorista cadastrado | Acionar “Excluir” e cancelar a confirmação | Diálogo fecha e motorista continua na lista |  | Não executado |  |
| MOT-05 | Confirmar exclusão de motorista | Existir motorista cadastrado sem vínculo que impeça a exclusão; módulo disponível | Acionar “Excluir” e confirmar | Motorista removido da lista e indicação de sucesso. Regras de vínculo e disponibilidade da API: A confirmar |  | Não executado |  |

## Ocorrências: criação, consulta, edição e exclusão

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| OCO-01 | Registrar ocorrência sem motorista | Usuário autenticado e ao menos um veículo disponível | Em `/ocorrencias`, selecionar “Nova ocorrência”; preencher título, tipo, data, veículo, status e descrição; deixar motorista como “Nenhum”; registrar | Ocorrência aparece na lista e a interface informa sucesso |  | Não executado |  |
| OCO-02 | Consultar lista e detalhes da ocorrência | Existir ocorrência cadastrada | Localizar a ocorrência; abrir “Detalhes” | Lista apresenta ocorrência, tipo, veículo, data e status; detalhe mostra descrição, tipo, data, veículo e motorista informado ou “Não informado” |  | Não executado |  |
| OCO-03 | Editar ocorrência | Existir ocorrência cadastrada | Acionar “Editar”; alterar dados; salvar alterações | Detalhes/lista refletem a alteração e a interface informa sucesso |  | Não executado |  |
| OCO-04 | Cancelar exclusão de ocorrência | Existir ocorrência cadastrada | Acionar “Excluir” e cancelar a confirmação | Diálogo fecha e ocorrência continua na lista |  | Não executado |  |
| OCO-05 | Confirmar exclusão de ocorrência | Existir ocorrência cadastrada | Acionar “Excluir” e confirmar | Ocorrência removida da lista e a interface informa sucesso |  | Não executado |  |

## Busca e filtros

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| BUS-01 | Buscar veículo | Existirem veículos com placa, marca ou modelo conhecidos | Em `/veiculos`, pesquisar por trecho de placa, marca e modelo, separadamente | Cada busca retorna veículos compatíveis; limpar o termo restaura a lista conforme o filtro selecionado |  | Não executado |  |
| BUS-02 | Filtrar veículos por status | Existirem veículos com status distintos | Em `/veiculos`, selecionar cada status e depois “Todos” | Lista mostra apenas o status selecionado; “Todos” remove o filtro |  | Não executado |  |
| BUS-03 | Buscar e filtrar motoristas | Existirem motoristas com nome/CNH e status conhecidos; módulo disponível | Em `/motoristas`, pesquisar por nome e CNH; aplicar status e depois “Todos” | Busca considera nome ou CNH e o filtro restringe os resultados ao status escolhido |  | Não executado |  |
| BUS-04 | Buscar ocorrências | Existirem ocorrências com títulos e descrições conhecidos | Em `/ocorrencias`, pesquisar por trecho do título e da descrição | Lista retorna ocorrências compatíveis; termo sem correspondência exibe estado sem resultados |  | Não executado |  |
| BUS-05 | Filtrar ocorrências por status e tipo | Existirem ocorrências de mais de um status e tipo | Em `/ocorrencias`, selecionar status e tipo; testar cada filtro isolado e ambos combinados | Lista respeita o status, o tipo e a combinação selecionada |  | Não executado |  |
| BUS-06 | Filtrar Histórico por período e exportar | Existirem ocorrências em datas conhecidas | Abrir `/historico`; testar status, tipo e datas “De”/“Até”, limpar filtros e acionar “Exportar CSV” com resultados | Resultados refletem filtros e período; registros são agrupados por mês; limpar filtros restaura a consulta; exportação inicia o download `historico-ocorrencias.csv` |  | Não executado |  |

## Campos obrigatórios e dados inválidos

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| VAL-01 | Impedir cadastro/login incompleto | Estar na tela de cadastro ou login | Enviar o formulário sem preencher os campos obrigatórios | Envio impedido e erros indicados nos campos que precisam de correção |  | Não executado |  |
| VAL-02 | Impedir placa ou ano inválido | Usuário autenticado na tela de cadastro/edição de veículo | Testar placa fora dos formatos ABC1234/ABC1D23; testar ano com formato inválido, ano 1800 e ano maior que o atual + 1 | Formulário impede salvar e destaca o campo inválido |  | Não executado |  |
| VAL-03 | Tratar placa duplicada | API disponível e placa já cadastrada | Tentar cadastrar veículo usando a placa existente | API recusa o conflito; interface apresenta erro e não duplica o registro. Texto exato da mensagem: A confirmar |  | Não executado |  |
| VAL-04 | Impedir dados inválidos de motorista | Usuário autenticado na tela de cadastro/edição de motorista | Enviar sem nome; informar CPF com 10 dígitos; informar CNH com quantidade diferente de 11 dígitos; não selecionar categoria; informar telefone com menos de 10 ou mais de 11 dígitos; testar status vazio, se possível | Formulário impede salvar e indica os campos inválidos |  | Não executado |  |
| VAL-05 | Impedir ocorrência incompleta ou com data futura | Usuário autenticado na tela de cadastro/edição de ocorrência | Enviar sem título, tipo, data, veículo, status ou descrição; testar data futura | Formulário impede salvar e indica os campos inválidos |  | Não executado |  |
| VAL-06 | Tratar veículo ou motorista inexistente na ocorrência | API disponível | Na criação/edição, enviar vínculo inexistente quando possível no ambiente | API recusa o vínculo inválido e a interface apresenta o erro associado ao campo. Preparação desse dado pelo fluxo da interface: A confirmar |  | Não executado |  |

## Mensagens de sucesso e erro

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| MSG-01 | Conferir mensagens após operações bem-sucedidas | Usuário autenticado e registros de teste disponíveis | Criar, editar e excluir um veículo, motorista e ocorrência, conforme disponibilidade de cada módulo | A interface exibe indicação de sucesso para cada operação concluída |  | Não executado |  |
| MSG-02 | Conferir erro de autenticação | Estar deslogado; API disponível ou modo demo | Tentar login com credenciais incorretas | Erro é apresentado na tela de login, sem sair da tela nem iniciar sessão |  | Não executado |  |
| MSG-03 | Conferir erro de validação da API | API disponível | Enviar dado inválido que passe pela validação local, quando aplicável | Erro da API é exibido; erros de campo são associados aos campos correspondentes quando retornados |  | Não executado |  |
| MSG-04 | Conferir estados de carregamento, vazio e erro | Usuário autenticado | Abrir listas durante carregamento; consultar lista sem registros/resultados; causar falha de carga controlada | Interface apresenta carregamento, estado vazio ou erro com “Tentar de novo”, conforme a situação, sem tela em branco |  | Não executado |  |

## Responsividade

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| RES-01 | Usar o sistema em celular | Usuário autenticado; viewport de celular registrada no ambiente | Abrir navegação, lista, formulário e detalhe de ocorrência; acionar o menu e navegar | Conteúdo e controles permanecem acessíveis, sem sobreposição ou corte que impeça o uso; menu abre e fecha |  | Não executado |  |
| RES-02 | Usar o sistema em tablet | Usuário autenticado; viewport de tablet registrada no ambiente | Repetir navegação e consulta de listas/formulários nas páginas principais | Textos, controles e dados permanecem legíveis e utilizáveis, sem sobreposição ou corte impeditivo |  | Não executado |  |
| RES-03 | Usar o sistema em computador | Usuário autenticado; viewport de computador registrada no ambiente | Navegar pelas páginas principais, usar ações de tabela, filtros e formulários | Layout, navegação e ações permanecem visíveis e utilizáveis |  | Não executado |  |

## Comportamento com a API indisponível

| ID | Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status | Passou? (S/N) |
|---|---|---|---|---|---|---|---|
| API-01 | Acessar login sem conexão com a API | `VITE_API_URL` configurada; API desligada ou inacessível; usuário deslogado | Abrir `/entrar` e tentar autenticar | Login informa “Não foi possível conectar ao servidor”; não autentica nem exibe tela em branco |  | Não executado |  |
| API-02 | Manter sessão existente diante de falha de carga | API configurada; usuário autenticado antes de interromper a API | Interromper a API e abrir/atualizar uma página de lista | Sessão permanece ativa; página mostra erro de carga e opção “Tentar de novo”, sem tela em branco |  | Não executado |  |
| API-03 | Repetir carga após falha | API indisponível e erro de carga visível | Acionar “Tentar de novo” | Nova tentativa de carga é feita; enquanto a API continuar indisponível, erro permanece apresentado |  | Não executado |  |
| API-04 | Iniciar sem URL de API | `VITE_API_URL` ausente, conforme configuração do ambiente | Abrir o sistema e verificar o topo; usar dados demo disponíveis | Interface indica “Modo demo” e usa dados locais; alterações ficam no navegador, conforme descrito no README |  | Não executado |  |

## Resumo final da execução

Atualize as quantidades após executar os cenários. O total considera os 52 cenários listados neste documento.

| Status | Quantidade |
|---|---:|
| Aprovados | 0 |
| Reprovados | 0 |
| Bloqueados | 0 |
| Não executados | 52 |
| Total de cenários | 52 |