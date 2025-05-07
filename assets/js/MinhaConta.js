document.addEventListener("DOMContentLoaded", function() {
    // Verifica se o usuário está logado
    if (!localStorage.getItem('usuarioLogado')) {
        window.location.href = "index.html";
        return;
    }
    
    // Carrega dados do usuário
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
    const cliente = clientes.find(c => c.email === usuario.email);
    
    // Preenche TODOS os campos do formulário com dados completos do cadastro
    document.getElementById('editNome').value = cliente.dadosCompletos?.nome || cliente.nome || '';
    document.getElementById('editNascimento').value = cliente.dadosCompletos?.nascimento || '';
    document.getElementById('editGenero').value = cliente.dadosCompletos?.genero || '';
    document.getElementById('editEmail').value = cliente.email;
    
    // Exibe os endereços cadastrados
    exibirEnderecos(cliente.dadosCompletos?.enderecosEntrega || cliente.enderecosEntrega || []);
    
    // Configura máscara e busca automática do CEP
    const cepInput = document.getElementById('modalCep');
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
        
        // Quando o CEP estiver completo (8 dígitos + traço), busca os dados
        if (value.length === 9) {
            buscarEnderecoPorCEP(value);
        }
    });
});

// Função para buscar endereço via API ViaCEP
async function buscarEnderecoPorCEP(cep) {
    // Remove traço e espaços do CEP
    const cepNumerico = cep.replace(/\D/g, '');
    const loadingElement = document.createElement('div');
    loadingElement.textContent = 'Buscando endereço...';
    loadingElement.style.color = '#00ff00';
    loadingElement.style.margin = '5px 0';
    
    // Insere mensagem de carregamento
    const cepGroup = document.querySelector('#modalCep').parentNode;
    cepGroup.appendChild(loadingElement);
    
    if (cepNumerico.length !== 8) {
        loadingElement.remove();
        return;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        
        loadingElement.remove();
        
        if (data.erro) {
            alert('CEP não encontrado. Por favor, verifique o número digitado.');
            return;
        }
        
        // Preenche os campos do formulário com os dados da API
        document.getElementById('modalLogradouro').value = data.logradouro || '';
        document.getElementById('modalBairro').value = data.bairro || '';
        document.getElementById('modalCidade').value = data.localidade || '';
        document.getElementById('modalUf').value = data.uf || '';
        
        // Foca no campo número (único que o usuário precisa preencher)
        document.getElementById('modalNumero').focus();
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        loadingElement.textContent = 'Erro ao consultar CEP. Tente novamente.';
        setTimeout(() => loadingElement.remove(), 3000);
    }
}

function abrirModalEndereco() {
    document.getElementById('addressModal').style.display = 'block';
    document.getElementById('addressForm').reset();
}

function fecharModalEndereco() {
    document.getElementById('addressModal').style.display = 'none';
}

function salvarEndereco() {
    const cep = document.getElementById('modalCep').value;
    const logradouro = document.getElementById('modalLogradouro').value;
    const numero = document.getElementById('modalNumero').value;
    const complemento = document.getElementById('modalComplemento').value;
    const bairro = document.getElementById('modalBairro').value;
    const cidade = document.getElementById('modalCidade').value;
    const uf = document.getElementById('modalUf').value;
    
    // Validação básica
    if (!cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    const novoEndereco = {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf: uf.toUpperCase(),
        padrao: false
    };
    
    // Inicializa o array de endereços se não existir
    if (!clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos = {};
    }
    
    if (!clientes[clienteIndex].dadosCompletos.enderecosEntrega) {
        clientes[clienteIndex].dadosCompletos.enderecosEntrega = [];
        novoEndereco.padrao = true;
    } else if (clientes[clienteIndex].dadosCompletos.enderecosEntrega.length === 0) {
        novoEndereco.padrao = true;
    }
    
    clientes[clienteIndex].dadosCompletos.enderecosEntrega.push(novoEndereco);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    
    exibirEnderecos(clientes[clienteIndex].dadosCompletos.enderecosEntrega);
    fecharModalEndereco();
    alert('Endereço cadastrado com sucesso!');
}

function atualizarDados() {
    const nome = document.getElementById('editNome').value;
    const nascimento = document.getElementById('editNascimento').value;
    const genero = document.getElementById('editGenero').value;
    
    // Validação básica
    if (!nome || !nascimento || !genero) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Atualiza os dados pessoais
    if (!clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos = {};
    }
    
    clientes[clienteIndex].dadosCompletos.nome = nome;
    clientes[clienteIndex].dadosCompletos.nascimento = nascimento;
    clientes[clienteIndex].dadosCompletos.genero = genero;
    
    // Mantém a compatibilidade com versões antigas
    clientes[clienteIndex].nome = nome;
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    alert("Dados pessoais atualizados com sucesso!");
}

async function alterarSenha() {
    const novaSenha = document.getElementById('novaSenha').value;
    
    if (novaSenha.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres!");
        return;
    }
    
    if (!confirm("Tem certeza que deseja alterar sua senha?")) {
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    clientes[clienteIndex].senha = await encriptarSenha(novaSenha);
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    alert("Senha atualizada com sucesso!");
    document.getElementById('novaSenha').value = '';
}

function exibirEnderecos(enderecos) {
    const listaEnderecos = document.getElementById('listaEnderecos');
    listaEnderecos.innerHTML = "";
    
    if (enderecos.length === 0) {
        listaEnderecos.innerHTML = '<p class="no-address">Nenhum endereço cadastrado ainda.</p>';
        return;
    }
    
    enderecos.forEach((endereco, index) => {
        const enderecoElement = document.createElement('div');
        enderecoElement.className = `endereco-item ${endereco.padrao ? 'padrao' : ''}`;
        enderecoElement.innerHTML = `
            <div class="address-info">
                <p><strong>${endereco.logradouro}, ${endereco.numero}</strong>${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
                <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
                <p>CEP: ${endereco.cep}</p>
            </div>
            <button class="btn-default" onclick="definirComoPadrao(${index})">
                ${endereco.padrao ? '✅ PADRÃO' : 'DEFINIR COMO PADRÃO'}
            </button>
        `;
        listaEnderecos.appendChild(enderecoElement);
    });
}

function definirComoPadrao(index) {
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Verifica se os endereços estão em dadosCompletos ou na raiz
    const enderecos = clientes[clienteIndex].dadosCompletos?.enderecosEntrega || clientes[clienteIndex].enderecosEntrega;
    
    enderecos.forEach((end, i) => {
        end.padrao = (i === index);
    });
    
    // Garante que os dados sejam salvos no local correto
    if (clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos.enderecosEntrega = enderecos;
    } else {
        clientes[clienteIndex].enderecosEntrega = enderecos;
    }
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirEnderecos(enderecos);
    alert("Endereço padrão atualizado com sucesso!");
}

function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem('usuarioLogado');
        window.location.href = "index.html";
    }
}

// Função auxiliar para encriptação
async function encriptarSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}