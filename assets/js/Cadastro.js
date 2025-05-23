document.addEventListener('DOMContentLoaded', function() {
    const loginBox = document.getElementById('loginBox');
    const pressKeyMessage = document.getElementById('press-key-message');
    
    // Mostrar formulário ao pressionar qualquer tecla ou clicar
    const showForm = () => {
        loginBox.style.display = 'block';
        pressKeyMessage.style.display = 'none';
        inicializarFormulario();
    };
    
    document.addEventListener('keydown', showForm, { once: true });
    document.addEventListener('click', showForm, { once: true });
});

// Função principal de inicialização do formulário
function inicializarFormulario() {
    // Aplicar máscaras aos campos
    aplicarMascaraCPF(document.getElementById('cpf'));
    aplicarMascaraCEP(document.getElementById('cep'));
    
    // Auto-preenchimento de endereço via CEP
    configurarAutoPreenchimentoCEP(document.getElementById('cep'), (endereco) => {
        document.getElementById('logradouro').value = endereco.logradouro || '';
        document.getElementById('bairro').value = endereco.bairro || '';
        document.getElementById('cidade').value = endereco.localidade || '';
        document.getElementById('uf').value = endereco.uf || '';
        document.getElementById('numero').focus();
    });
    
    // Checkbox para usar mesmo endereço de faturamento
    document.getElementById('mesmo-endereco').addEventListener('change', function() {
        if (this.checked) {
            document.querySelectorAll('.endereco-entrega').forEach(el => el.remove());
            adicionarEnderecoEntrega({
                cep: document.getElementById('cep').value,
                logradouro: document.getElementById('logradouro').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                uf: document.getElementById('uf').value
            });
        }
    });
    
    // Botão para adicionar novo endereço de entrega
    document.getElementById('adicionar-endereco').addEventListener('click', () => adicionarEnderecoEntrega());
    adicionarEnderecoEntrega(); // Endereço inicial
    
    // Submissão do formulário
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = await coletarDadosFormulario();
            const erros = await validarFormulario(formData);
            
            if (Object.keys(erros).length > 0) {
                exibirErros(erros);
                return;
            }
            
            if (await salvarNovoCliente(formData)) {
                alert('Cadastro realizado com sucesso! Redirecionando...');
                setTimeout(() => window.location.href = 'index.html', 2000);
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Erro durante o cadastro. Tente novamente.');
        }
    });
}

// Função para salvar novo cliente no localStorage
async function salvarNovoCliente(formData) {
    const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
    
    // Verificar se e-mail já existe
    if (usuarios.some(u => u.email === formData.email)) {
        throw new Error('E-mail já cadastrado');
    }

    // Verificar se CPF já existe
    if (usuarios.some(u => u.dadosCompletos?.cpf === formData.cpf)) {
        throw new Error('CPF já cadastrado');
    }

    const novoCliente = {
        usuario: gerarUsername(formData.nome),
        email: formData.email,
        senha: formData.senha,
        tipo: "Cliente",
        dadosCompletos: formData
    };

    usuarios.push(novoCliente);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(usuarios));
    return true;
}

// Gerar username a partir do nome
function gerarUsername(nome) {
    const base = nome.toLowerCase().split(' ')[0];
    let username = base;
    const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
    
    let tentativas = 1;
    while (usuarios.some(u => u.usuario === username)) {
        username = `${base}${tentativas}`;
        tentativas++;
    }
    
    return username;
}

// Coletar dados do formulário
async function coletarDadosFormulario() {
    return {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        nascimento: document.getElementById('nascimento').value,
        genero: document.getElementById('genero').value,
        senha: document.getElementById('senha').value,
        enderecoFaturamento: {
            cep: document.getElementById('cep').value.replace(/\D/g, ''),
            logradouro: document.getElementById('logradouro').value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            uf: document.getElementById('uf').value.trim()
        },
        enderecosEntrega: Array.from(document.querySelectorAll('.endereco-entrega')).map(endereco => ({
            cep: endereco.querySelector('.cep-entrega').value.replace(/\D/g, ''),
            logradouro: endereco.querySelector('.logradouro-entrega').value.trim(),
            numero: endereco.querySelector('.numero-entrega').value.trim(),
            complemento: endereco.querySelector('.complemento-entrega').value.trim(),
            bairro: endereco.querySelector('.bairro-entrega').value.trim(),
            cidade: endereco.querySelector('.cidade-entrega').value.trim(),
            uf: endereco.querySelector('.uf-entrega').value.trim()
        }))
    };
}

// Validação do formulário
async function validarFormulario(formData) {
    const erros = {};

    if (!formData.nome || formData.nome.split(' ').length < 2) {
        erros.nome = 'Nome completo obrigatório';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        erros.email = 'E-mail inválido';
    }

    if (!validarCPF(formData.cpf)) {
        erros.cpf = 'CPF inválido';
    }

    if (!formData.nascimento || !validarNascimento(formData.nascimento)) {
        erros.nascimento = 'Data inválida ou menor de 12 anos';
    }

    if (!formData.genero) {
        erros.genero = 'Selecione um gênero';
    }

    if (!formData.senha || formData.senha.length < 6) {
        erros.senha = 'Senha deve ter 6+ caracteres';
    }

    // Validação de confirmação de senha
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    if (formData.senha !== confirmarSenha) {
        erros.confirmarSenha = 'As senhas não coincidem';
    }

    // Validação de endereço
    const validaEndereco = (endereco, prefixo = '') => {
        if (!endereco.cep || endereco.cep.length !== 8) erros[`${prefixo}cep`] = 'CEP inválido';
        if (!endereco.logradouro) erros[`${prefixo}logradouro`] = 'Campo obrigatório';
        if (!endereco.numero) erros[`${prefixo}numero`] = 'Campo obrigatório';
        if (!endereco.bairro) erros[`${prefixo}bairro`] = 'Campo obrigatório';
        if (!endereco.cidade) erros[`${prefixo}cidade`] = 'Campo obrigatório';
        if (!endereco.uf || endereco.uf.length !== 2) erros[`${prefixo}uf`] = 'UF inválida';
    };

    validaEndereco(formData.enderecoFaturamento, 'enderecoFaturamento_');

    formData.enderecosEntrega.forEach((endereco, i) => {
        validaEndereco(endereco, `enderecoEntrega${i}_`);
    });

    return erros;
}

// Exibir erros no formulário
function exibirErros(erros) {
    document.querySelectorAll('.erro').forEach(el => el.textContent = '');

    const campos = {
        nome: 'erro-nome',
        email: 'erro-email',
        cpf: 'erro-cpf',
        nascimento: 'erro-nascimento',
        genero: 'erro-genero',
        senha: 'erro-senha',
        confirmarSenha: 'erro-confirmarSenha',
        enderecoFaturamento_cep: 'erro-cep',
        enderecoFaturamento_logradouro: 'erro-logradouro',
        enderecoFaturamento_numero: 'erro-numero',
        enderecoFaturamento_bairro: 'erro-bairro',
        enderecoFaturamento_cidade: 'erro-cidade',
        enderecoFaturamento_uf: 'erro-uf'
    };

    Object.keys(campos).forEach(key => {
        if (erros[key]) {
            document.getElementById(campos[key]).textContent = erros[key];
        }
    });

    Object.keys(erros).forEach(key => {
        if (key.startsWith('enderecoEntrega')) {
            const [_, index, campo] = key.match(/enderecoEntrega(\d+)_(\w+)/) || [];
            const elemento = document.querySelector(`.endereco-entrega:nth-child(${parseInt(index) + 1}) .erro-${campo}-entrega`);
            if (elemento) elemento.textContent = erros[key];
        }
    });
}

// Funções auxiliares para manipulação de endereços
function adicionarEnderecoEntrega(dados = {}) {
    const container = document.getElementById('enderecos-entrega');
    const id = Date.now();
    
    const template = `
        <div class="endereco-entrega" data-id="${id}">
            <div class="form-group">
                <p>CEP*</p>
                <input type="text" class="cep-entrega" placeholder="CEP" required value="${dados.cep || ''}">
                <span class="erro erro-cep-entrega"></span>
            </div>
            <div class="form-group">
                <p>Logradouro*</p>
                <input type="text" class="logradouro-entrega" placeholder="Rua/Avenida" required value="${dados.logradouro || ''}">
                <span class="erro erro-logradouro-entrega"></span>
            </div>
            <div class="form-row">
                <div class="form-group half-width">
                    <p>Número*</p>
                    <input type="text" class="numero-entrega" placeholder="Número" required value="${dados.numero || ''}">
                    <span class="erro erro-numero-entrega"></span>
                </div>
                <div class="form-group half-width">
                    <p>Complemento</p>
                    <input type="text" class="complemento-entrega" placeholder="Complemento" value="${dados.complemento || ''}">
                </div>
            </div>
            <div class="form-group">
                <p>Bairro*</p>
                <input type="text" class="bairro-entrega" placeholder="Bairro" required value="${dados.bairro || ''}">
                <span class="erro erro-bairro-entrega"></span>
            </div>
            <div class="form-row">
                <div class="form-group half-width">
                    <p>Cidade*</p>
                    <input type="text" class="cidade-entrega" placeholder="Cidade" required value="${dados.cidade || ''}">
                    <span class="erro erro-cidade-entrega"></span>
                </div>
                <div class="form-group half-width">
                    <p>UF*</p>
                    <input type="text" class="uf-entrega" placeholder="UF" required maxlength="2" value="${dados.uf || ''}">
                    <span class="erro erro-uf-entrega"></span>
                </div>
            </div>
            <button type="button" class="btn-remover-endereco">Remover Endereço</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', template);
    
    const novoEndereco = container.querySelector(`[data-id="${id}"]`);
    aplicarMascaraCEP(novoEndereco.querySelector('.cep-entrega'));
    
    configurarAutoPreenchimentoCEP(novoEndereco.querySelector('.cep-entrega'), (endereco) => {
        novoEndereco.querySelector('.logradouro-entrega').value = endereco.logradouro || '';
        novoEndereco.querySelector('.bairro-entrega').value = endereco.bairro || '';
        novoEndereco.querySelector('.cidade-entrega').value = endereco.localidade || '';
        novoEndereco.querySelector('.uf-entrega').value = endereco.uf || '';
        novoEndereco.querySelector('.numero-entrega').focus();
    });
    
    novoEndereco.querySelector('.btn-remover-endereco').addEventListener('click', function() {
        if (document.querySelectorAll('.endereco-entrega').length > 1) {
            novoEndereco.remove();
        } else {
            alert('Pelo menos um endereço de entrega é obrigatório.');
        }
    });
}

// Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validação de data de nascimento (mínimo 12 anos)
function validarNascimento(data) {
    const nascimento = new Date(data);
    const hoje = new Date();
    const idadeMinima = new Date(hoje.getFullYear() - 12, hoje.getMonth(), hoje.getDate());
    return nascimento <= idadeMinima;
}

// Máscaras para campos
function aplicarMascaraCPF(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.replace(/^(\d{3})/, '$1.');
        if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
        if (value.length > 11) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
        e.target.value = value.substring(0, 14);
    });
}

function aplicarMascaraCEP(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.replace(/^(\d{5})/, '$1-');
        e.target.value = value.substring(0, 9);
    });
}

// Consulta ViaCEP
async function configurarAutoPreenchimentoCEP(inputCep, callback) {
    if (!inputCep) return;
    
    inputCep.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const endereco = await response.json();
            if (!endereco.erro && callback) callback(endereco);
        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
        }
    });
}