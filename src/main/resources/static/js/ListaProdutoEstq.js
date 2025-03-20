// Array de produtos inicialmente vazio
let produtos = [];

// Variáveis de controle de paginação
let currentProductPage = 1;
const productsPerPage = 10;
let productSearchQuery = '';

// Função para carregar produtos do localStorage
function loadProductsFromLocalStorage() {
  const storedProducts = localStorage.getItem('produtos');
  if (storedProducts) {
    produtos = JSON.parse(storedProducts);
  }
}

// Função para salvar produtos no localStorage
function saveProductsToLocalStorage() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

// Carregar produtos ao iniciar a página
loadProductsFromLocalStorage();
renderProducts();

// Função para renderizar a lista de produtos na tabela
function renderProducts() {
  const filteredProducts = filterProducts();
  const paginatedProducts = paginateProducts(filteredProducts);

  const tableBody = document.getElementById('productsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  paginatedProducts.forEach(product => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${product.codigo}</td>
      <td>${product.nome}</td>
      <td><input type="number" id="quantity-${product.codigo}" value="${product.quantidade}" style="width: 60px;"></td>
      <td>${product.valor}</td>
      <td>${product.status}</td>
      <td>
        <button onclick="saveQuantity('${product.codigo}')">Salvar</button>
      </td>
    `;
  });

  updateProductPagination(filteredProducts.length);
}

// Função para salvar a quantidade
function saveQuantity(codigo) {
  const productIndex = produtos.findIndex(p => p.codigo === codigo);
  const newQuantity = parseInt(document.getElementById(`quantity-${codigo}`).value);
  if (!isNaN(newQuantity)) {
    produtos[productIndex].quantidade = newQuantity;
    saveProductsToLocalStorage(); // Salvar no localStorage
    renderProducts(); // Atualiza a tabela após salvar
  } else {
    alert("Quantidade inválida.");
  }
}

// Função para filtrar produtos
function filterProducts() {
  return produtos.filter(product => product.nome.toLowerCase().includes(productSearchQuery.toLowerCase()));
}

// Função para aplicar filtros de pesquisa
function applyProductFilters() {
  productSearchQuery = document.getElementById('productSearch').value;
  currentProductPage = 1;
  renderProducts();
}

// Função para paginar produtos
function paginateProducts(filteredProducts) {
  const startIndex = (currentProductPage - 1) * productsPerPage;
  return filteredProducts.slice(startIndex, startIndex + productsPerPage);
}

// Função para atualizar a paginação
function updateProductPagination(filteredProductsCount) {
  const totalPages = Math.ceil(filteredProductsCount / productsPerPage);
  document.getElementById('prevProductPage').disabled = currentProductPage === 1;
  document.getElementById('nextProductPage').disabled = currentProductPage === totalPages;
  document.getElementById('productPageInfo').textContent = `Página ${currentProductPage} de ${totalPages}`;
}

// Função para mudar a página
function changeProductPage(direction) {
  if (direction === 'prev' && currentProductPage > 1) currentProductPage--;
  if (direction === 'next' && currentProductPage < Math.ceil(produtos.length / productsPerPage)) currentProductPage++;
  renderProducts();
}

// Modal de Edição
function openEditProductModal(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  document.getElementById('editProductName').value = product.nome;
  document.getElementById('editProductCodigo').value = product.codigo;
  document.getElementById('editProductQuantity').value = product.quantidade;
  document.getElementById('editProductPrice').value = product.valor;
  document.getElementById('editProductStatus').value = product.status;
  document.getElementById('editProductModal').style.display = 'block';
}

function closeEditProductModal() {
  document.getElementById('editProductModal').style.display = 'none';
}

// Função para editar produto
function editProduct() {
  const codigo = document.getElementById('editProductCodigo').value;
  const productIndex = produtos.findIndex(p => p.codigo === codigo);
  const updatedProduct = {
    codigo: codigo,
    nome: document.getElementById('editProductName').value,
    quantidade: parseInt(document.getElementById('editProductQuantity').value),
    valor: parseFloat(document.getElementById('editProductPrice').value),
    status: document.getElementById('editProductStatus').value
  };

  produtos[productIndex] = updatedProduct;
  saveProductsToLocalStorage(); // Salvar no localStorage
  closeEditProductModal();
  renderProducts();
}

// Ouvir alterações no localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'produtos') {
    loadProductsFromLocalStorage(); // Recarrega os produtos
    renderProducts(); // Atualiza a tabela
  }
});

// Inicialização
renderProducts();