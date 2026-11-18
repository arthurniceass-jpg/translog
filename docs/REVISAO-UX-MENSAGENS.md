# Revisão de UX das mensagens — TransLog

Esta revisão inventaria mensagens de validação e erro encontradas na interface, nos serviços do front-end e no contrato/implementação atual da API. As sugestões são propostas de texto; nenhuma mensagem de código foi alterada nesta entrega. Mensagens marcadas como dinâmicas variam conforme o dado ou a resposta recebida.

| Mensagem atual | Sugestão | Arquivo |
|---|---|---|
| `Informe o nome.` | `Informe seu nome.` | `frontend/src/pages/Cadastro.jsx`; `frontend/src/pages/MotoristaForm.jsx` |
| `Informe o e-mail.` | `Informe seu e-mail.` | `frontend/src/pages/Cadastro.jsx`; `frontend/src/pages/Entrar.jsx`; `backend/src/main/java/br/com/translog/auth/dto/CadastroRequest.java`; `backend/src/main/java/br/com/translog/auth/dto/LoginRequest.java` |
| `E-mail inválido.` | `Confira o formato do e-mail.` | `frontend/src/pages/Cadastro.jsx`; `frontend/src/pages/Entrar.jsx`; `backend/src/main/java/br/com/translog/auth/dto/CadastroRequest.java` |
| `Informe a senha.` | `Informe sua senha.` | `frontend/src/pages/Cadastro.jsx`; `frontend/src/pages/Entrar.jsx`; `backend/src/main/java/br/com/translog/auth/dto/CadastroRequest.java`; `backend/src/main/java/br/com/translog/auth/dto/LoginRequest.java` |
| `Mínimo de 6 caracteres.` | `Use pelo menos 6 caracteres.` | `frontend/src/pages/Cadastro.jsx` |
| `A senha deve ter entre 6 e 72 caracteres.` | `Use uma senha de 6 a 72 caracteres.` | `backend/src/main/java/br/com/translog/auth/dto/CadastroRequest.java` |
| `As senhas não conferem.` | `As senhas estão diferentes.` | `frontend/src/pages/Cadastro.jsx` |
| `Já existe uma conta com este e-mail.` | `Este e-mail já está cadastrado. Tente entrar.` | `backend/src/main/java/br/com/translog/auth/AuthService.java`; mensagem equivalente do modo demo em `frontend/src/services/local.js` |
| `E-mail ou senha inválidos.` | `E-mail ou senha incorretos. Confira os dados e tente novamente.` | `backend/src/main/java/br/com/translog/auth/AuthService.java`; `frontend/src/services/local.js` |
| `Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.` | `Não foi possível conectar. Verifique sua conexão e tente novamente.` | `frontend/src/services/http.js` |
| `Erro {status} ao falar com o servidor.` | `O servidor retornou um erro ({status}). Tente novamente.` | `frontend/src/services/http.js` |
| `Não foi possível carregar {recursos}. {erro recebido}` | `Não foi possível carregar {recursos}. {erro recebido}`; manter a ação de tentar novamente junto ao aviso | `frontend/src/context/DataContext.jsx`; `frontend/src/components/Loading.jsx` |
| `Placa inválida (ex.: ABC1D23 ou ABC1234).` | `Informe uma placa válida, como ABC1D23.` | `frontend/src/pages/VeiculoForm.jsx` |
| `Informe a placa.` | `Informe a placa do veículo.` | `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `Placa inválida. Use ABC1234 ou ABC1D23.` | `Informe uma placa válida, como ABC1D23.` | `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `Informe a marca.` | `Informe a marca do veículo.` | `frontend/src/pages/VeiculoForm.jsx`; `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `A marca deve ter no máximo 60 caracteres.` | `Use até 60 caracteres para a marca.` | `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `Informe o modelo.` | `Informe o modelo do veículo.` | `frontend/src/pages/VeiculoForm.jsx`; `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `O modelo deve ter no máximo 60 caracteres.` | `Use até 60 caracteres para o modelo.` | `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `O ano deve ter 4 dígitos.` | `Informe o ano com quatro dígitos.` | `frontend/src/pages/VeiculoForm.jsx` |
| `Ano entre 1950 e {ano atual + 1}.` | `Informe um ano entre 1950 e {ano atual + 1}.` | `frontend/src/pages/VeiculoForm.jsx` |
| `O ano deve estar entre 1950 e o próximo ano.` | `Informe um ano entre 1950 e o próximo ano.` | `backend/src/main/java/br/com/translog/veiculo/dto/AnoValido.java` |
| `Informe o ano.` | `Informe o ano do veículo.` | `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `Selecione o status.` | `Selecione o status do veículo.` | `frontend/src/pages/VeiculoForm.jsx`; `backend/src/main/java/br/com/translog/veiculo/dto/VeiculoRequest.java` |
| `Já existe um veículo com a placa {placa}.` | `A placa {placa} já está cadastrada.` | `backend/src/main/java/br/com/translog/veiculo/VeiculoService.java` |
| `Placa já cadastrada.` | `Esta placa já está cadastrada.` | `frontend/src/services/local.js` |
| `Não é possível excluir o veículo {placa}: existem {quantidade} ocorrência(s) vinculada(s) a ele.` | `Não é possível excluir o veículo {placa}: ele está vinculado a {quantidade} ocorrência(s).` | `backend/src/main/java/br/com/translog/veiculo/VeiculoService.java` |
| `Este veículo possui ocorrências vinculadas e não pode ser excluído.` | `Não é possível excluir este veículo porque há ocorrências vinculadas.` | `frontend/src/services/local.js` |
| `Veículo não encontrado.` | `Não encontramos este veículo.` | `backend/src/main/java/br/com/translog/veiculo/VeiculoService.java` |
| `Informe o nome.` | `Informe o nome completo do motorista.` | `frontend/src/pages/MotoristaForm.jsx` |
| `CPF inválido. Deve ter 11 dígitos.` | `Informe um CPF com 11 dígitos.` | `frontend/src/pages/MotoristaForm.jsx` |
| `CNH inválida. Deve ter 11 dígitos.` | `Informe uma CNH com 11 dígitos.` | `frontend/src/pages/MotoristaForm.jsx` |
| `Selecione pelo menos uma categoria.` | `Selecione ao menos uma categoria da CNH.` | `frontend/src/pages/MotoristaForm.jsx` |
| `Telefone inválido. Use DDD + número.` | `Informe um telefone com DDD e 8 ou 9 dígitos.` | `frontend/src/pages/MotoristaForm.jsx` |
| `Selecione o status.` | `Selecione o status do motorista.` | `frontend/src/pages/MotoristaForm.jsx` |
| `CPF já cadastrado.` | `Este CPF já está cadastrado.` | `frontend/src/services/local.js` |
| `CNH já cadastrada.` | `Esta CNH já está cadastrada.` | `frontend/src/services/local.js` |
| `Este motorista possui ocorrências vinculadas e não pode ser excluído.` | `Não é possível excluir este motorista porque há ocorrências vinculadas.` | `frontend/src/services/local.js` |
| `Informe o título.` | `Informe um título para a ocorrência.` | `frontend/src/pages/OcorrenciaForm.jsx`; `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `O título deve ter no máximo 160 caracteres.` | `Use até 160 caracteres para o título.` | `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `Selecione o tipo.` | `Selecione o tipo da ocorrência.` | `frontend/src/pages/OcorrenciaForm.jsx`; `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `Informe a descrição.` | `Descreva a ocorrência.` | `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `A descrição deve ter no máximo 2000 caracteres.` | `Use até 2000 caracteres para a descrição.` | `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `Descreva a ocorrência.` | `Informe uma descrição da ocorrência.` | `frontend/src/pages/OcorrenciaForm.jsx` |
| `Informe a data.` | `Informe a data da ocorrência.` | `frontend/src/pages/OcorrenciaForm.jsx`; `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `A data não pode ser no futuro.` | `Informe hoje ou uma data anterior.` | `frontend/src/pages/OcorrenciaForm.jsx`; `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `Informe o veículo.` | `Selecione o veículo relacionado.` | `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `Selecione o veículo.` | `Selecione o veículo relacionado.` | `frontend/src/pages/OcorrenciaForm.jsx` |
| `Selecione o status.` | `Selecione o status da ocorrência.` | `frontend/src/pages/OcorrenciaForm.jsx`; `backend/src/main/java/br/com/translog/ocorrencia/dto/OcorrenciaRequest.java` |
| `Veículo informado não existe.` | `O veículo selecionado não foi encontrado. Confira a seleção.` | `backend/src/main/java/br/com/translog/ocorrencia/OcorrenciaService.java` |
| `Motorista informado não existe.` | `O motorista selecionado não foi encontrado. Confira a seleção.` | `backend/src/main/java/br/com/translog/ocorrencia/OcorrenciaService.java` |
| `A data inicial não pode ser maior que a final.` | `A data inicial deve ser igual ou anterior à data final.` | `backend/src/main/java/br/com/translog/ocorrencia/OcorrenciaService.java` |
| `Ocorrência não encontrada.` | `Não encontramos esta ocorrência.` | `backend/src/main/java/br/com/translog/ocorrencia/OcorrenciaService.java` |
| `Dados inválidos. Verifique os campos informados.` | `Confira os campos destacados e tente novamente.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `Corpo da requisição inválido ou malformado.` | `Os dados enviados estão em formato inválido. Confira e tente novamente.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `Parâmetro inválido na requisição.` | `Um dos parâmetros informados é inválido. Confira e tente novamente.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `Parâmetro com codificação inválida. Envie a URL em UTF-8.` | `Não foi possível ler os parâmetros da URL. Tente novamente.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `Operação não permitida: o registro conflita com dados existentes.` | `Não foi possível concluir: o registro entra em conflito com dados existentes.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `Recurso não encontrado: {rota}` | `Este recurso não está disponível. Confira o endereço ou tente novamente mais tarde.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `Erro interno. Tente novamente mais tarde.` | `Ocorreu um erro inesperado. Tente novamente mais tarde.` | `backend/src/main/java/br/com/translog/common/GlobalExceptionHandler.java` |
| `{rótulo} não encontrado(a).` | `Não encontramos este {rótulo}.` | `frontend/src/components/FormGate.jsx` |
| `Ocorrência não encontrada.` | `Ocorrência não encontrada.`; o texto atual é direto e claro | `frontend/src/pages/OcorrenciaDetalhe.jsx` |
| `Tem certeza que deseja excluir {registro}? Esta ação não pode ser desfeita.` | `Deseja excluir {registro}? Esta ação não poderá ser desfeita.` | `frontend/src/pages/Veiculos.jsx`; `frontend/src/pages/Motoristas.jsx`; `frontend/src/pages/Ocorrencias.jsx` |

## Observações de implementação

- Os textos de validação de motorista estão implementados no front-end. O README do backend ainda marca o módulo de motoristas como “a implementar”; não há mensagens de validação de API desse módulo para revisar neste momento.
- Mensagens de erro da API são repassadas pelo front. Os textos que dependem de uma resposta genérica de status, de um valor de enum inválido ou de um erro inesperado podem variar conforme a resposta; confirmar a mensagem observada no ambiente antes de aprovar uma troca.
- Esta revisão não alterou código de front-end nem back-end. Se alguma sugestão de mensagem do back-end for implementada, revisar os testes que comparam textos em `backend/src/test/java/br/com/translog/auth/AuthApiTest.java`, `backend/src/test/java/br/com/translog/veiculo/VeiculoApiTest.java` e `backend/src/test/java/br/com/translog/ocorrencia/OcorrenciaApiTest.java`. A necessidade exata depende das asserções de cada teste.
- As propostas abaixo são apenas documentação e não foram aplicadas aos controllers.

## Propostas de anotações OpenAPI

As operações e status foram conferidos nos controllers atuais. Para respostas de erro, `ApiError` e `GlobalExceptionHandler` documentam o formato JSON compartilhado. As anotações sugeridas descrevem o contrato sem alterar a lógica.

### Autenticação — `backend/src/main/java/br/com/translog/auth/AuthController.java`

- Classe: `@Tag(name = "Autenticação", description = "Cadastro, login e consulta da sessão do usuário.")`.
- `cadastro`: `@Operation(summary = "Cadastrar usuário")`; `@ApiResponse(responseCode = "201", description = "Usuário cadastrado")`; `@ApiResponse(responseCode = "400", description = "Dados inválidos")`; `@ApiResponse(responseCode = "409", description = "E-mail já cadastrado")`.
- `login`: `@Operation(summary = "Autenticar usuário")`; respostas `200` (autenticado), `400` (dados inválidos) e `401` (credenciais inválidas).
- `me`: `@Operation(summary = "Consultar usuário autenticado")`; respostas `200` (dados do usuário) e `401` (token inválido ou ausente).

### Veículos — `backend/src/main/java/br/com/translog/veiculo/VeiculoController.java`

- A classe já possui `@Tag(name = "Veículos")`; pode ser complementada com descrição do gerenciamento de veículos.
- `listar`: `@Operation(summary = "Listar veículos", description = "Permite busca por placa, marca ou modelo e filtro por status.")`; resposta `200`.
- `buscar`: `@Operation(summary = "Consultar veículo")`; respostas `200` e `404`.
- `criar`: `@Operation(summary = "Cadastrar veículo")`; respostas `201`, `400` e `409` (placa duplicada).
- `atualizar`: `@Operation(summary = "Atualizar veículo")`; respostas `200`, `400`, `404` e `409`.
- `excluir`: `@Operation(summary = "Excluir veículo")`; respostas `204`, `404` e `409` (ocorrências vinculadas).

### Ocorrências — `backend/src/main/java/br/com/translog/ocorrencia/OcorrenciaController.java`

- A classe já possui `@Tag(name = "Ocorrências")`; pode ser complementada com descrição do gerenciamento e consulta de ocorrências.
- `listar`: `@Operation(summary = "Listar ocorrências", description = "Aceita busca, status, tipo e período; filtros podem ser combinados.")`; respostas `200` e `400` (filtros inválidos, incluindo período invertido).
- `buscar`: `@Operation(summary = "Consultar ocorrência")`; respostas `200` e `404`.
- `criar`: `@Operation(summary = "Registrar ocorrência")`; respostas `201` e `400` (validação ou vínculo inexistente).
- `atualizar`: `@Operation(summary = "Atualizar ocorrência")`; respostas `200`, `400` e `404`.
- `excluir`: `@Operation(summary = "Excluir ocorrência")`; respostas `204` e `404`.

### Dashboard — `backend/src/main/java/br/com/translog/dashboard/DashboardController.java`

- A classe já possui `@Tag(name = "Dashboard")`; pode ser complementada com descrição dos indicadores agregados.
- `resumo`: `@Operation(summary = "Consultar resumo do dashboard")`; respostas `200` (totais e contagens por status/tipo) e `401` (não autenticado).

Os `@ApiResponse` podem referenciar um schema de erro comum correspondente a `ApiError`. Não há controller de motorista nos arquivos consultados; portanto, não se propõem anotações nem endpoints para esse módulo.

Se sugestões de mensagens do backend forem implementadas, revisar as asserções de texto nos testes de autenticação, veículos e ocorrências, em especial `AuthApiTest`, `VeiculoApiTest` e `OcorrenciaApiTest`. Nenhuma alteração nesses testes faz parte desta entrega.
