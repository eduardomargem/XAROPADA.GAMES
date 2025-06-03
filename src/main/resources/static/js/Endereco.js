document.addEventListener("DOMContentLoaded", function() {
    const formEndereco = document.getElementById('addressForm');
    const cepInput = document.getElementById('cep'); // CEP do modal de novo endereço
    const btnSalvarEndereco = document.getElementById('btnSalvarEndereco');
    const listaEnderecosContainer = document.getElementById('listaEnderecos');
    const btnContinuar = document.getElementById('btnContinuar');
    const btnNovoEndereco = document.getElementById('btnNovoEndereco');
    const modal = document.getElementById('addressModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Função para aplicar máscara de CEP (reutilizada de Cadastro.js ou definida aqui)
    function aplicarMascaraCEPLocal(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value.substring(0, 9);
        });
    }
    if(cepInput) aplicarMascaraCEPLocal(cepInput);


    async function buscarEnderecoPorCEPLocal(cep, formElement) {
        const cepNumerico = cep.replace(/\D/g, '');
        if (cepNumerico.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                mostrarNotificacaoGlobal('CEP não encontrado.', 'erro');
                return;
            }
            
            formElement.querySelector('#logradouro').value = data.logradouro || '';
            formElement.querySelector('#bairro').value = data.bairro || '';
            formElement.querySelector('#cidade').value = data.localidade || '';
            formElement.querySelector('#uf').value = data.uf || ''; // O select será preenchido
            formElement.querySelector('#numero').focus();
            
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            mostrarNotificacaoGlobal('Erro ao consultar CEP.', 'erro');
        }
    }
    
    if(cepInput && formEndereco) {
        cepInput.addEventListener('blur', function() {
            buscarEnderecoPorCEPLocal(this.value, formEndereco);
        });
    }


    async function carregarEnderecosCliente() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado || !usuarioLogado.id) {
            mostrarNotificacaoGlobal('Usuário não logado.', 'erro');
            window.location.href = "/index";
            return;
        }

        try {
            const response = await fetch(`/api/clientes/${usuarioLogado.id}/enderecos?tipo=ENTREGA`);
            if (!response.ok) {
                if (response.status === 404) { // Cliente não encontrado
                     listaEnderecosContainer.innerHTML = '<p class="no-address">Cliente não encontrado. Faça login novamente.</p>';
                     return;
                }
                throw new Error('Falha ao carregar endereços.');
            }
            const enderecos = await response.json();
            exibirEnderecos(enderecos);
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            mostrarNotificacaoGlobal(error.message, 'erro');
            listaEnderecosContainer.innerHTML = '<p class="no-address">Erro ao carregar endereços.</p>';
        }
    }
    
    function exibirEnderecos(enderecos) {
        listaEnderecosContainer.innerHTML = '';
        
        if (!enderecos || enderecos.length === 0) {
            listaEnderecosContainer.innerHTML = '<p class="no-address">Nenhum endereço de entrega cadastrado.</p>';
            return;
        }

        // Verificar se existe um endereço padrão já salvo no localStorage para esta sessão de checkout
        const enderecoSelecionadoStorage = JSON.parse(localStorage.getItem('enderecoEntregaSelecionado'));

        enderecos.forEach((endereco) => {
            // Um endereço é "padrão para o checkout" se seu ID corresponder ao que está no localStorage
            const isPadraoCheckout = enderecoSelecionadoStorage && enderecoSelecionadoStorage.id === endereco.id;

            const enderecoHTML = `
                <div class="endereco-item ${isPadraoCheckout ? 'padrao' : ''}" data-endereco-id="${endereco.id}">
                    <input type="radio" name="enderecoSelecionado" value="${endereco.id}" id="endereco-${endereco.id}" ${isPadraoCheckout ? 'checked' : ''}>
                    <label for="endereco-${endereco.id}" class="address-info">
                        <p><strong>${endereco.logradouro}, ${endereco.numero}</strong>${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
                        <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
                        <p>CEP: ${endereco.cep}</p> </label>
                    </div>
            `;
            listaEnderecosContainer.insertAdjacentHTML('beforeend', enderecoHTML);
        });

         // Adicionar event listener para salvar a seleção no localStorage
        document.querySelectorAll('input[name="enderecoSelecionado"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const selecionadoId = parseInt(this.value);
                const enderecoEscolhido = enderecos.find(e => e.id === selecionadoId);
                if (enderecoEscolhido) {
                    localStorage.setItem('enderecoEntregaSelecionado', JSON.stringify(enderecoEscolhido));
                    // Atualizar a classe 'padrao' visualmente
                    document.querySelectorAll('.endereco-item').forEach(item => item.classList.remove('padrao'));
                    this.closest('.endereco-item').classList.add('padrao');
                }
            });
        });
    }

    async function salvarNovoEndereco(event) {
        event.preventDefault();
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado || !usuarioLogado.id) {
            mostrarNotificacaoGlobal('Usuário não logado.', 'erro');
            return;
        }

        const enderecoData = {
            cep: document.getElementById('cep').value, // O backend espera com máscara
            logradouro: document.getElementById('logradouro').value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim() || null,
            bairro: document.getElementById('bairro').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            uf: document.getElementById('uf').value.trim().toUpperCase(),
            tipo: "ENTREGA" // Ou baseado na seleção do form
        };
        
        // Validação básica no frontend (idealmente mais robusta)
        if (!enderecoData.cep || !enderecoData.logradouro || !enderecoData.numero || !enderecoData.bairro || !enderecoData.cidade || !enderecoData.uf) {
            mostrarNotificacaoGlobal('Preencha todos os campos obrigatórios do endereço.', 'erro');
            return;
        }

        try {
            const response = await fetch(`/api/clientes/${usuarioLogado.id}/enderecos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enderecoData)
            });
            if (!response.ok) {
                const error = await response.json().catch(()=> ({message: response.statusText}));
                throw new Error(error.message || 'Falha ao salvar endereço.');
            }
            const novoEnderecoSalvo = await response.json();
            
            // Marcar o novo endereço como selecionado e salvar no localStorage
            localStorage.setItem('enderecoEntregaSelecionado', JSON.stringify(novoEnderecoSalvo));
            
            await carregarEnderecosCliente(); // Recarrega a lista e aplica a classe 'padrao'
            formEndereco.reset();
            modal.style.display = 'none';
            mostrarNotificacaoGlobal('Endereço cadastrado com sucesso e selecionado para entrega!', 'sucesso');

        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            mostrarNotificacaoGlobal(error.message, 'erro');
        }
    }


    if(btnSalvarEndereco) {
        btnSalvarEndereco.addEventListener('click', salvarNovoEndereco);
    }

    if(btnNovoEndereco) {
        btnNovoEndereco.addEventListener('click', () => {
            if(formEndereco) formEndereco.reset();
            modal.style.display = 'flex';
        });
    }
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    btnContinuar.addEventListener('click', () => {
        const enderecoSelecionado = JSON.parse(localStorage.getItem('enderecoEntregaSelecionado'));
        
        if (!enderecoSelecionado) {
            mostrarNotificacaoGlobal('Por favor, selecione ou cadastre um endereço de entrega para continuar!', 'erro');
            return;
        }

        // Assume que frete já foi calculado/selecionado na tela do carrinho e está no localStorage
        let freteInfo = JSON.parse(localStorage.getItem('freteInfo'));
        const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];

        if (!freteInfo && carrinhoAtual.length > 0) {
            mostrarNotificacaoGlobal('Cálculo de frete pendente. Volte ao carrinho para calcular.', 'info');
            // Poderia redirecionar para o carrinho: window.location.href = '/'; (ou onde o carrinho é acessado)
            // Por enquanto, permite prosseguir, mas o ideal é ter o frete definido.
            // Vamos definir um frete padrão para demonstração se não houver, mas isso é problemático.
             console.warn("Frete não definido, usando padrão 0. Idealmente, impedir ou calcular aqui.");
             freteInfo = { valor: 0.00, tipo: "Não Calculado" };
             localStorage.setItem('freteInfo', JSON.stringify(freteInfo));
        } else if (!freteInfo && carrinhoAtual.length === 0) {
             freteInfo = { valor: 0.00, tipo: "N/A" }; // Sem itens, sem frete.
             localStorage.setItem('freteInfo', JSON.stringify(freteInfo));
        }


        window.location.href = '/Pagamento';
    });

    carregarEnderecosCliente(); // Carrega os endereços ao iniciar
});

// Função de notificação global (coloque em um script utils.js ou defina aqui)
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