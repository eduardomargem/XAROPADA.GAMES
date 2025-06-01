// Função para verificar se o usuário está logado como cliente
function getUsuarioLogado() {
    try {
        const usuarioRaw = localStorage.getItem('usuarioLogado');
        if (!usuarioRaw) {
            console.log('Nenhum usuário logado encontrado');
            return null;
        }

        const usuario = JSON.parse(usuarioRaw);
        
        // Padroniza a estrutura do objeto usuário
        const usuarioPadronizado = {
            tipo: usuario.tipo,
            // Mantém compatibilidade com ambas estruturas
            id: usuario.cliente?.id || usuario.id,
            nome: usuario.cliente?.nomeCompleto || usuario.nome,
            email: usuario.cliente?.email || usuario.email
        };

        if (!usuarioPadronizado.tipo || !usuarioPadronizado.id) {
            console.log('Estrutura do usuário inválida');
            return null;
        }

        if (usuarioPadronizado.tipo !== 'cliente') {
            console.log('Usuário não é um cliente');
            return null;
        }

        return usuarioPadronizado;
    } catch (e) {
        console.error('Erro ao verificar usuário:', e);
        return null;
    }
}

// Função principal que é executada quando a página carrega
document.addEventListener("DOMContentLoaded", async function() {
    const usuario = getUsuarioLogado();
    
    if (!usuario) {
        console.log('Redirecionando para login...');
        window.location.href = '/login';  // Redireciona para página de login
        return;
    }

    console.log('Usuário logado:', usuario);
    
    try {
        // Carrega os dados do cliente
        await carregarDadosCliente(usuario.id);
        
        // Configura eventos dos campos
        configurarMascaras();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        mostrarNotificacao('Erro ao carregar dados', 'erro');
    }
});

function configurarMascaras() {
    // Configura máscara e busca automática do CEP
    const cepInput = document.getElementById('modalCep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value;
            
            if (value.length === 9) {
                buscarEnderecoPorCEP(value);
            }
        });
    }
    
    // Configura máscaras para os campos do cartão
    const numeroCartaoInput = document.getElementById('modalNumeroCartao');
    if (numeroCartaoInput) {
        numeroCartaoInput.addEventListener('input', mascaraCartaoCredito);
    }
    
    const validadeCartaoInput = document.getElementById('modalValidadeCartao');
    if (validadeCartaoInput) {
        validadeCartaoInput.addEventListener('input', mascaraValidadeCartao);
    }
    
    const cvvCartaoInput = document.getElementById('modalCvvCartao');
    if (cvvCartaoInput) {
        cvvCartaoInput.addEventListener('input', mascaraCVV);
    }
}

function mascaraCartaoCredito(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value.trim().substring(0, 19);
}

function mascaraValidadeCartao(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 6);
    }
    e.target.value = value.substring(0, 7);
}

function mascaraCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
}

// Função para carregar dados do cliente
async function carregarDadosCliente(clienteId) {
    try {
        const response = await fetch(`/api/clientes/${clienteId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do cliente');
        }
        
        const cliente = await response.json();
        
        // Preenche os campos do formulário
        document.getElementById('editNome').value = cliente.nomeCompleto || '';
        document.getElementById('editNascimento').value = cliente.dataNascimento || '';
        document.getElementById('editGenero').value = cliente.genero || '';
        document.getElementById('editEmail').value = cliente.email || '';
        
        // Exibe os endereços cadastrados (filtra apenas os de entrega)
        const enderecosEntrega = cliente.enderecos?.filter(e => e.tipo === 'ENTREGA') || [];
        exibirEnderecos(enderecosEntrega);
        
        // Exibe as formas de pagamento (será implementado posteriormente)
        exibirPagamentos([]);
        
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao carregar dados do cliente', 'erro');
    }
}

// Função para atualizar dados do cliente
async function atualizarDados() {
    const nome = document.getElementById('editNome').value;
    const nascimento = document.getElementById('editNascimento').value;
    const genero = document.getElementById('editGenero').value;
    
    if (!nome || !nascimento || !genero) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios!', 'erro');
        return;
    }
    
    try {
        const usuarioLogado = getUsuarioLogado();
        if (!usuarioLogado) return;
        
        const response = await fetch(`/api/clientes/${usuarioLogado.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nomeCompleto: nome,
                dataNascimento: nascimento,
                genero: genero
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar dados');
        }
        
        // Atualiza os dados no localStorage
        usuarioLogado.nome = nome;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        mostrarNotificacao("Dados pessoais atualizados com sucesso!");
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao atualizar dados', 'erro');
    }
}

// Função para alterar senha
async function alterarSenha() {
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarNovaSenha').value;
    
    // Limpa erros anteriores
    document.getElementById('erro-senha').textContent = '';
    document.getElementById('erro-confirmar-senha').textContent = '';
    
    // Validações
    let valido = true;
    
    if (novaSenha.length < 6) {
        document.getElementById('erro-senha').textContent = 'A senha deve ter no mínimo 6 caracteres!';
        valido = false;
    }
    
    if (confirmarSenha.length < 6) {
        document.getElementById('erro-confirmar-senha').textContent = 'Confirme sua senha!';
        valido = false;
    }
    
    if (novaSenha !== confirmarSenha) {
        document.getElementById('erro-confirmar-senha').textContent = 'As senhas não coincidem!';
        valido = false;
    }
    
    if (!valido) {
        return;
    }
    
    if (!confirm("Tem certeza que deseja alterar sua senha?")) {
        return;
    }
    
    try {
        const usuarioLogado = getUsuarioLogado();
        if (!usuarioLogado) return;
        
        const response = await fetch(`/api/clientes/${usuarioLogado.id}/senha`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                senha: novaSenha
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao alterar senha');
        }
        
        mostrarNotificacao("Senha atualizada com sucesso!");
        document.getElementById('novaSenha').value = '';
        document.getElementById('confirmarNovaSenha').value = '';
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao alterar senha', 'erro');
    }
}

// Função para exibir endereços
function exibirEnderecos(enderecos) {
    const listaEnderecos = document.getElementById('listaEnderecos');
    if (!listaEnderecos) return;
    
    listaEnderecos.innerHTML = "";
    
    if (enderecos.length === 0) {
        listaEnderecos.innerHTML = '<p class="no-address">Nenhum endereço de entrega cadastrado ainda.</p>';
        return;
    }
    
    enderecos.forEach((endereco) => {
        const enderecoElement = document.createElement('div');
        enderecoElement.className = 'endereco-item';
        enderecoElement.innerHTML = `
            <div class="address-info">
                <p><strong>${endereco.logradouro}, ${endereco.numero}</strong>${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
                <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
                <p>CEP: ${endereco.cep}</p>
            </div>
            <div class="action-buttons">
                <button class="btn-edit" onclick="editarEndereco(${endereco.id})">
                    <i class="fas fa-edit"></i> EDITAR
                </button>
                <button class="btn-delete" onclick="removerEndereco(${endereco.id})">
                    <i class="fas fa-trash"></i> REMOVER
                </button>
            </div>
        `;
        listaEnderecos.appendChild(enderecoElement);
    });
}

// Função para adicionar novo endereço
async function salvarEndereco() {
    const cep = document.getElementById('modalCep').value;
    const logradouro = document.getElementById('modalLogradouro').value;
    const numero = document.getElementById('modalNumero').value;
    const complemento = document.getElementById('modalComplemento').value;
    const bairro = document.getElementById('modalBairro').value;
    const cidade = document.getElementById('modalCidade').value;
    const uf = document.getElementById('modalUf').value;
    
    if (!cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios!', 'erro');
        return;
    }
    
    try {
        const usuarioLogado = getUsuarioLogado();
        if (!usuarioLogado) return;
        
        const response = await fetch(`/api/clientes/${usuarioLogado.id}/enderecos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                tipo: 'ENTREGA',
                cep: cep.replace(/\D/g, ''),
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                uf: uf.toUpperCase()
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar endereço');
        }
        
        await carregarDadosCliente(usuarioLogado.id);
        fecharModalEndereco();
        mostrarNotificacao('Endereço cadastrado com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao salvar endereço', 'erro');
    }
}

// Função para remover endereço
async function removerEndereco(enderecoId) {
    if (!confirm("Tem certeza que deseja remover este endereço?")) {
        return;
    }
    
    try {
        const usuarioLogado = getUsuarioLogado();
        if (!usuarioLogado) return;
        
        const response = await fetch(`/api/clientes/${usuarioLogado.id}/enderecos/${enderecoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao remover endereço');
        }
        
        await carregarDadosCliente(usuarioLogado.id);
        mostrarNotificacao("Endereço removido com sucesso!");
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao remover endereço', 'erro');
    }
}

// Função para buscar endereço via API ViaCEP
async function buscarEnderecoPorCEP(cep) {
    const cepNumerico = cep.replace(/\D/g, '');
    const loadingElement = document.createElement('div');
    loadingElement.textContent = 'Buscando endereço...';
    loadingElement.style.color = '#00ff00';
    loadingElement.style.margin = '5px 0';
    
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
            mostrarNotificacao('CEP não encontrado. Por favor, verifique o número digitado.', 'erro');
            return;
        }
        
        document.getElementById('modalLogradouro').value = data.logradouro || '';
        document.getElementById('modalBairro').value = data.bairro || '';
        document.getElementById('modalCidade').value = data.localidade || '';
        document.getElementById('modalUf').value = data.uf || '';
        document.getElementById('modalNumero').focus();
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        loadingElement.textContent = 'Erro ao consultar CEP. Tente novamente.';
        setTimeout(() => loadingElement.remove(), 3000);
    }
}

// Funções para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${tipo === 'erro' ? 'exclamation-circle' : tipo === 'info' ? 'info-circle' : 'check-circle'}"></i>
        ${mensagem}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Funções de modal
function abrirModalEndereco() {
    document.getElementById('addressModal').style.display = 'block';
    document.getElementById('addressForm').reset();
}

function fecharModalEndereco() {
    document.getElementById('addressModal').style.display = 'none';
}

function abrirModalPagamento() {
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('paymentForm').reset();
    document.getElementById('cartaoFields').style.display = 'none';
}

function fecharModalPagamento() {
    document.getElementById('paymentModal').style.display = 'none';
}

function mostrarCamposCartao() {
    const tipoPagamento = document.getElementById('modalTipoPagamento').value;
    const cartaoFields = document.getElementById('cartaoFields');
    
    if (tipoPagamento === 'credito') {
        cartaoFields.style.display = 'block';
    } else {
        cartaoFields.style.display = 'none';
    }
}

// Função para logout
function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem('usuarioLogado');
        window.location.href = "/";
    }
}

// Função para exibir pagamentos (placeholder)
function exibirPagamentos(pagamentos) {
    const listaPagamentos = document.getElementById('listaPagamentos');
    if (!listaPagamentos) return;
    
    listaPagamentos.innerHTML = "";
    
    if (pagamentos.length === 0) {
        listaPagamentos.innerHTML = `
            <p class="no-payment">Nenhuma forma de pagamento cadastrada ainda.</p>
            <button onclick="abrirModalPagamento()" class="btn-add-payment">
                <i class="fas fa-plus-circle"></i> ADICIONAR FORMA DE PAGAMENTO
            </button>
        `;
    }
}