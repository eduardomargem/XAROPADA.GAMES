// Em XAROPADA.GAMES-master/src/main/resources/static/js/Pagamento.js

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const containerId = 'notification-container-global'; // Usar ID global
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

function configurarMascarasCartao() {
    const numCartao = document.getElementById('modalNumeroCartao');
    const valCartao = document.getElementById('modalValidadeCartao');
    const cvvCartao = document.getElementById('modalCvvCartao');

    if(numCartao) {
        numCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value.trim().substring(0, 19);
        });
    }
    
    if(valCartao) {
        valCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4); // MM/AA
            }
            e.target.value = value.substring(0, 5);
        });
    }
    
    if(cvvCartao) {
        cvvCartao.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

function validarNumeroCartao(numero) {
    const numeroLimpo = numero.replace(/\s/g, '');
    return /^\d{13,19}$/.test(numeroLimpo); // Aceita de 13 a 19 dígitos
}

function validarValidade(validade) {
    if (!/^\d{2}\/\d{2}$/.test(validade)) return false; // MM/AA
    
    const [mesStr, anoStr] = validade.split('/');
    const mes = parseInt(mesStr);
    const ano = parseInt(`20${anoStr}`); // Assumindo século 21
    
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

function salvarCartao() {
    const nomeCartao = document.getElementById('modalNomeCartao').value.trim();
    const numeroCartao = document.getElementById('modalNumeroCartao').value;
    const validadeCartao = document.getElementById('modalValidadeCartao').value;
    const cvvCartao = document.getElementById('modalCvvCartao').value.trim();
    const parcelas = document.getElementById('modalParcelas').value;
    
    if (!nomeCartao || !numeroCartao || !validadeCartao || !cvvCartao || !parcelas) {
        mostrarNotificacao('PREENCHA TODOS OS CAMPOS DO CARTÃO!', 'erro');
        return false; // Indica falha
    }
    if (!validarNumeroCartao(numeroCartao)) {
        mostrarNotificacao('NÚMERO DO CARTÃO INVÁLIDO!', 'erro');
        return false;
    }
    if (!validarValidade(validadeCartao)) {
        mostrarNotificacao('VALIDADE INVÁLIDA! Formato: MM/AA e data futura.', 'erro');
        return false;
    }
    if (!validarCVV(cvvCartao)) {
        mostrarNotificacao('CVV INVÁLIDO! Deve ter 3 ou 4 dígitos.', 'erro');
        return false;
    }
    
    // Simulação de salvamento de cartão no localStorage (NÃO FAÇA ISSO EM PRODUÇÃO REAL COM DADOS SENSÍVEIS)
    // Em um cenário real, você enviaria isso para um gateway de pagamento seguro.
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        mostrarNotificacao('Usuário não logado. Faça login para salvar o cartão.', 'erro');
        return false;
    }

    // A estrutura de 'usuariosCadastrados' e 'dadosCompletos' é legada.
    // Para o fluxo de checkout, vamos salvar o cartão temporariamente para este pedido.
    const novoCartao = {
        id: `temp-${Date.now()}`, // ID temporário
        nomeCartao,
        numeroCartao: numeroCartao.replace(/\s/g, ''),
        ultimosDigitos: numeroCartao.slice(-4),
        validadeCartao,
        // NÃO SALVE CVV no localStorage, mesmo em simulação de checkout
        parcelas,
        tipo: 'CARTAO_CREDITO', // Para consistência
        padrao: true // Novo cartão adicionado é selecionado por padrão
    };

    // Salva como "cartaoParaCheckout" para ser usado na tela de resumo
    localStorage.setItem('cartaoParaCheckout', JSON.stringify(novoCartao));
    
    // Atualiza a UI para refletir o cartão recém-adicionado e selecionado
    exibirCartoesSalvos(novoCartao); // Passa o novo cartão para ser selecionado

    document.getElementById('cardForm').reset();
    document.getElementById('cardModal').style.display = 'none';
    mostrarNotificacao('CARTÃO ADICIONADO PARA ESTA COMPRA!');
    document.getElementById('newCard').checked = true; // Mantém a opção "Cartão de Crédito" marcada
    document.getElementById('newCard').closest('.payment-option').classList.add('selected');
    return true; // Indica sucesso
}


function exibirCartoesSalvos(cartaoRecemAdicionado = null) {
    const listaPagamentos = document.getElementById('listaPagamentos');
    if (!listaPagamentos) return;
    listaPagamentos.innerHTML = ''; // Limpa para reconstruir

    // EM UM SISTEMA REAL: buscaria cartões salvos do backend de forma segura.
    // Aqui, vamos simular que não há cartões salvos permanentemente,
    // mas se um cartão foi adicionado para o checkout atual, ele é listado.
    
    const cartaoParaCheckout = JSON.parse(localStorage.getItem('cartaoParaCheckout'));
    let cartoesExibidos = [];

    if (cartaoRecemAdicionado) { // Se um cartão foi acabado de ser salvo pelo modal
        cartoesExibidos.push(cartaoRecemAdicionado);
    } else if (cartaoParaCheckout) { // Se já existia um cartão no localStorage para este checkout
        cartoesExibidos.push(cartaoParaCheckout);
    }

    if (cartoesExibidos.length === 0) {
        listaPagamentos.innerHTML = '<p style="font-size:10px; color:#aaa; margin-left:35px;">Nenhum cartão salvo. Adicione um novo.</p>';
        return;
    }
    
    const titulo = document.createElement('h3');
    titulo.textContent = 'CARTÃO A SER USADO NESTA COMPRA';
    Object.assign(titulo.style, { margin: '20px 0 10px', color: 'var(--primary)', fontSize: '0.9rem', textShadow: '2px 2px 0 #000'});
    listaPagamentos.appendChild(titulo);
    
    cartoesExibidos.forEach((pagamento, index) => {
        const cartaoElement = document.createElement('div');
        cartaoElement.className = 'payment-option saved-card-option'; // Adiciona uma classe específica
        cartaoElement.innerHTML = `
            <input type="radio" name="savedCard" id="card-${pagamento.id || index}" value="${pagamento.id || index}" ${pagamento.padrao ? 'checked' : ''}>
            <label for="card-${pagamento.id || index}" class="payment-info">
                <h3><span class="payment-icon">C</span> ${pagamento.nomeCartao}</h3>
                <p>**** **** **** ${pagamento.ultimosDigitos} | VAL: ${pagamento.validadeCartao} | ${pagamento.parcelas}x</p>
            </label>
        `;
        listaPagamentos.appendChild(cartaoElement);
        if(pagamento.padrao) {
            cartaoElement.classList.add('selected');
        }
    });

    // Event listener para seleção de cartão salvo
    document.querySelectorAll('.saved-card-option input[name="savedCard"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.saved-card-option').forEach(opt => opt.classList.remove('selected'));
            if(this.checked) {
                this.closest('.saved-card-option').classList.add('selected');
                // Garante que "Cartão de Crédito" principal esteja selecionado
                document.getElementById('newCard').checked = true; 
                document.getElementById('newCard').closest('.payment-option').classList.add('selected');
                document.getElementById('boleto').closest('.payment-option').classList.remove('selected');

                // Atualiza o 'cartaoParaCheckout' no localStorage se um cartão salvo for explicitamente selecionado
                const selecionadoId = this.value;
                const cartaoEscolhido = cartoesExibidos.find(c => (c.id || cartoesExibidos.indexOf(c).toString()) === selecionadoId);
                if(cartaoEscolhido) {
                    localStorage.setItem('cartaoParaCheckout', JSON.stringify(cartaoEscolhido));
                }
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('usuarioLogado')) {
        mostrarNotificacao('Faça login para prosseguir com o pagamento.', 'erro');
        setTimeout(() => { window.location.href = '/index'; }, 2000);
        return;
    }
    
    configurarMascarasCartao();
    exibirCartoesSalvos(); // Exibe qualquer cartão já definido para este checkout
    
    const cardForm = document.getElementById('cardForm');
    if(cardForm) {
        cardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarCartao(); // salvarCartao agora retorna true/false
        });
    }
    
    const newCardRadio = document.getElementById('newCard');
    if(newCardRadio) {
        newCardRadio.addEventListener('change', function() {
            if(this.checked) {
                const listaPagamentos = document.getElementById('listaPagamentos');
                // Se não há cartões salvos/exibidos OU se o usuário explicitamente quer adicionar um novo
                // mesmo que haja um listado, o modal deve abrir para adicionar um *novo* ou *substituir* o atual.
                document.getElementById('cardModal').style.display = 'flex';
            }
        });
    }
    
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('cardModal').style.display = 'none';
            // Se fechar o modal sem salvar, e não houver cartão no localStorage, desmarcar opção de cartão
            if (!localStorage.getItem('cartaoParaCheckout')) {
                document.getElementById('newCard').checked = false;
                document.getElementById('newCard').closest('.payment-option').classList.remove('selected');
                document.getElementById('boleto').checked = true; // Volta para boleto
                document.getElementById('boleto').closest('.payment-option').classList.add('selected');
            }
        });
    });
    
    window.addEventListener('click', function(event) {
        const cardModal = document.getElementById('cardModal');
        if (event.target === cardModal) {
            cardModal.style.display = 'none';
             if (!localStorage.getItem('cartaoParaCheckout')) {
                document.getElementById('newCard').checked = false;
                document.getElementById('newCard').closest('.payment-option').classList.remove('selected');
                document.getElementById('boleto').checked = true;
                document.getElementById('boleto').closest('.payment-option').classList.add('selected');
            }
        }
    });
    
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function() {
            // Esta função é mais para uma confirmação visual, a lógica real de pagamento
            // ocorreria no backend após o resumo.
            const selectedPaymentRadio = document.querySelector('input[name="payment"]:checked');
            if (!selectedPaymentRadio) {
                 mostrarNotificacao('SELECIONE UMA FORMA DE PAGAMENTO!', 'erro'); return;
            }

            if (selectedPaymentRadio.id === 'boleto') {
                mostrarNotificacao('BOLETO SIMULADO GERADO! Próximo passo: Resumo.', 'sucesso');
            } else if (selectedPaymentRadio.id === 'newCard') {
                const cartaoSelecionado = JSON.parse(localStorage.getItem('cartaoParaCheckout'));
                if (cartaoSelecionado) {
                    mostrarNotificacao('PAGAMENTO COM CARTÃO CONFIGURADO! Próximo passo: Resumo.', 'sucesso');
                } else {
                    mostrarNotificacao('ADICIONE OS DADOS DO CARTÃO OU SELECIONE UM CARTÃO SALVO!', 'info');
                    document.getElementById('cardModal').style.display = 'flex';
                }
            }
        });
    }
    
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', function(e) {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (!usuarioLogado) {
                mostrarNotificacao('Faça login para continuar!', 'erro');
                e.preventDefault(); return;
            }

            const selectedPaymentRadio = document.querySelector('input[name="payment"]:checked');
            if (!selectedPaymentRadio) {
                mostrarNotificacao('Selecione uma forma de pagamento!', 'erro');
                e.preventDefault(); return;
            }
            const tipoPagamentoId = selectedPaymentRadio.id;
            let pagamentoParaCheckout = {};

            if (tipoPagamentoId === 'boleto') {
                pagamentoParaCheckout = { tipo: "BOLETO" };
            } else if (tipoPagamentoId === 'newCard') {
                const cartaoSalvoParaCheckout = JSON.parse(localStorage.getItem('cartaoParaCheckout'));
                if (cartaoSalvoParaCheckout) {
                     pagamentoParaCheckout = cartaoSalvoParaCheckout; // Já tem tipo, parcelas, etc.
                } else {
                    mostrarNotificacao('ADICIONE OS DADOS DO CARTÃO ANTES DE AVANÇAR!', 'erro');
                     document.getElementById('cardModal').style.display = 'flex';
                    e.preventDefault(); return;
                }
            } else {
                mostrarNotificacao('Forma de pagamento inválida!', 'erro');
                e.preventDefault(); return;
            }
            
            localStorage.setItem('pagamentoAtual', JSON.stringify(pagamentoParaCheckout));
            window.location.href = '/Resumo';
        });
    }

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('selected'));
            this.closest('.payment-option').classList.add('selected');
            
            if (this.id === 'newCard' && !localStorage.getItem('cartaoParaCheckout')) {
                 const listaPagamentos = document.getElementById('listaPagamentos');
                 // Se não houver cartões na lista (desconsiderando o título H3)
                 if (!listaPagamentos || listaPagamentos.children.length <= 1) {
                    document.getElementById('cardModal').style.display = 'flex';
                 }
            } else if (this.id === 'boleto') {
                // Se boleto for selecionado, desmarcar qualquer cartão salvo
                document.querySelectorAll('input[name="savedCard"]').forEach(rc => rc.checked = false);
                document.querySelectorAll('.saved-card-option').forEach(opt => opt.classList.remove('selected'));
            }
        });
    });
});