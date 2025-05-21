    document.addEventListener("DOMContentLoaded", function() {
                const userSection = document.getElementById('userSection');
                const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
                
                if (usuarioLogado) {
                    userSection.innerHTML = `
                        <div class="user-info">
                            <i class="fas fa-user"></i>
                            <span>Olá, ${usuarioLogado.nome}!</span>
                            <div class="user-actions">
                                <a href="Perfil.html" class="account-link">Minha Conta</a>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('logoutBtn').addEventListener('click', function() {
                        localStorage.removeItem('usuarioLogado');
                        window.location.reload();
                    });
                } else {
                    userSection.innerHTML = `
                        <div class="login-option">
                            <div><i class="fas fa-user"></i> <span>ENTRE OU</span></div>
                            <div>CADASTRE-SE</div>
                        </div>
                    `;
                    
                    userSection.addEventListener('click', function() {
                        window.location.href = 'index.html';
                    });
                }

                // Verificação ao finalizar compra
                const checkoutBtn = document.getElementById('checkoutBtn');
                const verificationModal = document.getElementById('verificationModal');
                const goToProfileBtn = document.getElementById('goToProfileBtn');
                const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
                const verificationMessage = document.getElementById('verificationMessage');

                if (checkoutBtn) {
                    checkoutBtn.addEventListener('click', function(e) {
                        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
                        if (!usuarioLogado) {
                            e.preventDefault();
                            alert('Por favor, faça login para finalizar sua compra!');
                            window.location.href = 'index.html';
                            return;
                        }

                        // Verifica se há itens no carrinho
                        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
                        if (carrinho.length === 0) {
                            mostrarNotificacao('Seu carrinho está vazio!', 'erro');
                            return;
                        }

                        // Verifica se o frete foi calculado
                        const freteSelecionado = parseFloat(localStorage.getItem('frete')) || 0;
                        if (freteSelecionado === 0) {
                            mostrarNotificacao('Por favor, calcule e selecione uma opção de frete.', 'erro');
                            return;
                        }

                        // Verifica dados do usuário
                        const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
                        const cliente = clientes.find(c => c.email === usuarioLogado.email);
                        
                        let mensagem = '';
                        let precisaVerificacao = false;

                        // Verifica endereço
                        const enderecos = cliente?.dadosCompletos?.enderecosEntrega || cliente?.enderecosEntrega || [];
                        const enderecoPadrao = enderecos.find(e => e.padrao);
                        
                        if (enderecos.length === 0) {
                            mensagem += 'Você precisa cadastrar pelo menos um endereço de entrega.<br>';
                            precisaVerificacao = true;
                        } else if (!enderecoPadrao) {
                            mensagem += 'Você precisa definir um endereço padrão para entrega.<br>';
                            precisaVerificacao = true;
                        }

                        // Verifica formas de pagamento
                        const formasPagamento = cliente?.dadosCompletos?.formasPagamento || [];
                        const pagamentoPadrao = formasPagamento.find(p => p.padrao);
                        
                        if (formasPagamento.length === 0) {
                            mensagem += 'Você precisa cadastrar pelo menos uma forma de pagamento.<br>';
                            precisaVerificacao = true;
                        } else if (!pagamentoPadrao) {
                            mensagem += 'Você precisa definir uma forma de pagamento padrão.<br>';
                            precisaVerificacao = true;
                        }

                        if (precisaVerificacao) {
                            verificationMessage.innerHTML = mensagem;
                            verificationModal.style.display = 'flex';
                            document.body.style.overflow = 'hidden';
                        } else {
                            // Tudo ok, pode finalizar a compra
                            finalizarCompra();
                        }
                    });
                }

                // Configura botões do modal de verificação
                if (goToProfileBtn) {
                    goToProfileBtn.addEventListener('click', function() {
                        window.location.href = 'DadosEntrega.html';
                    });
                }

                if (cancelCheckoutBtn) {
                    cancelCheckoutBtn.addEventListener('click', function() {
                        verificationModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    });
                }

                // Fecha modal ao clicar fora
                verificationModal.addEventListener('click', function(e) {
                    if (e.target === verificationModal) {
                        verificationModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            });