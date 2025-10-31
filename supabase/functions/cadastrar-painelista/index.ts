import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Headers CORS (igual ao de antes)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Pega os dados que o JS enviou
    const { mode, body: dadosDoFormulario } = await req.json()

    // 2. Pega as DUAS URLs dos segredos
    const prodUrl = Deno.env.get('N8N_WEBHOOK_URL') // A que você já tinha
    const testUrl = Deno.env.get('N8N_TEST_URL')    // A nova que criamos

    // 3. Se usa text ou prod 
    const n8nUrl = (mode === 'test') ? testUrl : prodUrl;

    if (!n8nUrl) {
      throw new Error("URL do n8n não configurada para o modo: " + mode)
    }

    // 4. Repassa os dados para o n8n 
    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosDoFormulario), 
    })

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      throw new Error(`n8n respondeu com erro: ${n8nResponse.status}. Detalhe: ${errorBody}`)
    }

    const n8nData = await n8nResponse.json()

    // 6. Retorna sucesso para o formulário
    return new Response(JSON.stringify(n8nData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // 7. Retorna erro para o formulário
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})