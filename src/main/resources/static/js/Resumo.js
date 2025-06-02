    document.addEventListener("DOMContentLoaded", function() {
        // Verifica se o usuário está logado
        if (!localStorage.getItem('usuarioLogado')) {
            window.location.href = '/index';
            return;
        }
        
        // Carrega os pedidos recentes na seção principal
        carregarPedidosRecentes();
    });

    // Função para carregar pedidos recentes na seção principal
    function carregarPedidosRecentes() {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuario) return;

        const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
        const usuarioCompras = historicoCompras.filter(compra => compra.usuarioEmail === usuario.email);
        
        const container = document.getElementById('historicoComprasResumo');
        container.innerHTML = '';

        if (usuarioCompras.length === 0) {
            container.innerHTML = '<p class="no-history">Nenhuma compra realizada ainda.</p>';
            return;
        }

        // Ordena por data (mais recente primeiro) e pega os 3 mais recentes
        const pedidosRecentes = usuarioCompras.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3);

        pedidosRecentes.forEach((compra) => {
            const compraElement = document.createElement('div');
            compraElement.className = 'pedido-item';
            
            // Determina o status
            let statusClass, statusText;
            switch(compra.status) {
                case 'aprovado':
                    statusClass = 'status-aprovado';
                    statusText = 'APROVADO';
                    break;
                case 'enviado':
                    statusClass = 'status-enviado';
                    statusText = 'ENVIADO';
                    break;
                case 'entregue':
                    statusClass = 'status-entregue';
                    statusText = 'ENTREGUE';
                    break;
                default:
                    statusClass = 'status-aguardando';
                    statusText = 'AGUARDANDO';
            }
            
            // Formata a data
            const dataCompra = new Date(compra.data);
            const dataFormatada = dataCompra.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Cria o HTML do item de compra resumido
            compraElement.innerHTML = `
                <div class="pedido-header">
                    <span class="pedido-id">Pedido #${compra.id}</span>
                    <span class="pedido-status ${statusClass}">${statusText}</span>
                </div>
                
                <div class="pedido-resumo">
                    ${compra.produtos.slice(0, 2).map(produto => `
                        <div class="produto-item">
                            <img src="${produto.imagem}" 
                                class="produto-img"
                                onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Produto'">
                            <div class="produto-info">
                                <div class="produto-nome">${produto.nome}</div>
                                <div class="produto-qtd">${produto.quantidade}x R$ ${produto.preco.toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${compra.produtos.length > 2 ? `<p>+ ${compra.produtos.length - 2} item(s)</p>` : ''}
                </div>
                
                <div class="pedido-total">
                    Total: R$ ${compra.total.toFixed(2)}
                </div>
                
                <div class="pedido-data">
                    ${dataFormatada}
                </div>
                
                <button class="btn-detalhes" onclick="mostrarDetalhesPedido('${compra.id}')">
                    <i class="fas fa-search"></i> VER DETALHES
                </button>
            `;
            
            container.appendChild(compraElement);
        });
    }

    // Função para mostrar detalhes completos do pedido
    function mostrarDetalhesPedido(pedidoId) {
        const historicoCompras = JSON.parse(localStorage.getItem('historicoCompras')) || [];
        const pedido = historicoCompras.find(p => p.id === pedidoId);
        
        if (!pedido) {
            mostrarNotificacao('Pedido não encontrado!', 'erro');
            return;
        }
        
        const modalContent = document.getElementById('detalhesPedidoConteudo');
        
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
        let statusClass, statusText;
        switch(pedido.status) {
            case 'aprovado':
                statusClass = 'status-aprovado';
                statusText = 'APROVADO';
                break;
            case 'enviado':
                statusClass = 'status-enviado';
                statusText = 'ENVIADO';
                break;
            case 'entregue':
                statusClass = 'status-entregue';
                statusText = 'ENTREGUE';
                break;
            default:
                statusClass = 'status-aguardando';
                statusText = 'AGUARDANDO Pagamento';
        }
        
        // HTML dos produtos
        const produtosHTML = pedido.produtos.map(produto => `
            <div class="produto-item">
                <img src="${produto.imagem}" 
                    class="produto-img"
                    onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Produto'">
                <div class="produto-info">
                    <div class="produto-nome">${produto.nome}</div>
                    <div class="produto-preco">Preço unitário: R$ ${produto.preco.toFixed(2)}</div>
                    <div class="produto-qtd">Quantidade: ${produto.quantidade}</div>
                </div>
                <div class="produto-total">R$ ${(produto.preco * produto.quantidade).toFixed(2)}</div>
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
                <p>Parcelas: ${pedido.pagamento.parcelas}x</p>
            `;
        }
        
        // Monta o conteúdo completo do modal
        modalContent.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-id">Pedido #${pedido.id}</span>
                <span class="pedido-status ${statusClass}">${statusText}</span>
            </div>
            <div class="pedido-data">
                Data do pedido: ${dataFormatada}
            </div>
            
            <div class="detalhes-pedido">
                <h3><i class="fas fa-box-open"></i> PRODUTOS</h3>
                <div class="produtos-lista">
                    ${produtosHTML}
                </div>
                
                <h3><i class="fas fa-map-marker-alt"></i> ENDEREÇO DE ENTREGA</h3>
                <div class="info-entrega">
                    ${enderecoHTML}
                </div>
                
                <h3><i class="fas fa-credit-card"></i> FORMA DE PAGAMENTO</h3>
                <div class="info-pagamento">
                    ${pagamentoHTML}
                </div>
                
                <h3><i class="fas fa-receipt"></i> RESUMO DO PEDIDO</h3>
                <div class="resumo-valores">
                    <div class="valor-item">
                        <span>Subtotal:</span>
                        <span>R$ ${pedido.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="valor-item">
                        <span>Frete:</span>
                        <span>R$ ${pedido.frete.toFixed(2)}</span>
                    </div>
                    <div class="valor-item">
                        <span>Desconto:</span>
                        <span>- R$ ${pedido.desconto.toFixed(2)}</span>
                    </div>
                    <div class="valor-item valor-total">
                        <span>TOTAL:</span>
                        <span>R$ ${pedido.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Mostra o modal
        document.getElementById('detalhesModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function fecharModalDetalhes() {
        document.getElementById('detalhesModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

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
            compraElement.className = 'pedido-item';
            
            // Determina o status
            let statusClass, statusText;
            switch(compra.status) {
                case 'aprovado':
                    statusClass = 'status-aprovado';
                    statusText = 'APROVADO';
                    break;
                case 'enviado':
                    statusClass = 'status-enviado';
                    statusText = 'ENVIADO';
                    break;
                case 'entregue':
                    statusClass = 'status-entregue';
                    statusText = 'ENTREGUE';
                    break;
                default:
                    statusClass = 'status-aguardando';
                    statusText = 'AGUARDANDO';
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
                <div class="pedido-header">
                    <span class="pedido-id">Pedido #${compra.id}</span>
                    <span class="pedido-status ${statusClass}">${statusText}</span>
                </div>
                
                <div class="pedido-resumo">
                    ${compra.produtos.slice(0, 2).map(produto => `
                        <div class="produto-item">
                            <img src="${produto.imagem}" 
                                class="produto-img"
                                onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Produto'">
                            <div class="produto-info">
                                <div class="produto-nome">${produto.nome}</div>
                                <div class="produto-qtd">${produto.quantidade}x R$ ${produto.preco.toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${compra.produtos.length > 2 ? `<p>+ ${compra.produtos.length - 2} item(s)</p>` : ''}
                </div>
                
                <div class="pedido-total">
                    Total: R$ ${compra.total.toFixed(2)}
                </div>
                
                <div class="pedido-data">
                    ${dataFormatada}
                </div>
                
                <button class="btn-detalhes" onclick="mostrarDetalhesPedido('${compra.id}')">
                    <i class="fas fa-search"></i> VER DETALHES
                </button>
            `;
            
            container.appendChild(compraElement);
        });
    }

    function logout() {
        if (confirm("Tem certeza que deseja sair?")) {
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/index';
        }
    }

    // Fecha o modal ao clicar fora do conteúdo
    window.onclick = function(event) {
        const modal = document.getElementById('detalhesModal');
        if (event.target === modal) {
            fecharModalDetalhes();
        }
    };