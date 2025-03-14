let currentPage = 1;
const usersPerPage = 10;
let searchQuery = '';
let users = [];

const apiUrl = 'http://localhost:8080/usuarios';

document.addEventListener("DOMContentLoaded", () => {
    verificarPermissao();
    fetchUsers();
    setupModalEvents();
    hideAllModals();
});

// 🔹 Função para verificar a permissão do usuário antes de exibir a lista
function verificarPermissao() {
    const idGrupo = localStorage.getItem("id_grupo");

    if (idGrupo !== "1") {  // Se não for administrador, bloqueia o acesso
        alert("Acesso negado! Você não tem permissão para visualizar esta página.");
        window.location.href = "dashboard.html";
    }
}

// 🔹 Função para buscar usuários da API
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

// 🔹 Renderiza os usuários na tabela
function renderUsers() {
    const filteredUsers = filterUsers();
    const paginatedUsers = paginate(filteredUsers);
    
    const tableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    paginatedUsers.forEach(user => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${user.ds_nome}</td>
            <td>${user.ds_email}</td>
            <td>${user.bo_status === 1 ? 'Ativo' : 'Inativo'}</td>
            <td>
                <button onclick="openEditModal('${user.ds_email}')">Editar</button>
                <button onclick="toggleUserStatus('${user.ds_email}')">${user.bo_status === 1 ? 'Desativar' : 'Ativar'}</button>
            </td>
        `;
    });

    updatePagination(filteredUsers.length);
}

// 🔹 Filtro de usuários por nome
function filterUsers() {
    return users.filter(user => user.ds_nome.toLowerCase().includes(searchQuery.toLowerCase()));
}

// 🔹 Aplica os filtros ao buscar usuários
function applyFilters() {
    searchQuery = document.getElementById('search').value;
    currentPage = 1;
    renderUsers();
}

// 🔹 Paginação da tabela
function paginate(filteredUsers) {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
}

// 🔹 Atualiza os botões de paginação
function updatePagination(filteredUsersCount) {
    const totalPages = Math.ceil(filteredUsersCount / usersPerPage);
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
}

// 🔹 Muda a página na navegação
function changePage(direction) {
    if (direction === 'prev' && currentPage > 1) currentPage--;
    if (direction === 'next' && currentPage < Math.ceil(users.length / usersPerPage)) currentPage++;
    renderUsers();
}

// 🔹 Eventos dos modais
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

// 🔹 Esconde todos os modais
function hideAllModals() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('editUserModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'none';
}

// 🔹 Abre modal de edição
function openEditModal(ds_email) {
    const user = users.find(u => u.ds_email === ds_email);
    if (user) {
        document.getElementById('editUserName').value = user.ds_nome;
        document.getElementById('editUserEmail').value = user.ds_email;
        document.getElementById('editUserCpf').value = user.nr_cpf;
        document.getElementById('editUserGroup').value = user.id_grupo;
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserModal').style.display = 'block';
    }
}

// 🔹 Edita usuário
async function editUser(event) {
    event.preventDefault();

    const id = document.getElementById('editUserId').value;
    const updatedUser = {
        ds_nome: document.getElementById('editUserName').value,
        ds_email: document.getElementById('editUserEmail').value,
        nr_cpf: document.getElementById('editUserCpf').value,
        id_grupo: document.getElementById('editUserGroup').value,
        ds_senha: document.getElementById('editUserPassword').value,
    };

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
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
    }
}

document.getElementById('editUserForm').addEventListener('submit', editUser);

// 🔹 Alterna status de ativação do usuário
async function toggleUserStatus(ds_email) {
    const user = users.find(u => u.ds_email === ds_email);
    if (user) {
        const newStatus = user.bo_status === 1 ? 0 : 1;

        try {
            const response = await fetch(`${apiUrl}/${user.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bo_status: newStatus }),
            });

            if (response.ok) {
                alert('Status do usuário alterado com sucesso!');
                fetchUsers();
            } else {
                alert('Erro ao alterar status do usuário.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao alterar status do usuário.');
        }
    }
}
