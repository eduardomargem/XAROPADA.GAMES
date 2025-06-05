document.addEventListener("DOMContentLoaded", function() {
    const API_URL = 'http://localhost:8080/api'; // URL base da API
    const formEndereco = document.getElementById('addressForm');
    const cepInput = document.getElementById('cep');
    const btnSalvarEndereco = document.getElementById('btnSalvarEndereco');
    const listaEnderecos = document.getElementById('listaEnderecos');
    const btnContinuar = document.getElementById('btnContinuar');
    const btnNovoEndereco = document.getElementById('btnNovoEndereco');
    const modal = document.getElementById('addressModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Máscara de CEP
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
        
        if (value.length === 9) {
            buscarEnderecoPorCEP(value);
        }
    });

    // Busca CEP via API ViaCEP
    async function buscarEnderecoPorCEP(cep) {
        const cepNumerico = cep.replace(/\D/g, '');
        if (cepNumerico.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                alert('CEP não encontrado. Verifique o número digitado.');
                return;
            }
            
            document.getElementById('logradouro').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('uf').value = data.uf || '';
            document.getElementById('numero').focus();
            
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao consultar CEP. Tente novamente.');
        }
    }

    // Salvar endereço via API
    async function salvarEndereco(event) {
        event.preventDefault();
        
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) {
            alert('Faça login para cadastrar endereços!');
            window.location.href = '/index';
            return;
        }

        const enderecoDTO = {
            tipo: document.querySelector('input[name="addressType"]:checked').value.toUpperCase(),
            cep: cepInput.value,
            logradouro: document.getElementById('logradouro').value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            uf: document.getElementById('uf').value.trim().toUpperCase()
        };
        
        try {
            const method = formEndereco.dataset.editingId ? 'PUT' : 'POST';
            const url = formEndereco.dataset.editingId 
                ? `${API_URL}/clientes/${usuarioLogado.id}/enderecos/${formEndereco.dataset.editingId}`
                : `${API_URL}/clientes/${usuarioLogado.id}/enderecos`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enderecoDTO)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao salvar endereço');
            }

            const enderecoSalvo = await response.json();
            carregarEnderecosCliente(usuarioLogado.id);
            formEndereco.reset();
            delete formEndereco.dataset.editingId;
            modal.style.display = 'none';
            mostrarNotificacao(`Endereço ${method === 'POST' ? 'cadastrado' : 'atualizado'} com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            alert(error.message || 'Erro ao salvar endereço. Tente novamente.');
        }
    }

    // Carrega endereços do cliente
    async function carregarEnderecosCliente(clienteId) {
        try {
            const response = await fetch(`${API_URL}/clientes/${clienteId}/enderecos`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar endereços');
            }
            
            const enderecos = await response.json();
            exibirEnderecos(enderecos);
            
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            listaEnderecos.innerHTML = '<p class="no-address">Erro ao carregar endereços.</p>';
        }
    }

    // Exibe os endereços na tela
    function exibirEnderecos(enderecos) {
        listaEnderecos.innerHTML = '';
    
    if (!enderecos || enderecos.length === 0) {
        listaEnderecos.innerHTML = `
            <div class="no-address">
                <i class="fas fa-map-marker-alt"></i>
                <p>Nenhum endereço cadastrado.</p>
                <button id="btnAdicionarPrimeiroEndereco" class="btn-primary">
                    Adicionar primeiro endereço
                </button>
            </div>
        `;
        
        document.getElementById('btnAdicionarPrimeiroEndereco')?.addEventListener('click', () => {
            formEndereco.reset();
            modal.style.display = 'flex';
        });
        return;
    }

        enderecos.forEach((endereco, index) => {
            const tipoEndereco = endereco.tipo === 'FATURAMENTO' ? 'Faturamento' : 'Entrega';
            const isPrincipal = index === 0;
            
            const enderecoHTML = `
                <div class="endereco-item ${isPrincipal ? 'principal' : ''}">
                    <div class="address-info">
                        <span class="address-type">${tipoEndereco}</span>
                        <p><strong>${endereco.logradouro}, ${endereco.numero}</strong>${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
                        <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
                        <p>CEP: ${formatarCEP(endereco.cep)}</p>
                    </div>
                    <div class="action-buttons">
                        <label class="radio-container">
                            <input type="radio" name="enderecoSelecionado" value="${endereco.id}" ${isPrincipal ? 'checked' : ''}>
                            <span class="radio-checkmark"></span>
                            Selecionar
                        </label>
                        <button class="btn-edit" data-endereco-id="${endereco.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
            listaEnderecos.insertAdjacentHTML('beforeend', enderecoHTML);
        });

        // Adiciona eventos para os botões de edição
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const enderecoId = e.currentTarget.getAttribute('data-endereco-id');
                carregarEnderecoParaEdicao(enderecoId);
            });
        });
    }

    // Função auxiliar para formatar CEP
    function formatarCEP(cep) {
        return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Função para carregar endereço para edição
    async function carregarEnderecoParaEdicao(enderecoId) {
        try {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            const response = await fetch(`${API_URL}/clientes/${usuarioLogado.id}/enderecos/${enderecoId}`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar endereço');
            }
            
            const endereco = await response.json();
            
            // Preenche o formulário com os dados do endereço
            const addressTypeInput = document.querySelector(`input[name="addressType"][value="${endereco.tipo.toLowerCase()}"]`);
            if (addressTypeInput) {
                addressTypeInput.checked = true;
            } else {
                console.warn(`Tipo de endereço não encontrado: ${endereco.tipo}`);
                // Marca o primeiro radio button como fallback
                document.querySelector('input[name="addressType"]').checked = true;
            }
            
            document.getElementById('cep').value = endereco.cep;
            document.getElementById('logradouro').value = endereco.logradouro;
            document.getElementById('numero').value = endereco.numero;
            document.getElementById('complemento').value = endereco.complemento || '';
            document.getElementById('bairro').value = endereco.bairro;
            document.getElementById('cidade').value = endereco.cidade;
            document.getElementById('uf').value = endereco.uf;
            
            // Armazena o ID do endereço que está sendo editado
            formEndereco.dataset.editingId = enderecoId;
            
            // Mostra o modal
            modal.style.display = 'flex';
            
        } catch (error) {
            console.error('Erro ao carregar endereço para edição:', error);
            mostrarNotificacao('Erro ao carregar endereço para edição', 'erro');
        }
    }

    // Event Listeners
    btnSalvarEndereco.addEventListener('click', salvarEndereco);
    btnNovoEndereco.addEventListener('click', () => {
        formEndereco.reset();
        modal.style.display = 'flex';
    });
    
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

    btnContinuar.addEventListener('click', async () => {
        const enderecoSelecionado = document.querySelector('input[name="enderecoSelecionado"]:checked');
        
        if (!enderecoSelecionado) {
            alert('Selecione um endereço para entrega!');
            return;
        }

        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = '/login';
            return;
        }

        try {
            // Busca o endereço completo da API
            const response = await fetch(`${API_URL}/clientes/${usuarioLogado.id}/enderecos/${enderecoSelecionado.value}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar endereço selecionado');
            }
            
            const enderecoCompleto = await response.json();
            
            // Salva o objeto completo do endereço no localStorage
            localStorage.setItem('enderecoSelecionado', JSON.stringify(enderecoCompleto));
            window.location.href = '/Pagamento';
            
        } catch (error) {
            console.error('Erro ao selecionar endereço:', error);
            alert('Erro ao selecionar endereço. Tente novamente.');
        }
    });

    // Carrega os endereços ao iniciar
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado && usuarioLogado.id) {
        carregarEnderecosCliente(usuarioLogado.id);
    }

    // Função para mostrar notificação
    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <i class="fas fa-${tipo === 'erro' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${mensagem}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
});