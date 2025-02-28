// Exemplo de usuários iniciais
let users = [
  { nome: "xaropada", email: "Xaropada@gmail.com", status: "Ativo", grupo: "admin", cpf: "12345678900", senha: "Admin@123" },
  { nome: "Maria Oliveira", email: "maria.oliveira@email.com", status: "Ativo", grupo: "estoquista", cpf: "98765432100", senha: "senha123" },
  { nome: "Carlos Souza", email: "carlos.souza@email.com", status: "Inativo", grupo: "admin", cpf: "19283746500", senha: "senha123" },
  { nome: "Fernanda Lima", email: "fernanda.lima@email.com", status: "Ativo", grupo: "estoquista", cpf: "56473829100", senha: "senha123" },
  { nome: "Ricardo Costa", email: "ricardo.costa@email.com", status: "Inativo", grupo: "admin", cpf: "10293847500", senha: "senha123" },
  { nome: "João Silva", email: "joao.silva@email.com", status: "Ativo", grupo: "admin", cpf: "12345678900", senha: "senha123" },
  { nome: "Maria Oliveira", email: "maria.oliveira@email.com", status: "Ativo", grupo: "estoquista", cpf: "98765432100", senha: "senha123" },
  { nome: "Carlos Souza", email: "carlos.souza@email.com", status: "Inativo", grupo: "admin", cpf: "19283746500", senha: "senha123" },
  { nome: "Fernanda Lima", email: "fernanda.lima@email.com", status: "Ativo", grupo: "estoquista", cpf: "56473829100", senha: "senha123" },
  { nome: "Ricardo Costa", email: "ricardo.costa@email.com", status: "Inativo", grupo: "admin", cpf: "10293847500", senha: "senha123" },
  { nome: "João Silva", email: "joao.silva@email.com", status: "Ativo", grupo: "admin", cpf: "12345678900", senha: "senha123" },
  { nome: "Maria Oliveira", email: "maria.oliveira@email.com", status: "Ativo", grupo: "estoquista", cpf: "98765432100", senha: "senha123" },
  { nome: "Carlos Souza", email: "carlos.souza@email.com", status: "Inativo", grupo: "admin", cpf: "19283746500", senha: "senha123" },
  { nome: "Fernanda Lima", email: "fernanda.lima@email.com", status: "Ativo", grupo: "estoquista", cpf: "56473829100", senha: "senha123" },
  { nome: "Ricardo Costa", email: "ricardo.costa@email.com", status: "Inativo", grupo: "admin", cpf: "10293847500", senha: "senha123" },
  { nome: "João Silva", email: "joao.silva@email.com", status: "Ativo", grupo: "admin", cpf: "12345678900", senha: "senha123" },
  { nome: "Maria Oliveira", email: "maria.oliveira@email.com", status: "Ativo", grupo: "estoquista", cpf: "98765432100", senha: "senha123" },
  { nome: "Carlos Souza", email: "carlos.souza@email.com", status: "Inativo", grupo: "admin", cpf: "19283746500", senha: "senha123" },
  { nome: "Fernanda Lima", email: "fernanda.lima@email.com", status: "Ativo", grupo: "estoquista", cpf: "56473829100", senha: "senha123" },
  { nome: "Ricardo Costa", email: "ricardo.costa@email.com", status: "Inativo", grupo: "admin", cpf: "10293847500", senha: "senha123" },
  // Mais usuários aqui...
];

// Variáveis de controle de paginação
let currentPage = 1;
const usersPerPage = 10;
let searchQuery = '';

// Função para renderizar a lista de usuários na tabela
function renderUsers() {
  const filteredUsers = filterUsers();
  const paginatedUsers = paginate(filteredUsers);

  const tableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; // Limpar a tabela antes de adicionar novos dados

  // Preencher a tabela com os dados dos usuários
  paginatedUsers.forEach(user => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${user.nome}</td>
      <td>${user.email}</td>
      <td>${user.status}</td>
      <td>
        <button onclick="openEditModal('${user.email}')">Editar</button>
        <button onclick="openConfirmationModal('${user.email}')">${user.status === 'Ativo' ? 'Desativar' : 'Ativar'}</button>
      </td>
    `;
  });

  updatePagination(filteredUsers.length);
}

// Filtrar usuários apenas por nome
function filterUsers() {
  return users.filter(user => user.nome.toLowerCase().includes(searchQuery.toLowerCase()));
}

// Aplicar filtro baseado no nome
function applyFilters() {
  searchQuery = document.getElementById('search').value;
  currentPage = 1; // Resetar para a primeira página após aplicar filtro
  renderUsers();
}

// Paginação
function paginate(filteredUsers) {
  const startIndex = (currentPage - 1) * usersPerPage;
  return filteredUsers.slice(startIndex, startIndex + usersPerPage);
}

// Atualizar navegação da paginação
function updatePagination(filteredUsersCount) {
  const totalPages = Math.ceil(filteredUsersCount / usersPerPage);
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
  document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
}

// Alterar página
function changePage(direction) {
  if (direction === 'prev' && currentPage > 1) currentPage--;
  if (direction === 'next' && currentPage < Math.ceil(users.length / usersPerPage)) currentPage++;
  renderUsers();
}

// Funções de Modal de Cadastro
function openRegisterModal() {
  document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
  document.getElementById('registerModal').style.display = 'none';
}

// Funções de Modal de Edição
function openEditModal(email) {
  const user = users.find(u => u.email === email);
  document.getElementById('editUserName').value = user.nome;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserCpf').value = user.cpf;
  document.getElementById('editUserGroup').value = user.grupo;
  document.getElementById('editUserStatus').value = user.status;
  document.getElementById('editUserModal').style.display = 'block';
}

function closeEditModal() {
  document.getElementById('editUserModal').style.display = 'none';
}

function editUser() {
  // Aqui você vai editar o usuário no array 'users'
  const email = document.getElementById('editUserEmail').value;
  const userIndex = users.findIndex(u => u.email === email);
  const updatedUser = {
    nome: document.getElementById('editUserName').value,
    email: email,
    cpf: document.getElementById('editUserCpf').value,
    grupo: document.getElementById('editUserGroup').value,
    status: document.getElementById('editUserStatus').value,
    senha: document.getElementById('editUserPassword').value,
  };

  users[userIndex] = updatedUser; // Atualiza no array

  closeEditModal(); // Fecha o modal
  renderUsers(); // Re-renderiza a tabela
}

// Funções de Modal de Confirmação
function openConfirmationModal(email) {
  const user = users.find(u => u.email === email);
  document.getElementById('modalMessage').textContent = `Você deseja ${user.status === 'Ativo' ? 'desativar' : 'ativar'} o usuário ${user.nome}?`;
  document.getElementById('confirmBtn').onclick = () => toggleUserStatus(user.email);
  document.getElementById('confirmationModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('confirmationModal').style.display = 'none';
}

function toggleUserStatus(email) {
  const user = users.find(u => u.email === email);
  user.status = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
  closeModal();
  renderUsers();
}

// Inicializar com a renderização dos usuários
renderUsers();
