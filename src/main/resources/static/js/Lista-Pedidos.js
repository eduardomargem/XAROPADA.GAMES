// Em XAROPADA.GAMES-master/src/main/resources/static/js/Lista-Pedidos.js

document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const isEstoquistaOuAdmin = usuario && (usuario.tipo === 'Estoquista' || (usuario.tipo === 'funcionario' && (usuario.id_grupo === 2 || usuario.id_grupo === 1) ));

    if (!isEstoquistaOuAdmin) {
        mostrarNotificacaoGlobal('Acesso restrito a funcionários autorizados.', 'erro');
        setTimeout(() => { window.location.href = '/index'; }, 2000);
        return;
    }

    loadOrdersFromBackend(); 
    setupFilters();
    setupSearch();
});

async function loadOrdersFromBackend(filterStatus = 'all') {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '<p class="loading-message" style="text-align:center; padding:20px;">Carregando pedidos...</p>';

    try {
        const response = await fetch('/api/pedidos/todos');
        if (!response.ok) {
            if(response.status === 204) {
                ordersList.innerHTML = '<p class="no-orders">Nenhum pedido encontrado.</p>';
                return;
            }
            throw new Error('Falha ao buscar pedidos do backend.');
        }
        let pedidos = await response.json(); 

        if (filterStatus && filterStatus !== 'all') {
            let backendStatusEquivalent = filterStatus.toUpperCase();
            // Mapeamento de status do filtro para status do backend
            if (filterStatus === 'aprovado') backendStatusEquivalent = 'PAGO';
            else if (filterStatus === 'aguardando') backendStatusEquivalent = 'AGUARDANDO_PAGAMENTO';
            else if (filterStatus === 'rejeitado') backendStatusEquivalent = 'PAGAMENTO_REJEITADO';
            else if (filterStatus === 'enviado') backendStatusEquivalent = 'ENVIADO';
            else if (filterStatus === 'entregue') backendStatusEquivalent = 'ENTREGUE';
            else if (filterStatus === 'cancelado') backendStatusEquivalent = 'CANCELADO';
            else if (filterStatus === 'estornado') backendStatusEquivalent = 'ESTORNADO';


            pedidos = pedidos.filter(pedido => pedido.statusPedido === backendStatusEquivalent);
        }
        
        renderizarPedidosParaAdmin(pedidos);

    } catch (error) {
        console.error("Erro ao carregar pedidos do backend:", error);
        ordersList.innerHTML = `<p class="no-orders" style="color:red;">Erro ao carregar pedidos: ${error.message}</p>`;
    }
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filterValue = this.getAttribute('data-filter');
            loadOrdersFromBackend(filterValue);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchOrder');
    const searchBtn = document.querySelector('.search-btn');

    const performSearch = async () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Recarrega todos os pedidos do backend para ter a lista completa para filtrar
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '<p class="loading-message" style="text-align:center; padding:20px;">Buscando...</p>';

        try {
            const response = await fetch('/api/pedidos/todos');
            if (!response.ok) {
                if(response.status === 204) {
                     ordersList.innerHTML = '<p class="no-orders">Nenhum pedido para buscar.</p>'; return;
                }
                throw new Error('Falha ao buscar dados para pesquisa.');
            }
            const todosPedidos = await response.json();
            
            if (!searchTerm) { // Se a busca está vazia, mostra todos
                renderizarPedidosParaAdmin(todosPedidos);
                return;
            }

            const pedidosFiltrados = todosPedidos.filter(pedido => 
                pedido.id.toString().includes(searchTerm) || 
                (pedido.nomeCliente && pedido.nomeCliente.toLowerCase().includes(searchTerm)) ||
                (pedido.clienteId && pedido.clienteId.toString().includes(searchTerm)) 
            );
            renderizarPedidosParaAdmin(pedidosFiltrados);

        } catch (error) {
             console.error("Erro ao buscar para pesquisar:", error);
             ordersList.innerHTML = `<p class="no-orders" style="color:red;">Erro ao realizar busca: ${error.message}</p>`;
        }
    };

    if(searchBtn) searchBtn.addEventListener('click', performSearch);
    if(searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}


function renderizarPedidosParaAdmin(pedidos) { 
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">Nenhum pedido encontrado com os filtros atuais.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        const statusDoPedido = pedido.statusPedido;
        const statusClass = `status-${statusDoPedido.toLowerCase().replace(/_/g, '-')}`; 
        const statusText = getStatusTextGlobal(statusDoPedido); 
        
        const dataFormatada = pedido.dataPedido; // Já formatada pelo DTO

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
                    ${pedido.itens.slice(0, 3).map(item => `
                        <img src="${item.imagemUrl || 'https://via.placeholder.com/50x50?text=Produto'}" 
                             alt="${item.nomeProduto}" 
                             class="product-thumb" 
                             title="${item.nomeProduto}"
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Img'">
                    `).join('')}
                    ${pedido.itens.length > 3 ? `<span>+${pedido.itens.length - 3}</span>` : ''}
                </div>
                <div class="order-total">Total: R$ ${pedido.valorTotal.toFixed(2)}</div>
            </div>
            <div class="order-customer-info" style="font-size:10px; margin-top:5px; color:#ccc;">
                Cliente: ${pedido.nomeCliente || 'N/A'} (ID: ${pedido.clienteId})
            </div>
            <div class="order-actions">
                <button class="details-btn" data-order-id="${pedido.id}">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                <button class="edit-btn" data-order-id="${pedido.id}" data-current-status="${statusDoPedido}">
                    <i class="fas fa-edit"></i> Editar Status
                </button>
            </div>
        `;
        ordersList.appendChild(orderItem);
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (typeof mostrarDetalhesPedidoBackend === "function") { // Verifica se a função existe
                mostrarDetalhesPedidoBackend(this.getAttribute('data-order-id'));
            } else {
                console.error("Função mostrarDetalhesPedidoBackend não encontrada. Certifique-se de que Resumo.js está carregado ou a função está disponível.");
                alert("Não foi possível carregar os detalhes do pedido. Função de visualização não encontrada.");
            }
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showEditStatusModal(this.getAttribute('data-order-id'), this.getAttribute('data-current-status'));
        });
    });
}

function showEditStatusModal(orderId, currentStatus) {
    const modal = document.getElementById('editStatusModal');
    if (!modal) {
        console.error("Modal de edição de status não encontrado no DOM.");
        return;
    }
    modal.setAttribute('data-order-id', orderId);
    const statusSelect = document.getElementById('statusSelect');
    if (!statusSelect) {
        console.error("Select de status não encontrado no modal.");
        return;
    }
    
    statusSelect.value = currentStatus; 
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const saveBtn = document.getElementById('saveStatusBtn');
    if (saveBtn) {
        saveBtn.onclick = function() { // Remove event listeners anteriores implicitamente
            updateOrderStatusBackend(orderId, statusSelect.value);
        };
    } else {
        console.error("Botão de salvar status não encontrado no modal.");
    }
}

async function updateOrderStatusBackend(orderId, newStatus) {
    const btnSalvar = document.getElementById('saveStatusBtn');
    const originalText = btnSalvar.innerHTML;
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

    try {
        const response = await fetch(`/api/pedidos/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statusPedido: newStatus })
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `Erro HTTP ${response.status}`);
        }
        
        mostrarNotificacaoGlobal(`Status do pedido #${orderId} atualizado para "${getStatusTextGlobal(responseData.statusPedido)}"`, 'sucesso');
        closeEditModal();
        const activeFilter = document.querySelector('.filter-btn.active');
        loadOrdersFromBackend(activeFilter ? activeFilter.getAttribute('data-filter') : 'all'); 
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        mostrarNotificacaoGlobal(error.message || 'Falha ao atualizar status.', 'erro');
    } finally {
        if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = originalText;
        }
    }
}

function getStatusTextGlobal(status) { // Renomeada para evitar conflito se Resumo.js for carregado
    switch(status) {
        case 'AGUARDANDO_PAGAMENTO': return 'AGUARDANDO PAGAMENTO';
        case 'PAGAMENTO_REJEITADO': return 'PAGAMENTO REJEITADO';
        case 'PAGO': return 'PAGO (Aprovado)';
        case 'ENVIADO': return 'ENVIADO';
        case 'ENTREGUE': return 'ENTREGUE';
        case 'CANCELADO': return 'CANCELADO';
        case 'ESTORNADO': return 'ESTORNADO';
        default: return status ? status.replace(/_/g, ' ').toUpperCase() : 'DESCONHECIDO';
    }
}

function closeModal() { 
    const detalhesModal = document.getElementById('orderDetailsModal');
    if (detalhesModal) detalhesModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeEditModal() { 
    const editModal = document.getElementById('editStatusModal');
    if (editModal) editModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function mostrarNotificacaoGlobal(mensagem, tipo = 'sucesso') {
    const containerId = 'notification-container-global';
    let notificationContainer = document.getElementById(containerId);
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = containerId;
        Object.assign(notificationContainer.style, {
            position: 'fixed', top: '20px', right: '20px', zIndex: '20000',
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
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 50); 
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(110%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

window.onclick = function(event) {
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const editStatusModal = document.getElementById('editStatusModal');

    if (event.target === orderDetailsModal) {
        closeModal();
    }
    if (event.target === editStatusModal) {
        closeEditModal();
    }
};

// A função mostrarDetalhesPedidoBackend é usada por esta tela,
// mas está definida em Resumo.js. Se Resumo.js não for carregado
// nesta página, você precisará copiar a função mostrarDetalhesPedidoBackend
// para Lista-Pedidos.js ou para um arquivo de utilidades global.
// Para este exemplo, assumimos que ela estará acessível (por exemplo, se Resumo.js for carregado antes ou
// a função for movida para um escopo global/compartilhado).