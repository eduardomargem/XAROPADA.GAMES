// Variáveis de controle de produtos e paginação
let produtos = [];
let currentProductPage = 1;
const productsPerPage = 10;
let productSearchQuery = '';

// Função para buscar os produtos do banco de dados e renderizar
function listarProdutos() {
  fetch('http://localhost:8080/produtos')
    .then(response => response.json())
    .then(data => {
      produtos = data;
      renderProducts(); // Chama a função que renderiza os produtos na tabela
    })
    .catch(error => console.error('Erro ao listar produtos:', error));
}

// Função para renderizar a lista de produtos na tabela
function renderProducts() {
  const filteredProducts = filterProducts();
  const paginatedProducts = paginateProducts(filteredProducts);

  const tableBody = document.getElementById('productsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; // Limpar a tabela antes de adicionar novos dados

  // Preencher a tabela com os dados dos produtos
  paginatedProducts.forEach(product => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.nome}</td>
      <td>${product.quantidade}</td>
      <td>${product.valor}</td>
      <td>${product.status || (product.quantidade > 0 ? 'Ativo' : 'Inativo')}</td>
      <td>
        <button onclick="openEditProductModal(${product.id})">Alterar</button>
        <button onclick="openProductConfirmationModal(${product.id})">${product.quantidade > 0 ? 'Desativar' : 'Reativar'}</button>
      </td>
    `;
  });

  updateProductPagination(filteredProducts.length);
}

// Filtrar produtos por nome
function filterProducts() {
  return produtos.filter(product => product.nome.toLowerCase().includes(productSearchQuery.toLowerCase()));
}

// Aplicar filtro baseado no nome do produto
function applyProductFilters() {
  productSearchQuery = document.getElementById('productSearch').value;
  currentProductPage = 1; // Resetar para a primeira página após aplicar filtro
  renderProducts();
}

// Paginação de produtos
function paginateProducts(filteredProducts) {
  const startIndex = (currentProductPage - 1) * productsPerPage;
  return filteredProducts.slice(startIndex, startIndex + productsPerPage);
}

// Atualizar navegação da paginação de produtos
function updateProductPagination(filteredProductsCount) {
  const totalPages = Math.ceil(filteredProductsCount / productsPerPage);
  document.getElementById('prevProductPage').disabled = currentProductPage === 1;
  document.getElementById('nextProductPage').disabled = currentProductPage === totalPages;
  document.getElementById('productPageInfo').textContent = `Página ${currentProductPage} de ${totalPages}`;
}

// Alterar página de produtos
function changeProductPage(direction) {
  const totalPages = Math.ceil(produtos.length / productsPerPage);
  if (direction === 'prev' && currentProductPage > 1) currentProductPage--;
  if (direction === 'next' && currentProductPage < totalPages) currentProductPage++;
  renderProducts();
}

// Funções de Modal de Cadastro de Produto
function openRegisterProductModal() {
  document.getElementById('registerProductModal').style.display = "block";
}

function closeRegisterProductModal() {
  document.getElementById('registerProductModal').style.display = "none";
}

// Função para cadastrar um novo produto
function cadastrarProduto() {
  const novoProduto = {
    nome: document.getElementById('productName').value,
    valor: document.getElementById('productPrice').value,
    quantidade: document.getElementById('productQuantity').value,
    descricao: document.getElementById('productDescription').value,
    avaliacao: document.getElementById('productRating').value
  };

  fetch('http://localhost:8080/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(novoProduto)
  })
  .then(response => response.json())
  .then(produtoCadastrado => {
    // Aqui você recebe o produto cadastrado com o ID gerado
    const imagens = document.getElementById('productImages').files;
    
    if (imagens.length > 0) {
      return addImage(produtoCadastrado.id, imagens)
        .then(() => produtoCadastrado);
    }
    return produtoCadastrado;
  })
  .then(() => {
    listarProdutos();
    closeRegisterProductModal();
  })
  .catch(error => console.error('Erro ao cadastrar produto:', error));
}

function addImage(produtoId, arquivosImagens) {
  const formData = new FormData();
  
  // Adiciona cada imagem ao FormData
  for (let i = 0; i < arquivosImagens.length; i++) {
    formData.append('imagens', arquivosImagens[i]);
  }
  
  return fetch(`http://localhost:8080/produtos/${produtoId}/imagens`, {
    method: 'POST',
    body: formData
  });
}

// Funções de Modal de Edição de Produto
function openEditProductModal(id) {
  const product = produtos.find(p => p.id === id);
  document.getElementById('editProductName').value = product.nome;
  document.getElementById('editProductCodigo').value = product.id;
  document.getElementById('editProductQuantity').value = product.quantidade;
  document.getElementById('editProductPrice').value = product.valor;
  document.getElementById('editProductModal').style.display = "block";
}

function closeEditProductModal() {
  document.getElementById('editProductModal').style.display = "none";
}

// Função para alterar um produto existente
function alterarProduto() {
  const produtoId = document.getElementById('editProductCodigo').value;

  const produtoAtualizado = {
    nome: document.getElementById('editProductName').value,
    quantidade: document.getElementById('editProductQuantity').value,
    valor: document.getElementById('editProductPrice').value
  };

  fetch(`http://localhost:8080/produtos/${produtoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produtoAtualizado)
  })
  .then(response => response.json())
  .then(data => {
    listarProdutos(); // Atualiza a lista de produtos
    closeEditProductModal(); // Fecha o modal de edição
  })
  .catch(error => console.error('Erro ao alterar produto:', error));
}

// Funções de Modal de Confirmação de Status de Produto
function openProductConfirmationModal(id) {
  const product = produtos.find(p => p.id === id);
  document.getElementById('productModalMessage').textContent = `Você deseja ${product.quantidade > 0 ? 'desativar' : 'reativar'} o produto ${product.nome}?`;
  document.getElementById('confirmProductBtn').onclick = () => toggleProductStatus(product.id);
  document.getElementById('productConfirmationModal').style.display = "block";
}

function closeProductModal() {
  document.getElementById('productConfirmationModal').style.display = "none";
}

// Função para alterar o status do produto
function toggleProductStatus(id) {
  const product = produtos.find(p => p.id === id);
  product.status = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
  closeProductModal();
  renderProducts();
}

// Fecha o modal se clicar fora da área do conteúdo do modal
window.onclick = function(event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

// Inicializar com a renderização dos produtos
listarProdutos(); // Carrega os produtos do backend e os renderiza na tabela
