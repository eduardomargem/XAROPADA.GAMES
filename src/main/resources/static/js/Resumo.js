// Em XAROPADA.GAMES-master/src/main/resources/static/js/Resumo.js

document.addEventListener("DOMContentLoaded", function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        mostrarNotificacaoGlobal('Você precisa estar logado para ver esta página.', 'erro');
        setTimeout(() => { window.location.href = '/index'; }, 1500);
        return;
    }
    
    carregarResumoPedidoAtual(); 
    carregarPedidosRecentes(); 

    const btnConcluir = document.getElementById('btnConcluirCompra');
    if (btnConcluir) {
        btnConcluir.addEventListener('click', concluirCompra);
    }
});

function carregarResumoPedidoAtual() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const enderecoEntrega = JSON.parse(localStorage.getItem('enderecoEntregaSelecionado')); 
    const pagamentoAtual = JSON.parse(localStorage.getItem('pagamentoAtual'));
    const freteInfo = JSON.parse(localStorage.getItem('freteInfo')); 

    const container = document.getElementById('resumoPedidoAtualContainer'); 
    container.innerHTML = ''; 

    if (carrinho.length === 0 || !enderecoEntrega || !pagamentoAtual || !freteInfo) {
        container.innerHTML = `
            <p class="no-history" style="text-align:center; padding: 20px;">
                Seu carrinho está vazio ou faltam informações de endereço/pagamento/frete para finalizar.
                <br><br>
                <button onclick="window.location.href='/'" style="padding:10px 15px; font-size:10px;">Voltar à Loja</button>
            </p>`;
        const btnConcluir = document.getElementById('btnConcluirCompra');
        if(btnConcluir) btnConcluir.style.display = 'none';
        const btnVoltarPagamento = document.querySelector('.btn-voltar-resumo');
        if(btnVoltarPagamento) btnVoltarPagamento.style.display = 'none';
        return;
    }

    let subtotal = 0;
    const produtosHTML = carrinho.map(produto => {
        subtotal += produto.preco * produto.quantidade;
        return `
            <div class="produto-item">
                <img src="${produto.imagem || 'https://via.placeholder.com/50x50?text=Produto'}" class="produto-img" onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Produto'">
                <div class="produto-info">
                    <div class="produto-nome">${produto.nome}</div>
                    <div class="produto-qtd">${produto.quantidade}x R$ ${produto.preco.toFixed(2)}</div>
                </div>
                <div class="produto-total">R$ ${(produto.preco * produto.quantidade).toFixed(2)}</div>
            </div>
        `;
    }).join('');

    const valorFrete = parseFloat(freteInfo.valor) || 0;
    const totalPedido = subtotal + valorFrete;

    const resumoHTML = `
        <div class="pedido-item-atual">
            <h3><i class="fas fa-shopping-bag"></i> ITENS DO SEU PEDIDO ATUAL</h3>
            <div class="produtos-lista">${produtosHTML}</div>
            
            <h3><i class="fas fa-truck"></i> ENDEREÇO DE ENTREGA SELECIONADO</h3>
            <div class="info-entrega">
                <p>${enderecoEntrega.logradouro}, ${enderecoEntrega.numero} ${enderecoEntrega.complemento || ''}</p>
                <p>${enderecoEntrega.bairro}, ${enderecoEntrega.cidade} - ${enderecoEntrega.uf}</p>
                <p>CEP: ${enderecoEntrega.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</p>
            </div>

            <h3><i class="fas fa-credit-card"></i> FORMA DE PAGAMENTO ESCOLHIDA</h3>
            <div class="info-pagamento">
                <p>Tipo: ${pagamentoAtual.tipo === 'BOLETO' ? 'Boleto Bancário' : 'Cartão de Crédito'}</p>
                ${pagamentoAtual.tipo === 'CARTAO_CREDITO' ? `
                    <p>Cartão: ${pagamentoAtual.nomeCartao || 'N/A'} final ${pagamentoAtual.ultimosDigitos || 'N/A'}</p>
                    <p>Parcelas: ${pagamentoAtual.parcelas || 'N/A'}x</p>
                ` : ''}
            </div>

            <h3><i class="fas fa-receipt"></i> RESUMO FINANCEIRO</h3>
            <div class="resumo-valores">
                <div class="valor-item"><span>Subtotal dos Produtos:</span> <span>R$ ${subtotal.toFixed(2)}</span></div>
                <div class="valor-item"><span>Frete (${freteInfo.tipo || "N/A"}):</span> <span>R$ ${valorFrete.toFixed(2)}</span></div>
                <div class="valor-item valor-total"><span>TOTAL DO PEDIDO:</span> <span>R$ ${totalPedido.toFixed(2)}</span></div>
            </div>
        </div>
    `;
    container.innerHTML = resumoHTML;
    const btnConcluir = document.getElementById('btnConcluirCompra');
    if(btnConcluir) btnConcluir.style.display = 'inline-block';
    const btnVoltarPagamento = document.querySelector('.btn-voltar-resumo');
    if(btnVoltarPagamento) btnVoltarPagamento.style.display = 'inline-block';
}

async function concluirCompra() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarNotificacaoGlobal('Erro: Usuário não identificado. Faça login novamente.', 'erro');
        return;
    }

    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const enderecoEntregaStorage = JSON.parse(localStorage.getItem('enderecoEntregaSelecionado'));
    const pagamentoAtualStorage = JSON.parse(localStorage.getItem('pagamentoAtual'));
    const freteInfoStorage = JSON.parse(localStorage.getItem('freteInfo'));

    if (carrinho.length === 0 || !enderecoEntregaStorage || !pagamentoAtualStorage || !freteInfoStorage) {
        mostrarNotificacaoGlobal('Dados do pedido incompletos. Verifique o carrinho, endereço e pagamento.', 'erro');
        return;
    }

    const itensPedido = carrinho.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade,
        precoUnitario: item.preco
    }));

    let subtotal = 0;
    carrinho.forEach(item => subtotal += item.preco * item.quantidade);
    const valorFrete = parseFloat(freteInfoStorage.valor) || 0;
    const valorTotal = subtotal + valorFrete;

    // O enderecoEntregaStorage já deve estar formatado como EnderecoDTO
    // com CEP sem máscara, conforme salvo em Endereco.js
    const enderecoEntregaDTO = {
        cep: enderecoEntregaStorage.cep, // Já deve estar sem máscara
        logradouro: enderecoEntregaStorage.logradouro,
        numero: enderecoEntregaStorage.numero,
        complemento: enderecoEntregaStorage.complemento || null,
        bairro: enderecoEntregaStorage.bairro,
        cidade: enderecoEntregaStorage.cidade,
        uf: enderecoEntregaStorage.uf,
        tipo: "ENTREGA" 
    };
    // Formata o CEP para o padrão XXXXX-XXX para o DTO do backend, se ele esperar assim
    enderecoEntregaDTO.cep = enderecoEntregaDTO.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');


    const pedidoRequest = {
        clienteId: usuarioLogado.id,
        itens: itensPedido,
        enderecoEntrega: enderecoEntregaDTO,
        formaPagamento: pagamentoAtualStorage.tipo, 
        detalhesPagamento: pagamentoAtualStorage.tipo === 'CARTAO_CREDITO' ? `Cartão ${pagamentoAtualStorage.nomeCartao || ''} final ${pagamentoAtualStorage.ultimosDigitos || ''}, ${pagamentoAtualStorage.parcelas || '1'}x` : null,
        valorFrete: valorFrete,
        valorTotal: valorTotal
    };

    const btnConcluir = document.getElementById('btnConcluirCompra');
    const btnVoltar = document.querySelector('.btn-voltar-resumo');
    try {
        btnConcluir.disabled = true;
        btnConcluir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        if(btnVoltar) btnVoltar.style.display = 'none';


        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(pedidoRequest)
        });

        const responseData = await response.json();

        if (response.ok) {
            mostrarNotificacaoGlobal(`Pedido #${responseData.pedidoId} realizado! Valor: R$ ${responseData.valorTotal.toFixed(2)}`, 'sucesso');
            localStorage.removeItem('carrinho');
            localStorage.removeItem('enderecoEntregaSelecionado');
            localStorage.removeItem('pagamentoAtual');
            localStorage.removeItem('freteInfo');
            
            if (typeof window.atualizarContadorCarrinho === "function") { 
                 window.atualizarContadorCarrinho(); // Função do Carrinho.js
            }
            
            document.getElementById('resumoPedidoAtualContainer').innerHTML = 
                `<p class="no-history" style="text-align:center; padding: 20px; color: #00ff85;">
                    Seu pedido #${responseData.pedidoId} foi enviado com sucesso! <br> Você será redirecionado para a loja em breve.
                </p>`;
            btnConcluir.style.display = 'none'; 
            
            setTimeout(() => {
                window.location.href = '/'; 
            }, 4000); // Aumentar tempo para ler a mensagem
        } else {
            mostrarNotificacaoGlobal(`Erro: ${responseData.message || response.statusText}`, 'erro');
            btnConcluir.disabled = false;
            btnConcluir.innerHTML = '<i class="fas fa-check-circle"></i> CONCLUIR COMPRA';
            if(btnVoltar) btnVoltar.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Erro ao concluir compra:', error);
        mostrarNotificacaoGlobal('Erro de comunicação ao finalizar o pedido. Tente novamente.', 'erro');
        btnConcluir.disabled = false;
        btnConcluir.innerHTML = '<i class="fas fa-check-circle"></i> CONCLUIR COMPRA';
        if(btnVoltar) btnVoltar.style.display = 'inline-block';
    }
}

async function carregarPedidosRecentes() { 
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || !usuario.id) return;

    const container = document.getElementById('historicoComprasResumo'); 
    container.innerHTML = '<p>Carregando seus pedidos recentes...</p>';

    try {
        const response = await fetch(`/api/pedidos/cliente/${usuario.id}`);
        if (!response.ok) {
            if (response.status === 204) {
                container.innerHTML = '<p class="no-history">Nenhum pedido realizado ainda.</p>'; return;
            }
            throw new Error('Falha ao buscar pedidos');
        }
        const pedidosDoBanco = await response.json();
        
        container.innerHTML = '';
        if (pedidosDoBanco.length === 0) {
            container.innerHTML = '<p class="no-history">Nenhum pedido realizado ainda.</p>'; return;
        }

        const pedidosRecentes = pedidosDoBanco.slice(0, 3); 
        pedidosRecentes.forEach(pedido => container.appendChild(criarElementoPedido(pedido)));

    } catch (error) {
        console.error("Erro ao carregar pedidos recentes:", error);
        container.innerHTML = '<p class="no-history">Erro ao carregar pedidos recentes.</p>';
    }
}

async function carregarHistoricoCompleto() { 
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || !usuario.id) return;

    const container = document.getElementById('historicoCompras'); 
    container.innerHTML = '<p>Carregando histórico completo...</p>';

    try {
        const response = await fetch(`/api/pedidos/cliente/${usuario.id}`);
        if (!response.ok) {
            if (response.status === 204) {
                container.innerHTML = '<p class="no-history">Nenhum pedido realizado ainda.</p>'; return;
            }
            throw new Error('Falha ao buscar histórico de compras');
        }
        const pedidosDoBanco = await response.json();
        
        container.innerHTML = ''; 
        if (pedidosDoBanco.length === 0) {
            container.innerHTML = '<p class="no-history">Nenhum pedido realizado ainda.</p>'; return;
        }
        pedidosDoBanco.forEach(pedido => container.appendChild(criarElementoPedido(pedido)));
    } catch (error) {
        console.error("Erro ao carregar histórico completo:", error);
        container.innerHTML = '<p class="no-history">Erro ao carregar histórico de compras.</p>';
    }
}

function criarElementoPedido(pedido) { 
    const compraElement = document.createElement('div');
    compraElement.className = 'pedido-item';
    
    let statusClass, statusText;
    switch(pedido.statusPedido) { // Usa o nome do campo do PedidoResponseDTO
        case 'PAGO': statusClass = 'status-aprovado'; statusText = 'PAGAMENTO APROVADO'; break;
        case 'ENVIADO': statusClass = 'status-enviado'; statusText = 'ENVIADO'; break;
        case 'ENTREGUE': statusClass = 'status-entregue'; statusText = 'ENTREGUE'; break;
        case 'CANCELADO': statusClass = 'status-cancelado'; statusText = 'CANCELADO'; break;
        case 'AGUARDANDO_PAGAMENTO': 
        default: statusClass = 'status-aguardando'; statusText = 'AGUARDANDO PAGAMENTO';
    }
    
    // dataPedido no DTO é String formatada
    const dataFormatada = pedido.dataPedido; 
    
    compraElement.innerHTML = `
        <div class="pedido-header">
            <span class="pedido-id">Pedido #${pedido.id}</span>
            <span class="pedido-status ${statusClass}">${statusText}</span>
        </div>
        <div class="pedido-resumo">
             ${pedido.itens.slice(0, 2).map(item => `
                <div class="produto-item">
                    <img src="${item.imagemUrl || 'https://via.placeholder.com/50x50?text=Produto'}" class="produto-img" onerror="this.onerror=null;this.src='https://via.placeholder.com/50x50?text=Produto'">
                    <div class="produto-info">
                        <div class="produto-nome">${item.nomeProduto}</div>
                        <div class="produto-qtd">${item.quantidade}x R$ ${item.precoUnitario.toFixed(2)}</div>
                    </div>
                </div>
            `).join('')}
            ${pedido.itens.length > 2 ? `<p>+ ${pedido.itens.length - 2} item(s)</p>` : ''}
        </div>
        <div class="pedido-total">Total: R$ ${pedido.valorTotal.toFixed(2)}</div>
        <div class="pedido-data">Data: ${dataFormatada}</div>
        <button class="btn-detalhes" onclick="mostrarDetalhesPedidoBackend(${pedido.id})">
            <i class="fas fa-search"></i> VER DETALHES
        </button>
    `;
    return compraElement;
}

async function mostrarDetalhesPedidoBackend(pedidoId) {
    const modalContent = document.getElementById('detalhesPedidoConteudo');
    modalContent.innerHTML = "<p>Carregando detalhes do pedido...</p>";
    document.getElementById('detalhesModal').style.display = 'block';
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: "Erro ao buscar detalhes."}));
            throw new Error(errorData.message || 'Pedido não encontrado ou erro ao buscar detalhes.');
        }
        const pedido = await response.json(); 
        
        const dataFormatada = pedido.dataPedido; // Já formatada no DTO
        
        let statusClass, statusText;
        switch(pedido.statusPedido) {
            case 'PAGO': statusClass = 'status-aprovado'; statusText = 'PAGAMENTO APROVADO'; break;
            case 'ENVIADO': statusClass = 'status-enviado'; statusText = 'ENVIADO'; break;
            case 'ENTREGUE': statusClass = 'status-entregue'; statusText = 'ENTREGUE'; break;
            case 'CANCELADO': statusClass = 'status-cancelado'; statusText = 'CANCELADO'; break;
            case 'AGUARDANDO_PAGAMENTO': 
            default: statusClass = 'status-aguardando'; statusText = 'AGUARDANDO PAGAMENTO';
        }
        
        const produtosHTML = pedido.itens.map(item => `
            <div class="produto-item">
                <img src="${item.imagemUrl || 'https://via.placeholder.com/60x60?text=Produto'}" class="produto-img" onerror="this.onerror=null;this.src='https://via.placeholder.com/60x60?text=Produto'">
                <div class="produto-info">
                    <div class="produto-nome">${item.nomeProduto}</div>
                    <div class="produto-preco">Preço unitário: R$ ${item.precoUnitario.toFixed(2)}</div>
                    <div class="produto-qtd">Quantidade: ${item.quantidade}</div>
                </div>
                <div class="produto-total">R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</div>
            </div>
        `).join('');
        
        const endereco = pedido.enderecoEntrega;
        const enderecoHTML = `
            <p>${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
            <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
            <p>CEP: ${endereco.cep}</p> 
        `;
        
        let pagamentoHTML = `<p><strong>Tipo:</strong> ${pedido.formaPagamento.replace('_', ' ')}</p>`;
        if (pedido.detalhesPagamento) {
            pagamentoHTML += `<p><strong>Detalhes:</strong> ${pedido.detalhesPagamento}</p>`;
        }
        
        let subtotalItens = 0;
        pedido.itens.forEach(item => subtotalItens += item.precoUnitario * item.quantidade);

        modalContent.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-id">Pedido #${pedido.id}</span>
                <span class="pedido-status ${statusClass}">${statusText}</span>
            </div>
            <div class="pedido-data">Data do pedido: ${dataFormatada}</div>
             <div class="detalhes-pedido" style="font-size:10px;">
                <h3><i class="fas fa-user"></i> Cliente</h3>
                <p>${pedido.nomeCliente || 'Não informado'}</p>

                <h3><i class="fas fa-box-open"></i> PRODUTOS</h3>
                <div class="produtos-lista">${produtosHTML}</div>
                
                <h3><i class="fas fa-map-marker-alt"></i> ENDEREÇO DE ENTREGA</h3>
                <div class="info-entrega">${enderecoHTML}</div>
                
                <h3><i class="fas fa-credit-card"></i> FORMA DE PAGAMENTO</h3>
                <div class="info-pagamento">${pagamentoHTML}</div>
                
                <h3><i class="fas fa-receipt"></i> RESUMO FINANCEIRO</h3>
                <div class="resumo-valores">
                    <div class="valor-item"><span>Subtotal dos Produtos:</span> <span>R$ ${subtotalItens.toFixed(2)}</span></div>
                    <div class="valor-item"><span>Frete:</span> <span>R$ ${pedido.valorFrete ? pedido.valorFrete.toFixed(2) : '0.00'}</span></div>
                    <div class="valor-item valor-total"><span>TOTAL DO PEDIDO:</span> <span>R$ ${pedido.valorTotal.toFixed(2)}</span></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Erro ao buscar detalhes do pedido:", error);
        modalContent.innerHTML = `<p>Erro ao carregar detalhes do pedido: ${error.message}</p>`;
        mostrarNotificacaoGlobal('Erro ao carregar detalhes do pedido.', 'erro');
    }
}

function abrirModalHistorico() {
    document.getElementById('historicoModal').style.display = 'block';
    carregarHistoricoCompleto(); 
}

function fecharModalHistorico() {
    document.getElementById('historicoModal').style.display = 'none';
}

function fecharModalDetalhes() {
    document.getElementById('detalhesModal').style.display = 'none';
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
    const detalhesModal = document.getElementById('detalhesModal');
    const historicoModal = document.getElementById('historicoModal');
    if (event.target === detalhesModal) fecharModalDetalhes();
    if (event.target === historicoModal) fecharModalHistorico();
};