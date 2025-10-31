# About Pesquisas Pagas — Formulário de Cadastro

Formulário web simples e responsivo para cadastrar painelistas, com:
- Autocomplete de País/Estado a partir do banco Supabase
- Máscara de telefone dinâmica por país (IMask)
- Tradução automática para PT/ES conforme idioma do navegador
- Envio seguro via Supabase Edge Function para um webhook do n8n
- Redirecionamento pós-sucesso

> Projeto pensado para ser estático (HTML/CSS/JS) e usar apenas serviços gerenciados do Supabase.

---

## Stack
- HTML, CSS (vanilla)
- JavaScript no navegador
  - `@supabase/supabase-js` (via CDN)
  - `imask` (via CDN)
- Supabase
  - Tabelas: `dpais`, `destado`, `genero`
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

Importante: em `supabase/config.toml`, `verify_jwt = true`, então a função exige um JWT válido no header `Authorization` (no front usamos o `anon key`).

---

## Banco de dados esperado (Supabase)
O front consome as tabelas abaixo, com colunas mínimas para funcionar:

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

Políticas RLS recomendadas (leitura pública): permitir `select` para a role `anon` nessas tabelas (apenas leitura). Não exponha dados sensíveis.

---

## Configuração
### 1) Supabase (projeto e tabelas)
1. Crie um projeto no Supabase.
2. Crie as tabelas `dpais`, `destado`, `genero` conforme acima.
3. Ajuste RLS para permitir `select` ao `anon` nessas tabelas, se desejar consumo direto do front.

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
3. Use a `SUPABASE_URL` e `SUPABASE_ANON_KEY` do seu projeto no `script.js`.

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
