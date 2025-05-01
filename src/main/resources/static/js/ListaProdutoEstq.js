// Variáveis de controle de produtos e paginação
let produtos = [];
let currentProductPage = 1;
const productsPerPage = 10;
let productSearchQuery = '';
let currentEditingProductId = null;

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
  tableBody.innerHTML = '';

  paginatedProducts.forEach(product => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.nome}</td>
      <td>${product.quantidade}</td>
      <td>R$ ${product.preco.toFixed(2)}</td>
      <td>${product.bo_status === 1 ? 'Ativo' : 'Inativo'}</td>
      <td>
        <button onclick="openEditProductModal(${product.id})">Alterar Estoque</button>
      </td>
    `;
  });

  updateProductPagination(filteredProducts.length);
}

// Função para abrir o modal de edição
function openEditProductModal(productId) {
  currentEditingProductId = productId;
  
  fetch(`http://localhost:8080/produtos/${productId}`)
    .then(response => response.json())
    .then(product => {
      document.getElementById('editProductCodigo').value = product.id;
      document.getElementById('editProductName').value = product.nome;
      document.getElementById('editProductQuantity').value = product.quantidade;
      document.getElementById('editProductPrice').value = product.preco.toFixed(2);
      document.getElementById('editProductStatus').value = product.bo_status === 1 ? 'Ativo' : 'Inativo';
      
      document.getElementById('editProductModal').style.display = "block";
    })
    .catch(error => console.error('Erro ao carregar produto:', error));
}

// Função para fechar o modal de edição
function closeEditProductModal() {
  document.getElementById('editProductModal').style.display = "none";
  currentEditingProductId = null;
}

// Função para atualizar apenas a quantidade
function updateProductQuantity() {
  const newQuantity = parseInt(document.getElementById('editProductQuantity').value);
  
  if (isNaN(newQuantity) || newQuantity < 0) {
    alert('Por favor, insira uma quantidade válida (número inteiro positivo)');
    return;
  }

  fetch(`http://localhost:8080/produtos/${currentEditingProductId}/quantidade`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quantidade: newQuantity
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao atualizar quantidade');
    }
    return response.json();
  })
  .then(updatedProduct => {
    alert('Quantidade atualizada com sucesso!');
    closeEditProductModal();
    listarProdutos(); // Atualiza a lista
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao atualizar quantidade: ' + error.message);
  });
}

// // Função para salvar a quantidade no banco de dados (somente admin)
// function saveQuantity(id) {
//   if (userType !== 'admin') return;
//   const newQuantity = parseInt(document.getElementById(`quantity-${id}`).value);
//   if (!isNaN(newQuantity)) {
//     fetch(`http://localhost:8080/produtos/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ quantidade: newQuantity })
//     })
//     .then(() => listarProdutos()) // Atualiza a lista de produtos
//     .catch(error => console.error('Erro ao atualizar quantidade:', error));
//   } else {
//     alert("Quantidade inválida.");
//   }
// }

// Funções de pesquisa e paginação
function filterProducts() {
  return produtos.filter(product => product.nome.toLowerCase().includes(productSearchQuery.toLowerCase()));
}

function applyProductFilters() {
  productSearchQuery = document.getElementById('productSearch').value;
  currentProductPage = 1;
  renderProducts();
}

function paginateProducts(filteredProducts) {
  const startIndex = (currentProductPage - 1) * productsPerPage;
  return filteredProducts.slice(startIndex, startIndex + productsPerPage);
}

function updateProductPagination(filteredProductsCount) {
  const totalPages = Math.ceil(filteredProductsCount / productsPerPage);
  document.getElementById('prevProductPage').disabled = currentProductPage === 1;
  document.getElementById('nextProductPage').disabled = currentProductPage === totalPages;
  document.getElementById('productPageInfo').textContent = `Página ${currentProductPage} de ${totalPages}`;
}

function changeProductPage(direction) {
  const totalPages = Math.ceil(produtos.length / productsPerPage);
  if (direction === 'prev' && currentProductPage > 1) currentProductPage--;
  if (direction === 'next' && currentProductPage < totalPages) currentProductPage++;
  renderProducts();
}

// Inicializa carregando os produtos do banco de dados
listarProdutos();
