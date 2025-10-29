// URL do seu webhook do n8n 
const N8N_WEBHOOK_URL = "https://teste-n8n.ade4u1.easypanel.host/webhook/Cadastro-About-Brazil";

// URL e Chave ANON  Supabase 
const SUPABASE_URL = "https://mlhdtsjdhmmaiveltojv.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saGR0c2pkaG1tYWl2ZWx0b2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTI5NzMsImV4cCI6MjA3NTA4ODk3M30.ruk8TVAvqwIs-bHCgcbw2S2q_wLtRG3dP9DEEDEQVkM";

// Mapeamento de máscaras de telefone por país (código iso2)
const maskMap = {
    // --- Am. do Sul ---
    'AR': { mask: '+54 000 000-0000', placeholder: '+54 XXX XXX-XXXX' }, 
    'BO': { mask: '+591 0 000-0000', placeholder: '+591 X XXX-XXXX' },    
    'BR': { mask: '+55 (00) 00000-0000', placeholder: '+55 (DD) 9____-____' }, 
    'CL': { mask: '+56 0 0000 0000', placeholder: '+56 X XXXX XXXX' }, 
    'CO': { mask: '+57 000 000-0000', placeholder: '+57 XXX XXX-XXXX' }, 
    'EC': { mask: '+593 00 000-0000', placeholder: '+593 XX XXX-XXXX' }, 
    'PY': { mask: '+595 000 000-000', placeholder: '+595 XXX XXX-XXX' }, 
    'PE': { mask: '+51 000 000-000', placeholder: '+51 XXX XXX-XXX' }, 
    'UY': { mask: '+598 0 000-0000', placeholder: '+598 X XXX-XXXX' },   
    'VE': { mask: '+58 000 000-0000', placeholder: '+58 XXX XXX-XXXX' }, 
    
    // --- Am. Central, Norte e Caribe ---
    'CR': { mask: '+506 0000-0000', placeholder: '+506 XXXX-XXXX' }, 
    'CU': { mask: '+53 0 000-0000', placeholder: '+53 X XXX-XXXX' },    
    'DO': { mask: '+1 (000) 000-0000', placeholder: '+1 (XXX) XXX-XXXX' }, 
    'SV': { mask: '+503 0000-0000', placeholder: '+503 XXXX-XXXX' }, 
    'GT': { mask: '+502 0000-0000', placeholder: '+502 XXXX-XXXX' }, 
    'HN': { mask: '+504 0000-0000', placeholder: '+504 XXXX-XXXX' }, 
    'MX': { mask: '+52 00 0000-0000', placeholder: '+52 XX XXXX-XXXX' }, 
    'NI': { mask: '+505 0000-0000', placeholder: '+505 XXXX-XXXX' }, 
    'PA': { mask: '+507 0000-0000', placeholder: '+507 XXXX-XXXX' }, 
    
    // --- Padrão ---
    'DEFAULT': { mask: '+000000000000000', placeholder: 'Número com cód. país' }
};

// ---------------------------------------------------------------
// 2. INICIALIZAÇÃO
// ---------------------------------------------------------------

// Inicializa o cliente Supabase
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("COLE_SUA")) {
     alert("ERRO: Configure suas chaves SUPABASE_URL e SUPABASE_ANON_KEY no código JavaScript.");
}
// OBS: As variáveis 'supabase' e 'IMask' são globais 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do formulário
const form = document.getElementById('meuFormulario');
const feedback = document.getElementById('feedback');
const paisSelect = document.getElementById('pais');
const estadoSelect = document.getElementById('estado');
const celularInput = document.getElementById('celular');

let phoneMask = null; // Variável global para a máscara

// ---------------------------------------------------------------
// 3. FUNÇÕES DE DADOS
// ---------------------------------------------------------------

// Busca países do Supabase
async function fetchPaises() {
    const { data, error } = await supabase
        .from('dpais') 
        .select('id_pais, nome, codigo_iso2')
        .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao buscar países:', error);
        paisSelect.innerHTML = '<option value="">Erro ao carregar países</option>';
        return;
    }

    // Popula o dropdown de países
    paisSelect.innerHTML = '<option value="">Selecione um país...</option>';
    data.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais.id_pais; 
        option.textContent = pais.nome; 
        option.dataset.iso2 = pais.codigo_iso2; 
        paisSelect.appendChild(option);
    });
}

// Busca estados de um país específico
async function fetchEstados(paisId) {
    estadoSelect.disabled = true;
    estadoSelect.innerHTML = '<option value="">Carregando estados...</option>';

    const { data, error } = await supabase
        .from('destado') 
        .select('id_estado, nome_estado')
        .eq('id_pais', paisId) 
        .order('nome_estado', { ascending: true });

    if (error) {
        console.error('Erro ao buscar estados:', error);
        estadoSelect.innerHTML = '<option value="">Erro ao carregar estados</option>';
        return;
    }

    // Popula o dropdown de estados
    estadoSelect.innerHTML = '<option value="">Selecione um estado...</option>';
    data.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id_estado; // Envia o ID
        option.textContent = estado.nome_estado; // Mostra o Nome
        estadoSelect.appendChild(option);
    });
    estadoSelect.disabled = false;
}

// ---------------------------------------------------------------
// 4. FUNÇÕES DE INTERFACE (UI)
// ---------------------------------------------------------------

// Atualiza a máscara do telefone
function updatePhoneMask(iso2) {
    // Destrói a máscara antiga caso exista
    if (phoneMask) {
        phoneMask.destroy();
        phoneMask = null;
    }

    const maskConfig = maskMap[iso2] || maskMap['DEFAULT'];

    celularInput.placeholder = maskConfig.placeholder;
    phoneMask = IMask(celularInput, {
        mask: maskConfig.mask
    });
}

// ---------------------------------------------------------------
// 5. EVENT LISTENERS (Onde a mágica acontece)
// ---------------------------------------------------------------

// 1. Quando a página carregar, busca os países
document.addEventListener('DOMContentLoaded', fetchPaises);

// 2. Quando o usuário MUDAR o país...
paisSelect.addEventListener('change', (event) => {
    const selectedOption = event.target.selectedOptions[0];
    const paisId = selectedOption.value;
    const paisIso2 = selectedOption.dataset.iso2;

    if (paisId) {
        // ...busca os estados desse país
        fetchEstados(paisId);
        // atualiza a máscara do telefone
        updatePhoneMask(paisIso2);
    } else {
        // reseta se o usuário selecionar "Selecione um país"
        estadoSelect.innerHTML = '<option value="">Selecione um país primeiro...</option>';
        estadoSelect.disabled = true;
        if (phoneMask) phoneMask.destroy();
        celularInput.placeholder = "Selecione um país...";
    }
});

// 3. Quando o usuário ENVIAR o formulário...
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = 'Enviando...';
    feedback.className = '';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    //  Pega o valor SEM máscara e adiciona o "+"
    if (phoneMask && phoneMask.value) {
         // Pega o valor formatado (ex: "+55 (85) 99901-7780")
         // e remove os caracteres de formatação 
         data.celular = phoneMask.value.replace(/[ \(\)\-]/g, '');
    } else {
        // Fallback 
        data.celular = data.celular.replace(/[\s\(\)\-]/g, ''); 
    }
    
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            feedback.textContent = 'Formulário enviado com sucesso!';
            feedback.className = 'success';
            form.reset();
            // Reseta os campos dinâmicos
            const urlDeRedirecionamento = "https://conectatribo.com.br/t/lOlVjW"; // 

                
                const tempoDeEspera = 2000; // 2 segundos

                // 3. função de redirecionamento
                setTimeout(() => {
                    window.location.href = urlDeRedirecionamento;
                }, tempoDeEspera);

        } else {
            feedback.textContent = 'Erro ao enviar. O n8n respondeu com um erro.';
            feedback.className = 'error';
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        feedback.textContent = 'Erro de rede. Verifique o console (F12) e a URL do webhook.';
        feedback.className = 'error';
    }
});