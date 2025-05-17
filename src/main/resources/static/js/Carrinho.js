const apiUrl = 'http://localhost:8080'; // URL base da sua API
let produtos = []; // Será preenchido dinamicamente
let carrosselInterval;

// Elementos DOM
const elements = {
    productsGrid: document.getElementById('productsGrid'),
    productModal: document.getElementById('productModal'),
    productModalBody: document.getElementById('productModalBody'),
    closeProductModal: document.getElementById('closeProductModal'),
    cartModal: document.getElementById('cartModal'),
    cartItems: document.getElementById('cartItems'),
    closeModal: document.getElementById('closeModal'),
    continueBtn: document.getElementById('continueBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    cartCount: document.getElementById('cartCount'),
    subtotalValue: document.getElementById('subtotalValue'),
    freteValue: document.getElementById('freteValue'),
    totalValue: document.getElementById('totalValue'),
    cepInput: document.getElementById('cepInput'),
    calcFreteBtn: document.getElementById('calcFreteBtn'),
    cepInfo: document.getElementById('cepInfo'),
    freteOptions: document.getElementById('freteOptions'),
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

// Função para buscar produtos da API
async function fetchProdutos() {
    try {
        showLoading(true);
        const response = await fetch(`${apiUrl}/produtos`);
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }
        produtos = await response.json();
        console.log('Produtos carregados:', produtos);
        gerarProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        mostrarNotificacao('Erro ao carregar produtos. Tente novamente.', 'erro');
        elements.productsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Não foi possível carregar os produtos</p>
                <button onclick="fetchProdutos()">Tentar novamente</button>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// Função para mostrar skeletons de loading
function showLoading(show) {
    if (show) {
        elements.productsGrid.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'product-card skeleton';
            elements.productsGrid.appendChild(skeleton);
        }
    }
}

// Função para gerar os cards de produtos
function gerarProdutos() {
    elements.productsGrid.innerHTML = '';
    
    if (produtos.length === 0) {
        elements.productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>Nenhum produto disponível no momento</p>
            </div>
        `;
        return;
    }
    
    // Filtra apenas produtos ativos (bo_status = 1)
    const produtosAtivos = produtos.filter(produto => produto.bo_status === 1);
    
    produtosAtivos.forEach(produto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Obtém a primeira imagem do produto ou usa placeholder
        const imagemPrincipal = produto.imagens && produto.imagens.length > 0 ? 
            `${apiUrl}/imagens/${produto.imagens[0].id}` : 
            'https://static.thenounproject.com/png/1554489-200.png';
        
        const preco = produto.preco ? parseFloat(produto.preco) : 0;
        const nome = produto.nome || 'Produto sem nome';
        const descricaoResumida = produto.descricao ? 
            produto.descricao.substring(0, 100) + (produto.descricao.length > 100 ? '...' : '') : 
            'Descrição não disponível';
            
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imagemPrincipal}" 
                    alt="${nome}" 
                    loading="lazy"
                    onerror="this.onerror=null;this.src='https://static.thenounproject.com/png/1554489-200.png'">
                ${produto.quantidade === 0 ? `<span class="out-of-stock">ESGOTADO</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${nome}</h3>
                <p class="product-description">${descricaoResumida}</p>
                <div class="product-price">
                    <span class="price">R$ ${preco.toFixed(2)}</span>
                    <span class="installment">ou 10x de R$ ${(preco/10).toFixed(2)}</span>
                </div>
                <div class="product-actions">
                    <button class="details-btn" data-id="${produto.id}">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                    <button class="add-to-cart" data-id="${produto.id}" 
                        ${produto.quantidade === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Evento para o botão de detalhes
        const detailsBtn = productCard.querySelector('.details-btn');
        detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalProduto(produto.id);
        });
        
        // Evento para o botão de adicionar ao carrinho
        const addButton = productCard.querySelector('.add-to-cart');
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            adicionarAoCarrinho(produto);
        });
        
        // Evento para clicar no card (abre detalhes)
        productCard.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart') && !e.target.closest('.details-btn')) {
                abrirModalProduto(produto.id);
            }
        });
        
        elements.productsGrid.appendChild(productCard);
    });
}

// Função para buscar detalhes completos de um produto
async function buscarDetalhesProduto(produtoId) {
    try {
        const response = await fetch(`${apiUrl}/produtos/${produtoId}`);
        if (!response.ok) {
            throw new Error('Produto não encontrado');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        mostrarNotificacao('Erro ao carregar detalhes do produto', 'erro');
        return null;
    }
}

// Função para abrir o modal de detalhes do produto
async function abrirModalProduto(produtoId) {
    try {
        const produto = await buscarDetalhesProduto(produtoId);
        if (!produto) return;
        
        clearInterval(carrosselInterval);
        
        // Organiza as imagens
        let imagensProduto = produto.imagens || [];
        if (imagensProduto.length === 0) {
            imagensProduto = [{ id: 0 }]; // Placeholder será tratado no onerror
        }

        // Formata a avaliação
        const avaliacao = produto.avaliacao ? parseFloat(produto.avaliacao) : 0;
        
        // Cria o HTML do modal
        elements.productModalBody.innerHTML = `
            <div class="product-modal-container">
                <!-- Carrossel de Imagens -->
                <div class="product-gallery">
                    <div class="carrossel-container">
                        <div class="carrossel">
                            ${imagensProduto.map((img, index) => `
                                <div class="carrossel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                                    <img src="${apiUrl}/imagens/${img.id}" 
                                         class="carrossel-img"
                                         alt="${produto.nome} - Imagem ${index + 1}"
                                         draggable="false"
                                         onerror="this.onerror=null;this.src='https://static.thenounproject.com/png/1554489-200.png'">
                                </div>
                            `).join('')}
                        </div>
                        ${imagensProduto.length > 1 ? `
                        <button class="carrossel-prev" aria-label="Imagem anterior">&lt;</button>
                        <button class="carrossel-next" aria-label="Próxima imagem">&gt;</button>
                        <div class="carrossel-nav">
                            ${imagensProduto.map((_, index) => `
                                <div class="carrossel-indicator ${index === 0 ? 'active' : ''}" 
                                     data-index="${index}"></div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Informações do Produto -->
                <div class="product-details">
                    <h1 class="product-title">${produto.nome}</h1>
                    
                    <div class="product-meta">
                        <div class="product-rating">
                            ${gerarEstrelas(avaliacao)}
                            <span class="rating-value">${avaliacao.toFixed(1)}</span>
                        </div>
                        
                        <div class="product-stock">
                            ${produto.quantidade > 0 ? 
                                `<i class="fas fa-check"></i> Em estoque (${produto.quantidade} unidades)` : 
                                `<i class="fas fa-times"></i> Esgotado`}
                        </div>
                    </div>
                    
                    <div class="product-price">
                        <span class="price">R$ ${parseFloat(produto.preco).toFixed(2)}</span>
                        <span class="installment">ou 10x de R$ ${(parseFloat(produto.preco)/10).toFixed(2)}</span>
                    </div>
                    
                    <div class="product-description">
                        <h3>Descrição do Produto</h3>
                        <p>${produto.descricao || 'Descrição não disponível'}</p>
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-id="${produto.id}" 
                            ${produto.quantidade === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Configuração do carrossel (apenas se houver mais de uma imagem)
        if (imagensProduto.length > 0) {
            const carrossel = elements.productModalBody.querySelector('.carrossel');
            const slides = elements.productModalBody.querySelectorAll('.carrossel-slide');
            const indicators = elements.productModalBody.querySelectorAll('.carrossel-indicator');
            const prevBtn = elements.productModalBody.querySelector('.carrossel-prev');
            const nextBtn = elements.productModalBody.querySelector('.carrossel-next');
        
            let currentImageIndex = 0;
            
            // Configurações iniciais
            carrossel.style.width = `${imagensProduto.length * 100}%`;
            slides.forEach(slide => {
                slide.style.width = `${100 / imagensProduto.length}%`;
            });
        
            // Função para atualizar o carrossel
            const updateCarrossel = () => {
                const translateValue = -currentImageIndex * 100;
                carrossel.style.transform = `translateX(${translateValue}%)`;
                
                // Atualiza indicadores
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === currentImageIndex);
                });
            };
        
            // Navegação
            const goToSlide = (index) => {
                currentImageIndex = (index + imagensProduto.length) % imagensProduto.length;
                updateCarrossel();
            };
        
            // Event listeners para navegação
            nextBtn?.addEventListener('click', () => {
                clearInterval(carrosselInterval);
                goToSlide(currentImageIndex + 1);
                startCarrossel();
            });
        
            prevBtn?.addEventListener('click', () => {
                clearInterval(carrosselInterval);
                goToSlide(currentImageIndex - 1);
                startCarrossel();
            });
        
            // Event listeners para indicadores
            indicators.forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    clearInterval(carrosselInterval);
                    const index = parseInt(e.target.getAttribute('data-index'));
                    goToSlide(index);
                    startCarrossel();
                });
            });
        
            // Inicia com o primeiro slide ativo
            if (indicators.length > 0) {
                indicators[0].classList.add('active');
            }
        
            // Inicia o carrossel automático (se houver mais de uma imagem)
            const startCarrossel = () => {
                if (imagensProduto.length > 1) {
                    carrosselInterval = setInterval(() => {
                        goToSlide(currentImageIndex + 1);
                    }, 5000);
                }
            };
        
            updateCarrossel();
            startCarrossel();
        }

        // Evento para adicionar ao carrinho
        const addButton = elements.productModalBody.querySelector('.add-to-cart-btn');
        addButton.addEventListener('click', (e) => {
            e.stopPropagation();
            adicionarAoCarrinho(produto);
            
        });

    } catch (error) {
        console.error('Erro ao abrir modal de produto:', error);
    } finally {
        elements.productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
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

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
    if (!produto || !produto.id || produto.quantidade === 0) return;

    // Recupera o carrinho do localStorage ou cria um novo
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Verifica se o produto já está no carrinho
    const itemExistente = carrinho.find(item => item.id === produto.id);
    
    if (itemExistente) {
        // Aumenta a quantidade se ainda houver estoque
        if (itemExistente.quantidade < produto.quantidade) {
            itemExistente.quantidade += 1;
        } else {
            mostrarNotificacao('Quantidade máxima em estoque atingida!', 'aviso');
            return;
        }
    } else {
        // Adiciona novo item ao carrinho
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: parseFloat(produto.preco),
            imagem: produto.imagens && produto.imagens.length > 0 ? 
                   `${apiUrl}/imagens/${produto.imagens[0].id}` : 
                   'https://static.thenounproject.com/png/1554489-200.png',
            quantidade: 1,
            maxQuantidade: produto.quantidade
        });
    }
    
    // Atualiza o carrinho no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
    
    // Atualiza o contador do carrinho
    atualizarContadorCarrinho();
    
    // Animação no ícone do carrinho
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.classList.add('animate-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('animate-bounce');
        }, 1000);
    }
}

// Função para atualizar o contador de itens no carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItens;
        if (totalItens > 0) {
            elements.cartCount.style.display = 'flex';
        } else {
            elements.cartCount.style.display = 'none';
        }
    }
}

// Função para abrir o modal do carrinho
function abrirCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Limpa os itens do carrinho
    elements.cartItems.innerHTML = '';
    
    if (carrinho.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        elements.freteOptions.style.display = 'none';
    } else {
        let subtotal = 0;
        
        carrinho.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.imagem}" 
                         alt="${item.nome}" 
                         onerror="this.onerror=null;this.src='https://static.thenounproject.com/png/1554489-200.png'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantidade}</span>
                        <button class="quantity-btn increase" data-id="${item.id}" 
                            ${item.quantidade >= item.maxQuantidade ? 'disabled' : ''}>+</button>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            elements.cartItems.appendChild(itemElement);
            subtotal += item.preco * item.quantidade;
        });
        
        // Atualiza os totais (formatando com vírgula para decimais)
        elements.subtotalValue.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        elements.totalValue.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        elements.freteOptions.style.display = 'block';
    }
    
    // Mostra o modal
    elements.cartModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Função para fechar o modal
function fecharModal() {
    elements.cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Função para fechar o modal de produto
function fecharModalProduto() {
    clearInterval(carrosselInterval);
    elements.productModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Função para calcular frete (simulada)
function calcularFrete() {
    const cep = elements.cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        elements.cepInput.classList.add('error');
        elements.cepInfo.textContent = 'CEP inválido! Digite 8 números.';
        elements.cepInfo.style.color = '#FF4B4B';
        return;
    }
    
    elements.calcFreteBtn.disabled = true;
    elements.calcFreteBtn.textContent = 'Calculando...';
    
    // Simula cálculo do frete
    setTimeout(() => {
        elements.cepInput.classList.remove('error');
        elements.cepInfo.textContent = `Frete para CEP: ${cep.substring(0, 5)}-${cep.substring(5)}`;
        elements.cepInfo.style.color = '#ffffff';
        elements.calcFreteBtn.disabled = false;
        elements.calcFreteBtn.textContent = 'Calcular';
        elements.freteOptions.style.display = 'block';
    }, 1000);
}

// Função para selecionar opção de frete
function selecionarFrete(valor) {
    const frete = parseFloat(valor) || 0;
    
    // Obtém o subtotal como número
    const subtotalText = elements.subtotalValue.textContent
        .replace('R$ ', '')
        .replace('.', '')
        .replace(',', '.');
    const subtotal = parseFloat(subtotalText) || 0;
    
    // Formata o frete para exibição (com vírgula para decimais)
    elements.freteValue.textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    
    // Calcula o total (soma números) e formata para exibição
    const total = subtotal + frete;
    elements.totalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Marca a opção selecionada
    document.querySelectorAll('.frete-option').forEach(option => {
        const optionValue = parseFloat(option.getAttribute('data-value'));
        if (optionValue === frete) {
            option.classList.add('selected');
            option.querySelector('input').checked = true;
        } else {
            option.classList.remove('selected');
            option.querySelector('input').checked = false;
        }
    });
}

// Função para alterar quantidade no carrinho
function alterarQuantidade(id, alteracao) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const index = carrinho.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const novaQuantidade = carrinho[index].quantidade + alteracao;
        
        if (novaQuantidade > 0 && novaQuantidade <= carrinho[index].maxQuantidade) {
            carrinho[index].quantidade = novaQuantidade;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            abrirCarrinho();
            atualizarContadorCarrinho();
        } else if (novaQuantidade > carrinho[index].maxQuantidade) {
            mostrarNotificacao('Quantidade máxima em estoque atingida!', 'aviso');
        }
    }
}

// Função para remover item do carrinho
function removerItem(id) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    mostrarNotificacao('Produto removido do carrinho!');
    abrirCarrinho();
    atualizarContadorCarrinho();
}

// Função para finalizar compra
function finalizarCompra() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado) {
        mostrarNotificacao('Por favor, faça login para finalizar sua compra!', 'erro');
        window.location.href = '/index';
        return;
    }
    
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!', 'erro');
        return;
    }
    
    // Verifica se o frete foi selecionado
    const freteSelecionado = document.querySelector('.frete-option.selected');
    if (!freteSelecionado) {
        mostrarNotificacao('Por favor, selecione uma opção de frete!', 'erro');
        return;
    }
    
    // Simula finalização da compra
    mostrarNotificacao('Compra finalizada com sucesso! Obrigado por comprar conosco.');
    
    // Limpa o carrinho
    localStorage.removeItem('carrinho');
    fecharModal();
    atualizarContadorCarrinho();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    document.getElementById('cartIcon').addEventListener('click', abrirCarrinho);
    elements.closeModal.addEventListener('click', fecharModal);
    elements.continueBtn.addEventListener('click', fecharModal);
    elements.closeProductModal.addEventListener('click', fecharModalProduto);
    elements.calcFreteBtn.addEventListener('click', calcularFrete);
    elements.checkoutBtn.addEventListener('click', finalizarCompra);
    
    // Evento para fechar modais ao clicar fora
    elements.cartModal.addEventListener('click', (e) => {
        if (e.target === elements.cartModal) fecharModal();
    });
    
    elements.productModal.addEventListener('click', (e) => {
        if (e.target === elements.productModal) fecharModalProduto();
    });
    
    // Evento para selecionar frete
    document.querySelectorAll('.frete-option').forEach(option => {
        option.addEventListener('click', () => {
            const valor = option.getAttribute('data-value');
            selecionarFrete(valor);
        });
    });
    
    // Evento para formatar CEP
    elements.cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value.substring(0, 9);
    });
    
    // Delegation para botões de quantidade e remover
    elements.cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('decrease') || e.target.closest('.decrease')) {
            const id = parseInt(e.target.closest('.decrease').getAttribute('data-id'));
            alterarQuantidade(id, -1);
        }
        
        if (e.target.classList.contains('increase') || e.target.closest('.increase')) {
            const id = parseInt(e.target.closest('.increase').getAttribute('data-id'));
            alterarQuantidade(id, 1);
        }
        
        if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const id = parseInt(e.target.closest('.remove-btn').getAttribute('data-id'));
            removerItem(id);
        }
    });
    
    // Carrega os produtos
    fetchProdutos();
    
    // Atualiza o contador do carrinho
    atualizarContadorCarrinho();
});

// Adiciona animação de bounce ao CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    .animate-bounce {
        animation: bounce 0.5s ease infinite;
    }
`;
document.head.appendChild(style);