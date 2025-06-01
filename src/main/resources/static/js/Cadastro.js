const TIPO_ENDERECO = {
    FATURAMENTO: "FATURAMENTO",
    ENTREGA: "ENTREGA"
};

// Função para validar CPF (adaptada de https://www.macoratti.net/alg_cpf.htm)
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Garante que só tem números
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Função para validar CEP via API
async function validarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) return null;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        return !data.erro ? data : null;
    } catch (error) {
        console.error('Erro ao validar CEP:', error);
        return null;
    }
}

// Função para validar nome completo (2 palavras com pelo menos 3 letras cada)
function validarNome(nome) {
    if (!nome || typeof nome !== 'string') return false;
    const partes = nome.trim().split(/\s+/);
    return partes.length >= 2 && partes.every(part => part.length >= 3);
}

// Função para validar data de nascimento (mínimo 12 anos)
function validarNascimento(data) {
    if (!data) return false;
    const nascimento = new Date(data);
    const hoje = new Date();
    const idadeMinima = new Date(hoje.getFullYear() - 12, hoje.getMonth(), hoje.getDate());
    return nascimento <= idadeMinima;
}

// Função para encriptar senha (simulação usando SHA-256)
async function encriptarSenha(senha) {
    if (!senha) return '';
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Função para validar todos os campos do formulário
async function validarFormulario(formData) {
    const erros = {};

    // Validar nome
    if (!formData.nomeCompleto || !validarNome(formData.nomeCompleto)) {
        erros.nome = 'Nome completo deve ter pelo menos 2 palavras com 3+ letras cada';
    }

    // Validar e-mail
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        erros.email = 'E-mail inválido';
    }

    // Validar CPF
    if (!formData.cpf || !validarCPF(formData.cpf) || formData.cpf.length !== 11) {
        erros.cpf = 'CPF inválido (deve conter 11 dígitos)';
    }

    // Validação específica para data
    if (!formData.dataNascimento || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dataNascimento)) {
        erros.nascimento = 'Data de nascimento inválida';
    }

    // Validar gênero
    if (!formData.genero) {
        erros.genero = 'Selecione um gênero';
    }

    // Validar senha
    if (!formData.senha || formData.senha.trim() === '') {
        erros.senha = 'A senha é obrigatória';
    } else if (formData.senha.length < 6) {
        erros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validação dos endereços
    if (!formData.enderecos || formData.enderecos.length < 2) {
        erros.enderecos = 'Pelo menos um endereço de faturamento e um de entrega são obrigatórios';
    } else {
        // Verifica se há exatamente um endereço de faturamento
        const faturamentoCount = formData.enderecos.filter(e => e.tipo === "FATURAMENTO").length;
        if (faturamentoCount !== 1) {
            erros.enderecos = 'Deve haver exatamente um endereço de faturamento';
        }
    }

    return erros;
}

// Função para adicionar máscara ao CPF
function aplicarMascaraCPF(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 3) value = value.replace(/^(\d{3})/, '$1.');
        if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
        if (value.length > 11) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
        
        e.target.value = value.substring(0, 14);
    });
}

// Função para adicionar máscara ao CEP
function aplicarMascaraCEP(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 5) value = value.replace(/^(\d{5})/, '$1-');
        
        e.target.value = value.substring(0, 9);
    });
}

// Função para preencher endereço a partir do CEP
function configurarAutoPreenchimentoCEP(input, callback) {
    input.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        const endereco = await validarCEP(cep);
        if (endereco && callback) {
            callback(endereco);
        }
    });
}

// Função para adicionar um novo endereço de entrega
function adicionarEnderecoEntrega(dados = null) {
    const container = document.getElementById('enderecos-entrega');
    const id = Date.now();
    
    const enderecoDiv = document.createElement('div');
    enderecoDiv.className = 'endereco-entrega';
    enderecoDiv.dataset.id = id;
    
    enderecoDiv.innerHTML = `
        <div class="form-group">
            <p>CEP*</p>
            <input type="text" class="cep-entrega" placeholder="CEP" required maxlength="9" value="${dados?.cep || ''}">
            <span class="erro erro-cep-entrega"></span>
        </div>
        <div class="form-group">
            <p>Logradouro*</p>
            <input type="text" class="logradouro-entrega" placeholder="Rua/Avenida" required value="${dados?.logradouro || ''}">
            <span class="erro erro-logradouro-entrega"></span>
        </div>
        <div class="form-row">
            <div class="form-group half-width">
                <p>Número*</p>
                <input type="text" class="numero-entrega" placeholder="Número" required value="${dados?.numero || ''}">
                <span class="erro erro-numero-entrega"></span>
            </div>
            <div class="form-group half-width">
                <p>Complemento</p>
                <input type="text" class="complemento-entrega" placeholder="Complemento" value="${dados?.complemento || ''}">
            </div>
        </div>
        <div class="form-group">
            <p>Bairro*</p>
            <input type="text" class="bairro-entrega" placeholder="Bairro" required value="${dados?.bairro || ''}">
            <span class="erro erro-bairro-entrega"></span>
        </div>
        <div class="form-row">
            <div class="form-group half-width">
                <p>Cidade*</p>
                <input type="text" class="cidade-entrega" placeholder="Cidade" required value="${dados?.cidade || ''}">
                <span class="erro erro-cidade-entrega"></span>
            </div>
            <div class="form-group half-width">
                <p>UF*</p>
                <input type="text" class="uf-entrega" placeholder="UF" required maxlength="2" value="${dados?.uf || ''}">
                <span class="erro erro-uf-entrega"></span>
            </div>
        </div>
        <button type="button" class="btn-remover-endereco">Remover Endereço</button>
    `;
    
    container.insertBefore(enderecoDiv, document.getElementById('adicionar-endereco'));
    
    // Configurar máscara e auto-preenchimento para o novo CEP
    const novoCepInput = enderecoDiv.querySelector('.cep-entrega');
    aplicarMascaraCEP(novoCepInput);
    
    configurarAutoPreenchimentoCEP(novoCepInput, (endereco) => {
        enderecoDiv.querySelector('.logradouro-entrega').value = endereco.logradouro || '';
        enderecoDiv.querySelector('.bairro-entrega').value = endereco.bairro || '';
        enderecoDiv.querySelector('.cidade-entrega').value = endereco.localidade || '';
        enderecoDiv.querySelector('.uf-entrega').value = endereco.uf || '';
        enderecoDiv.querySelector('.numero-entrega').focus();
    });
    
    // Configurar botão de remover
    enderecoDiv.querySelector('.btn-remover-endereco').addEventListener('click', function() {
        const enderecos = document.querySelectorAll('.endereco-entrega');
        if (enderecos.length > 1) {
            enderecoDiv.remove();
        } else {
            alert('Pelo menos um endereço de entrega é obrigatório.');
        }
    });
}

// Função para coletar dados do formulário
async function coletarDadosFormulario() {
    const dataNascimento = document.getElementById('nascimento').value;

    const formData = {
        nomeCompleto: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        dataNascimento: dataNascimento,
        genero: document.getElementById('genero').value,
        senha: document.getElementById('senha').value,
        confirmarSenha: document.getElementById('confirmarSenha').value,
        enderecos: []
    };

    // Endereço de faturamento
    formData.enderecos.push({
        tipo: "FATURAMENTO",
        cep: document.getElementById('cep').value.replace(/\D/g, ''),
        logradouro: document.getElementById('logradouro').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        complemento: document.getElementById('complemento').value.trim() || null,
        bairro: document.getElementById('bairro').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        uf: document.getElementById('uf').value.trim().toUpperCase()
    });

    // Endereços de entrega
    document.querySelectorAll('.endereco-entrega').forEach(enderecoEl => {
        formData.enderecos.push({
            tipo: "ENTREGA",
            cep: enderecoEl.querySelector('.cep-entrega').value.replace(/\D/g, ''),
            logradouro: enderecoEl.querySelector('.logradouro-entrega').value.trim(),
            numero: enderecoEl.querySelector('.numero-entrega').value.trim(),
            complemento: enderecoEl.querySelector('.complemento-entrega').value.trim() || null,
            bairro: enderecoEl.querySelector('.bairro-entrega').value.trim(),
            cidade: enderecoEl.querySelector('.cidade-entrega').value.trim(),
            uf: enderecoEl.querySelector('.uf-entrega').value.trim().toUpperCase()
        });
    });

    // Formatar CEP para o padrão 12345-678 antes de enviar
    formData.enderecos.forEach(endereco => {
        if (endereco.cep && endereco.cep.length === 8) {
            endereco.cep = endereco.cep.substring(0, 5) + '-' + endereco.cep.substring(5);
        }
    });

    return formData;
}

// Função para exibir erros no formulário
function exibirErros(erros) {
    // Limpar todos os erros primeiro
    document.querySelectorAll('.erro').forEach(el => el.textContent = '');
    
    // Exibir erros individuais
    if (erros.nome) document.getElementById('erro-nome').textContent = erros.nome;
    if (erros.email) document.getElementById('erro-email').textContent = erros.email;
    if (erros.cpf) document.getElementById('erro-cpf').textContent = erros.cpf;
    if (erros.nascimento) document.getElementById('erro-nascimento').textContent = erros.nascimento;
    if (erros.genero) document.getElementById('erro-genero').textContent = erros.genero;
    if (erros.senha) document.getElementById('erro-senha').textContent = erros.senha;
    if (erros.endereco) document.getElementById('erro-cep').textContent = erros.endereco;
    if (erros.enderecosEntrega) alert(erros.enderecosEntrega);
}

// Função para salvar cliente
async function salvarCliente() {
    try {
        const formData = await coletarDadosFormulario();
        
        // Verificar se as senhas coincidem
        if (formData.senha !== formData.confirmarSenha) {
            alert('As senhas não coincidem');
            return;
        }

        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao cadastrar');
        }

        const data = await response.json();
        console.log('Cadastro realizado:', data);
        
        // Fazer login automático após o cadastro
        await fazerLoginAutomatico(formData.email, formData.senha);
        
    } catch (error) {
        console.error('Erro:', error);
        // alert('Erro ao cadastrar: ' + error.message);
    }
}

async function fazerLoginAutomatico(email, senha) {
    try {
        const response = await fetch('/api/clientes/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error('Falha no login automático');
        }

        const data = await response.json();
        
        // Armazenar informações do cliente no localStorage
        const usuarioLogado = {
            tipo: 'cliente',
            id: data.cliente.id,
            nome: data.cliente.nomeCompleto,
            email: data.cliente.email,
            cidade: data.cliente.cidade || ''
        };
        
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        // Redirecionar para a página inicial
        window.location.href = '/';
        
    } catch (error) {
        console.error('Erro no login automático:', error);
        // Mesmo com falha no login, redireciona para a página inicial
        window.location.href = '/';
    }
}

// Função principal para inicializar o formulário
function inicializarFormulario() {
    // Aplicar máscaras
    aplicarMascaraCPF(document.getElementById('cpf'));
    aplicarMascaraCEP(document.getElementById('cep'));
    
    // Configurar auto-preenchimento de CEP para faturamento
    configurarAutoPreenchimentoCEP(document.getElementById('cep'), (endereco) => {
        document.getElementById('logradouro').value = endereco.logradouro || '';
        document.getElementById('bairro').value = endereco.bairro || '';
        document.getElementById('cidade').value = endereco.localidade || '';
        document.getElementById('uf').value = endereco.uf || '';
        document.getElementById('numero').focus();
    });
    
    // Configurar checkbox para copiar endereço de faturamento
    document.getElementById('mesmo-endereco').addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('.endereco-entrega').forEach(el => el.remove());
            
            const dadosFaturamento = {
                cep: document.getElementById('cep').value,
                logradouro: document.getElementById('logradouro').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                uf: document.getElementById('uf').value
            };
            
            adicionarEnderecoEntrega(dadosFaturamento);
        }
    });
    
    // Configurar botão para adicionar novo endereço de entrega
    document.getElementById('adicionar-endereco').addEventListener('click', function() {
        adicionarEnderecoEntrega();
    });
    
    // Adicionar um endereço de entrega inicial
    adicionarEnderecoEntrega();
    
    // Configurar envio do formulário
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarCliente();
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const loginBox = document.getElementById('loginBox');
    const pressKeyMessage = document.getElementById('press-key-message');
    
    document.addEventListener('keydown', function() {
        loginBox.style.display = 'block';
        pressKeyMessage.style.display = 'none';
        inicializarFormulario();
    }, { once: true });
    
    document.addEventListener('click', function() {
        loginBox.style.display = 'block';
        pressKeyMessage.style.display = 'none';
        inicializarFormulario();
    }, { once: true });
});