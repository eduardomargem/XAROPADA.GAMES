document.addEventListener("DOMContentLoaded", function() {
    const API_URL = 'http://localhost:8080/api';
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    // Verifica se o usuário está logado
    if (!usuarioLogado) {
        window.location.href = '/index';
        return;
    }

    // Configura máscaras para os campos do cartão
    function configurarMascarasCartao() {
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

    // Função para salvar o cartão no localStorage
    function salvarCartao(event) {
        event.preventDefault();
        
        const nomeCartao = document.getElementById('modalNomeCartao').value;
        const numeroCartao = document.getElementById('modalNumeroCartao').value;
        const validadeCartao = document.getElementById('modalValidadeCartao').value;
        const cvvCartao = document.getElementById('modalCvvCartao').value;
        const parcelas = document.getElementById('modalParcelas').value;
        
        // Validações
        if (!nomeCartao || !numeroCartao || !validadeCartao || !cvvCartao || !parcelas) {
            mostrarNotificacao('PREENCHA TODOS OS CAMPOS!', 'erro');
            return;
        }
        
        if (!validarNumeroCartao(numeroCartao)) {
            mostrarNotificacao('NÚMERO DO CARTÃO INVÁLIDO!', 'erro');
            return;
        }
        
        if (!validarValidade(validadeCartao)) {
            mostrarNotificacao('VALIDADE INVÁLIDA! FORMATO: MM/AAAA', 'erro');
            return;
        }
        
        if (!validarCVV(cvvCartao)) {
            mostrarNotificacao('CVV INVÁLIDO! 3 OU 4 DÍGITOS', 'erro');
            return;
        }
        
        // Cria objeto de pagamento
        const novoPagamento = {
            tipo: 'credito',
            nomeCartao,
            numeroCartao: numeroCartao.replace(/\s/g, ''),
            ultimosDigitos: numeroCartao.slice(-4),
            validadeCartao,
            cvvCartao,
            parcelas: parseInt(parcelas),
            padrao: false
        };
        
        // Salva no localStorage
        let formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
        if (formasPagamento.length === 0) {
            novoPagamento.padrao = true;
        }
        formasPagamento.push(novoPagamento);
        localStorage.setItem('formasPagamento', JSON.stringify(formasPagamento));
        
        // Atualiza a exibição e fecha o modal
        exibirCartoesSalvos();
        document.getElementById('cardForm').reset();
        document.getElementById('cardModal').style.display = 'none';
        mostrarNotificacao('CARTÃO SALVO COM SUCESSO!');
    }

    // Exibe os cartões salvos
    function exibirCartoesSalvos() {
        const listaPagamentos = document.getElementById('listaPagamentos');
        listaPagamentos.innerHTML = '';
        
        const formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
        const cartoes = formasPagamento.filter(fp => fp.tipo === 'credito');
        
        if (cartoes.length === 0) return;
        
        const titulo = document.createElement('h3');
        titulo.textContent = 'CARTÕES SALVOS';
        titulo.style.margin = '20px 0 10px';
        titulo.style.color = 'var(--primary)';
        titulo.style.fontSize = '0.9rem';
        titulo.style.textShadow = '2px 2px 0 #000';
        listaPagamentos.appendChild(titulo);
        
        cartoes.forEach((cartao, index) => {
            const cartaoElement = document.createElement('div');
            cartaoElement.className = 'payment-option';
            cartaoElement.innerHTML = `
                <input type="radio" name="savedCard" id="card-${index}" value="${index}">
                <div class="payment-info">
                    <h3><span class="payment-icon">C</span> ${cartao.nomeCartao}</h3>
                    <p>**** **** **** ${cartao.ultimosDigitos} | VAL: ${cartao.validadeCartao}</p>
                </div>
            `;
            listaPagamentos.appendChild(cartaoElement);
        });
    }

    // Função para confirmar o pagamento
    async function confirmarPagamento() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').id;
        let formaPagamento;
        
        if (selectedPayment === 'boleto') {
            formaPagamento = {
                tipo: 'boleto',
                codigoBoleto: gerarCodigoBoleto()
            };
            
            mostrarNotificacao('BOLETO GERADO! IMPRIMA OU COPIE O CÓDIGO.', 'sucesso');
        } 
        else if (selectedPayment === 'newCard') {
            const selectedCard = document.querySelector('input[name="savedCard"]:checked');
            if (!selectedCard) {
                mostrarNotificacao('SELECIONE OU ADICIONE UM CARTÃO!', 'info');
                document.getElementById('cardModal').style.display = 'flex';
                return;
            }
            
            const formasPagamento = JSON.parse(localStorage.getItem('formasPagamento')) || [];
            const cartaoSelecionado = formasPagamento[selectedCard.value];
            
            formaPagamento = {
                tipo: 'cartao',
                nomeCartao: cartaoSelecionado.nomeCartao,
                numeroCartao: cartaoSelecionado.numeroCartao,
                validade: cartaoSelecionado.validadeCartao,
                cvv: cartaoSelecionado.cvvCartao,
                parcelas: cartaoSelecionado.parcelas
            };
            
            mostrarNotificacao('PAGAMENTO COM CARTÃO CONFIRMADO!', 'sucesso');
        }
        
        // Armazena os dados no formato esperado pela página de resumo
        localStorage.setItem('formaPagamento', JSON.stringify(formaPagamento));
        
        // Redireciona para a página de resumo
        window.location.href = '/Resumo';
    }

    // Função auxiliar para gerar código de boleto fictício
    function gerarCodigoBoleto() {
        let codigo = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 5; j++) {
                codigo += Math.floor(Math.random() * 10);
            }
            if (i < 3) codigo += ' ';
        }
        return codigo;
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

    // Event Listeners
    configurarMascarasCartao();
    exibirCartoesSalvos();
    
    // Formulário de cartão
    document.getElementById('cardForm').addEventListener('submit', salvarCartao);
    
    // Botão para adicionar novo cartão
    document.getElementById('newCard').addEventListener('change', function() {
        if(this.checked) {
            document.getElementById('cardModal').style.display = 'flex';
        }
    });
    
    // Fechar modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('cardModal').style.display = 'none';
            document.getElementById('boleto').checked = true;
        });
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('cardModal')) {
            document.getElementById('cardModal').style.display = 'none';
            document.getElementById('boleto').checked = true;
        }
    });
    
    // Botão Confirmar Pagamento
    document.getElementById('confirmPayment').addEventListener('click', confirmarPagamento);
    
    // Botão Avançar
    document.getElementById('nextButton').addEventListener('click', confirmarPagamento);
    
    // Atualiza a classe selected quando muda a opção
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });
            this.closest('.payment-option').classList.add('selected');
        });
    });
    
    // Atualiza a seleção quando escolhe um cartão salvo
    document.addEventListener('change', function(e) {
        if (e.target.name === 'savedCard') {
            document.getElementById('boleto').checked = false;
            document.getElementById('newCard').checked = true;
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.getElementById('newCard').closest('.payment-option').classList.add('selected');
        }
    });
});