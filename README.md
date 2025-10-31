# About Pesquisas Pagas — Formulário de Cadastro Pesquisas Pagas

Formulário web simples e responsivo para cadastrar painelistas, com:
- Autocomplete de País/Estado a partir do banco Supabase
- Máscara de telefone dinâmica por país (IMask)
- Tradução automática para PT/ES conforme idioma do navegador
- Envio seguro via Supabase Edge Function para um webhook do n8n
- Redirecionamento pós-sucesso

> Projeto pensado para ser estático (HTML/CSS/JS) e usar apenas serviços gerenciados do Supabase e do N8N.

---

## Stack
- HTML, CSS (vanilla)
- JavaScript no navegador
  - `@supabase/supabase-js` (via CDN)
  - `imask` (via CDN)
- Supabase
  - Tabelas: `dpais`, `destado`, `genero`, `painelista`, `celulares`
  - Edge Function `cadastrar-painelista` (Deno)
  - RLS (Row Level Security) habilitado nas tabelas públicas de leitura
- n8n (webhook externo para processar o cadastro)

---

## Estrutura de pastas
```
index.html
package.json
script.js
style.css
Imagens/
supabase/
  config.toml
  functions/
    cadastrar-painelista/
      deno.json
      index.ts
```
## Formulario Imagem
<p align="center">
  <img width="581" height="907" alt="image" src="https://github.com/user-attachments/assets/47e9781f-9fe9-4280-a899-3474edbc0960" />
</p>
---

## Como funciona
### Front-end (formulário)
O arquivo `index.html` renderiza o formulário e carrega `script.js` que:
- Inicializa o cliente Supabase com `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- Carrega Países (`dpais`) e, quando um país é selecionado, carrega Estados (`destado`).
- Carrega opções de Gênero (`genero`).
- Define máscara de celular conforme o ISO2 do país selecionado (ex.: BR → +55 (00) 00000-0000).
- Valida Nome (apenas letras e espaços) e Celular (comprimento esperado por país).
- Envia um POST para a Edge Function `cadastrar-painelista` com o token `anon` no header `Authorization`.
- Em caso de sucesso, exibe mensagem e redireciona para `URL_REDIRECIONAMENTO`.

Internacionalização (PT/ES) é determinada por `navigator.language` em `script.js`, alterando rótulos e mensagens.

### Edge Function (Supabase)
A função `cadastrar-painelista` (em `supabase/functions/cadastrar-painelista/index.ts`) recebe:
- Body JSON com `{ mode: "test" | "production", body: <dados_do_formulário> }`
- Redireciona o payload para o webhook do n8n, definido por variável de ambiente:
  - `N8N_TEST_URL` quando `mode = test`
  - `N8N_WEBHOOK_URL` quando `mode = production`
- Retorna o JSON de sucesso do n8n ou mensagem de erro (status 400).

---

## Banco de dados  (Supabase)
O front consome as tabelas abaixo, com colunas mínimas para funcionar:
### Tabelas de referência (leitura pública)
- `dpais`
  - `id_pais` (primary key)
  - `nome` (string)
  - `codigo_iso2` (string, ex.: BR, AR, CL…)

- `destado`
  - `id_estado` (primary key)
  - `id_pais` (foreign key → `dpais.id_pais`)
  - `nome_estado` (string)

- `genero`
  - `id_genero` (primary key)
  - `escolha_genero` (string)

Políticas RLS recomendadas (leitura pública): permitir `select` para a role `anon` nessas tabelas (apenas leitura).

### Tabelas de cadastro (escrita via Edge Function)

- `painelista`
  - `id_painel` (integer, primary key, auto-increment)
  - `nome_completo` (varchar, required)
  - `email` (varchar, required, unique)
  - `data_nascimento` (date)
  - `data_cadastro` (timestamp, default now())
  - `id_estado` (integer, FK → `destado.id_estado`)
  - `id_genero` (integer, FK → `genero.id_genero`)
  - `cpf` (char, unique, nullable) (SERÁ USADO FUTURAMENTE)
  - `id_pais` (integer, FK → `dpais.id_pais`)

- `celulares`
  - `id_celular` (integer, primary key, auto-increment)
  - `id_painel` (integer, FK → `painelista.id_painel`, required)
  - `numero` (text, required, unique)
    - Validação: formato E.164 `^\+[1-9]\d{6,14}$`
  - `is_ativo` (boolean, default true)
  - `criado_em` (timestamp with time zone, default now())

**Importante sobre RLS:**
- As tabelas `painelista` e `celulares` **não devem** permitir `insert` direto do front-end (role `anon`).
- O cadastro é feito via Edge Function → n8n, que deve usar uma `service_role` key ou credenciais adequadas para inserir dados.
- Políticas RLS que **bloqueia** acesso anônimo de escrita nessas tabelas, permitindo apenas operações autenticadas/autorizadas.

**Fluxo de cadastro:**
1. Front-end envia dados para Edge Function `cadastrar-painelista`
2. Edge Function repassa para webhook n8n
3. n8n processa e insere em `painelista` e `celulares` usando credenciais com permissão de escrita

---

## Configuração
### 1) Supabase (projeto e tabelas)
1. Crie um projeto no Supabase.
2. Crie as tabelas `dpais`, `destado`, `genero`, `painelista`, `celulares`  conforme acima.
3. Ajuste RLS para permitir `select` ao `anon` nas tabelas, `dpais`, `destado`, `genero`  se desejar consumo direto do front.

### 2) Variáveis no front (`script.js`)
No topo de `script.js`, ajuste:
- `SUPABASE_URL` — https://mlhdtsjdhmmaiveltojv.supabase.co
- `SUPABASE_ANON_KEY` — eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGR0c2pkaG1tYWl2ZWx0b2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTI5NzMsImV4cCI6MjA3NTA4ODk3M30.ruk8TVAvqwIs-bHCgcbw2S2q_wLtRG3dP9DEEDEQVkM
- `URL_REDIRECIONAMENTO` — [para onde enviar o usuário após sucesso](https://conectatribo.com.br/t/lOlVjW)
- `MODO_DE_TESTE` — `true` para usar `N8N_TEST_URL`, `false` para `N8N_WEBHOOK_URL`

Observação de segurança: a `anon key` é pública por natureza. Garanta que RLS está correto e que apenas as operações necessárias estão expostas ao anônimo.

### 3) Variáveis na Edge Function
Variáveis no Supabase para a função `cadastrar-painelista`:
- `N8N_WEBHOOK_URL` — webhook de produção do n8n
- `N8N_TEST_URL` — webhook de teste do n8n 

---

## Rodando localmente
Pré-requisitos opcionais:
- Node.js (para um servidor estático simples)
- Supabase CLI (para rodar/implantar a Edge Function)

### Servir o front-end estaticamente
Você pode abrir `index.html` direto no navegador ou usar um servidor local (recomendado para CORS adequado):

- Via VS Code (extensão Live Server) — clique “Go Live”.
- Via Node (exemplo com `serve`):
  ```bash
  npx serve .
  ```

### Testar a Edge Function localmente (opcional)
Com Supabase CLI instalado e logado:
```bash
supabase functions serve cadastrar-painelista
```
Defina as variáveis de ambiente locais conforme a CLI (ou `.env`) para `N8N_WEBHOOK_URL` e `N8N_TEST_URL`.

---

## Instalação e Configuração do Supabase CLI

### Pré-requisitos
- Node.js e npm instalados no sistema

### 1. Instalar Supabase CLI
Instale o Supabase CLI como dependência de desenvolvimento do projeto:
```bash
npm install supabase --save-dev
```

### 2. Conectar ao Projeto Supabase
Faça login na sua conta Supabase:
```bash
npx supabase login
```

Vincule o projeto local ao seu projeto no Supabase (substitua `SEU_ID_DO_PROJETO` pelo ID real do seu projeto):
```bash
npx supabase link --project-ref SEU_ID_DO_PROJETO
```

> **Dica:** Você encontra o ID do projeto (project ref) na URL do dashboard do Supabase ou nas configurações do projeto.

### 3. Criar a Edge Function
Crie a estrutura da função `cadastrar-painelista`:
```bash
npx supabase functions new cadastrar-painelista
```

Isso criará a pasta `supabase/functions/cadastrar-painelista/` com os arquivos necessários. Substitua o conteúdo de `index.ts` pelo código da função.

### 4. Configurar Variáveis de Ambiente (Segredos)
Defina a URL do webhook do n8n como segredo:
```bash
npx supabase secrets set N8N_WEBHOOK_URL="URL_SECRETA_DO_N8N_VAI_AQUI"
```

Opcionalmente, defina também a URL de teste:
```bash
npx supabase secrets set N8N_TEST_URL="URL_SECRETA_DO_N8N_TESTE_AQUI"
```

### 5. Deploy da Função
Faça o deploy da função para o Supabase:
```bash
npx supabase functions deploy cadastrar-painelista --no-verify-jwt
```



---

## Deploy (Supabase)
1. Deploy da função:
   ```bash
   supabase functions deploy cadastrar-painelista
   ```
2. Segredos da função (ambiente do projeto):
   ```bash
   supabase secrets set N8N_WEBHOOK_URL="https://teste-n8n.ade4u1.easypanel.host/webhook/Cadastro-About-Brazil"
   supabase secrets set N8N_TEST_URL="https://teste-n8n.ade4u1.easypanel.host/webhook-test/Cadastro-About-Brazil"
   ```
3. A `SUPABASE_URL` e `SUPABASE_ANON_KEY` do projeto no `script.js`.

---

## API — Edge Function `cadastrar-painelista`
- URL: `POST {SUPABASE_URL}/functions/v1/cadastrar-painelista`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <SUPABASE_ANON_KEY>`
- Body (exemplo):
  ```json
  {
    "mode": "production",
    "body": {
      "nome_completo": "Fulano de Tal",
      "email": "fulano@email.com",
      "data_nascimento": "1990-01-01",
      "id_pais": 76,
      "id_estado": 2301,
      "id_genero": 1,
      "celular": "+5585999999999"
    }
  }
  ```
- Resposta: proxy do JSON vindo do n8n (200) ou `{ "error": "mensagem" }` (400).

---

## n8n (Back-end de Validação e Cadastro)

O workflow do n8n atua como o "cérebro" do back-end. Ele é acionado **exclusivamente** pela Supabase Edge Function `cadastrar-painelista`, garantindo que a URL do webhook nunca seja exposta publicamente.

A principal responsabilidade deste workflow é a **validação de regras de negócio** e a **prevenção de dados duplicados** antes de salvar no banco de dados.

### Gatilho
* **`Webhook`**: Recebe o `POST` da Edge Function. Os dados do formulário estão localizados em `body.body`, e o modo (teste/produção) em `body.mode`.

### Fluxo de Validação e Sucesso
O fluxo segue esta ordem:

1.  **`Verificação país` (Supabase - Get a row)**
    * Recebe o `id_pais` (ex: `76`) do formulário via Webhook.
    * Busca na tabela `dpais` pela linha onde `id_pais` é igual ao valor recebido.
    * Retorna o `codigo_iso2` (ex: "BR") para o próximo nó.

2.  **`Validação` (Code)**
    * Este é o "guarda-costas" principal. Ele recebe os dados do Webhook e do nó `Verificação país`.
    * **Valida o Nome:** Checa se `nome_completo` bate com a regex `^[a-zA-Z\u00C0-\u017F ]+$`.
    * **Valida o Email:** Checa se `email` bate com a regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
    * **Valida o Gênero:** Confirma que o `id_genero` recebido é um número válido (ex: 1, 2, ou 3).
    * **Valida o Celular:**
        * Usa o `codigo_iso2` (ex: "BR") para encontrar a regra de DDI e comprimento no mapa `regrasTelefone`.
        * Verifica se o `celular` (ex: `+5585999017780`) começa com o DDI correto (`+55`).
        * Verifica se o `celular` tem o comprimento total exato (ex: `13`).
    * Se qualquer validação falhar, o nó joga um `Error`, que interrompe o fluxo e é capturado pelo `Error Trigger`.

3.  **`Procurar Email Existente` (Supabase - getAll)**
    * Verifica na tabela `painelista` se o `email` recebido já existe.

4.  **`If` (Verificação de Email)**
    * **Se `true` (Email encontrado):** O fluxo é desviado para o nó `Email Existente`.
    * **Se `false` (Email novo):** O fluxo continua.

5.  **`Procurar Numero Existente` (Supabase - get)**
    * Verifica na tabela `celulares` se o `numero` de celular recebido já existe.

6.  **`Verificar Erro de Numero Duplicado` (If)**
    * **Se `true` (Celular encontrado):** O fluxo é desviado para o nó `Numero de Celular Existente`.
    * **Se `false` (Celular novo):** O fluxo continua para o cadastro.

7.  **`Cadastro Painelista` (Supabase - create)**
    * Insere o novo usuário na tabela `painelista` com os dados validados.
    * Retorna o `id_painel` do usuário recém-criado.

8.  **`Cadastro Numero de Celular` (Supabase - create)**
    * Usa o `id_painel` do nó anterior para inserir o `numero` de celular na tabela `celulares`, ligando-o ao novo painelista.

9.  **`Cadastro Concluído` (Respond to Webhook)**
    * Retorna uma mensagem de `status: "sucesso"` e um código 200 para a Edge Function, que repassa ao formulário.

### Fluxo de Erros (Tratamento)
O workflow é configurado com um `Error Trigger` (gatilho de erro) para lidar com falhas:

* **Validação (Nó `Code`):** Se qualquer regra de negócio falhar (nome, email, gênero, celular), o nó `Code` dispara um `throw new Error(...)`.
* **Duplicidade (Nós `If`):** Se o email ou celular já existirem, o fluxo é desviado para os nós `Email Existente` ou `Numero de Celular Existente`.
* **Resposta de Erro:** Em qualquer caso de erro, um nó `Respond to Webhook` é acionado para retornar um **status 4xx** (ex: 400 para validação, 409 para duplicidade) e a mensagem de erro específica (ex: `"Telefone inválido"`). A Edge Function repassa essa mensagem de erro diretamente para o `feedback` no formulário.

<img width="1553" height="366" alt="image" src="https://github.com/user-attachments/assets/9c108f32-bd06-4d42-ae54-392baf033d69" />


---
## Troubleshooting
- 401/403 na Edge Function: confirme `verify_jwt = true` e que o header `Authorization` contém um JWT válido (use a `anon key`).
- CORS: a função já envia os headers CORS necessários; se servir o front de outro domínio, mantenha `Access-Control-Allow-Origin: *` (ou restrinja conforme o seu domínio).
- RLS bloqueando leitura: ajuste políticas `select` para as tabelas `dpais`, `destado`, `genero`.
- Máscara de celular inválida: verifique se o país selecionado tem `codigo_iso2` compatível com o `maskMap` e `lengthMap`.

---

## Contribuição
Sinta-se à vontade para abrir issues e pull requests. Descreva claramente a mudança proposta e seu impacto.

## Licença
Defina a licença do projeto (ex.: MIT). Caso não tenha uma, considere adicionar um arquivo `LICENSE`.
