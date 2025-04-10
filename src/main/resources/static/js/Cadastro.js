// Função para validar CPF (adaptada de https://www.macoratti.net/alg_cpf.htm)
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
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

// Função para formatar CPF
function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

// Função para formatar CEP
function formatarCEP(cep) {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Função para validar nome completo (2 palavras com pelo menos 3 letras cada)
function validarNome(nome) {
    const partes = nome.trim().split(/\s+/);
    return partes.length >= 2 && partes.every(part => part.length >= 3);
}

// Função para validar e-mail único (simulação)
async function verificarEmailUnico(email) {
    // Simulação - em uma aplicação real, faria uma requisição ao servidor
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true); // Assume que o e-mail é único
        }, 500);
    });
}

// Função para validar data de nascimento (mínimo 12 anos)
function validarNascimento(data) {
    const nascimento = new Date(data);
    const hoje = new Date();
    const idadeMinima = new Date(hoje.getFullYear() - 12, hoje.getMonth(), hoje.getDate());
    return nascimento <= idadeMinima;
}

// Função para encriptar senha (simulação usando bcrypt.js)
async function encriptarSenha(senha) {
    // Em uma aplicação real, usaria bcrypt ou similar
    // Esta é uma simulação básica apenas para demonstração
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Função para criar um objeto de endereço
function criarEndereco(tipo, dados) {
    return {
        tipo,
        cep: dados.cep,
        logradouro: dados.logradouro,
        numero: dados.numero,
        complemento: dados.complemento || '',
        bairro: dados.bairro,
        cidade: dados.cidade,
        uf: dados.uf
    };
}

// Função para validar todos os campos do formulário
async function validarFormulario(formData) {
    const erros = {};

    // Validar nome
    if (!validarNome(formData.nome)) {
        erros.nome = 'Nome completo deve ter pelo menos 2 palavras com 3+ letras cada';
    }

    // Validar e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        erros.email = 'E-mail inválido';
    } else if (!await verificarEmailUnico(formData.email)) {
        erros.email = 'E-mail já cadastrado';
    }

    // Validar CPF
    if (!validarCPF(formData.cpf)) {
        erros.cpf = 'CPF inválido';
    }

    // Validar data de nascimento
    if (!formData.nascimento || !validarNascimento(formData.nascimento)) {
        erros.nascimento = 'Data de nascimento inválida ou idade mínima não atingida';
    }

    // Validar gênero
    if (!formData.genero) {
        erros.genero = 'Selecione um gênero';
    }

    // Validar senha
    if (formData.senha.length < 6) {
        erros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar endereço de faturamento
    if (!formData.cep || !formData.logradouro || !formData.numero || 
        !formData.bairro || !formData.cidade || !formData.uf) {
        erros.endereco = 'Endereço de faturamento incompleto';
    }

    // Validar endereços de entrega
    if (formData.enderecosEntrega.length === 0) {
        erros.enderecosEntrega = 'Pelo menos um endereço de entrega é obrigatório';
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
function configurarAutoPreenchimentoCEP() {
    const cepInput = document.getElementById('cep');
    
    cepInput.addEventListener('blur', async function() {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        const endereco = await validarCEP(cep);
        if (endereco) {
            document.getElementById('logradouro').value = endereco.logradouro || '';
            document.getElementById('bairro').value = endereco.bairro || '';
            document.getElementById('cidade').value = endereco.localidade || '';
            document.getElementById('uf').value = endereco.uf || '';
            
            // Focar no número depois de preencher
            document.getElementById('numero').focus();
        } else {
            document.getElementById('erro-cep').textContent = 'CEP não encontrado';
        }
    });
}

// Função para adicionar um novo endereço de entrega
function adicionarEnderecoEntrega(dados = null) {
    const container = document.getElementById('enderecos-entrega');
    const id = Date.now(); // ID único para o endereço
    
    const enderecoDiv = document.createElement('div');
    enderecoDiv.className = 'endereco-entrega';
    enderecoDiv.dataset.id = id;
    
    enderecoDiv.innerHTML = `
        <h3>Endereço de Entrega</h3>
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
    
    // Inserir antes do botão de adicionar
    container.insertBefore(enderecoDiv, document.getElementById('adicionar-endereco'));
    
    // Configurar máscara de CEP para o novo campo
    const novoCepInput = enderecoDiv.querySelector('.cep-entrega');
    aplicarMascaraCEP(novoCepInput);
    
    // Configurar auto-preenchimento para o novo CEP
    novoCepInput.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        const endereco = await validarCEP(cep);
        if (endereco) {
            enderecoDiv.querySelector('.logradouro-entrega').value = endereco.logradouro || '';
            enderecoDiv.querySelector('.bairro-entrega').value = endereco.bairro || '';
            enderecoDiv.querySelector('.cidade-entrega').value = endereco.localidade || '';
            enderecoDiv.querySelector('.uf-entrega').value = endereco.uf || '';
            
            // Focar no número depois de preencher
            enderecoDiv.querySelector('.numero-entrega').focus();
        } else {
            enderecoDiv.querySelector('.erro-cep-entrega').textContent = 'CEP não encontrado';
        }
    });
    
    // Configurar botão de remover
    enderecoDiv.querySelector('.btn-remover-endereco').addEventListener('click', function() {
        // Não permitir remover se for o único endereço
        const enderecos = document.querySelectorAll('.endereco-entrega');
        if (enderecos.length > 1) {
            enderecoDiv.remove();
        } else {
            alert('Pelo menos um endereço de entrega é obrigatório.');
        }
    });
    
    return id;
}

// Função para coletar dados do formulário
async function coletarDadosFormulario() {
    // Dados básicos
    const formData = {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        nascimento: document.getElementById('nascimento').value,
        genero: document.getElementById('genero').value,
        senha: document.getElementById('senha').value,
        // Endereço de faturamento
        cep: document.getElementById('cep').value.replace(/\D/g, ''),
        logradouro: document.getElementById('logradouro').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        complemento: document.getElementById('complemento').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        uf: document.getElementById('uf').value.trim(),
        // Endereços de entrega
        enderecosEntrega: []
    };
    
    // Encriptar senha
    formData.senha = await encriptarSenha(formData.senha);
    
    // Coletar endereços de entrega
    const enderecosEntrega = document.querySelectorAll('.endereco-entrega');
    enderecosEntrega.forEach(endereco => {
        formData.enderecosEntrega.push({
            cep: endereco.querySelector('.cep-entrega').value.replace(/\D/g, ''),
            logradouro: endereco.querySelector('.logradouro-entrega').value.trim(),
            numero: endereco.querySelector('.numero-entrega').value.trim(),
            complemento: endereco.querySelector('.complemento-entrega').value.trim(),
            bairro: endereco.querySelector('.bairro-entrega').value.trim(),
            cidade: endereco.querySelector('.cidade-entrega').value.trim(),
            uf: endereco.querySelector('.uf-entrega').value.trim()
        });
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
    if (erros.cep) document.getElementById('erro-cep').textContent = erros.cep;
    if (erros.logradouro) document.getElementById('erro-logradouro').textContent = erros.logradouro;
    if (erros.numero) document.getElementById('erro-numero').textContent = erros.numero;
    if (erros.bairro) document.getElementById('erro-bairro').textContent = erros.bairro;
    if (erros.cidade) document.getElementById('erro-cidade').textContent = erros.cidade;
    if (erros.uf) document.getElementById('erro-uf').textContent = erros.uf;
    
    // Exibir erros de endereço de entrega
    if (erros.enderecosEntrega) {
        alert(erros.enderecosEntrega);
    }
}

// Função para salvar cliente (simulação)
async function salvarCliente(cliente) {
    // Em uma aplicação real, faria uma requisição POST para o servidor
    console.log('Cliente a ser salvo:', cliente);
    
    // Simular atraso de rede
    return new Promise(resolve => {
        setTimeout(() => {
            // Simular sucesso
            resolve({ success: true });
            
            // Em uma aplicação real, redirecionar para login após cadastro
            window.location.href = '/login.html';
        }, 1000);
    });
}

// Função principal para inicializar o formulário
function inicializarFormulario() {
    // Aplicar máscaras
    aplicarMascaraCPF(document.getElementById('cpf'));
    aplicarMascaraCEP(document.getElementById('cep'));
    
    // Configurar auto-preenchimento de CEP
    configurarAutoPreenchimentoCEP();
    
    // Configurar checkbox para copiar endereço de faturamento
    document.getElementById('mesmo-endereco').addEventListener('change', function() {
        if (this.checked) {
            // Limpar endereços de entrega existentes
            document.querySelectorAll('.endereco-entrega').forEach(el => el.remove());
            
            // Adicionar um novo endereço com os dados de faturamento
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
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Coletar dados
        const formData = await coletarDadosFormulario();
        
        // Validar
        const erros = await validarFormulario(formData);
        
        if (Object.keys(erros).length > 0) {
            exibirErros(erros);
            return;
        }
        
        // Salvar cliente
        const resultado = await salvarCliente(formData);
        
        if (resultado.success) {
            // Redirecionar para login
            window.location.href = '/src/main/resources/templates/index.html';
        } else {
            alert('Erro ao cadastrar cliente. Por favor, tente novamente.');
        }
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const loginBox = document.getElementById('loginBox');
    const pressKeyMessage = document.getElementById('press-key-message');
    
    // Mostrar o formulário quando qualquer tecla for pressionada
    document.addEventListener('keydown', function() {
        loginBox.style.display = 'block';
        pressKeyMessage.style.display = 'none';
        inicializarFormulario();
    }, { once: true });
    
    // Também permitir clique/touch para dispositivos móveis
    document.addEventListener('click', function() {
        loginBox.style.display = 'block';
        pressKeyMessage.style.display = 'none';
        inicializarFormulario();
    }, { once: true });
});
