// Array de produtos inicialmente vazio
let produtos = [];

// Variáveis de controle de paginação
let currentProductPage = 1;
const productsPerPage = 10;
let productSearchQuery = '';

// Variável para controlar o índice da imagem no carrossel
let currentImageIndex = 0;

// Função para salvar produtos no localStorage
function saveProductsToLocalStorage() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

// Função para carregar produtos do localStorage
function loadProductsFromLocalStorage() {
  const storedProducts = localStorage.getItem('produtos');
  if (storedProducts) {
    produtos = JSON.parse(storedProducts);
  }
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
      <td>${product.quantidade}</td>
      <td>${product.valor}</td>
      <td>${product.status}</td>
      <td>
        <input type="checkbox" ${product.status === 'Ativo' ? 'checked' : ''} onchange="toggleProductStatus('${product.codigo}')">
        <button onclick="openEditProductModal('${product.codigo}')">Alterar</button>
        <button onclick="openViewProductModal('${product.codigo}')">Visualizar</button>
      </td>
    `;
  });

  updateProductPagination(filteredProducts.length);
}

// Função para filtrar produtos por ID, Nome, Preço e Quantidade
function filterProducts() {
  return produtos.filter(product => {
    const searchQuery = productSearchQuery.toLowerCase();
    return (
      product.codigo.toLowerCase().includes(searchQuery) || // Pesquisa por ID
      product.nome.toLowerCase().includes(searchQuery) || // Pesquisa por Nome
      product.valor.toString().includes(searchQuery) || // Pesquisa por Preço
      product.quantidade.toString().includes(searchQuery) // Pesquisa por Quantidade
    );
  });
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

// Modal de Cadastro
function openRegisterProductModal() {
  document.getElementById('registerProductModal').style.display = 'block';
}

function closeRegisterProductModal() {
  document.getElementById('registerProductModal').style.display = 'none';
  document.getElementById('imagePreviewContainer').style.display = 'none';
  document.getElementById('registerProductForm').reset();
}

// Função para cadastrar produto
function registerProduct(event) {
  event.preventDefault();

  const novoCodigo = "P" + String(produtos.length + 1).padStart(3, '0');

  const novoProduto = {
    codigo: novoCodigo,
    nome: document.getElementById('productName').value,
    quantidade: parseInt(document.getElementById('productQuantity').value),
    valor: parseFloat(document.getElementById('productPrice').value),
    status: "Ativo",
    imagens: [], // Array para múltiplas imagens
    descricao: document.getElementById('productDescription').value,
    avaliacao: document.getElementById('productRating').value // Adiciona a avaliação
  };

  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const images = imagePreviewContainer.querySelectorAll('img');

  // Adicionar no máximo 5 imagens
  images.forEach((img, index) => {
    if (index < 5) {
      novoProduto.imagens.push(img.src);
    }
  });

  produtos.push(novoProduto);
  saveProductsToLocalStorage(); // Salvar no localStorage
  closeRegisterProductModal();
  renderProducts();
}

document.getElementById('registerProductForm').addEventListener('submit', registerProduct);

// Função para adicionar imagem no modal de cadastro
function addImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(event) {
    const files = event.target.files;
    if (files.length > 0) {
      const imagePreviewContainer = document.getElementById('imagePreviewContainer');

      // Limitar a 5 imagens
      if (imagePreviewContainer.children.length >= 5) {
        alert('Você só pode adicionar no máximo 5 imagens.');
        return;
      }

      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Pré-visualização da Imagem';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        imagePreviewContainer.appendChild(img);
        imagePreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Função para adicionar imagem no modal de edição
function addImageEdit() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(event) {
    const files = event.target.files;
    if (files.length > 0) {
      const imagePreviewContainer = document.getElementById('editProductImagePreviewContainer');

      // Limitar a 5 imagens
      if (imagePreviewContainer.children.length >= 5) {
        alert('Você só pode adicionar no máximo 5 imagens.');
        return;
      }

      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Pré-visualização da Imagem';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '0';
        deleteButton.style.right = '0';
        deleteButton.style.background = 'red';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.cursor = 'pointer';
        deleteButton.onclick = function() {
          imgContainer.remove(); // Remove a imagem ao clicar no botão
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteButton);
        imagePreviewContainer.appendChild(imgContainer);
        imagePreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Modal de Edição
function openEditProductModal(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  document.getElementById('editProductName').value = product.nome;
  document.getElementById('editProductCodigo').value = product.codigo;
  document.getElementById('editProductQuantity').value = product.quantidade;
  document.getElementById('editProductPrice').value = product.valor;
  document.getElementById('editProductDescription').value = product.descricao;

  const imagePreviewContainer = document.getElementById('editProductImagePreviewContainer');
  imagePreviewContainer.innerHTML = ''; // Limpar imagens anteriores

  if (product.imagens && product.imagens.length > 0) {
    product.imagens.forEach((imagem, index) => {
      if (index < 5) { // Limitar a 5 imagens
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';

        const img = document.createElement('img');
        img.src = imagem;
        img.alt = `Imagem ${index + 1} do produto ${product.nome}`;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '0';
        deleteButton.style.right = '0';
        deleteButton.style.background = 'red';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.cursor = 'pointer';
        deleteButton.onclick = function() {
          imgContainer.remove(); // Remove a imagem ao clicar no botão
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteButton);
        imagePreviewContainer.appendChild(imgContainer);
      }
    });
    imagePreviewContainer.style.display = 'block';
  } else {
    imagePreviewContainer.style.display = 'none';
  }

  document.getElementById('editProductModal').style.display = 'block';
}

function closeEditProductModal() {
  document.getElementById('editProductModal').style.display = 'none';
  document.getElementById('editProductImagePreviewContainer').style.display = 'none';
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
    status: produtos[productIndex].status,
    imagens: [], // Array para múltiplas imagens
    descricao: document.getElementById('editProductDescription').value
  };

  const imagePreviewContainer = document.getElementById('editProductImagePreviewContainer');
  const images = imagePreviewContainer.querySelectorAll('img');

  // Adicionar no máximo 5 imagens
  images.forEach((img) => {
    updatedProduct.imagens.push(img.src);
  });

  produtos[productIndex] = updatedProduct;
  saveProductsToLocalStorage(); // Salvar no localStorage
  closeEditProductModal();
  renderProducts();
}

// Modal de Visualização
function openViewProductModal(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  document.getElementById('viewProductName').textContent = product.nome;
  document.getElementById('viewProductCodigo').textContent = product.codigo;
  document.getElementById('viewProductQuantity').textContent = product.quantidade;
  document.getElementById('viewProductPrice').textContent = product.valor;
  document.getElementById('viewProductDescription').textContent = product.descricao;

  const carouselImages = document.getElementById('carouselImages');
  carouselImages.innerHTML = '';

  // Exibir no máximo 5 imagens
  const imagesToShow = product.imagens.slice(0, 5);
  imagesToShow.forEach((imagem, index) => {
    const img = document.createElement('img');
    img.src = imagem;
    img.alt = `Imagem ${index + 1} do produto ${product.nome}`;
    carouselImages.appendChild(img);
  });

  currentImageIndex = 0; // Reinicia o índice ao abrir o modal
  updateCarousel(); // Atualiza o carrossel
  document.getElementById('viewProductModal').style.display = 'block';
}

function closeViewProductModal() {
  document.getElementById('viewProductModal').style.display = 'none';
}

// Funções do carrossel
function updateCarousel() {
  const carouselImages = document.getElementById('carouselImages');
  const offset = -currentImageIndex * 300; // 300px é a largura de cada imagem
  carouselImages.style.transform = `translateX(${offset}px)`;
}

function nextImage() {
  const carouselImages = document.getElementById('carouselImages');
  const totalImages = carouselImages.children.length;
  currentImageIndex = (currentImageIndex + 1) % totalImages; // Avança para a próxima imagem
  updateCarousel();
}

function prevImage() {
  const carouselImages = document.getElementById('carouselImages');
  const totalImages = carouselImages.children.length;
  currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages; // Volta para a imagem anterior
  updateCarousel();
}

// Função para comprar produto
function buyProduct() {
  const codigo = document.getElementById('viewProductCodigo').textContent;
  const quantidadeComprada = 1; // Quantidade padrão (pode ser ajustada)

  // Enviar requisição ao estoquista
  fetch('/comprar-produto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ codigo, quantidadeComprada }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Compra realizada com sucesso!');
        closeViewProductModal();
        renderProducts(); // Atualiza a lista de produtos
      } else {
        alert('Erro ao realizar a compra: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      alert('Compra realizada com sucesso.');
    });
}

// Confirmação de Status
function openProductConfirmationModal(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  document.getElementById('productModalMessage').textContent = `Você deseja ${product.status === 'Ativo' ? 'desativar' : 'reativar'} o produto ${product.nome}?`;
  document.getElementById('confirmProductBtn').onclick = () => toggleProductStatus(product.codigo);
  document.getElementById('productConfirmationModal').style.display = 'block';
}

function closeProductModal() {
  document.getElementById('productConfirmationModal').style.display = 'none';
}

// Função para alternar status do produto
function toggleProductStatus(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  product.status = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
  saveProductsToLocalStorage(); // Salvar no localStorage
  renderProducts();
}

// Ouvir alterações no localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'produtos') {
    loadProductsFromLocalStorage(); // Recarrega os produtos
    renderProducts(); // Atualiza a tabela
  }
});