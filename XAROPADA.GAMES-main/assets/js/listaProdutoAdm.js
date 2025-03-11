// Exemplo de produtos
let produtos = [
  { codigo: "P001", nome: "Smartphone Samsung", quantidade: 10, valor: 1500, status: "Ativo" },
  { codigo: "P002", nome: "Smartwatch Xiaomi", quantidade: 20, valor: 500, status: "Ativo" },
  { codigo: "P003", nome: "Fone de Ouvido JBL", quantidade: 15, valor: 300, status: "Ativo" },
  { codigo: "P004", nome: "Câmera Digital Canon", quantidade: 5, valor: 2000, status: "Inativo" },
  // ... mais produtos
];

// Variáveis de controle de paginação
let currentProductPage = 1;
const productsPerPage = 10;
let productSearchQuery = '';
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
      <td>${product.codigo}</td>
      <td>${product.nome}</td>
      <td>${product.quantidade}</td>
      <td>${product.valor}</td>
      <td>${product.status}</td>
      <td>
        <button onclick="openEditProductModal('${product.codigo}')">Alterar</button>
        <button onclick="openProductConfirmationModal('${product.codigo}')">${product.status === 'Ativo' ? 'Desativar' : 'Reativar'}</button>
      </td>
    `;
  });

  updateProductPagination(filteredProducts.length);
}
// Filtrar produtos apenas por nome
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
  if (direction === 'prev' && currentProductPage > 1) currentProductPage--;
  if (direction === 'next' && currentProductPage < Math.ceil(produtos.length / productsPerPage)) currentProductPage++;
  renderProducts();
}
// Funções de Modal de Cadastro de Produto
function openRegisterProductModal() {
  document.getElementById('registerProductModal').style.display = 'block';
}

function closeRegisterProductModal() {
  document.getElementById('registerProductModal').style.display = 'none';
}
// Funções de Modal de Edição de Produto
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

function editProduct() {
  const codigo = document.getElementById('editProductCodigo').value;
  const productIndex = produtos.findIndex(p => p.codigo === codigo);
  const updatedProduct = {
    codigo: codigo,
    nome: document.getElementById('editProductName').value,
    quantidade: document.getElementById('editProductQuantity').value,
    valor: document.getElementById('editProductPrice').value,
    status: document.getElementById('editProductStatus').value
  };

  produtos[productIndex] = updatedProduct; // Atualiza no array
  closeEditProductModal(); // Fecha o modal
  renderProducts(); // Re-renderiza a tabela
}
// Funções de Modal de Confirmação de Status de Produto
function openProductConfirmationModal(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  document.getElementById('productModalMessage').textContent = `Você deseja ${product.status === 'Ativo' ? 'desativar' : 'reativar'} o produto ${product.nome}?`;
  document.getElementById('confirmProductBtn').onclick = () => toggleProductStatus(product.codigo);
  document.getElementById('productConfirmationModal').style.display = 'block';
}

function closeProductModal() {
  document.getElementById('productConfirmationModal').style.display = 'none';
}

function toggleProductStatus(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  product.status = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
  closeProductModal();
  renderProducts();
}
// Inicializar com a renderização dos produtos
renderProducts();
