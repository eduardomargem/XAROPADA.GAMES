document.addEventListener("DOMContentLoaded", function() {
    // Elementos do DOM
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
        
        // Busca automática do CEP quando completo
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
            
            // Preenche os campos automaticamente
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

    // Salvar endereço no localStorage
    function salvarEndereco(event) {
        event.preventDefault();
        
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado) {
            alert('Faça login para cadastrar endereços!');
            window.location.href = '/index';
            return;
        }

        const endereco = {
            cep: cepInput.value.replace(/\D/g, ''),
            logradouro: document.getElementById('logradouro').value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            uf: document.getElementById('uf').value.trim().toUpperCase(),
            padrao: false
        };

        // Validação dos campos obrigatórios
        if (!endereco.cep || endereco.cep.length !== 8) {
            alert('CEP inválido!');
            return;
        }
        if (!endereco.logradouro) {
            alert('Logradouro é obrigatório!');
            return;
        }
        if (!endereco.numero) {
            alert('Número é obrigatório!');
            return;
        }
        if (!endereco.bairro) {
            alert('Bairro é obrigatório!');
            return;
        }
        if (!endereco.cidade) {
            alert('Cidade é obrigatória!');
            return;
        }
        if (!endereco.uf || endereco.uf.length !== 2) {
            alert('UF inválida!');
            return;
        }

        // Recupera ou inicializa a lista de endereços
        const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
        const usuarioIndex = usuariosCadastrados.findIndex(u => u.email === usuarioLogado.email);
        
        if (usuarioIndex === -1) {
            alert('Usuário não encontrado!');
            return;
        }

        // Inicializa o array de endereços se não existir
        if (!usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega) {
            usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega = [];
            endereco.padrao = true;
        } else if (usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.length === 0) {
            endereco.padrao = true;
        }

        // Adiciona o novo endereço
        usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.push(endereco);
        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
        
        // Atualiza a exibição
        exibirEnderecos(usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega);
        formEndereco.reset();
        modal.style.display = 'none';
        alert('Endereço cadastrado com sucesso!');
    }

    // Exibe os endereços cadastrados
    function exibirEnderecos(enderecos) {
        listaEnderecos.innerHTML = '';
        
        if (!enderecos || enderecos.length === 0) {
            listaEnderecos.innerHTML = '<p class="no-address">Nenhum endereço cadastrado.</p>';
            return;
        }

        enderecos.forEach((endereco, index) => {
            const enderecoHTML = `
                <div class="endereco-item ${endereco.padrao ? 'padrao' : ''}">
                    <div class="address-info">
                        <p><strong>${endereco.logradouro}, ${endereco.numero}</strong>${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
                        <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
                        <p>CEP: ${endereco.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</p>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-default" onclick="definirComoPadrao(${index})">
                            ${endereco.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                        </button>
                        <button class="btn-danger" onclick="removerEndereco(${index})">
                            REMOVER
                        </button>
                    </div>
                </div>
            `;
            listaEnderecos.insertAdjacentHTML('beforeend', enderecoHTML);
        });
    }

    // Define um endereço como padrão
    window.definirComoPadrao = function(index) {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados'));
        const usuarioIndex = usuariosCadastrados.findIndex(u => u.email === usuarioLogado.email);
        
        // Marca apenas o endereço selecionado como padrão
        usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.forEach((endereco, i) => {
            endereco.padrao = (i === index);
        });

        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
        exibirEnderecos(usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega);
        alert('Endereço padrão atualizado com sucesso!');
    };

    // Remove um endereço
    window.removerEndereco = function(index) {
        if (!confirm('Tem certeza que deseja remover este endereço?')) return;
        
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados'));
        const usuarioIndex = usuariosCadastrados.findIndex(u => u.email === usuarioLogado.email);
        
        // Verifica se é o último endereço
        if (usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.length <= 1) {
            alert('Você deve ter pelo menos um endereço cadastrado!');
            return;
        }
        
        // Remove o endereço
        usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.splice(index, 1);
        
        // Se o endereço removido era o padrão, define o primeiro como padrão
        const temPadrao = usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.some(e => e.padrao);
        if (!temPadrao && usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega.length > 0) {
            usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega[0].padrao = true;
        }

        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
        exibirEnderecos(usuariosCadastrados[usuarioIndex].dadosCompletos.enderecosEntrega);
        alert('Endereço removido com sucesso!');
    };

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

    btnContinuar.addEventListener('click', () => {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
        const usuario = usuariosCadastrados.find(u => u.email === usuarioLogado.email);
        
        if (!usuario.dadosCompletos.enderecosEntrega || usuario.dadosCompletos.enderecosEntrega.length === 0) {
            alert('Selecione ou cadastre um endereço para continuar!');
            return;
        }

        // Verifica se há um endereço padrão selecionado
        const enderecoPadrao = usuario.dadosCompletos.enderecosEntrega.find(e => e.padrao);
        if (!enderecoPadrao) {
            alert('Selecione um endereço padrão para entrega!');
            return;
        }

        // Redireciona para a página de pagamento
        window.location.href = '/Pagamento';
    });

    // Carrega os endereços ao iniciar
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado) {
        const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
        const usuario = usuariosCadastrados.find(u => u.email === usuarioLogado.email);
        if (usuario && usuario.dadosCompletos && usuario.dadosCompletos.enderecosEntrega) {
            exibirEnderecos(usuario.dadosCompletos.enderecosEntrega);
        }
    }
});