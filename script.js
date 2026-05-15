// URL e Chave Anonima Supabase 
const SUPABASE_URL = "https://byutodfuespjqjoxkemz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXRvZGZ1ZXNwanFqb3hrZW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTA0ODIsImV4cCI6MjA3Nzg2NjQ4Mn0.42Gp04PBXuuymIlveCAWL0w4sVKp5gnJjYs-rfme3bo";

// Coloque 'true' para enviar ao n8n de teste.
// Coloque 'false' para enviar ao n8n de produção.
const MODO_DE_TESTE = false;

// ---------------------------------------------------------------
// 1. TRADUÇÕES
// ---------------------------------------------------------------
const translations = {
    'pt': {
        'pageTitle': 'Formulário de Cadastro',
        'formTitle': 'Cadastro',
        'labelNome': 'Nome Completo',
        'labelEmail': 'Email',
        'labelGenero': 'Gênero',
        'labelNascimento': 'Data de Nascimento',
        'labelPais': 'País',
        'labelEstado': 'Estado',
        'labelCelular': 'Número do Celular',
        'btnEnviar': 'Enviar',
        'optCarregando': 'Carregando...',
        'optSelecione': 'Selecione...',
        'optCarregandoPais': 'Carregando países...',
        'optSelecionePais': 'Selecione um país primeiro...',
        'optCarregandoEstado': 'Carregando estados...',
        'optSelecioneEstado': 'Selecione um estado...',
        'feedbackEnviando': 'Enviando...',
        'feedbackSucesso': 'Cadastro realizado com sucesso!',
        'feedbackErroSupabase': 'Erro no cadastro:',
        'feedbackErroRede': 'Erro de rede. Verifique o console (F12).',
        'feedbackErroNome': 'Erro: O nome deve conter apenas letras e espaços.',
        'feedbackErroCelularInvalido': 'Erro: Número de celular inválido.',
        'feedbackErroEmailInvalido': 'Erro: Email inválido.'
    },

    'es': {
        'pageTitle': 'Formulario de Registro',
        'formTitle': 'Registro',
        'labelNome': 'Nombre Completo',
        'labelEmail': 'Correo Electrónico',
        'labelGenero': 'Género',
        'labelNascimento': 'Fecha de Nacimiento',
        'labelPais': 'País',
        'labelEstado': 'Estado/Provincia',
        'labelCelular': 'Número de Celular',
        'btnEnviar': 'Enviar',
        'optCarregando': 'Cargando...',
        'optSelecione': 'Seleccione...',
        'optCarregandoPais': 'Cargando países...',
        'optSelecionePais': 'Seleccione un país primero...',
        'optCarregandoEstado': 'Cargando estados...',
        'optSelecioneEstado': 'Seleccione un estado...',
        'feedbackEnviando': 'Enviando...',
        'feedbackSucesso': '¡Registro realizado con éxito!',
        'feedbackErroSupabase': 'Error en el registro:',
        'feedbackErroRede': 'Error de red.',
        'feedbackErroNome': 'Error: El nombre debe contener solo letras y espacios.',
        'feedbackErroCelularInvalido': 'Error: Número de celular inválido.',
        'feedbackErroEmailInvalido': 'Error: Correo inválido.'
    }
};

// ---------------------------------------------------------------
// 2. MÁSCARAS
// ---------------------------------------------------------------
const maskMap = {
    'AR': { mask: '+54 9 0000 00-0000', placeholder: '+54 9 XXX XXX-XXXX' },
    'BO': { mask: '+591 0 000-0000', placeholder: '+591 X XXX-XXXX' },
    'BR': { mask: '+55 (00) 00000-0000', placeholder: '+55 (DD) 9____-____' },
    'CL': { mask: '+56 0 0000 0000', placeholder: '+56 X XXXX XXXX' },
    'CO': { mask: '+57 000 000-0000', placeholder: '+57 XXX XXX-XXXX' },
    'EC': { mask: '+593 00 000-0000', placeholder: '+593 XX XXX-XXXX' },
    'PY': { mask: '+595 000 000-000', placeholder: '+595 XXX XXX-XXX' },
    'PE': { mask: '+51 000 000-000', placeholder: '+51 XXX XXX-XXX' },
    'UY': { mask: '+598 0 000-0000', placeholder: '+598 X XXX-XXXX' },
    'VE': { mask: '+58 000 000-0000', placeholder: '+58 XXX XXX-XXXX' },
    'CR': { mask: '+506 0000-0000', placeholder: '+506 XXXX-XXXX' },
    'CU': { mask: '+53 0 000-0000', placeholder: '+53 X XXX-XXXX' },
    'DO': { mask: '+1 (000) 000-0000', placeholder: '+1 (XXX) XXX-XXXX' },
    'SV': { mask: '+503 0000-0000', placeholder: '+503 XXXX-XXXX' },
    'GT': { mask: '+502 0000-0000', placeholder: '+502 XXXX-XXXX' },
    'HN': { mask: '+504 0000-0000', placeholder: '+504 XXXX-XXXX' },
    'MX': { mask: '+52 00 0000-0000', placeholder: '+52 XX XXXX-XXXX' },
    'NI': { mask: '+505 0000-0000', placeholder: '+505 XXXX-XXXX' },
    'PA': { mask: '+507 0000-0000', placeholder: '+507 XXXX-XXXX' },

    'DEFAULT': {
        mask: '+000000000000000',
        placeholder: 'Número com cód. país'
    }
};

// ---------------------------------------------------------------
// 3. TAMANHO DOS TELEFONES
// ---------------------------------------------------------------
const lengthMap = {

    // Argentina aceita tamanho variável
    'AR': { min: 11, max: 13 },

    // Países fixos
    'BO': 8,
    'BR': 11,
    'CL': 9,
    'CO': 10,
    'EC': 9,
    'PY': 9,
    'PE': 9,
    'UY': 8,
    'VE': 10,
    'CR': 8,
    'CU': 8,
    'DO': 10,
    'SV': 8,
    'GT': 8,
    'HN': 8,
    'MX': 10,
    'NI': 8,
    'PA': 8,

    'DEFAULT': 7
};

// ---------------------------------------------------------------
// 4. LINGUAGEM
// ---------------------------------------------------------------
const userLang = navigator.language.split('-')[0];
const lang = (userLang === 'es') ? 'es' : 'pt';
const dict = translations[lang] || translations['pt'];

function setLanguage() {

    document.documentElement.lang = lang;
    document.title = dict.pageTitle;

    document.querySelectorAll('[data-key]').forEach(element => {

        const key = element.dataset.key;

        if (dict[key]) {
            element.textContent = dict[key];
        }
    });

    const celularInput = document.getElementById('celular');

    if (celularInput) {
        celularInput.placeholder = dict.optSelecionePais;
    }
}

// ---------------------------------------------------------------
// 5. SUPABASE
// ---------------------------------------------------------------
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    alert("ERRO: Chaves do Supabase não configuradas.");
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ---------------------------------------------------------------
// 6. ELEMENTOS
// ---------------------------------------------------------------
const form = document.getElementById('meuFormulario');
const feedback = document.getElementById('feedback');

const paisSelect = document.getElementById('pais');
const estadoSelect = document.getElementById('estado');
const generoSelect = document.getElementById('genero');

const celularInput = document.getElementById('celular');

let phoneMask = null;

// ---------------------------------------------------------------
// 7. BUSCAR PAÍSES
// ---------------------------------------------------------------
async function fetchPaises() {

    const { data, error } = await supabaseClient
        .from('dpais')
        .select('id_pais, nome, codigo_iso2')
        .order('nome');

    if (error) {

        console.error(error);

        paisSelect.innerHTML = `
            <option value="">
                ${dict.feedbackErroRede}
            </option>
        `;

        return;
    }

    paisSelect.innerHTML = `
        <option value="">
            ${dict.optSelecione}
        </option>
    `;

    data.forEach(pais => {

        const option = document.createElement('option');

        option.value = pais.id_pais;
        option.textContent = pais.nome;
        option.dataset.iso2 = pais.codigo_iso2;

        paisSelect.appendChild(option);
    });
}

// ---------------------------------------------------------------
// 8. BUSCAR ESTADOS
// ---------------------------------------------------------------
async function fetchEstados(paisId) {

    estadoSelect.disabled = true;

    estadoSelect.innerHTML = `
        <option value="">
            ${dict.optCarregandoEstado}
        </option>
    `;

    const { data, error } = await supabaseClient
        .from('destado')
        .select('id_estado, nome_estado')
        .eq('id_pais', paisId)
        .order('nome_estado');

    if (error) {

        console.error(error);

        estadoSelect.innerHTML = `
            <option value="">
                ${dict.feedbackErroRede}
            </option>
        `;

        return;
    }

    estadoSelect.innerHTML = `
        <option value="">
            ${dict.optSelecioneEstado}
        </option>
    `;

    data.forEach(estado => {

        const option = document.createElement('option');

        option.value = estado.id_estado;
        option.textContent = estado.nome_estado;

        estadoSelect.appendChild(option);
    });

    estadoSelect.disabled = false;
}

// ---------------------------------------------------------------
// 9. BUSCAR GÊNEROS
// ---------------------------------------------------------------
async function fetchGeneros() {

    const { data, error } = await supabaseClient
        .from('genero')
        .select('id_genero, escolha_genero')
        .order('id_genero');

    if (error) {

        console.error(error);

        generoSelect.innerHTML = `
            <option value="">
                ${dict.feedbackErroRede}
            </option>
        `;

        return;
    }

    generoSelect.innerHTML = `
        <option value="">
            ${dict.optSelecione}
        </option>
    `;

    data.forEach(genero => {

        const option = document.createElement('option');

        option.value = genero.id_genero;
        option.textContent = genero.escolha_genero;

        generoSelect.appendChild(option);
    });
}

// ---------------------------------------------------------------
// 10. MÁSCARA TELEFONE
// ---------------------------------------------------------------
function updatePhoneMask(iso2) {

    if (phoneMask) {
        phoneMask.destroy();
    }

    const maskConfig = maskMap[iso2] || maskMap['DEFAULT'];

    celularInput.placeholder = maskConfig.placeholder;

    phoneMask = IMask(celularInput, {
        mask: maskConfig.mask
    });
}

// ---------------------------------------------------------------
// 11. LOAD
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    setLanguage();

    fetchPaises();

    fetchGeneros();

    celularInput.disabled = true;
});

// ---------------------------------------------------------------
// 12. TROCA DE PAÍS
// ---------------------------------------------------------------
paisSelect.addEventListener('change', (event) => {

    const selectedOption = event.target.selectedOptions[0];

    const paisId = selectedOption.value;
    const paisIso2 = selectedOption.dataset.iso2;

    if (paisId) {

        fetchEstados(paisId);

        updatePhoneMask(paisIso2);

        celularInput.disabled = false;

    } else {

        estadoSelect.innerHTML = `
            <option value="">
                ${dict.optSelecionePais}
            </option>
        `;

        estadoSelect.disabled = true;

        if (phoneMask) {
            phoneMask.destroy();
        }

        celularInput.placeholder = dict.optSelecionePais;

        celularInput.disabled = true;
    }
});

// ---------------------------------------------------------------
// 13. SUBMIT
// ---------------------------------------------------------------
form.addEventListener('submit', async (event) => {

    event.preventDefault();

    // Nome
    const nomeCompleto = document.getElementById('nome_completo').value;

    const regexNome = /^[a-zA-Z\u00C0-\u017F ]+$/;

    if (!regexNome.test(nomeCompleto)) {

        feedback.textContent = dict.feedbackErroNome;
        feedback.className = 'error';

        return;
    }

    // Email
    const email = document.getElementById('email').value;

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {

        feedback.textContent = dict.feedbackErroEmailInvalido;
        feedback.className = 'error';

        return;
    }

    // Telefone
    const paisIso2 = paisSelect.options[
        paisSelect.selectedIndex
    ].dataset.iso2;

    const regraTelefone = lengthMap[paisIso2] || lengthMap['DEFAULT'];

    if (!phoneMask) {

        feedback.textContent = dict.feedbackErroCelularInvalido;
        feedback.className = 'error';

        return;
    }

    const tamanho = phoneMask.unmaskedValue.length;

    // País variável
    if (typeof regraTelefone === 'object') {

        if (
            tamanho < regraTelefone.min ||
            tamanho > regraTelefone.max
        ) {

            feedback.textContent = dict.feedbackErroCelularInvalido;
            feedback.className = 'error';

            return;
        }

    } else {

        // País fixo
        if (tamanho !== regraTelefone) {

            feedback.textContent = dict.feedbackErroCelularInvalido;
            feedback.className = 'error';

            return;
        }
    }

    feedback.textContent = dict.feedbackEnviando;
    feedback.className = '';

    // Dados
    const formData = new FormData(form);

    const data = Object.fromEntries(formData.entries());

    // Formata telefone
    let celular_e164 = "";

    if (phoneMask && phoneMask.value) {

        celular_e164 = phoneMask.value.replace(
            /[ \(\)\-]/g,
            ''
        );

    } else {

        celular_e164 = data.celular.replace(
            /[ \(\)\-]/g,
            ''
        );
    }

    data.celular = celular_e164;

    // Gênero
    if (data.genero) {

        data.id_genero = data.genero;

        delete data.genero;
    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/cadastrar-painelista`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                },

                body: JSON.stringify({
                    mode: MODO_DE_TESTE ? "test" : "production",
                    body: data,
                }),
            }
        );

        let result;

        try {

            result = await response.json();

        } catch {

            result = {
                mensagem: "Erro desconhecido."
            };
        }

        // Erro
        if (!response.ok) {

            feedback.textContent =
                result.mensagem ||
                "Erro ao processar cadastro.";

            feedback.className = "error";

            console.warn(result);

            return;
        }

        // Sucesso
        feedback.textContent =
            result.mensagem ||
            dict.feedbackSucesso;

        feedback.className = "success";

        form.reset();

        estadoSelect.innerHTML = `
            <option value="">
                ${dict.optSelecionePais}
            </option>
        `;

        estadoSelect.disabled = true;

        if (phoneMask) {
            phoneMask.destroy();
        }

        celularInput.placeholder =
            dict.optSelecionePais;

        celularInput.disabled = true;

    } catch (error) {

        console.error(error);

        feedback.textContent =
            `${dict.feedbackErroSupabase} ${error.message}`;

        feedback.className = "error";
    }
});
