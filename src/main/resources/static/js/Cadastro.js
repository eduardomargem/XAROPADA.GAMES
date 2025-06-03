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

// Função para validar todos os campos do formulário
async function validarFormulario(formData) {
    const erros = {};

    if (!formData.nomeCompleto || !validarNome(formData.nomeCompleto)) {
        erros.nome = 'Nome completo deve ter pelo menos 2 palavras com 3+ letras cada';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        erros.email = 'E-mail inválido';
    }
    if (!formData.cpf || !validarCPF(formData.cpf)) { // CPF já é enviado sem máscara
        erros.cpf = 'CPF inválido';
    }
    if (!formData.dataNascimento || !validarNascimento(formData.dataNascimento)) {
        erros.nascimento = 'Data de nascimento inválida ou idade menor que 12 anos.';
    }
    if (!formData.genero) {
        erros.genero = 'Selecione um gênero';
    }
    if (!formData.senha || formData.senha.length < 6) {
        erros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    if (formData.senha !== formData.confirmarSenha) {
        erros.confirmarSenha = 'As senhas não coincidem';
    }

    // Validação dos endereços
    if (!formData.enderecos || formData.enderecos.length === 0) {
        erros.enderecosGeral = 'Pelo menos um endereço de faturamento é obrigatório.';
    } else {
        const faturamentoCount = formData.enderecos.filter(e => e.tipo === TIPO_ENDERECO.FATURAMENTO).length;
        if (faturamentoCount !== 1) {
            erros.faturamento = 'Deve haver exatamente um endereço de faturamento.';
        }
        const entregaCount = formData.enderecos.filter(e => e.tipo === TIPO_ENDERECO.ENTREGA).length;
        if (entregaCount === 0) {
             erros.entrega = 'Pelo menos um endereço de entrega é obrigatório (pode ser o mesmo do faturamento).';
        }

        for (let i = 0; i < formData.enderecos.length; i++) {
            const end = formData.enderecos[i];
            const prefixoErro = `${end.tipo.toLowerCase()}${i}-`; // Ex: faturamento0- ou entrega0-
            if (!end.cep || end.cep.length !== 8) erros[`${prefixoErro}cep`] = 'CEP inválido.';
            if (!end.logradouro) erros[`${prefixoErro}logradouro`] = 'Logradouro obrigatório.';
            if (!end.numero) erros[`${prefixoErro}numero`] = 'Número obrigatório.';
            if (!end.bairro) erros[`${prefixoErro}bairro`] = 'Bairro obrigatório.';
            if (!end.cidade) erros[`${prefixoErro}cidade`] = 'Cidade obrigatória.';
            if (!end.uf || end.uf.length !== 2) erros[`${prefixoErro}uf`] = 'UF inválida.';
        }
    }
    return erros;
}

function aplicarMascaraCPF(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.replace(/^(\d{3})/, '$1.');
        if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
        if (value.length > 11) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
        e.target.value = value.substring(0, 14);
    });
}

function aplicarMascaraCEP(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.replace(/^(\d{5})/, '$1-');
        e.target.value = value.substring(0, 9);
    });
}

function configurarAutoPreenchimentoCEP(inputElement, parentDiv) {
    inputElement.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        const enderecoData = await validarCEP(cep); // validarCEP já existe
        if (enderecoData) {
            parentDiv.querySelector('.logradouro-entrega, #logradouro').value = enderecoData.logradouro || '';
            parentDiv.querySelector('.bairro-entrega, #bairro').value = enderecoData.bairro || '';
            parentDiv.querySelector('.cidade-entrega, #cidade').value = enderecoData.localidade || '';
            parentDiv.querySelector('.uf-entrega, #uf').value = enderecoData.uf || '';
            const numeroInput = parentDiv.querySelector('.numero-entrega, #numero');
            if(numeroInput) numeroInput.focus();
        } else {
            mostrarNotificacaoGlobal('CEP não encontrado ou inválido.', 'erro');
        }
    });
}

function adicionarEnderecoEntrega(dados = null) {
    const container = document.getElementById('enderecos-entrega');
    const id = Date.now();
    
    const enderecoDiv = document.createElement('div');
    enderecoDiv.className = 'endereco-entrega';
    enderecoDiv.dataset.id = id; // Para facilitar a remoção
    
    enderecoDiv.innerHTML = `
        <h4>Endereço de Entrega Adicional</h4>
        <div class="form-group">
            <p>CEP*</p>
            <input type="text" class="cep-entrega" placeholder="CEP" required maxlength="9" value="${dados?.cep || ''}">
            <span class="erro erro-cep-entrega-${id}"></span>
        </div>
        <div class="form-group">
            <p>Logradouro*</p>
            <input type="text" class="logradouro-entrega" placeholder="Rua/Avenida" required value="${dados?.logradouro || ''}">
            <span class="erro erro-logradouro-entrega-${id}"></span>
        </div>
        <div class="form-row">
            <div class="form-group half-width">
                <p>Número*</p>
                <input type="text" class="numero-entrega" placeholder="Número" required value="${dados?.numero || ''}">
                <span class="erro erro-numero-entrega-${id}"></span>
            </div>
            <div class="form-group half-width">
                <p>Complemento</p>
                <input type="text" class="complemento-entrega" placeholder="Complemento" value="${dados?.complemento || ''}">
            </div>
        </div>
        <div class="form-group">
            <p>Bairro*</p>
            <input type="text" class="bairro-entrega" placeholder="Bairro" required value="${dados?.bairro || ''}">
            <span class="erro erro-bairro-entrega-${id}"></span>
        </div>
        <div class="form-row">
            <div class="form-group half-width">
                <p>Cidade*</p>
                <input type="text" class="cidade-entrega" placeholder="Cidade" required value="${dados?.cidade || ''}">
                <span class="erro erro-cidade-entrega-${id}"></span>
            </div>
            <div class="form-group half-width">
                <p>UF*</p>
                <input type="text" class="uf-entrega" placeholder="UF" required maxlength="2" value="${dados?.uf || ''}">
                <span class="erro erro-uf-entrega-${id}"></span>
            </div>
        </div>
        <button type="button" class="btn-remover-endereco" style="background-color: #ff6b6b; color:white; font-size:10px; padding:8px;">Remover Endereço</button>
        <hr style="border:1px dashed #00FF85; margin-top:15px;">
    `;
    
    const addButton = document.getElementById('adicionar-endereco');
    container.insertBefore(enderecoDiv, addButton);
    
    const novoCepInput = enderecoDiv.querySelector('.cep-entrega');
    aplicarMascaraCEP(novoCepInput);
    configurarAutoPreenchimentoCEP(novoCepInput, enderecoDiv);
    
    enderecoDiv.querySelector('.btn-remover-endereco').addEventListener('click', function() {
        const enderecosEntregaAtuais = document.querySelectorAll('.endereco-entrega');
        if (document.getElementById('mesmo-endereco').checked || enderecosEntregaAtuais.length > 1) {
            enderecoDiv.remove();
        } else {
            mostrarNotificacaoGlobal('Pelo menos um endereço de entrega é obrigatório se não for o mesmo do faturamento.', 'erro');
        }
    });
}

async function coletarDadosFormulario() {
    const dataNascimento = document.getElementById('nascimento').value;

    const formData = {
        nomeCompleto: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        dataNascimento: dataNascimento, // Formato YYYY-MM-DD
        genero: document.getElementById('genero').value,
        senha: document.getElementById('senha').value,
        confirmarSenha: document.getElementById('confirmarSenha').value,
        enderecos: []
    };

    formData.enderecos.push({
        tipo: TIPO_ENDERECO.FATURAMENTO,
        cep: document.getElementById('cep').value, // Mantém máscara para enviar ao backend
        logradouro: document.getElementById('logradouro').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        complemento: document.getElementById('complemento').value.trim() || null,
        bairro: document.getElementById('bairro').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        uf: document.getElementById('uf').value.trim().toUpperCase()
    });

    document.querySelectorAll('.endereco-entrega').forEach(enderecoEl => {
        formData.enderecos.push({
            tipo: TIPO_ENDERECO.ENTREGA,
            cep: enderecoEl.querySelector('.cep-entrega').value, // Mantém máscara
            logradouro: enderecoEl.querySelector('.logradouro-entrega').value.trim(),
            numero: enderecoEl.querySelector('.numero-entrega').value.trim(),
            complemento: enderecoEl.querySelector('.complemento-entrega').value.trim() || null,
            bairro: enderecoEl.querySelector('.bairro-entrega').value.trim(),
            cidade: enderecoEl.querySelector('.cidade-entrega').value.trim(),
            uf: enderecoEl.querySelector('.uf-entrega').value.trim().toUpperCase()
        });
    });
    return formData;
}

function exibirErros(erros) {
    document.querySelectorAll('.erro').forEach(el => el.textContent = '');
    
    if (erros.nome) document.getElementById('erro-nome').textContent = erros.nome;
    if (erros.email) document.getElementById('erro-email').textContent = erros.email;
    if (erros.cpf) document.getElementById('erro-cpf').textContent = erros.cpf;
    if (erros.nascimento) document.getElementById('erro-nascimento').textContent = erros.nascimento;
    if (erros.genero) document.getElementById('erro-genero').textContent = erros.genero;
    if (erros.senha) document.getElementById('erro-senha').textContent = erros.senha;
    if (erros.confirmarSenha) document.getElementById('erro-confirmarSenha').textContent = erros.confirmarSenha;

    // Erros de endereço podem ser mais complexos de mapear para o ID dinâmico.
    // Simplificando para mensagens gerais se houver erro em endereços:
    if (erros.faturamento) mostrarNotificacaoGlobal(erros.faturamento, 'erro');
    if (erros.entrega) mostrarNotificacaoGlobal(erros.entrega, 'erro');
    if (erros.enderecosGeral) mostrarNotificacaoGlobal(erros.enderecosGeral, 'erro');
    
    // Para erros específicos de campos de endereço, você precisaria iterar e encontrar os spans de erro corretos
    // Exemplo para CEP do primeiro endereço de entrega (se houver):
    document.querySelectorAll('.endereco-entrega').forEach((div, index) => {
        const id = div.dataset.id;
        if(erros[`entrega${index}-cep`]) div.querySelector(`.erro-cep-entrega-${id}`).textContent = erros[`entrega${index}-cep`];
        // ... e assim por diante para outros campos de endereço de entrega
    });
     if (erros.faturamento0 && erros.faturamento0.cep) { // Assumindo que faturamento é sempre o primeiro
        document.getElementById('erro-cep').textContent = erros.faturamento0.cep;
    }
}

async function salvarCliente() {
    const btnSalvar = document.querySelector('#registerForm button[type="submit"]');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'CADASTRANDO...';

    try {
        const formData = await coletarDadosFormulario();
        const erros = await validarFormulario(formData);

        if (Object.keys(erros).length > 0) {
            exibirErros(erros);
            mostrarNotificacaoGlobal('Corrija os erros no formulário.', 'erro');
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'CADASTRAR';
            return;
        }
        
        // Remove confirmarSenha antes de enviar para o backend
        const { confirmarSenha, ...payload } = formData;

        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Garante que o servidor saiba que esperamos JSON
            },
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Erro ao cadastrar cliente.');
        }

        const data = await response.json();
        console.log('Cadastro realizado:', data);
        mostrarNotificacaoGlobal('Cadastro realizado com sucesso! Fazendo login...', 'sucesso');
        await fazerLoginAutomatico(formData.email, formData.senha);
        
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        mostrarNotificacaoGlobal(`Erro ao cadastrar: ${error.message}`, 'erro');
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'CADASTRAR';
    }
}

async function fazerLoginAutomatico(email, senha) {
    try {
        const response = await fetch('/api/clientes/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Falha no login automático após cadastro.' }));
            throw new Error(errorData.message);
        }

        const data = await response.json();
        
        const usuarioLogado = {
            tipo: 'cliente',
            id: data.cliente.id,
            nome: data.cliente.nomeCompleto,
            email: data.cliente.email
        };
        
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        if (carrinho.length > 0) {
            mostrarNotificacaoGlobal('Login realizado! Continue sua compra.', 'sucesso');
            setTimeout(() => { window.location.href = '/Dados-Entrega'; }, 1500);
        } else {
            mostrarNotificacaoGlobal('Login realizado com sucesso!', 'sucesso');
            setTimeout(() => { window.location.href = '/'; }, 1500);
        }
        
    } catch (error) {
        console.error('Erro no login automático:', error);
        mostrarNotificacaoGlobal(`Erro no login: ${error.message}`, 'erro');
         setTimeout(() => { window.location.href = '/'; }, 2000);
    }
}

function inicializarFormulario() {
    aplicarMascaraCPF(document.getElementById('cpf'));
    aplicarMascaraCEP(document.getElementById('cep'));
    configurarAutoPreenchimentoCEP(document.getElementById('cep'), document.querySelector('.login-box')); // Passa o form como parent
    
    document.getElementById('mesmo-endereco').addEventListener('change', function() {
        const enderecosEntregaContainer = document.getElementById('enderecos-entrega');
        const btnAdicionarEndereco = document.getElementById('adicionar-endereco');

        // Limpa endereços de entrega existentes antes de adicionar/copiar
        document.querySelectorAll('.endereco-entrega').forEach(el => el.remove());

        if (this.checked) {
            const dadosFaturamento = {
                cep: document.getElementById('cep').value,
                logradouro: document.getElementById('logradouro').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                uf: document.getElementById('uf').value
            };
            adicionarEnderecoEntrega(dadosFaturamento); // Adiciona o endereço copiado
            btnAdicionarEndereco.style.display = 'none'; // Esconde o botão de adicionar mais
        } else {
            adicionarEnderecoEntrega(); // Adiciona um campo de endereço de entrega vazio
            btnAdicionarEndereco.style.display = 'block'; // Mostra o botão de adicionar mais
        }
    });
    
    document.getElementById('adicionar-endereco').addEventListener('click', function() {
        adicionarEnderecoEntrega();
    });
    
    // Adiciona um endereço de entrega inicial apenas se "mesmo endereço" não estiver marcado
    if (!document.getElementById('mesmo-endereco').checked) {
        adicionarEnderecoEntrega();
    } else {
         // Se "mesmo endereço" estiver marcado por padrão (se você decidir isso no HTML),
         // copie o endereço de faturamento aqui.
         // Mas a lógica atual dispara a cópia no 'change', então um campo vazio é ok se não marcado.
         document.getElementById('adicionar-endereco').style.display = 'none';
    }
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarCliente();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const loginBox = document.getElementById('loginBox');
    const pressKeyMessage = document.getElementById('press-key-message');
    let formInitialized = false;

    function showForm() {
        if (formInitialized) return;
        loginBox.style.display = 'block';
        pressKeyMessage.style.display = 'none';
        inicializarFormulario();
        formInitialized = true; 
    }
    
    document.addEventListener('keydown', showForm, { once: true });
    document.addEventListener('click', showForm, { once: true });
});

// Função de notificação global (reutilizável)
function mostrarNotificacaoGlobal(mensagem, tipo = 'sucesso') {
    const containerId = 'notification-container-global';
    let notificationContainer = document.getElementById(containerId);
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = containerId;
        Object.assign(notificationContainer.style, {
            position: 'fixed', top: '20px', right: '20px', zIndex: '20000', // Z-index alto
            display: 'flex', flexDirection: 'column', gap: '10px'
        });
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `<i class="fas fa-${tipo === 'erro' ? 'exclamation-circle' : tipo === 'info' ? 'info-circle' : 'check-circle'}"></i> ${mensagem}`;
    
    Object.assign(notification.style, {
        padding: '12px 18px', marginBottom: '10px', color: 'white', borderRadius: '4px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)', fontFamily: "'Press Start 2P', cursive",
        fontSize: '10px', opacity: '0', transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: 'translateX(100%)', minWidth: '280px', maxWidth: '380px',
        borderLeft: `5px solid ${tipo === 'sucesso' ? '#00cc66' : tipo === 'erro' ? '#ff5252' : '#3498db'}`
    });
    if (tipo === 'sucesso') notification.style.backgroundColor = 'rgba(0, 204, 102, 0.9)';
    else if (tipo === 'erro') notification.style.backgroundColor = 'rgba(255, 82, 82, 0.9)';
    else if (tipo === 'info') notification.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
    
    notificationContainer.appendChild(notification);

    // Animação de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 50); 
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(110%)'; // Para sair da tela
        setTimeout(() => notification.remove(), 300); // Tempo para animação de saída
    }, 4000); // Tempo que a notificação fica visível
}