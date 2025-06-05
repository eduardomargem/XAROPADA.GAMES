document.addEventListener("DOMContentLoaded", function() {
    // Verifica se o usuário está logado
    if (!localStorage.getItem('usuarioLogado')) {
        window.location.href = '/index';
        return;
    }

    console.log("Conteúdo do localStorage antes de carregar:");
    console.log("enderecoSelecionado:", localStorage.getItem('enderecoSelecionado'));
    console.log("formaPagamento:", localStorage.getItem('formaPagamento'));
    
    // Carrega os dados do carrinho e do pedido
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let enderecoEntrega = null;
    let formaPagamento = null;
    
    try {
        enderecoEntrega = JSON.parse(localStorage.getItem('enderecoSelecionado'));
    } catch (e) {
        console.error("Erro ao parsear enderecoSelecionado:", e);
    }
    
    try {
        formaPagamento = JSON.parse(localStorage.getItem('formaPagamento'));
    } catch (e) {
        console.error("Erro ao parsear formaPagamento:", e);
    }
    
    const frete = parseFloat(localStorage.getItem('frete')) || 0;

    // Calcula totais
    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const total = subtotal + frete;

    // Exibe os produtos
    const produtosLista = document.getElementById('produtosLista');
    produtosLista.innerHTML = carrinho.map(item => `
        <div class="product-item">
            <img src="${item.imagem}" alt="${item.nome}" class="product-image"
                 onerror="this.onerror=null;this.src='https://via.placeholder.com/60x60?text=Produto'">
            <div class="product-info">
                <div class="product-name">${item.nome}</div>
                <div class="product-price">Preço unitário: R$ ${item.preco.toFixed(2)}</div>
                <div class="product-quantity">Quantidade: ${item.quantidade}</div>
                <div class="product-total">Total: R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
            </div>
        </div>
    `).join('');

    // Exibe o endereço de entrega
    const enderecoElement = document.getElementById('enderecoEntrega');
    if (enderecoEntrega && typeof enderecoEntrega === 'object') {
    // Verifica se os campos mínimos existem
    if (enderecoEntrega.logradouro && enderecoEntrega.numero && enderecoEntrega.bairro && 
        enderecoEntrega.cidade && enderecoEntrega.uf && enderecoEntrega.cep) {
        enderecoElement.innerHTML = `
            <p>${enderecoEntrega.logradouro}, ${enderecoEntrega.numero}${enderecoEntrega.complemento ? ' - ' + enderecoEntrega.complemento : ''}</p>
            <p>${enderecoEntrega.bairro}, ${enderecoEntrega.cidade} - ${enderecoEntrega.uf}</p>
            <p>CEP: ${enderecoEntrega.cep}</p>
        `;
    } else {
        console.warn("Endereço incompleto no localStorage:", enderecoEntrega);
        enderecoElement.innerHTML = '<p class="error">Endereço incompleto</p>';
    }
    } else {
        console.warn("Nenhum endereço encontrado ou formato inválido");
        enderecoElement.innerHTML = '<p class="error">Nenhum endereço selecionado</p>';
    }

    // Exibe a forma de pagamento
    const pagamentoElement = document.getElementById('formaPagamento');
    if (formaPagamento && typeof formaPagamento === 'object' && formaPagamento.tipo) {
    if (formaPagamento.tipo === 'boleto') {
        pagamentoElement.innerHTML = '<p>Boleto Bancário</p>';
    } else if (formaPagamento.tipo === 'cartao') {
        // Verifica campos mínimos do cartão
        if (formaPagamento.nomeCartao && formaPagamento.numeroCartao && formaPagamento.validade) {
            pagamentoElement.innerHTML = `
                <p>Cartão de Crédito</p>
                <p>${formaPagamento.nomeCartao}</p>
                <p>Terminado em ${formaPagamento.numeroCartao.slice(-4)}</p>
                <p>Validade: ${formaPagamento.validade}</p>
                ${formaPagamento.parcelas ? `<p>Parcelas: ${formaPagamento.parcelas}x de R$ ${(total / formaPagamento.parcelas).toFixed(2)}</p>` : ''}
            `;
        } else {
            console.warn("Dados do cartão incompletos:", formaPagamento);
            pagamentoElement.innerHTML = '<p class="error">Dados do cartão incompletos</p>';
        }
    }
    } else {
        console.warn("Nenhuma forma de pagamento encontrada ou formato inválido");
        pagamentoElement.innerHTML = '<p class="error">Nenhuma forma de pagamento selecionada</p>';
    }

    // Exibe os valores
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('frete').textContent = `R$ ${frete.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;

    // Configura o botão de concluir compra
    document.getElementById('btnConcluirCompra').addEventListener('click', concluirPedido);

    // Configura o botão de fechar modal
    document.getElementById('btnCloseModal').addEventListener('click', function() {
        document.getElementById('confirmModal').style.display = 'none';
        window.location.href = '/';
    });
});

async function concluirPedido() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const enderecoEntrega = JSON.parse(localStorage.getItem('enderecoSelecionado'));
    const formaPagamento = JSON.parse(localStorage.getItem('formaPagamento'));
    const frete = parseFloat(localStorage.getItem('frete')) || 0;

    if (!enderecoEntrega) {
        alert('Por favor, selecione um endereço de entrega');
        return;
    }

    if (!formaPagamento) {
        alert('Por favor, selecione uma forma de pagamento');
        return;
    }

    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const total = subtotal + frete;

    // Prepara os itens do pedido
    const itensPedido = carrinho.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade,
        precoUnitario: item.preco
    }));

    // Prepara os dados de pagamento
    const dadosPagamento = {
        tipo: formaPagamento.tipo,
        nomeCartao: formaPagamento.nomeCartao,
        numeroCartao: formaPagamento.numeroCartao,
        validade: formaPagamento.validade,
        cvv: formaPagamento.cvv,
        parcelas: formaPagamento.parcelas
    };

    // Cria o objeto do pedido para enviar ao backend
    const pedidoRequest = {
        clienteId: usuario.id,
        enderecoEntregaId: enderecoEntrega.id,
        itens: itensPedido,
        valorTotal: total,
        valorFrete: frete,
        metodoPagamento: formaPagamento.tipo === 'cartao' ? 'CARTAO_CREDITO' : 'BOLETO',
        dadosPagamento: dadosPagamento
    };

    try {
        // Envia o pedido para o backend
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(pedidoRequest)
        });

        if (response.ok) {
            const pedido = await response.json();
            
            // Exibe mensagem de sucesso
            const modalContent = document.getElementById('confirmContent');
            modalContent.innerHTML = `
                <h3><i class="fas fa-check-circle success-icon"></i> PEDIDO REALIZADO COM SUCESSO!</h3>
                <p>Número do pedido: <strong>${pedido.numeroPedido}</strong></p>
                <p>Valor total: <strong>R$ ${total.toFixed(2)}</strong></p>
                <p>Status: <strong>Aguardando pagamento</strong></p>
                <p>Você receberá um e-mail com os detalhes do pedido.</p>
            `;
            
            // Limpa o carrinho
            localStorage.removeItem('carrinho');
            localStorage.removeItem('enderecoSelecionado');
            localStorage.removeItem('formaPagamento');
            localStorage.removeItem('frete');
            
            // Mostra o modal
            document.getElementById('confirmModal').style.display = 'block';
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao processar pedido');
        }
    } catch (error) {
        const modalContent = document.getElementById('confirmContent');
        modalContent.innerHTML = `
            <h3><i class="fas fa-exclamation-circle error-icon"></i> ERRO AO PROCESSAR PEDIDO</h3>
            <p>${error.message}</p>
            <p>Por favor, tente novamente ou entre em contato com o suporte.</p>
        `;
        document.getElementById('confirmModal').style.display = 'block';
    }
}