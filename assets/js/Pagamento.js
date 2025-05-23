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

            // Funções de validação de cartão
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

            // Função para salvar o cartão
            function salvarCartao() {
                const nomeCartao = document.getElementById('modalNomeCartao').value;
                const numeroCartao = document.getElementById('modalNumeroCartao').value;
                const validadeCartao = document.getElementById('modalValidadeCartao').value;
                const cvvCartao = document.getElementById('modalCvvCartao').value;
                const parcelas = document.getElementById('modalParcelas').value;
                
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
                
                const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
                const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
                
                if (!usuario) {
                    mostrarNotificacao('USUÁRIO NÃO LOGADO!', 'erro');
                    return;
                }
                
                const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
                
                if (clienteIndex === -1) {
                    mostrarNotificacao('USUÁRIO NÃO ENCONTRADO!', 'erro');
                    return;
                }
                
                const novoPagamento = {
                    tipo: 'credito',
                    nomeCartao,
                    numeroCartao: numeroCartao.replace(/\s/g, ''),
                    ultimosDigitos: numeroCartao.slice(-4),
                    validadeCartao,
                    cvvCartao,
                    parcelas,
                    padrao: false
                };
                
                if (!clientes[clienteIndex].dadosCompletos) {
                    clientes[clienteIndex].dadosCompletos = {};
                }
                
                if (!clientes[clienteIndex].dadosCompletos.formasPagamento) {
                    clientes[clienteIndex].dadosCompletos.formasPagamento = [];
                    novoPagamento.padrao = true;
                } else if (clientes[clienteIndex].dadosCompletos.formasPagamento.length === 0) {
                    novoPagamento.padrao = true;
                }
                
                clientes[clienteIndex].dadosCompletos.formasPagamento.push(novoPagamento);
                localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
                
                exibirCartoesSalvos();
                document.getElementById('cardForm').reset();
                document.getElementById('cardModal').style.display = 'none';
                mostrarNotificacao('CARTÃO SALVO COM SUCESSO!');
            }

            // Função para exibir cartões salvos
            function exibirCartoesSalvos() {
                const listaPagamentos = document.getElementById('listaPagamentos');
                listaPagamentos.innerHTML = '';
                
                const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
                const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
                
                if (!usuario) return;
                
                const cliente = clientes.find(c => c.email === usuario.email);
                if (!cliente || !cliente.dadosCompletos || !cliente.dadosCompletos.formasPagamento) return;
                
                const pagamentos = cliente.dadosCompletos.formasPagamento;
                
                if (pagamentos.length === 0) return;
                
                const titulo = document.createElement('h3');
                titulo.textContent = 'CARTÕES SALVOS';
                titulo.style.margin = '20px 0 10px';
                titulo.style.color = 'var(--primary)';
                titulo.style.fontSize = '0.9rem';
                titulo.style.textShadow = '2px 2px 0 #000';
                listaPagamentos.appendChild(titulo);
                
                pagamentos.forEach((pagamento, index) => {
                    if (pagamento.tipo === 'credito') {
                        const cartaoElement = document.createElement('div');
                        cartaoElement.className = 'payment-option';
                        cartaoElement.innerHTML = `
                            <input type="radio" name="savedCard" id="card-${index}">
                            <div class="payment-info">
                                <h3><span class="payment-icon">C</span> ${pagamento.nomeCartao}</h3>
                                <p>**** **** **** ${pagamento.ultimosDigitos} | VAL: ${pagamento.validadeCartao}</p>
                            </div>
                        `;
                        listaPagamentos.appendChild(cartaoElement);
                    }
                });
            }

            // Event Listeners
            document.addEventListener('DOMContentLoaded', function() {
                // Verifica se o usuário está logado
                if (!localStorage.getItem('usuarioLogado')) {
                    window.location.href = "index.html";
                    return;
                }
                
                // Configura máscaras
                configurarMascarasCartao();
                
                // Exibe cartões salvos
                exibirCartoesSalvos();
                
                // Formulário de cartão
                document.getElementById('cardForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    salvarCartao();
                });
                
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
                
                // Confirmar pagamento
                document.getElementById('confirmPayment').addEventListener('click', function() {
                    const selectedPayment = document.querySelector('input[name="payment"]:checked').id;
                    const selectedCard = document.querySelector('input[name="savedCard"]:checked');
                    
                    if (selectedPayment === 'boleto') {
                        mostrarNotificacao('BOLETO GERADO! IMPRIMA OU COPIE O CÓDIGO.', 'sucesso');
                    } else if (selectedPayment === 'newCard') {
                        if (selectedCard) {
                            mostrarNotificacao('PAGAMENTO COM CARTÃO CONFIRMADO!', 'sucesso');
                        } else {
                            mostrarNotificacao('SELECIONE OU ADICIONE UM CARTÃO!', 'info');
                            document.getElementById('cardModal').style.display = 'flex';
                        }
                    } else {
                        mostrarNotificacao('SELECIONE UMA FORMA DE PAGAMENTO!', 'erro');
                    }
                });
                
                // Botão Avançar
                document.getElementById('nextButton').addEventListener('click', function(e) {
                    const selectedPayment = document.querySelector('input[name="payment"]:checked').id;
                    
                    if (selectedPayment === 'newCard') {
                        const selectedCard = document.querySelector('input[name="savedCard"]:checked');
                        if (!selectedCard) {
                            e.preventDefault();
                            mostrarNotificacao('SELECIONE OU ADICIONE UM CARTÃO ANTES DE AVANÇAR!', 'erro');
                            document.getElementById('cardModal').style.display = 'flex';
                            return;
                        }
                    }
                    
                    // Se passou na validação, redireciona para Resumo.html
                    window.location.href = 'Resumo.htm';
                });

                // Garante que apenas uma forma de pagamento seja selecionada
                document.querySelectorAll('input[name="payment"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        if (this.id === 'newCard') {
                            const savedCards = document.querySelectorAll('input[name="savedCard"]');
                            if (savedCards.length === 0) {
                                document.getElementById('cardModal').style.display = 'flex';
                            }
                        }
                        
                        // Atualiza a classe selected para todas as opções
                        document.querySelectorAll('.payment-option').forEach(option => {
                            option.classList.remove('selected');
                        });
                        
                        // Adiciona a classe selected apenas para a opção selecionada
                        this.closest('.payment-option').classList.add('selected');
                    });
                });

                // Atualiza a classe selected quando um cartão salvo é selecionado
                document.addEventListener('change', function(e) {
                    if (e.target.name === 'savedCard') {
                        // Desmarca o boleto se um cartão for selecionado
                        document.getElementById('boleto').checked = false;
                        document.getElementById('newCard').checked = true;
                        
                        // Atualiza a classe selected para todas as opções
                        document.querySelectorAll('.payment-option').forEach(option => {
                            option.classList.remove('selected');
                        });
                        
                        // Adiciona a classe selected para a opção de cartão
                        document.getElementById('newCard').closest('.payment-option').classList.add('selected');
                    }
                });
            });