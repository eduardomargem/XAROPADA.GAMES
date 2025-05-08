// Array de produtos carregado do localStorage
let produtos = [];

// Carregar produtos do localStorage
function loadProductsFromLocalStorage() {
  const storedProducts = localStorage.getItem('produtos');
  if (storedProducts) {
    produtos = JSON.parse(storedProducts).filter(p => p.status === 'Ativo');
  }
}

// Carregar produtos ao iniciar
loadProductsFromLocalStorage();

// Variáveis globais
let carrinho = [];
let freteSelecionado = 0;
let cepCalculado = '';
let carrosselInterval;
let desconto = 0;

// Elementos DOM
const elements = {
    cartIcon: document.getElementById('cartIcon'),
    cartModal: document.getElementById('cartModal'),
    closeModal: document.getElementById('closeModal'),
    productsGrid: document.getElementById('productsGrid'),
    cartItems: document.getElementById('cartItems'),
    cepInput: document.getElementById('cepInput'),
    calcFreteBtn: document.getElementById('calcFreteBtn'),
    freteOptions: document.getElementById('freteOptions'),
    continueBtn: document.getElementById('continueBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    subtotalValue: document.getElementById('subtotalValue'),
    freteValue: document.getElementById('freteValue'),
    totalValue: document.getElementById('totalValue'),
    cartCount: document.getElementById('cartCount'),
    cepInfo: document.getElementById('cepInfo'),
    productModal: document.getElementById('productModal'),
    productModalBody: document.getElementById('productModalBody'),
    closeProductModal: document.getElementById('closeProductModal'),
    cupomInput: document.getElementById('cupomInput'),
    aplicarCupomBtn: document.getElementById('aplicarCupomBtn'),
    descontoValue: document.getElementById('descontoValue'),
    notificationContainer: document.createElement('div')
};

// Configuração do container de notificação
elements.notificationContainer.className = 'notification-container';
document.body.appendChild(elements.notificationContainer);

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;
    
    elements.notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Função para validar CEP
function validarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return /^[0-9]{8}$/.test(cepLimpo);
}

// Função para gerar estrelas de avaliação
function gerarEstrelas(avaliacao) {
    const avaliacaoNum = parseFloat(avaliacao) || 0;
    const estrelasCheias = Math.floor(avaliacaoNum);
    const temMeiaEstrela = avaliacaoNum % 1 >= 0.5;
    const estrelasVazias = 5 - estrelasCheias - (temMeiaEstrela ? 1 : 0);
    
    let html = '';
    for (let i = 0; i < estrelasCheias; i++) html += '<i class="fas fa-star"></i>';
    if (temMeiaEstrela) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < estrelasVazias; i++) html += '<i class="far fa-star"></i>';
    return html;
}

// Funções auxiliares para detalhes do produto
function getDetailIcon(key) {
    const icons = {
        plataforma: 'gamepad',
        genero: 'tags',
        classificacao: 'certificate',
        lancamento: 'calendar-alt',
        desenvolvedor: 'building'
    };
    return icons[key] || 'info-circle';
}

function formatDetailKey(key) {
    const names = {
        plataforma: 'Plataforma',
        genero: 'Gênero',
        classificacao: 'Classificação',
        lancamento: 'Lançamento',
        desenvolvedor: 'Desenvolvedor'
    };
    return names[key] || key;
}

// Função para gerar os produtos na página
function gerarProdutos() {
    elements.productsGrid.innerHTML = '';
    
    // Mostra skeletons enquanto carrega
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'product-card skeleton';
        elements.productsGrid.appendChild(skeleton);
    }
    
    // Simula carregamento
    setTimeout(() => {
        elements.productsGrid.innerHTML = '';
        
        produtos.forEach(produto => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const imageUrl = produto.imagens?.[0] || 'https://via.placeholder.com/300x200?text=Imagem+Indispon%C3%ADvel';
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${imageUrl}" 
                         alt="${produto.nome}" 
                         loading="lazy"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Imagem+Indispon%C3%ADvel'">
                </div>
                <div class="product-info">
                    <h3>${produto.nome}</h3>
                    <p class="product-description">${produto.descricao}</p>
                    <div class="product-price">
                        <span class="price">R$ ${produto.valor.toFixed(2)}</span>
                        <span class="installment">ou 10x de R$ ${(produto.valor/10).toFixed(2)}</span>
                    </div>
                    <div class="product-stock">Estoque: ${produto.quantidade}</div>
                    <div class="product-rating">${gerarEstrelas(produto.avaliacao || 0)}</div>
                    <button class="add-to-cart" data-id="${produto.codigo}">
                        <i class="fas fa-cart-plus"></i> Adicionar
                    </button>
                </div>
            `;
            
            const addButton = productCard.querySelector('.add-to-cart');
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                adicionarAoCarrinho(produto);
            });
            
            productCard.addEventListener('click', (e) => {
                // Verifica se o clique não foi no botão de adicionar ao carrinho
                if (!e.target.closest('.add-to-cart')) {
                    abrirModalProduto(produto);
                }
            });
            
            elements.productsGrid.appendChild(productCard);
        });
    }, 1000);
}

// Função para abrir o modal de detalhes do produto
function abrirModalProduto(produto) {
    clearInterval(carrosselInterval);
    
    let currentImageIndex = 0;
    let imagensProduto = produto.imagens?.length > 0 ? produto.imagens : ['https://via.placeholder.com/500x300?text=Imagem+Indispon%C3%ADvel'];
    
    // Garante que a primeira imagem existe
    if (imagensProduto.length > 0 && !imagensProduto[0]) {
        imagensProduto[0] = 'https://via.placeholder.com/500x300?text=Imagem+Indispon%C3%ADvel';
    }

    // Cria o HTML do modal
    elements.productModalBody.innerHTML = `
        <div class="product-modal-top">
            <div class="carrossel-container">
                <div class="carrossel">
                    ${imagensProduto.map((img, index) => `
                        <div class="carrossel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${img}" 
                                 class="carrossel-img"
                                 alt="${produto.nome} - Imagem ${index + 1}"
                                 draggable="false"
                                 onerror="this.onerror=null;this.src='https://via.placeholder.com/500x300?text=Imagem+Indispon%C3%ADvel'">
                        </div>
                    `).join('')}
                </div>
                <button class="carrossel-prev" aria-label="Imagem anterior">&lt;</button>
                <button class="carrossel-next" aria-label="Próxima imagem">&gt;</button>
                <div class="carrossel-nav">
                    ${imagensProduto.map((_, index) => `
                        <div class="carrossel-indicator ${index === 0 ? 'active' : ''}" 
                             data-index="${index}"></div>
                    `).join('')}
                </div>
            </div>
            <div class="product-modal-info">
                <h2 class="product-modal-title">${produto.nome}</h2>
                <div class="product-modal-rating">
                    ${gerarEstrelas(produto.avaliacao || 0)}
                    <span>(${(produto.avaliacao || 0).toFixed(1)})</span>
                </div>
                <div class="product-modal-price">R$ ${produto.valor.toFixed(2)}</div>
                <div class="product-modal-stock">Estoque: ${produto.quantidade}</div>
                <p class="product-modal-description">${produto.descricao}</p>
            </div>
        </div>
        <div class="product-details-grid">
            ${Object.entries(produto.detalhes || {}).map(([key, value]) => `
                <div class="detail-item">
                    <i class="fas fa-${getDetailIcon(key)} detail-icon"></i>
                    <div>
                        <strong>${formatDetailKey(key)}:</strong>
                        <span>${value}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="modal-add-to-cart" data-id="${produto.codigo}">
            <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
        </button>
    `;

    // Configura o carrossel
    const carrossel = elements.productModalBody.querySelector('.carrossel');
    const slides = elements.productModalBody.querySelectorAll('.carrossel-slide');
    const indicators = elements.productModalBody.querySelectorAll('.carrossel-indicator');
    const prevBtn = elements.productModalBody.querySelector('.carrossel-prev');
    const nextBtn = elements.productModalBody.querySelector('.carrossel-next');

    if (carrossel && slides.length > 0) {
        carrossel.style.width = `${imagensProduto.length * 100}%`;
        slides.forEach(slide => {
            slide.style.width = `${100 / imagensProduto.length}%`;
        });

        // Função para mudar slide
        const goToSlide = (index) => {
            if (index >= imagensProduto.length) index = 0;
            if (index < 0) index = imagensProduto.length - 1;
            
            currentImageIndex = index;
            const translateValue = -currentImageIndex * (100 / imagensProduto.length);
            carrossel.style.transform = `translateX(${translateValue}%)`;
            
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === currentImageIndex);
            });
            
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentImageIndex);
            });
        };

        // Event listeners para navegação
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(carrosselInterval);
                goToSlide(currentImageIndex + 1);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(carrosselInterval);
                goToSlide(currentImageIndex - 1);
            });
        }

        // Event listeners para indicadores
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                clearInterval(carrosselInterval);
                const index = parseInt(e.target.getAttribute('data-index'));
                goToSlide(index);
            });
        });

        // Inicia o carrossel automático
        carrosselInterval = setInterval(() => {
            goToSlide(currentImageIndex + 1);
        }, 5000);
    }

    // Event listener para botão de adicionar ao carrinho
    const addButton = elements.productModalBody.querySelector('.modal-add-to-cart');
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            adicionarAoCarrinho(produto);
            fecharModalProduto();
        });
    }
    
    // Mostra o modal
    elements.productModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Função para fechar o modal de produto
function fecharModalProduto() {
    clearInterval(carrosselInterval);
    elements.productModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
    if (!produto || !produto.codigo) return;

    // Verifica se há estoque disponível
    if (produto.quantidade <= 0) {
        mostrarNotificacao('Produto sem estoque disponível!', 'erro');
        return;
    }

    const itemExistente = carrinho.find(item => item.codigo === produto.codigo);
    
    if (itemExistente) {
        // Verifica se não excede o estoque
        if (itemExistente.quantidade >= produto.quantidade) {
            mostrarNotificacao('Quantidade máxima em estoque atingida!', 'erro');
            return;
        }
        itemExistente.quantidade = (itemExistente.quantidade || 0) + 1;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }
    
    atualizarCarrinho();
    
    // Animação do ícone do carrinho
    const cartCount = elements.cartCount;
    cartCount.style.transition = 'all 0.3s ease';
    cartCount.style.transform = 'scale(1.5) rotate(10deg)';
    
    setTimeout(() => {
        cartCount.style.transform = 'scale(1) rotate(0)';
    }, 300);
    
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
}

// Função para atualizar o carrinho
function atualizarCarrinho() {
    elements.cartItems.innerHTML = '';
    let subtotal = 0;

    carrinho.forEach(item => {
        const preco = typeof item.valor === 'number' ? item.valor : 0;
        const quantidade = typeof item.quantidade === 'number' ? item.quantidade : 0;
        subtotal += preco * quantidade;
        
        const imageUrl = item.imagens?.[0] || 'https://via.placeholder.com/300x200?text=Imagem+Indispon%C3%ADvel';
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${imageUrl}" 
                     alt="${item.nome || 'Produto sem nome'}" 
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=Imagem+Indispon%C3%ADvel'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.nome || 'Produto sem nome'}</div>
                <div class="cart-item-price">R$ ${preco.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" data-id="${item.codigo}">-</button>
                    <span class="quantity-value">${quantidade}</span>
                    <button class="quantity-btn increase" data-id="${item.codigo}">+</button>
                    <button class="remove-btn" data-id="${item.codigo}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        elements.cartItems.appendChild(itemElement);
    });

    // Calcula totais com desconto
    const valorDesconto = subtotal * desconto;
    const total = subtotal - valorDesconto + freteSelecionado;

    // Atualiza totais na interface
    elements.subtotalValue.textContent = `R$ ${subtotal.toFixed(2)}`;
    elements.freteValue.textContent = freteSelecionado > 0 ? `R$ ${freteSelecionado.toFixed(2)}` : 'R$ 0,00';
    
    if (elements.descontoValue) {
        elements.descontoValue.textContent = valorDesconto > 0 ? `- R$ ${valorDesconto.toFixed(2)}` : 'R$ 0,00';
    }
    
    elements.totalValue.textContent = `R$ ${total.toFixed(2)}`;
    elements.cartCount.textContent = carrinho.reduce((total, item) => total + (item.quantidade || 0), 0);

    // Mostra/Esconde seção de frete
    elements.freteOptions.style.display = carrinho.length > 0 ? 'block' : 'none';
    if (carrinho.length === 0) {
        elements.cepInput.value = '';
        cepCalculado = '';
        elements.cepInfo.textContent = '';
        freteSelecionado = 0;
        desconto = 0;
    }

    // Adiciona eventos aos botões
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id) alterarQuantidade(id, -1);
        });
    });

    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id) alterarQuantidade(id, 1);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id) removerItem(id);
        });
    });

    // Salva no localStorage
    try {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        localStorage.setItem('frete', freteSelecionado.toString());
        localStorage.setItem('desconto', desconto.toString());
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
        mostrarNotificacao("Erro ao salvar carrinho. Seus itens podem não ser mantidos.", 'erro');
    }
}

// Funções auxiliares do carrinho
function alterarQuantidade(id, alteracao) {
    const index = carrinho.findIndex(item => item.codigo === id);
    if (index === -1) return;

    const novaQuantidade = (carrinho[index].quantidade || 0) + alteracao;
    
    if (novaQuantidade > 0) {
        // Verifica se não excede o estoque
        const produtoOriginal = produtos.find(p => p.codigo === id);
        if (produtoOriginal && novaQuantidade > produtoOriginal.quantidade) {
            mostrarNotificacao('Quantidade máxima em estoque atingida!', 'erro');
            return;
        }
        
        carrinho[index].quantidade = novaQuantidade;
    } else {
        carrinho.splice(index, 1);
    }
    
    atualizarCarrinho();
}

function removerItem(id) {
    const item = carrinho.find(item => item.codigo === id);
    if (item) {
        carrinho = carrinho.filter(item => item.codigo !== id);
        mostrarNotificacao(`${item.nome} removido do carrinho!`);
        atualizarCarrinho();
    }
}

// Funções de modal do carrinho
function abrirModal() {
    elements.cartModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    elements.cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Funções de frete
function calcularFrete() {
    const cep = elements.cepInput.value.trim();
    
    if (!validarCEP(cep)) {
        elements.cepInput.classList.add('error');
        elements.cepInfo.textContent = 'CEP inválido! Digite 8 números.';
        elements.cepInfo.style.color = 'red';
        return;
    }
    
    elements.calcFreteBtn.disabled = true;
    elements.calcFreteBtn.textContent = 'Calculando...';
    elements.cepInput.classList.remove('error');
    
    // Simula cálculo do frete com API
    setTimeout(() => {
        cepCalculado = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
        
        elements.freteOptions.style.display = 'block';
        elements.calcFreteBtn.disabled = false;
        elements.calcFreteBtn.textContent = 'Calcular';
        elements.cepInfo.textContent = `Frete para CEP: ${cepCalculado}`;
        elements.cepInfo.style.color = '';
        
        selecionarFrete(15);
    }, 1000);
}

function selecionarFrete(valor) {
    freteSelecionado = parseFloat(valor) || 0;
    
    document.querySelectorAll('.frete-option').forEach(option => {
        const optionValue = parseFloat(option.getAttribute('data-value')) || 0;
        const radioInput = option.querySelector('input[type="radio"]');
        
        if (optionValue === valor) {
            option.classList.add('selected');
            if (radioInput) radioInput.checked = true;
        } else {
            option.classList.remove('selected');
            if (radioInput) radioInput.checked = false;
        }
    });
    
    atualizarCarrinho();
}

// Função para aplicar cupom de desconto
function aplicarCupom() {
    const cupom = elements.cupomInput ? elements.cupomInput.value.trim() : '';
    
    if (cupom === "XAROPADA10") {
        desconto = 0.1; // 10% de desconto
        mostrarNotificacao("Cupom aplicado com sucesso! 10% de desconto.");
        atualizarCarrinho();
    } else if (cupom === "XAROPADA20") {
        desconto = 0.2; // 20% de desconto
        mostrarNotificacao("Cupom aplicado com sucesso! 20% de desconto.");
        atualizarCarrinho();
    } else if (cupom) {
        mostrarNotificacao("Cupom inválido!", 'erro');
    }
}

// Função para finalizar compra
function finalizarCompra() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado) {
        mostrarNotificacao('Por favor, faça login para finalizar sua compra!', 'erro');
        window.location.href = 'index.html';
        return;
    }
    
    if (carrinho.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!', 'erro');
        return;
    }
    
    if (freteSelecionado === 0) {
        mostrarNotificacao('Por favor, calcule e selecione uma opção de frete.', 'erro');
        return;
    }
    
    // Verifica se o usuário tem endereço e forma de pagamento cadastrados
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
    const cliente = clientes.find(c => c.email === usuarioLogado.email);
    
    const enderecos = cliente?.dadosCompletos?.enderecosEntrega || cliente?.enderecosEntrega || [];
    const enderecoPadrao = enderecos.find(e => e.padrao);
    
    const formasPagamento = cliente?.dadosCompletos?.formasPagamento || [];
    const pagamentoPadrao = formasPagamento.find(p => p.padrao);
    
    if (!enderecoPadrao || !pagamentoPadrao) {
        mostrarNotificacao('Por favor, verifique seu endereço e forma de pagamento padrão!', 'erro');
        return;
    }
    
    const subtotal = carrinho.reduce((sum, item) => sum + ((item.valor || 0) * (item.quantidade || 0)), 0);
    const valorDesconto = subtotal * desconto;
    const total = subtotal - valorDesconto + freteSelecionado;
    
    // Exibe resumo da compra
    const resumo = `
        <div class="resumo-compra">
            <h3>Resumo da Compra</h3>
            <div class="resumo-item">
                <span>Itens:</span>
                <span>${carrinho.reduce((sum, item) => sum + (item.quantidade || 0), 0)}</span>
            </div>
            <div class="resumo-item">
                <span>Subtotal:</span>
                <span>R$ ${subtotal.toFixed(2)}</span>
            </div>
            ${desconto > 0 ? `
            <div class="resumo-item desconto">
                <span>Desconto:</span>
                <span>- R$ ${valorDesconto.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="resumo-item">
                <span>Frete:</span>
                <span>R$ ${freteSelecionado.toFixed(2)}</span>
            </div>
            <div class="resumo-item total">
                <span>Total:</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
            <div class="resumo-item">
                <span>CEP de entrega:</span>
                <span>${cepCalculado}</span>
            </div>
            <div class="resumo-item">
                <span>Endereço:</span>
                <span>${enderecoPadrao.logradouro}, ${enderecoPadrao.numero}${enderecoPadrao.complemento ? ' - ' + enderecoPadrao.complemento : ''}, ${enderecoPadrao.bairro}, ${enderecoPadrao.cidade} - ${enderecoPadrao.uf}</span>
            </div>
            <div class="resumo-item">
                <span>Forma de pagamento:</span>
                <span>${pagamentoPadrao.tipo === 'credito' ? 'Cartão de Crédito ****' + pagamentoPadrao.ultimosDigitos + ' (' + pagamentoPadrao.parcelas + 'x)' : 'Boleto Bancário'}</span>
            </div>
            <div class="resumo-item">
                <span>Cliente:</span>
                <span>${usuarioLogado.nome}</span>
            </div>
            <button id="confirmarCompra">Confirmar Compra</button>
                <button onclick="window.location.href='perfil.html'">Voltar</button>
        </div>
    `;
    
    // Substitui o conteúdo do modal pelo resumo
    elements.cartItems.innerHTML = resumo;
    elements.freteOptions.style.display = 'none';
    elements.continueBtn.style.display = 'none';
    
    // Adiciona evento ao botão de confirmação
    document.getElementById('confirmarCompra')?.addEventListener('click', () => {
        mostrarNotificacao('Compra finalizada com sucesso! Obrigado por comprar conosco.');
        
        // Limpa o carrinho
        carrinho = [];
        freteSelecionado = 0;
        cepCalculado = '';
        desconto = 0;
        elements.cepInput.value = '';
        elements.freteOptions.style.display = 'none';
        elements.cepInfo.textContent = '';
        
        if (elements.cupomInput) elements.cupomInput.value = '';
        
        // Restaura o carrinho vazio
        setTimeout(() => {
            atualizarCarrinho();
            elements.continueBtn.style.display = 'block';
            fecharModal();
        }, 2000);
        
        // Limpa localStorage
        try {
            localStorage.removeItem('carrinho');
            localStorage.removeItem('frete');
            localStorage.removeItem('desconto');
        } catch (e) {
            console.error('Erro ao limpar localStorage:', e);
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    elements.cartIcon.addEventListener('click', abrirModal);
    elements.closeModal.addEventListener('click', fecharModal);
    elements.continueBtn.addEventListener('click', fecharModal);
    elements.calcFreteBtn.addEventListener('click', calcularFrete);
    elements.checkoutBtn.addEventListener('click', finalizarCompra);
    elements.closeProductModal.addEventListener('click', fecharModalProduto);
    
    if (elements.aplicarCupomBtn) {
        elements.aplicarCupomBtn.addEventListener('click', aplicarCupom);
    }
    
    elements.cartModal.addEventListener('click', (e) => {
        if (e.target === elements.cartModal) fecharModal();
    });
    
    elements.productModal.addEventListener('click', (e) => {
        if (e.target === elements.productModal) fecharModalProduto();
    });
    
    document.querySelectorAll('.frete-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const valor = parseFloat(option.getAttribute('data-value')) || 0;
            selecionarFrete(valor);
        });
    });
    
    elements.cepInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value.substring(0, 9);
    });

    // Carrega dados salvos
    try {
        const carrinhoSalvo = localStorage.getItem('carrinho');
        const freteSalvo = localStorage.getItem('frete');
        const descontoSalvo = localStorage.getItem('desconto');
        
        if (carrinhoSalvo) {
            carrinho = JSON.parse(carrinhoSalvo);
            carrinho = carrinho.filter(item => item && item.codigo && item.quantidade > 0);
        }
        
        if (freteSalvo) {
            freteSelecionado = parseFloat(freteSalvo);
        }
        
        if (descontoSalvo) {
            desconto = parseFloat(descontoSalvo);
        }
    } catch (e) {
        console.error('Erro ao carregar dados:', e);
        carrinho = [];
        freteSelecionado = 0;
        desconto = 0;
    }

    // Inicializa a interface
    gerarProdutos();
    atualizarCarrinho();
    elements.freteOptions.style.display = 'none';
});