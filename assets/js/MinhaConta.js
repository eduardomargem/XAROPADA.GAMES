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
    
    // Preenche os campos do formulário
    document.getElementById('editNome').value = cliente.dadosCompletos?.nome || cliente.nome || '';
    document.getElementById('editNascimento').value = cliente.dadosCompletos?.nascimento || '';
    document.getElementById('editGenero').value = cliente.dadosCompletos?.genero || '';
    document.getElementById('editEmail').value = cliente.email;
    
    // Exibe os endereços cadastrados
    exibirEnderecos(cliente.dadosCompletos?.enderecosEntrega || cliente.enderecosEntrega || []);
    
    // Exibe as formas de pagamento
    exibirPagamentos(cliente.dadosCompletos?.formasPagamento || []);
    
    // Configura máscara e busca automática do CEP
    const cepInput = document.getElementById('modalCep');
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
    
    // Configura máscaras para os campos do cartão
    document.getElementById('modalNumeroCartao').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value.trim().substring(0, 19);
    });
    
    document.getElementById('modalValidadeCartao').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 6);
        }
        e.target.value = value.substring(0, 7);
    });
    
    document.getElementById('modalCvvCartao').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });

    // Verifica se há compras recentes para mostrar notificação
    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    const comprasRecentes = historicoCompras.filter(
        compra => compra.usuarioEmail === usuario.email && 
                 compra.status === 'aguardando' &&
                 new Date(compra.data) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (comprasRecentes.length > 0) {
        setTimeout(() => {
            mostrarNotificacao(`Você tem ${comprasRecentes.length} pedido(s) aguardando aprovação!`, 'info');
        }, 1000);
    }
});

// Função para mostrar notificação
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
    
    if (!cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios!', 'erro');
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
    mostrarNotificacao('Endereço cadastrado com sucesso!');
}

function atualizarDados() {
    const nome = document.getElementById('editNome').value;
    const nascimento = document.getElementById('editNascimento').value;
    const genero = document.getElementById('editGenero').value;
    
    if (!nome || !nascimento || !genero) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios!', 'erro');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    if (!clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos = {};
    }
    
    clientes[clienteIndex].dadosCompletos.nome = nome;
    clientes[clienteIndex].dadosCompletos.nascimento = nascimento;
    clientes[clienteIndex].dadosCompletos.genero = genero;
    clientes[clienteIndex].nome = nome;
    
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    usuarioLogado.nome = nome;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    mostrarNotificacao("Dados pessoais atualizados com sucesso!");
}

async function alterarSenha() {
    const novaSenha = document.getElementById('novaSenha').value;
    
    if (novaSenha.length < 6) {
        mostrarNotificacao("A senha deve ter no mínimo 6 caracteres!", 'erro');
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
    mostrarNotificacao("Senha atualizada com sucesso!");
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
            <div class="action-buttons">
                <button class="btn-default" onclick="definirComoPadrao(${index})">
                    ${endereco.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                </button>
            </div>
        `;
        listaEnderecos.appendChild(enderecoElement);
    });
}

function removerEndereco(index) {
    if (!confirm("Tem certeza que deseja remover este endereço?")) {
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    clientes[clienteIndex].dadosCompletos.enderecosEntrega.splice(index, 1);
    
    if (clientes[clienteIndex].dadosCompletos.enderecosEntrega.length === 0) {
        clientes[clienteIndex].dadosCompletos.enderecosEntrega = [];
    }
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirEnderecos(clientes[clienteIndex].dadosCompletos.enderecosEntrega);
    mostrarNotificacao("Endereço removido com sucesso!");
}

function definirComoPadrao(index) {
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    const enderecos = clientes[clienteIndex].dadosCompletos?.enderecosEntrega;
    
    enderecos.forEach((end, i) => {
        end.padrao = (i === index);
    });
    
    clientes[clienteIndex].dadosCompletos.enderecosEntrega = enderecos;
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirEnderecos(enderecos);
    mostrarNotificacao("Endereço padrão atualizado com sucesso!");
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

function salvarPagamento() {
    const tipoPagamento = document.getElementById('modalTipoPagamento').value;
    
    if (!tipoPagamento) {
        mostrarNotificacao('Por favor, selecione um tipo de pagamento!', 'erro');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    let novoPagamento;
    
    if (tipoPagamento === 'boleto') {
        novoPagamento = {
            tipo: 'boleto',
            padrao: false
        };
    } else if (tipoPagamento === 'credito') {
        const nomeCartao = document.getElementById('modalNomeCartao').value;
        const numeroCartao = document.getElementById('modalNumeroCartao').value;
        const validadeCartao = document.getElementById('modalValidadeCartao').value;
        const cvvCartao = document.getElementById('modalCvvCartao').value;
        const parcelas = document.getElementById('modalParcelas').value;
        
        if (!nomeCartao || !numeroCartao || !validadeCartao || !cvvCartao) {
            mostrarNotificacao('Por favor, preencha todos os campos do cartão!', 'erro');
            return;
        }
        
        if (!validarNumeroCartao(numeroCartao)) {
            mostrarNotificacao('Número do cartão inválido!', 'erro');
            return;
        }
        
        if (!validarValidade(validadeCartao)) {
            mostrarNotificacao('Data de validade inválida! Use o formato MM/AAAA', 'erro');
            return;
        }
        
        if (!validarCVV(cvvCartao)) {
            mostrarNotificacao('CVV inválido! Deve ter 3 ou 4 dígitos', 'erro');
            return;
        }
        
        novoPagamento = {
            tipo: 'credito',
            nomeCartao,
            numeroCartao: numeroCartao.replace(/\s/g, ''),
            ultimosDigitos: numeroCartao.slice(-4),
            validadeCartao,
            cvvCartao,
            parcelas,
            padrao: false
        };
    }
    
    if (!clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos = {};
    }
    
    if (!clientes[clienteIndex].dadosCompletos.formasPagamento) {
        clientes[clienteIndex].dadosCompletos.formasPagamento = [];
        novoPagamento.padrao = true;
    } else if (clientes[clienteIndex].dadosCompletos.formasPagamento.length === 0) {
        novoPagamento.padrao = true;
    }
    
    clientes[clienteIndex].dadosCompletos.formasPagamento.push(novoPagamento);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    
    exibirPagamentos(clientes[clienteIndex].dadosCompletos.formasPagamento);
    fecharModalPagamento();
    mostrarNotificacao('Forma de pagamento cadastrada com sucesso!');
}

function exibirPagamentos(pagamentos) {
    const listaPagamentos = document.getElementById('listaPagamentos');
    listaPagamentos.innerHTML = "";
    
    if (!pagamentos || pagamentos.length === 0) {
        listaPagamentos.innerHTML = '<p class="no-payment">Nenhuma forma de pagamento cadastrada ainda.</p>';
        return;
    }
    
    pagamentos.forEach((pagamento, index) => {
        const pagamentoElement = document.createElement('div');
        pagamentoElement.className = `payment-item ${pagamento.padrao ? 'padrao' : ''}`;
        
        if (pagamento.tipo === 'boleto') {
            pagamentoElement.innerHTML = `
                <div class="payment-info">
                    <p><strong>Boleto Bancário</strong></p>
                </div>
                <div class="action-buttons">
                    <button class="btn-default" onclick="definirComoPadraoPagamento(${index})">
                        ${pagamento.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                    </button>
                </div>
            `;
        } else if (pagamento.tipo === 'credito') {
            pagamentoElement.innerHTML = `
                <div class="payment-info">
                    <p><strong>Cartão de Crédito</strong></p>
                    <p>${pagamento.nomeCartao}</p>
                    <p>**** **** **** ${pagamento.ultimosDigitos}</p>
                    <p>Validade: ${pagamento.validadeCartao} | Parcelas: ${pagamento.parcelas}x</p>
                </div>
                <div class="action-buttons">
                    <button class="btn-default" onclick="definirComoPadraoPagamento(${index})">
                        ${pagamento.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                    </button>
                </div>
            `;
        }
        
        listaPagamentos.appendChild(pagamentoElement);
    });
}

function removerPagamento(index) {
    if (!confirm("Tem certeza que deseja remover esta forma de pagamento?")) {
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    clientes[clienteIndex].dadosCompletos.formasPagamento.splice(index, 1);
    
    if (clientes[clienteIndex].dadosCompletos.formasPagamento.length === 0) {
        clientes[clienteIndex].dadosCompletos.formasPagamento = [];
    }
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirPagamentos(clientes[clienteIndex].dadosCompletos.formasPagamento);
    mostrarNotificacao("Forma de pagamento removida com sucesso!");
}

function definirComoPadraoPagamento(index) {
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    const pagamentos = clientes[clienteIndex].dadosCompletos?.formasPagamento;
    
    pagamentos.forEach((pag, i) => {
        pag.padrao = (i === index);
    });
    
    clientes[clienteIndex].dadosCompletos.formasPagamento = pagamentos;
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirPagamentos(pagamentos);
    mostrarNotificacao("Forma de pagamento padrão atualizada com sucesso!");
}

// Funções para o histórico de compras
function abrirModalHistorico() {
    document.getElementById('historicoModal').style.display = 'block';
    carregarHistoricoCompras();
}

function fecharModalHistorico() {
    document.getElementById('historicoModal').style.display = 'none';
}

function carregarHistoricoCompras() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) return;

    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    const usuarioCompras = historicoCompras.filter(compra => compra.usuarioEmail === usuario.email);
    
    const container = document.getElementById('historicoCompras');
    container.innerHTML = '';

    if (usuarioCompras.length === 0) {
        container.innerHTML = '<p class="no-history">Nenhuma compra realizada ainda.</p>';
        return;
    }

    // Ordena por data (mais recente primeiro)
    usuarioCompras.sort((a, b) => new Date(b.data) - new Date(a.data));

    usuarioCompras.forEach((compra) => {
        const compraElement = document.createElement('div');
        compraElement.className = 'compra-item';
        
        // Determina o status e progresso
        let statusClass, statusText, progressWidth;
        switch(compra.status) {
            case 'aprovado':
                statusClass = 'status-aprovado';
                statusText = 'APROVADO';
                progressWidth = '50%';
                break;
            case 'enviado':
                statusClass = 'status-enviado';
                statusText = 'ENVIADO';
                progressWidth = '75%';
                break;
            case 'entregue':
                statusClass = 'status-entregue';
                statusText = 'ENTREGUE';
                progressWidth = '100%';
                break;
            default:
                statusClass = 'status-aguardando';
                statusText = 'AGUARDANDO APROVAÇÃO';
                progressWidth = '25%';
        }
        
        // Formata a data
        const dataCompra = new Date(compra.data);
        const dataFormatada = dataCompra.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Cria o HTML do item de compra
        compraElement.innerHTML = `
            <div class="compra-header">
                <span class="compra-id">Pedido #${compra.id}</span>
                <span class="compra-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="compra-produtos">
                ${compra.produtos.map(produto => `
                    <div class="produto-item">
                        <img src="${produto.imagem}" 
                             class="produto-img"
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Produto'">
                        <div class="produto-info">
                            <div class="produto-nome">${produto.nome}</div>
                            <div class="produto-qtd">${produto.quantidade}x R$ ${produto.preco.toFixed(2)}</div>
                        </div>
                        <div>R$ ${(produto.preco * produto.quantidade).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="compra-total">
                Total: R$ ${compra.total.toFixed(2)}
            </div>
            
            <div class="compra-data">
                Realizado em: ${dataFormatada}
            </div>
            
            <div class="status-timeline">
                <div class="status-line">
                    <div class="status-line-progress" style="width: ${progressWidth}"></div>
                </div>
                
                <div class="status-step">
                    <div class="status-bubble ${compra.status ? 'active' : ''}"></div>
                    <div class="status-label">Pedido Realizado</div>
                </div>
                
                <div class="status-step">
                    <div class="status-bubble ${['aprovado', 'enviado', 'entregue'].includes(compra.status) ? 'active' : ''}"></div>
                    <div class="status-label">Aprovado</div>
                </div>
                
                <div class="status-step">
                    <div class="status-bubble ${['enviado', 'entregue'].includes(compra.status) ? 'active' : ''}"></div>
                    <div class="status-label">Enviado</div>
                </div>
                
                <div class="status-step">
                    <div class="status-bubble ${compra.status === 'entregue' ? 'active' : ''}"></div>
                    <div class="status-label">Entregue</div>
                </div>
            </div>
        `;
        
        container.appendChild(compraElement);
    });
}

// Funções de validação
function validarNumeroCartao(numero) {
    const numeroLimpo = numero.replace(/\s/g, '');
    return /^\d{16}$/.test(numeroLimpo);
}

function validarValidade(validade) {
    if (!/^\d{2}\/\d{4}$/.test(validade)) return false;
    
    const [mes, ano] = validade.split('/').map(Number);
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;
    
    if (ano < anoAtual) return false;
    if (ano === anoAtual && mes < mesAtual) return false;
    if (mes < 1 || mes > 12) return false;
    
    return true;
}

function validarCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
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



document.addEventListener("DOMContentLoaded", function() {
    const userSection = document.getElementById('userSection');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    function atualizarHeaderUsuario() {
        if (usuarioLogado) {
            userSection.innerHTML = `
                <div class="user-info">
                    <i class="fas fa-user"></i>
                    <span>Olá, ${usuarioLogado.nome}!</span>
                    <span class="logout-side" id="logoutBtn">Sair</span>
                </div>
            `;
            
            // Adiciona o evento de logout com delay de 300ms
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                setTimeout(function() {
                    localStorage.removeItem('usuarioLogado');
                    location.reload();
                }, 300);
            });
        } else {
            userSection.innerHTML = `
                <div class="login-option">
                    <div><i class="fas fa-user"></i> <span>ENTRE OU</span></div>
                    <div>CADASTRE-SE</div>
                </div>
            `;
            
            userSection.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
    }

    // Inicializa o header
    atualizarHeaderUsuario();

    // Verificação ao finalizar compra
    const checkoutBtn = document.getElementById('checkoutBtn');
    const verificationModal = document.getElementById('verificationModal');
    const goToProfileBtn = document.getElementById('goToProfileBtn');
    const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
    const verificationMessage = document.getElementById('verificationMessage');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (!usuarioLogado) {
                e.preventDefault();
                alert('Por favor, faça login para finalizar sua compra!');
                window.location.href = 'index.html';
                return;
            }

            // Verifica se há itens no carrinho
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            if (carrinho.length === 0) {
                mostrarNotificacao('Seu carrinho está vazio!', 'erro');
                return;
            }

            // Verifica se o frete foi calculado
            const freteSelecionado = parseFloat(localStorage.getItem('frete')) || 0;
            if (freteSelecionado === 0) {
                mostrarNotificacao('Por favor, calcule e selecione uma opção de frete.', 'erro');
                return;
            }

            // Verifica dados do usuário
            const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
            const cliente = clientes.find(c => c.email === usuarioLogado.email);
            
            let mensagem = '';
            let precisaVerificacao = false;

            // Verifica endereço
            const enderecos = cliente?.dadosCompletos?.enderecosEntrega || cliente?.enderecosEntrega || [];
            const enderecoPadrao = enderecos.find(e => e.padrao);
            
            if (enderecos.length === 0) {
                mensagem += 'Você precisa cadastrar pelo menos um endereço de entrega.<br>';
                precisaVerificacao = true;
            } else if (!enderecoPadrao) {
                mensagem += 'Você precisa definir um endereço padrão para entrega.<br>';
                precisaVerificacao = true;
            }

            // Verifica formas de pagamento
            const formasPagamento = cliente?.dadosCompletos?.formasPagamento || [];
            const pagamentoPadrao = formasPagamento.find(p => p.padrao);
            
            if (formasPagamento.length === 0) {
                mensagem += 'Você precisa cadastrar pelo menos uma forma de pagamento.<br>';
                precisaVerificacao = true;
            } else if (!pagamentoPadrao) {
                mensagem += 'Você precisa definir uma forma de pagamento padrão.<br>';
                precisaVerificacao = true;
            }

            if (precisaVerificacao) {
                verificationMessage.innerHTML = mensagem;
                verificationModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                // Tudo ok, pode finalizar a compra
                finalizarCompra();
            }
        });
    }

    // Configura botões do modal de verificação
    if (goToProfileBtn) {
        goToProfileBtn.addEventListener('click', function() {
            window.location.href = 'DadosEntrega.html';
        });
    }

    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', function() {
            verificationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Fecha modal ao clicar fora
    verificationModal.addEventListener('click', function(e) {
        if (e.target === verificationModal) {
            verificationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});