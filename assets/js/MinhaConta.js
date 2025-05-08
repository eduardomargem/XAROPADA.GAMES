document.addEventListener("DOMContentLoaded", function() {
    // Verifica se o usuário está logado
    if (!localStorage.getItem('usuarioLogado')) {
        window.location.href = "index.html";
        return;
    }
    
    // Carrega dados do usuário
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
    const cliente = clientes.find(c => c.email === usuario.email);
    
    // Preenche os campos do formulário
    document.getElementById('editNome').value = cliente.dadosCompletos?.nome || cliente.nome || '';
    document.getElementById('editNascimento').value = cliente.dadosCompletos?.nascimento || '';
    document.getElementById('editGenero').value = cliente.dadosCompletos?.genero || '';
    document.getElementById('editEmail').value = cliente.email;
    
    // Exibe os endereços cadastrados
    exibirEnderecos(cliente.dadosCompletos?.enderecosEntrega || cliente.enderecosEntrega || []);
    
    // Exibe as formas de pagamento
    exibirPagamentos(cliente.dadosCompletos?.formasPagamento || []);
    
    // Configura máscara e busca automática do CEP
    const cepInput = document.getElementById('modalCep');
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
        
        // Quando o CEP estiver completo (8 dígitos + traço), busca os dados
        if (value.length === 9) {
            buscarEnderecoPorCEP(value);
        }
    });
    
    // Configura máscaras para os campos do cartão
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
});

// Função para buscar endereço via API ViaCEP
async function buscarEnderecoPorCEP(cep) {
    // Remove traço e espaços do CEP
    const cepNumerico = cep.replace(/\D/g, '');
    const loadingElement = document.createElement('div');
    loadingElement.textContent = 'Buscando endereço...';
    loadingElement.style.color = '#00ff00';
    loadingElement.style.margin = '5px 0';
    
    // Insere mensagem de carregamento
    const cepGroup = document.querySelector('#modalCep').parentNode;
    cepGroup.appendChild(loadingElement);
    
    if (cepNumerico.length !== 8) {
        loadingElement.remove();
        return;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        
        loadingElement.remove();
        
        if (data.erro) {
            alert('CEP não encontrado. Por favor, verifique o número digitado.');
            return;
        }
        
        // Preenche os campos do formulário com os dados da API
        document.getElementById('modalLogradouro').value = data.logradouro || '';
        document.getElementById('modalBairro').value = data.bairro || '';
        document.getElementById('modalCidade').value = data.localidade || '';
        document.getElementById('modalUf').value = data.uf || '';
        
        // Foca no campo número (único que o usuário precisa preencher)
        document.getElementById('modalNumero').focus();
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        loadingElement.textContent = 'Erro ao consultar CEP. Tente novamente.';
        setTimeout(() => loadingElement.remove(), 3000);
    }
}

function abrirModalEndereco() {
    document.getElementById('addressModal').style.display = 'block';
    document.getElementById('addressForm').reset();
}

function fecharModalEndereco() {
    document.getElementById('addressModal').style.display = 'none';
}

function salvarEndereco() {
    const cep = document.getElementById('modalCep').value;
    const logradouro = document.getElementById('modalLogradouro').value;
    const numero = document.getElementById('modalNumero').value;
    const complemento = document.getElementById('modalComplemento').value;
    const bairro = document.getElementById('modalBairro').value;
    const cidade = document.getElementById('modalCidade').value;
    const uf = document.getElementById('modalUf').value;
    
    // Validação básica
    if (!cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    const novoEndereco = {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf: uf.toUpperCase(),
        padrao: false
    };
    
    // Inicializa o array de endereços se não existir
    if (!clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos = {};
    }
    
    if (!clientes[clienteIndex].dadosCompletos.enderecosEntrega) {
        clientes[clienteIndex].dadosCompletos.enderecosEntrega = [];
        novoEndereco.padrao = true;
    } else if (clientes[clienteIndex].dadosCompletos.enderecosEntrega.length === 0) {
        novoEndereco.padrao = true;
    }
    
    clientes[clienteIndex].dadosCompletos.enderecosEntrega.push(novoEndereco);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    
    exibirEnderecos(clientes[clienteIndex].dadosCompletos.enderecosEntrega);
    fecharModalEndereco();
    alert('Endereço cadastrado com sucesso!');
}

function atualizarDados() {
    const nome = document.getElementById('editNome').value;
    const nascimento = document.getElementById('editNascimento').value;
    const genero = document.getElementById('editGenero').value;
    
    // Validação básica
    if (!nome || !nascimento || !genero) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Atualiza os dados pessoais
    if (!clientes[clienteIndex].dadosCompletos) {
        clientes[clienteIndex].dadosCompletos = {};
    }
    
    clientes[clienteIndex].dadosCompletos.nome = nome;
    clientes[clienteIndex].dadosCompletos.nascimento = nascimento;
    clientes[clienteIndex].dadosCompletos.genero = genero;
    
    // Mantém a compatibilidade com versões antigas
    clientes[clienteIndex].nome = nome;
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    alert("Dados pessoais atualizados com sucesso!");
}

async function alterarSenha() {
    const novaSenha = document.getElementById('novaSenha').value;
    
    if (novaSenha.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres!");
        return;
    }
    
    if (!confirm("Tem certeza que deseja alterar sua senha?")) {
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    clientes[clienteIndex].senha = await encriptarSenha(novaSenha);
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    alert("Senha atualizada com sucesso!");
    document.getElementById('novaSenha').value = '';
}

function exibirEnderecos(enderecos) {
    const listaEnderecos = document.getElementById('listaEnderecos');
    listaEnderecos.innerHTML = "";
    
    if (enderecos.length === 0) {
        listaEnderecos.innerHTML = '<p class="no-address">Nenhum endereço cadastrado ainda.</p>';
        return;
    }
    
    enderecos.forEach((endereco, index) => {
        const enderecoElement = document.createElement('div');
        enderecoElement.className = `endereco-item ${endereco.padrao ? 'padrao' : ''}`;
        enderecoElement.innerHTML = `
            <div class="address-info">
                <p><strong>${endereco.logradouro}, ${endereco.numero}</strong>${endereco.complemento ? ' - ' + endereco.complemento : ''}</p>
                <p>${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}</p>
                <p>CEP: ${endereco.cep}</p>
            </div>
            <div class="action-buttons">
                <button class="btn-default" onclick="definirComoPadrao(${index})">
                    ${endereco.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                </button>
                <button class="btn-default" onclick="removerEndereco(${index})">
                    <i class="fas fa-trash"></i> REMOVER
                </button>
            </div>
        `;
        listaEnderecos.appendChild(enderecoElement);
    });
}

function removerEndereco(index) {
    if (!confirm("Tem certeza que deseja remover este endereço?")) {
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Remove o endereço
    clientes[clienteIndex].dadosCompletos.enderecosEntrega.splice(index, 1);
    
    // Se era o único endereço, limpa o array
    if (clientes[clienteIndex].dadosCompletos.enderecosEntrega.length === 0) {
        clientes[clienteIndex].dadosCompletos.enderecosEntrega = [];
    }
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirEnderecos(clientes[clienteIndex].dadosCompletos.enderecosEntrega);
    alert("Endereço removido com sucesso!");
}

function definirComoPadrao(index) {
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Verifica se os endereços estão em dadosCompletos
    const enderecos = clientes[clienteIndex].dadosCompletos?.enderecosEntrega;
    
    enderecos.forEach((end, i) => {
        end.padrao = (i === index);
    });
    
    clientes[clienteIndex].dadosCompletos.enderecosEntrega = enderecos;
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirEnderecos(enderecos);
    alert("Endereço padrão atualizado com sucesso!");
}

// Funções para o modal de pagamento
function abrirModalPagamento() {
    document.getElementById('paymentModal').style.display = 'block';
    document.getElementById('paymentForm').reset();
    document.getElementById('cartaoFields').style.display = 'none';
}

function fecharModalPagamento() {
    document.getElementById('paymentModal').style.display = 'none';
}

function mostrarCamposCartao() {
    const tipoPagamento = document.getElementById('modalTipoPagamento').value;
    const cartaoFields = document.getElementById('cartaoFields');
    
    if (tipoPagamento === 'credito') {
        cartaoFields.style.display = 'block';
    } else {
        cartaoFields.style.display = 'none';
    }
}

function salvarPagamento() {
    const tipoPagamento = document.getElementById('modalTipoPagamento').value;
    
    if (!tipoPagamento) {
        alert('Por favor, selecione um tipo de pagamento!');
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    let novoPagamento;
    
    if (tipoPagamento === 'boleto') {
        novoPagamento = {
            tipo: 'boleto',
            padrao: false
        };
    } else if (tipoPagamento === 'credito') {
        const nomeCartao = document.getElementById('modalNomeCartao').value;
        const numeroCartao = document.getElementById('modalNumeroCartao').value;
        const validadeCartao = document.getElementById('modalValidadeCartao').value;
        const cvvCartao = document.getElementById('modalCvvCartao').value;
        const parcelas = document.getElementById('modalParcelas').value;
        
        // Validação dos campos do cartão
        if (!nomeCartao || !numeroCartao || !validadeCartao || !cvvCartao) {
            alert('Por favor, preencha todos os campos do cartão!');
            return;
        }
        
        if (!validarNumeroCartao(numeroCartao)) {
            alert('Número do cartão inválido!');
            return;
        }
        
        if (!validarValidade(validadeCartao)) {
            alert('Data de validade inválida! Use o formato MM/AAAA');
            return;
        }
        
        if (!validarCVV(cvvCartao)) {
            alert('CVV inválido! Deve ter 3 ou 4 dígitos');
            return;
        }
        
        novoPagamento = {
            tipo: 'credito',
            nomeCartao,
            numeroCartao: numeroCartao.replace(/\s/g, ''),
            ultimosDigitos: numeroCartao.slice(-4),
            validadeCartao,
            cvvCartao,
            parcelas,
            padrao: false
        };
    }
    
    // Inicializa o array de pagamentos se não existir
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
    
    exibirPagamentos(clientes[clienteIndex].dadosCompletos.formasPagamento);
    fecharModalPagamento();
    alert('Forma de pagamento cadastrada com sucesso!');
}

function exibirPagamentos(pagamentos) {
    const listaPagamentos = document.getElementById('listaPagamentos');
    listaPagamentos.innerHTML = "";
    
    if (!pagamentos || pagamentos.length === 0) {
        listaPagamentos.innerHTML = '<p class="no-payment">Nenhuma forma de pagamento cadastrada ainda.</p>';
        return;
    }
    
    pagamentos.forEach((pagamento, index) => {
        const pagamentoElement = document.createElement('div');
        pagamentoElement.className = `payment-item ${pagamento.padrao ? 'padrao' : ''}`;
        
        if (pagamento.tipo === 'boleto') {
            pagamentoElement.innerHTML = `
                <div class="payment-info">
                    <p><strong>Boleto Bancário</strong></p>
                </div>
                <div class="action-buttons">
                    <button class="btn-default" onclick="definirComoPadraoPagamento(${index})">
                        ${pagamento.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                    </button>
                    <button class="btn-default" onclick="removerPagamento(${index})">
                        <i class="fas fa-trash"></i> REMOVER
                    </button>
                </div>
            `;
        } else if (pagamento.tipo === 'credito') {
            pagamentoElement.innerHTML = `
                <div class="payment-info">
                    <p><strong>Cartão de Crédito</strong></p>
                    <p>${pagamento.nomeCartao}</p>
                    <p>**** **** **** ${pagamento.ultimosDigitos}</p>
                    <p>Validade: ${pagamento.validadeCartao} | Parcelas: ${pagamento.parcelas}x</p>
                </div>
                <div class="action-buttons">
                    <button class="btn-default" onclick="definirComoPadraoPagamento(${index})">
                        ${pagamento.padrao ? '✅ PADRÃO' : 'DEFINIR PADRÃO'}
                    </button>
                    <button class="btn-default" onclick="removerPagamento(${index})">
                        <i class="fas fa-trash"></i> REMOVER
                    </button>
                </div>
            `;
        }
        
        listaPagamentos.appendChild(pagamentoElement);
    });
}

function removerPagamento(index) {
    if (!confirm("Tem certeza que deseja remover esta forma de pagamento?")) {
        return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Remove a forma de pagamento
    clientes[clienteIndex].dadosCompletos.formasPagamento.splice(index, 1);
    
    // Se era a única forma de pagamento, limpa o array
    if (clientes[clienteIndex].dadosCompletos.formasPagamento.length === 0) {
        clientes[clienteIndex].dadosCompletos.formasPagamento = [];
    }
    
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirPagamentos(clientes[clienteIndex].dadosCompletos.formasPagamento);
    alert("Forma de pagamento removida com sucesso!");
}

function definirComoPadraoPagamento(index) {
    const clientes = JSON.parse(localStorage.getItem('usuariosCadastrados'));
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    const clienteIndex = clientes.findIndex(c => c.email === usuario.email);
    
    // Verifica se os pagamentos estão em dadosCompletos
    const pagamentos = clientes[clienteIndex].dadosCompletos?.formasPagamento;
    
    pagamentos.forEach((pag, i) => {
        pag.padrao = (i === index);
    });
    
    clientes[clienteIndex].dadosCompletos.formasPagamento = pagamentos;
    localStorage.setItem('usuariosCadastrados', JSON.stringify(clientes));
    exibirPagamentos(pagamentos);
    alert("Forma de pagamento padrão atualizada com sucesso!");
}

// Funções de validação
function validarNumeroCartao(numero) {
    // Remove espaços e verifica se tem 16 dígitos
    const numeroLimpo = numero.replace(/\s/g, '');
    return /^\d{16}$/.test(numeroLimpo);
}

function validarValidade(validade) {
    // Verifica o formato MM/AAAA
    if (!/^\d{2}\/\d{4}$/.test(validade)) return false;
    
    const [mes, ano] = validade.split('/').map(Number);
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;
    
    // Verifica se a data é no futuro
    if (ano < anoAtual) return false;
    if (ano === anoAtual && mes < mesAtual) return false;
    if (mes < 1 || mes > 12) return false;
    
    return true;
}

function validarCVV(cvv) {
    // CVV pode ter 3 ou 4 dígitos
    return /^\d{3,4}$/.test(cvv);
}

function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem('usuarioLogado');
        window.location.href = "index.html";
    }
}

// Função auxiliar para encriptação
async function encriptarSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}