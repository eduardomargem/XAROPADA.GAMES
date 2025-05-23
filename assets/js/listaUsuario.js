// Array de usuários - será populado com os usuários cadastrados
let users = [
  { 
      id: 1, 
      nome: "admin", 
      email: "xaropada@gmail.com", 
      cpf: "726.792.360-76", 
      senha: "Admin@123", 
      grupo: "admin", 
      status: "Ativo" 
  },
  { 
      id: 2, 
      nome: "user", 
      email: "xaropadinha@gmail.com", 
      cpf: "203.032.760-37", 
      senha: "@100Senha", 
      grupo: "estoquista", 
      status: "Ativo" 
  }
];

// Verificar se há usuário logado
const loggedUser = JSON.parse(localStorage.getItem('usuarioLogado'));

// Se não estiver logado, redirecionar para login
if (!loggedUser) {
  window.location.href = 'index.html';
}

// Variáveis de controle
let currentPage = 1;
const usersPerPage = 10;
let searchQuery = '';
let currentAction = '';
let selectedUserId = null;

// Função para aplicar filtros de pesquisa
function applyFilters() {
  searchQuery = document.getElementById('search').value.trim().toLowerCase();
  currentPage = 1; // Resetar para a primeira página ao filtrar
  renderUsers();
}

// Função para abrir modal de cadastro
function openRegisterModal() {
  document.getElementById('registerForm').reset();
  aplicarMascaraCPF(document.getElementById('userCpf'));
  document.getElementById('registerModal').style.display = 'block';
  currentAction = 'register';
}

// Função para cadastrar novo usuário
function registerUser(event) {
  event.preventDefault();
  
  const nome = document.getElementById('userName').value.trim();
  const cpf = document.getElementById('userCpf').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const senha = document.getElementById('userPassword').value;
  const confirmarSenha = document.getElementById('userConfirmPassword').value;
  const grupo = document.getElementById('userGroup').value;

  // Validações
  if (!nome) return alert('Nome é obrigatório');
  if (!validarCPF(cpf)) return alert('CPF inválido');
  if (!validarEmail(email)) return alert('Email inválido');
  if (users.some(u => u.email === email)) return alert('Email já cadastrado');
  if (senha !== confirmarSenha) return alert('Senhas não coincidem');

  // Criar novo usuário
  const novoUsuario = {
      id: Date.now(),
      nome,
      cpf,
      email,
      senha,
      grupo,
      status: 'Ativo'
  };

  users.push(novoUsuario);
  closeRegisterModal();
  renderUsers();
  alert('Usuário cadastrado com sucesso!');
}

// Função para abrir modal de edição
function openEditModal(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('editUserName').value = user.nome;
  document.getElementById('editUserCpf').value = user.cpf;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserGroup').value = user.grupo;
  aplicarMascaraCPF(document.getElementById('editUserCpf'));
  document.getElementById('editUserModal').style.display = 'block';
  selectedUserId = userId;
  currentAction = 'edit';
}

// Função para editar usuário
function editUser(event) {
  event.preventDefault();
  
  const userIndex = users.findIndex(u => u.id === selectedUserId);
  if (userIndex === -1) return;

  const nome = document.getElementById('editUserName').value.trim();
  const cpf = document.getElementById('editUserCpf').value.trim();
  const grupo = document.getElementById('editUserGroup').value;
  const senha = document.getElementById('editUserPassword').value;
  const confirmarSenha = document.getElementById('editUserConfirmPassword').value;

  // Validações
  if (!nome) return alert('Nome é obrigatório');
  if (!validarCPF(cpf)) return alert('CPF inválido');
  if (senha && senha.length < 6) return alert('Senha deve ter pelo menos 6 caracteres');
  if (senha && senha !== confirmarSenha) return alert('Senhas não coincidem');

  // Atualizar usuário
  users[userIndex] = {
      ...users[userIndex],
      nome,
      cpf,
      grupo,
      senha: senha || users[userIndex].senha
  };

  closeEditModal();
  renderUsers();
  alert('Usuário atualizado com sucesso!');
}

// Função para renderizar a tabela com filtros
function renderUsers() {
  const tableBody = document.getElementById('usersTable').querySelector('tbody');
  tableBody.innerHTML = '';

  // Aplicar filtro de pesquisa se houver
  const filteredUsers = searchQuery 
    ? users.filter(user => user.nome.toLowerCase().includes(searchQuery))
    : users;

  // Aplicar paginação
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Atualizar informações de paginação
  document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${Math.ceil(filteredUsers.length / usersPerPage)}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === Math.ceil(filteredUsers.length / usersPerPage);

  // Preencher tabela
  paginatedUsers.forEach(user => {
      const row = tableBody.insertRow();
      row.innerHTML = `
          <td>${user.nome}</td>
          <td>${user.email}</td>
          <td>${user.cpf}</td>
          <td>${user.status}</td>
          <td>
              <button onclick="openEditModal(${user.id})">Editar</button>
              <button onclick="toggleUserStatus(${user.id})">
                  ${user.status === 'Ativo' ? 'Desativar' : 'Ativar'}
              </button>
          </td>
      `;
  });
}

// Função para mudar de página
function changePage(direction) {
  const totalPages = Math.ceil(users.length / usersPerPage);
  
  if (direction === 'prev' && currentPage > 1) {
      currentPage--;
  } else if (direction === 'next' && currentPage < totalPages) {
      currentPage++;
  }
  
  renderUsers();
}

// Função para alternar status do usuário
function toggleUserStatus(userId) {
  const user = users.find(u => u.id === userId);
  if (user) {
      user.status = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
      renderUsers();
  }
}

// Funções auxiliares
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Função para formatar CPF
function formatarCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para adicionar máscara ao CPF
function aplicarMascaraCPF(input) {
  input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 3) value = value.replace(/^(\d{3})/, '$1.');
      if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
      if (value.length > 11) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
      
      e.target.value = value.substring(0, 14);
  });
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function closeRegisterModal() {
  document.getElementById('registerModal').style.display = 'none';
}

function closeEditModal() {
  document.getElementById('editUserModal').style.display = 'none';
}

function closeModal() {
  document.getElementById('confirmationModal').style.display = 'none';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Event listeners
  document.getElementById('registerForm').addEventListener('submit', registerUser);
  document.getElementById('editUserForm').addEventListener('submit', editUser);
  
  // Adicionar evento de tecla para a pesquisa
  document.getElementById('search').addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
          applyFilters();
      }
  });

  // Renderizar tabela inicial
  renderUsers();
});