let currentPage = 1;
const usersPerPage = 4;
let searchQuery = '';
let users = [];

const apiUrl = 'http://localhost:8080/usuarios';

// Função de validação de CPF (adicionada conforme o algoritmo do Macoratti)
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    
    // Elimina CPFs invalidos conhecidos
    if (cpf.length !== 11 ||
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999")
        return false;
        
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11)
        rev = 0;
    if (rev !== parseInt(cpf.charAt(9)))
        return false;
        
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11)
        rev = 0;
    if (rev !== parseInt(cpf.charAt(10)))
        return false;
        
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    verificarPermissaoAdmin();
    fetchUsers();
    setupModalEvents();
    hideAllModals();
});

function verificarAutenticacao() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) {
        window.location.href = "/index";
        return null;
    }
    return usuario;
}

// Verifica se o usuário tem permissão (admin = grupo 1)
function verificarPermissaoAdmin() {
    const usuario = verificarAutenticacao();
    if (usuario && usuario.idGrupo !== 1) {
        window.location.href = "/dashboard-admin";
        return false;
    }
    return true;
  }

async function fetchUsers() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Erro ao buscar usuários');
        }
        users = await response.json();
        renderUsers();
    } catch (error) {
        console.error('Erro:', error);
        users = [];
        renderUsers();
    }
}

function renderUsers() {
    const filteredUsers = filterUsers();
    const paginatedUsers = paginate(filteredUsers);
    
    const tableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    paginatedUsers.forEach(user => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${user.dsNome}</td>
            <td>${user.dsEmail}</td>
            <td>${user.boStatus === 1 ? 'Ativo' : 'Inativo'}</td>
            <td>
                <button onclick="openEditModal('${user.dsEmail}')">Editar</button>
                <button onclick="toggleUserStatus('${user.dsEmail}')">${user.boStatus === 1 ? 'Desativar' : 'Ativar'}</button>
            </td>
        `;
    });

    updatePagination(filteredUsers.length);
}

function filterUsers() {
    return users.filter(user => user.dsNome.toLowerCase().includes(searchQuery.toLowerCase()));
}

function applyFilters() {
    searchQuery = document.getElementById('search').value;
    currentPage = 1;
    renderUsers();
}

function paginate(filteredUsers) {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
}

function updatePagination(filteredUsersCount) {
    const totalPages = Math.ceil(filteredUsersCount / usersPerPage);
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
}

function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) currentPage--;
    if (direction === 'next' && currentPage < Math.ceil(users.length / usersPerPage)) currentPage++;
    renderUsers();
}

function setupModalEvents() {
    document.querySelectorAll(".modal .close").forEach(button => {
        button.addEventListener("click", () => {
            button.closest(".modal").style.display = "none";
        });
    });

    window.addEventListener("click", (event) => {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    });
}

function hideAllModals() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'none';
}

function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function openEditModal(dsEmail) {
    const user = users.find(u => u.dsEmail === dsEmail);
    if (user) {
        document.getElementById('editUserName').value = user.dsNome;
        document.getElementById('editUserEmail').value = user.dsEmail;
        document.getElementById('editUserCpf').value = user.nrCpf;
        document.getElementById('editUserGroup').value = user.idGrupo;
        document.getElementById('editUserId').value = user.id;  // Preenche o ID
        document.getElementById('editUserModal').style.display = 'block';
    }
}

async function editUser(event) {
    event.preventDefault();

    // Valida o CPF antes de enviar
    const cpf = document.getElementById('editUserCpf').value;
    if (!validarCPF(cpf)) {
        alert('CPF inválido! Por favor, insira um CPF válido.');
        return;
    }

    // Exibir loader ou desativar botão de salvar alterações
    const saveButton = document.querySelector('#editUserForm button[type="submit"]');
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';

    const id = document.getElementById('editUserId').value;  // Pega o ID do usuário
    const email = document.getElementById('editUserEmail').value;
    const updatedUser = {
        dsNome: document.getElementById('editUserName').value,
        nrCpf: cpf,
        dsEmail: email,
        dsSenha: document.getElementById('editUserPassword').value,
        idGrupo: document.getElementById('editUserGroup').value,
        boStatus: 1
    };

    console.log('Dados para envio:', updatedUser); // Debug

    try {
        const response = await fetch(`${apiUrl}/${id}`, {  // Usa o ID do campo oculto
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            alert('Usuário atualizado com sucesso!');
            document.getElementById('editUserModal').style.display = 'none';
            fetchUsers();
        } else {
            alert('Erro ao atualizar o usuário.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar o usuário.');
    } finally {
        // Ocultar loader ou habilitar botão de salvar novamente
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar Alterações';
    }
}

document.getElementById('editUserForm').addEventListener('submit', editUser);

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Valida o CPF antes de enviar
    const cpf = document.getElementById('userCpf').value;
    if (!validarCPF(cpf)) {
        alert('CPF inválido! Por favor, insira um CPF válido.');
        return;
    }

    const newUser = {
        dsNome: document.getElementById('userName').value,
        nrCpf: cpf,
        dsEmail: document.getElementById('userEmail').value,
        dsSenha: document.getElementById('userPassword').value,
        idGrupo: document.getElementById('userGroup').value === 'admin' ? 1 : 2,
        boStatus: 1
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (response.ok) {
            alert("Usuário cadastrado com sucesso!");
            document.getElementById('registerModal').style.display = 'none';
            fetchUsers();
        } else {
            alert("Erro ao cadastrar usuário.");
        }
    } catch (error) {
        console.error('Erro:', error);
        alert("Erro ao cadastrar usuário.");
    }
});

// Função para alternar o status de ativação/desativação do usuário
async function toggleUserStatus(dsEmail) {
    const user = users.find(u => u.dsEmail === dsEmail);
    if (user) {
        const newStatus = user.boStatus === 1 ? 0 : 1;

        try {
            const response = await fetch(`${apiUrl}/${user.id}/status`, {  // Chama o endpoint que alterna o status
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ boStatus: newStatus }),  // Passa o novo status no corpo
            });

            if (response.ok) {
                alert('Status do usuário alterado com sucesso!');
                fetchUsers();  // Atualiza a lista de usuários após a alteração
            } else {
                alert('Erro ao alterar status do usuário.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao alterar status do usuário.');
        }
    }
}