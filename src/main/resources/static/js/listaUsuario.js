let currentPage = 1;
const usersPerPage = 10;
let searchQuery = '';
let users = [];

const apiUrl = 'http://localhost:8080/usuarios';

document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();
    setupModalEvents();
    hideAllModals();
});

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

function filterUsers() {
    return users.filter(user => user.ds_nome.toLowerCase().includes(searchQuery.toLowerCase()));
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

function openEditModal(ds_email) {
    const user = users.find(u => u.ds_email === ds_email);
    if (user) {
        document.getElementById('editUserName').value = user.ds_nome;
        document.getElementById('editUserEmail').value = user.ds_email;
        document.getElementById('editUserCpf').value = user.nr_cpf;
        document.getElementById('editUserGroup').value = user.id_grupo;
        document.getElementById('editUserId').value = user.id;  // Preenche o ID
        document.getElementById('editUserModal').style.display = 'block';
    }
}

async function editUser(event) {
    event.preventDefault();

    const id = document.getElementById('editUserId').value;  // Pega o ID do usuário
    const email = document.getElementById('editUserEmail').value;
    const updatedUser = {
        ds_nome: document.getElementById('editUserName').value,
        ds_email: email,
        nr_cpf: document.getElementById('editUserCpf').value,
        id_grupo: document.getElementById('editUserGroup').value,
        ds_senha: document.getElementById('editUserPassword').value,
    };

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
    }
}

document.getElementById('editUserForm').addEventListener('submit', editUser);

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const newUser = {
        ds_nome: document.getElementById('userName').value,
        nr_cpf: document.getElementById('userCpf').value,
        ds_email: document.getElementById('userEmail').value,
        ds_senha: document.getElementById('userPassword').value,
        id_grupo: document.getElementById('userGroup').value === 'admin' ? 1 : 2,
        bo_status: 1
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
async function toggleUserStatus(ds_email) {
    const user = users.find(u => u.ds_email === ds_email);
    if (user) {
        const newStatus = user.bo_status === 1 ? 0 : 1;

        try {
            const response = await fetch(`${apiUrl}/${user.id}/status`, {  // Chama o endpoint que alterna o status
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bo_status: newStatus }),  // Passa o novo status no corpo
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