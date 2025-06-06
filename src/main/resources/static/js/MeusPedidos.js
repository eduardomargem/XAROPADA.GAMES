const API_URL = 'http://localhost:8080/api/pedidos'; // URL base da API

document.addEventListener("DOMContentLoaded", function() {
    // Verifica se o usuário está logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        window.location.href = '/index';
        return;
    }
    
    // Carrega os pedidos na página
    carregarPedidos();
    
    // Configura o botão de logout se existir
    document.getElementById('btnLogout')?.addEventListener('click', logout);
});

// Função principal para carregar pedidos
async function carregarPedidos() {
    const container = document.getElementById('historicoCompras');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando pedidos...</div>';

    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        console.log('Usuário logado:', usuario); // Debug
        
        if (!usuario) {
            console.error('Nenhum usuário logado encontrado');
            window.location.href = '/index';
            return;
        }

        console.log(`Fazendo requisição para: ${API_URL}/cliente/${usuario.id}`); // Debug
        const response = await fetch(`${API_URL}/cliente/${usuario.id}`);
        
        console.log('Resposta recebida:', response); // Debug
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', response.status, errorText);
            throw new Error(`Erro: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Resposta bruta:', responseText); // Debug
        
        let pedidos;
        try {
            pedidos = JSON.parse(responseText);
            console.log('Pedidos parseados:', pedidos); // Debug
            
            if (!Array.isArray(pedidos)) {
                console.error('Estrutura de dados inválida:', typeof pedidos);
                throw new Error('Estrutura de dados inválida: esperado array');
            }
            
            if (pedidos.length > 0 && !pedidos[0].hasOwnProperty('id')) {
                console.error('Estrutura de pedido inválida:', pedidos[0]);
                throw new Error('Estrutura de pedido inválida');
            }
            
        } catch (e) {
            console.error('Erro ao parsear JSON:', e, 'Texto:', responseText);
            throw new Error('Dados recebidos são inválidos');
        }

        localStorage.setItem('pedidosCliente', JSON.stringify(pedidos));
        console.log('Pedidos salvos no localStorage:', pedidos); // Debug
        
        if (pedidos.length === 0) {
            console.log('Nenhum pedido encontrado para o cliente');
            container.innerHTML = '<div class="no-orders"><i class="fas fa-box-open"></i><p>Nenhum pedido realizado ainda.</p></div>';
            return;
        }

        const pedidosOrdenados = pedidos.sort((a, b) => 
            new Date(b.dataPedido) - new Date(a.dataPedido));
        
        console.log('Pedidos ordenados:', pedidosOrdenados); // Debug
        exibirPedidos(pedidosOrdenados, container);
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        
        const pedidosCache = JSON.parse(localStorage.getItem('pedidosCliente') || '[]');
        console.log('Tentando usar cache:', pedidosCache); // Debug
        
        if (pedidosCache.length > 0) {
            exibirPedidos(pedidosCache, container);
            mostrarNotificacao('Dados podem estar desatualizados', 'info');
        } else {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${error.message || 'Erro ao carregar pedidos'}</p>
                    <button onclick="carregarPedidos()" class="btn-retry">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}


// Função para exibir pedidos (sem imagens dos produtos)
function exibirPedidos(pedidos, container) {
    container.innerHTML = '';

    pedidos.forEach((pedido) => {
        const pedidoElement = document.createElement('div');
        pedidoElement.className = 'pedido-item';
        
        // Determina o status
        const statusInfo = getStatusInfo(pedido.status);
        
        // Formata a data
        const dataPedido = new Date(pedido.dataPedido);
        const dataFormatada = dataPedido.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // HTML dos produtos (sem imagem)
        const produtosHTML = pedido.itens.map(item => {
            const produto = item.produto || {};
            return `
                <div class="produto-item">
                    <div class="produto-info">
                        <div class="produto-nome">${produto.nome || 'Produto não disponível'}</div>
                        <div class="produto-qtd">${item.quantidade}x R$ ${item.precoUnitario.toFixed(2)}</div>
                    </div>
                    <div class="produto-subtotal">R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</div>
                </div>
            `;
        }).join('');
        
        // HTML do endereço de entrega
        const enderecoEntrega = pedido.enderecoEntrega || {};
        const enderecoHTML = `
            <p><strong>${enderecoEntrega.tipo === 'ENTREGA' ? 'Endereço de Entrega' : 'Endereço de Faturamento'}</strong></p>
            ${enderecoEntrega.logradouro ? `<p>${enderecoEntrega.logradouro}, ${enderecoEntrega.numero || ''}</p>` : ''}
            ${enderecoEntrega.complemento ? `<p>Complemento: ${enderecoEntrega.complemento}</p>` : ''}
            ${enderecoEntrega.bairro ? `<p>${enderecoEntrega.bairro}, ${enderecoEntrega.cidade || ''} - ${enderecoEntrega.uf || ''}</p>` : ''}
            ${enderecoEntrega.cep ? `<p>CEP: ${enderecoEntrega.cep}</p>` : ''}
        `;
        
        // HTML da forma de pagamento
        const pagamento = pedido.pagamento || {};
        let pagamentoHTML = '';
        
        if (pagamento.metodo === 'BOLETO') {
            pagamentoHTML = `
                <p><strong>Boleto Bancário</strong></p>
                ${pagamento.codigoBoleto ? `<p>Código: ${pagamento.codigoBoleto}</p>` : ''}
                <p>Status: ${pagamento.status || 'Não informado'}</p>
            `;
        } else if (pagamento.metodo === 'CARTAO_CREDITO') {
            pagamentoHTML = `
                <p><strong>Cartão de Crédito</strong></p>
                ${pagamento.cartaoUltimosDigitos ? `<p>Terminado em ${pagamento.cartaoUltimosDigitos}</p>` : ''}
                ${pagamento.cartaoParcelas ? `<p>Parcelas: ${pagamento.cartaoParcelas}x</p>` : ''}
                <p>Status: ${pagamento.status || 'Não informado'}</p>
            `;
        }
        
        // Monta o HTML do pedido
        pedidoElement.innerHTML = `
            <div class="pedido-header">
                <div class="pedido-id-status">
                    <span class="pedido-id">Pedido #${pedido.numeroPedido || pedido.id}</span>
                    <span class="pedido-status ${statusInfo.class}">${statusInfo.text}</span>
                </div>
                <span class="pedido-data">${dataFormatada}</span>
            </div>
            
            <div class="pedido-section">
                <h3><i class="fas fa-box-open"></i> Produtos</h3>
                <div class="produtos-lista">
                    ${produtosHTML}
                </div>
            </div>
            
            <div class="pedido-details-grid">
                <div class="pedido-section">
                    <h3><i class="fas fa-map-marker-alt"></i> Endereço</h3>
                    <div class="info-entrega">
                        ${enderecoHTML}
                    </div>
                </div>
                
                <div class="pedido-section">
                    <h3><i class="fas fa-credit-card"></i> Pagamento</h3>
                    <div class="info-pagamento">
                        ${pagamentoHTML || '<p>Forma de pagamento não informada</p>'}
                    </div>
                </div>
            </div>
            
            <div class="pedido-total">
                <div class="total-item">
                    <span>Subtotal:</span>
                    <span>R$ ${(pedido.valorTotal - (pedido.valorFrete || 0)).toFixed(2)}</span>
                </div>
                <div class="total-item">
                    <span>Frete:</span>
                    <span>R$ ${(pedido.valorFrete || 0).toFixed(2)}</span>
                </div>
                <div class="total-item grand-total">
                    <span>Total:</span>
                    <span>R$ ${pedido.valorTotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        container.appendChild(pedidoElement);
    });
}

// Função auxiliar para obter informações de status
function getStatusInfo(status) {
    switch(status) {
        case 'AGUARDANDO_PAGAMENTO':
            return { class: 'status-pending', text: 'Aguardando Pagamento' };
        case 'PAGAMENTO_REJEITADO':
            return { class: 'status-cancelled', text: 'Pagamento Rejeitado' };
        case 'PAGAMENTO_SUCESSO':
            return { class: 'status-approved', text: 'Pagamento Aprovado' };
        case 'AGUARDANDO_RETIRADA':
            return { class: 'status-processing', text: 'Aguardando Retirada' };
        case 'EM_TRANSITO':
            return { class: 'status-shipped', text: 'Em Trânsito' };
        case 'ENTREGUE':
            return { class: 'status-delivered', text: 'Entregue' };
        default:
            return { class: 'status-pending', text: status };
    }
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${tipo === 'error' ? 'exclamation-circle' : tipo === 'info' ? 'info-circle' : 'check-circle'}"></i>
        ${mensagem}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('pedidosCliente');
        window.location.href = '/index';
    }
}