document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário é estoquista
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || usuario.tipo !== 'Estoquista') {
        window.location.href = 'index.html';
        return;
    }

    // Carrega os pedidos
    loadOrders();

    // Configura os filtros
    setupFilters();

    // Configura a busca
    setupSearch();
});

function loadOrders(filter = 'all') {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    
    // Ordena por data (mais recente primeiro)
    const pedidosOrdenados = historicoCompras.sort((a, b) => new Date(b.data) - new Date(a.data));

    if (pedidosOrdenados.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">Nenhum pedido encontrado</p>';
        return;
    }

    // Filtra os pedidos se necessário
    const pedidosFiltrados = filter === 'all' ? pedidosOrdenados : pedidosOrdenados.filter(pedido => pedido.status === filter);

    if (pedidosFiltrados.length === 0) {
        ordersList.innerHTML = `<p class="no-orders">Nenhum pedido com status "${getStatusText(filter)}"</p>`;
        return;
    }

    // Renderiza os pedidos
    pedidosFiltrados.forEach(pedido => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        const statusClass = `status-${pedido.status}`;
        const statusText = getStatusText(pedido.status);
        
        // Formata a data
        const dataPedido = new Date(pedido.data);
        const dataFormatada = dataPedido.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        orderItem.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">Pedido #${pedido.id}</span>
                    <span class="order-date">${dataFormatada}</span>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-summary">
                <div class="order-products">
                    ${pedido.produtos.slice(0, 3).map(produto => `
                        <img src="${produto.imagem || 'https://via.placeholder.com/50x50?text=Produto'}" 
                             alt="${produto.nome}" 
                             class="product-thumb" 
                             title="${produto.nome}">
                    `).join('')}
                    ${pedido.produtos.length > 3 ? `<span>+${pedido.produtos.length - 3}</span>` : ''}
                </div>
                <div class="order-total">Total: R$ ${pedido.total.toFixed(2)}</div>
            </div>
            <div class="order-actions">
                <button class="details-btn" data-order="${pedido.id}">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                <button class="edit-btn" data-order="${pedido.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `;

        ordersList.appendChild(orderItem);
    });

    // Adiciona eventos aos botões
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showOrderDetails(this.getAttribute('data-order'));
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showEditStatusModal(this.getAttribute('data-order'));
        });
    });
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove a classe active de todos os botões
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');
            
            // Carrega os pedidos com o filtro selecionado
            loadOrders(this.getAttribute('data-filter'));
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchOrder');
    const searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('click', searchOrders);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchOrders();
        }
    });
}

function searchOrders() {
    const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
    if (!searchTerm) {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        loadOrders(activeFilter);
        return;
    }

    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    const pedidosFiltrados = historicoCompras.filter(pedido => 
        pedido.id.toLowerCase().includes(searchTerm) || 
        pedido.usuarioEmail.toLowerCase().includes(searchTerm)
    );

    if (pedidosFiltrados.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">Nenhum pedido encontrado</p>';
        return;
    }

    // Renderiza os pedidos encontrados
    pedidosFiltrados.forEach(pedido => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        const statusClass = `status-${pedido.status}`;
        const statusText = getStatusText(pedido.status);
        
        const dataPedido = new Date(pedido.data);
        const dataFormatada = dataPedido.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        orderItem.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">Pedido #${pedido.id}</span>
                    <span class="order-date">${dataFormatada}</span>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-summary">
                <div class="order-products">
                    ${pedido.produtos.slice(0, 3).map(produto => `
                        <img src="${produto.imagem || 'https://via.placeholder.com/50x50?text=Produto'}" 
                             alt="${produto.nome}" 
                             class="product-thumb" 
                             title="${produto.nome}">
                    `).join('')}
                    ${pedido.produtos.length > 3 ? `<span>+${pedido.produtos.length - 3}</span>` : ''}
                </div>
                <div class="order-total">Total: R$ ${pedido.total.toFixed(2)}</div>
            </div>
            <div class="order-actions">
                <button class="details-btn" data-order="${pedido.id}">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                <button class="edit-btn" data-order="${pedido.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `;

        ordersList.appendChild(orderItem);
    });

    // Adiciona eventos aos botões
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showOrderDetails(this.getAttribute('data-order'));
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showEditStatusModal(this.getAttribute('data-order'));
        });
    });
}

function showOrderDetails(orderId) {
    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    const pedido = historicoCompras.find(p => p.id === orderId);
    
    if (!pedido) {
        alert('Pedido não encontrado!');
        return;
    }
    
    const modalContent = document.getElementById('orderDetailsContent');
    
    // Formata a data
    const dataPedido = new Date(pedido.data);
    const dataFormatada = dataPedido.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Determina o status
    const statusClass = `status-${pedido.status}`;
    const statusText = getStatusText(pedido.status);
    
    // HTML dos produtos
    const produtosHTML = pedido.produtos.map(produto => `
        <div class="order-product-item">
            <img src="${produto.imagem || 'https://via.placeholder.com/60x60?text=Produto'}" 
                class="order-product-img">
            <div class="order-product-info">
                <div class="order-product-name">${produto.nome}</div>
                <div class="order-product-price">Preço unitário: R$ ${produto.preco.toFixed(2)}</div>
                <div class="order-product-qty">Quantidade: ${produto.quantidade}</div>
            </div>
            <div class="order-product-total">R$ ${(produto.preco * produto.quantidade).toFixed(2)}</div>
        </div>
    `).join('');
    
    // HTML do endereço de entrega
    const enderecoHTML = `
        <p>${pedido.endereco.logradouro}, ${pedido.endereco.numero}${pedido.endereco.complemento ? ' - ' + pedido.endereco.complemento : ''}</p>
        <p>${pedido.endereco.bairro}, ${pedido.endereco.cidade} - ${pedido.endereco.uf}</p>
        <p>CEP: ${pedido.endereco.cep}</p>
    `;
    
    // HTML da forma de pagamento
    let pagamentoHTML = '';
    if (pedido.pagamento.tipo === 'boleto') {
        pagamentoHTML = '<p>Boleto Bancário</p>';
    } else if (pedido.pagamento.tipo === 'credito') {
        pagamentoHTML = `
            <p>Cartão de Crédito</p>
            <p>${pedido.pagamento.nomeCartao}</p>
            <p>Terminado em ${pedido.pagamento.ultimosDigitos}</p>
            <p>Validade: ${pedido.pagamento.validadeCartao}</p>
            <p>Parcelas: ${pedido.pagamento.parcelas}x de R$ ${(pedido.total / pedido.pagamento.parcelas).toFixed(2)}</p>
        `;
    } else if (pedido.pagamento.tipo === 'pix') {
        pagamentoHTML = '<p>Pagamento via PIX</p>';
    }
    
    // Monta o conteúdo completo do modal
    modalContent.innerHTML = `
        <div class="order-details">
            <div class="order-info">
                <h4><i class="fas fa-info-circle"></i> INFORMAÇÕES DO PEDIDO</h4>
                <p><strong>Número do Pedido:</strong> ${pedido.id}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> <span class="order-status ${statusClass}">${statusText}</span></p>
                <p><strong>Cliente:</strong> ${pedido.usuarioEmail}</p>
            </div>
            
            <div class="order-info">
                <h4><i class="fas fa-box-open"></i> PRODUTOS</h4>
                <div class="order-products-list">
                    ${produtosHTML}
                </div>
            </div>
            
            <div class="order-info">
                <h4><i class="fas fa-map-marker-alt"></i> ENDEREÇO DE ENTREGA</h4>
                ${enderecoHTML}
            </div>
            
            <div class="order-info">
                <h4><i class="fas fa-credit-card"></i> FORMA DE PAGAMENTO</h4>
                ${pagamentoHTML}
            </div>
            
            <div class="order-summary-total">
                <h4><i class="fas fa-receipt"></i> RESUMO DO PEDIDO</h4>
                <div class="order-summary-row">
                    <span>Subtotal:</span>
                    <span>R$ ${pedido.subtotal?.toFixed(2) || pedido.total.toFixed(2)}</span>
                </div>
                <div class="order-summary-row">
                    <span>Frete:</span>
                    <span>R$ ${pedido.frete?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="order-summary-row">
                    <span>Desconto:</span>
                    <span>- R$ ${pedido.desconto?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="order-summary-row">
                    <span>TOTAL:</span>
                    <span>R$ ${pedido.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Mostra o modal
    document.getElementById('orderDetailsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showEditStatusModal(orderId) {
    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    const pedido = historicoCompras.find(p => p.id === orderId);
    
    if (!pedido) {
        alert('Pedido não encontrado!');
        return;
    }
    
    // Armazena o ID do pedido que está sendo editado no modal
    document.getElementById('editStatusModal').setAttribute('data-order', orderId);
    
    // Seleciona o status atual no dropdown
    const statusSelect = document.getElementById('statusSelect');
    statusSelect.value = pedido.status;
    
    // Mostra o modal
    document.getElementById('editStatusModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Configura o botão de salvar
    document.getElementById('saveStatusBtn').onclick = function() {
        updateOrderStatus(orderId, statusSelect.value);
    };
}

function updateOrderStatus(orderId, newStatus) {
    const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
    const pedidoIndex = historicoCompras.findIndex(p => p.id === orderId);
    
    if (pedidoIndex === -1) {
        alert('Pedido não encontrado!');
        return;
    }
    
    // Atualiza o status
    historicoCompras[pedidoIndex].status = newStatus;
    
    // Salva no localStorage
    localStorage.setItem('historicoCompras', JSON.stringify(historicoCompras));
    
    // Fecha o modal
    closeEditModal();
    
    // Recarrega os pedidos
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    loadOrders(activeFilter);
    
    // Mostra mensagem de sucesso
    alert(`Status do pedido ${orderId} atualizado para "${getStatusText(newStatus)}"`);
}

function closeModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeEditModal() {
    document.getElementById('editStatusModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function getStatusText(status) {
    switch(status) {
        case 'aguardando': return 'AGUARDANDO PAGAMENTO';
        case 'rejeitado': return 'PAGAMENTO REJEITADO';
        case 'aprovado': return 'PAGAMENTO APROVADO';
        case 'retirada': return 'AGUARDANDO RETIRADA';
        case 'transito': return 'Estornado';
        case 'entregue': return 'ENTREGUE';
        default: return status.toUpperCase();
    }
}

// Fecha o modal ao clicar fora do conteúdo
window.onclick = function(event) {
    if (event.target === document.getElementById('orderDetailsModal')) {
        closeModal();
    }
    if (event.target === document.getElementById('editStatusModal')) {
        closeEditModal();
    }
};