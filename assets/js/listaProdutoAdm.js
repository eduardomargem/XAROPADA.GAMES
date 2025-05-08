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
  } else {
    // Inicializa com alguns produtos de exemplo se não houver nada no localStorage
    produtos = [
      {
        codigo: "P001",
        nome: "EA Sports FC 2025",
        quantidade: 50,
        valor: 249.90,
        status: "Ativo",
        imagens: [
          "https://republicadg.com.br/wp-content/uploads/2024/07/Design-sem-nome-1-8.jpg",
          "https://via.placeholder.com/500x300?text=FC2025+Imagem+2",
          "https://via.placeholder.com/500x300?text=FC2025+Imagem+3"
        ],
        descricao: "O mais novo jogo de futebol da EA Sports traz gráficos ultra-realistas, modos de jogo inovadores e todas as ligas e times licenciados.",
        avaliacao: 4.5,
        detalhes: {
          plataforma: "PS5, Xbox Series X, PC",
          genero: "Esportes",
          classificacao: "Livre",
          lancamento: "27/09/2024",
          desenvolvedor: "EA Sports"
        }
      },
      {
        codigo: "P002",
        nome: "The Last of Us Part II",
        quantidade: 30,
        valor: 199.90,
        status: "Ativo",
        imagens: [
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaz8wf6zJ71GBPAXj0CQz81bsAda8yiTcKhA&s",
          "https://via.placeholder.com/500x300?text=TLOU2+Imagem+2",
          "https://via.placeholder.com/500x300?text=TLOU2+Imagem+3"
        ],
        descricao: "Uma emocionante história de sobrevivência e vingança em um mundo pós-apocalíptico.",
        avaliacao: 4.9,
        detalhes: {
          plataforma: "PS5",
          genero: "Ação e Aventura",
          classificacao: "18+",
          lancamento: "19/06/2020",
          desenvolvedor: "Naughty Dog"
        }
      }
    ];
    saveProductsToLocalStorage();
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
      <td>R$ ${product.valor.toFixed(2)}</td>
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
      product.codigo.toLowerCase().includes(searchQuery) ||
      product.nome.toLowerCase().includes(searchQuery) ||
      product.valor.toString().includes(searchQuery) ||
      product.quantidade.toString().includes(searchQuery)
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
  document.getElementById('nextProductPage').disabled = currentProductPage === totalPages || totalPages === 0;
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
  document.getElementById('imagePreviewContainer').innerHTML = '<p>Pré-visualização da Imagem:</p>';
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
    imagens: [],
    descricao: document.getElementById('productDescription').value,
    avaliacao: document.getElementById('productRating').value,
    detalhes: {
      plataforma: "PS5, Xbox Series X, PC",
      genero: "Ação",
      classificacao: "Livre",
      lancamento: new Date().toLocaleDateString('pt-BR'),
      desenvolvedor: "Desenvolvedor Padrão"
    }
  };

  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const images = imagePreviewContainer.querySelectorAll('img');

  images.forEach((img) => {
    novoProduto.imagens.push(img.src);
  });

  produtos.push(novoProduto);
  saveProductsToLocalStorage();
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

      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Pré-visualização da Imagem';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.margin = '5px';
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

      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';
        imgContainer.style.margin = '5px';

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
          imgContainer.remove();
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
  imagePreviewContainer.innerHTML = '<p>Pré-visualização da Imagem</p>';

  if (product.imagens && product.imagens.length > 0) {
    product.imagens.forEach((imagem) => {
      const imgContainer = document.createElement('div');
      imgContainer.style.position = 'relative';
      imgContainer.style.display = 'inline-block';
      imgContainer.style.margin = '5px';

      const img = document.createElement('img');
      img.src = imagem;
      img.alt = `Imagem do produto ${product.nome}`;
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
        imgContainer.remove();
      };

      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteButton);
      imagePreviewContainer.appendChild(imgContainer);
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
  document.getElementById('editProductImagePreviewContainer').innerHTML = '<p>Pré-visualização da Imagem</p>';
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
    imagens: [],
    descricao: document.getElementById('editProductDescription').value,
    avaliacao: produtos[productIndex].avaliacao || "0",
    detalhes: produtos[productIndex].detalhes || {
      plataforma: "PS5, Xbox Series X, PC",
      genero: "Ação",
      classificacao: "Livre",
      lancamento: new Date().toLocaleDateString('pt-BR'),
      desenvolvedor: "Desenvolvedor Padrão"
    }
  };

  const imagePreviewContainer = document.getElementById('editProductImagePreviewContainer');
  const images = imagePreviewContainer.querySelectorAll('img');

  images.forEach((img) => {
    updatedProduct.imagens.push(img.src);
  });

  produtos[productIndex] = updatedProduct;
  saveProductsToLocalStorage();
  closeEditProductModal();
  renderProducts();
}

// Modal de Visualização
function openViewProductModal(codigo) {
  const product = produtos.find(p => p.codigo === codigo);
  document.getElementById('viewProductName').textContent = product.nome;
  document.getElementById('viewProductCodigo').textContent = product.codigo;
  document.getElementById('viewProductQuantity').textContent = product.quantidade;
  document.getElementById('viewProductPrice').textContent = product.valor.toFixed(2);
  document.getElementById('viewProductDescription').textContent = product.descricao;
  document.getElementById('viewProductRating').textContent = product.avaliacao;

  const carouselImages = document.getElementById('carouselImages');
  carouselImages.innerHTML = '';

  product.imagens.forEach((imagem, index) => {
    const img = document.createElement('img');
    img.src = imagem;
    img.alt = `Imagem ${index + 1} do produto ${product.nome}`;
    carouselImages.appendChild(img);
  });

  currentImageIndex = 0;
  updateCarousel();
  document.getElementById('viewProductModal').style.display = 'block';
}

function closeViewProductModal() {
  document.getElementById('viewProductModal').style.display = 'none';
}

// Funções do carrossel
function updateCarousel() {
  const carouselImages = document.getElementById('carouselImages');
  const offset = -currentImageIndex * 300;
  carouselImages.style.transform = `translateX(${offset}px)`;
}

function nextImage() {
  const carouselImages = document.getElementById('carouselImages');
  const totalImages = carouselImages.children.length;
  currentImageIndex = (currentImageIndex + 1) % totalImages;
  updateCarousel();
}

function prevImage() {
  const carouselImages = document.getElementById('carouselImages');
  const totalImages = carouselImages.children.length;
  currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
  updateCarousel();
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
  saveProductsToLocalStorage();
  renderProducts();
  closeProductModal();
}

// Ouvir alterações no localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'produtos') {
    loadProductsFromLocalStorage();
    renderProducts();
  }
});