
    // Array de produtos inicialmente vazio
    let produtos = [];

    // Variáveis de controle de paginação
    let currentProductPage = 1;
    const productsPerPage = 10;
    let productSearchQuery = '';

    
    function saveProductsToLocalStorage() {
      localStorage.setItem('produtos', JSON.stringify(produtos));
    }

  
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
        imagem: document.getElementById('imagePreview').src || "",
        descricao: document.getElementById('productDescription').value
      };

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
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            const imagePreviewContainer = document.getElementById('imagePreviewContainer');
            imagePreview.src = e.target.result;
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
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const imagePreview = document.getElementById('editProductImagePreview');
            const imagePreviewContainer = document.getElementById('editProductImagePreviewContainer');
            imagePreview.src = e.target.result;
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

      const imagePreview = document.getElementById('editProductImagePreview');
      if (product.imagem) {
        imagePreview.src = product.imagem;
        document.getElementById('editProductImagePreviewContainer').style.display = 'block';
      } else {
        document.getElementById('editProductImagePreviewContainer').style.display = 'none';
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
        imagem: document.getElementById('editProductImagePreview').src || produtos[productIndex].imagem,
        descricao: document.getElementById('editProductDescription').value
      };

      produtos[productIndex] = updatedProduct;
      saveProductsToLocalStorage(); // Salvar no localStorage
      closeEditProductModal();
      renderProducts();
    }

    // Modal de Visualização
    function openViewProductModal(codigo) {
      const product = produtos.find(p => p.codigo === codigo);
      document.getElementById('viewProductImage').src = product.imagem;
      document.getElementById('viewProductName').textContent = product.nome;
      document.getElementById('viewProductCodigo').textContent = product.codigo;
      document.getElementById('viewProductQuantity').textContent = product.quantidade;
      document.getElementById('viewProductPrice').textContent = product.valor;
      document.getElementById('viewProductDescription').textContent = product.descricao;
      document.getElementById('viewProductModal').style.display = 'block';
    }

    function closeViewProductModal() {
      document.getElementById('viewProductModal').style.display = 'none';
    }

    // Função para comprar produto
    function buyProduct() {
      alert('Produto comprado!');
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
