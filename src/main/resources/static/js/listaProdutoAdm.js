// Coloque este código fora da função cadastrarProduto(), no início do arquivo
document.getElementById('productImages').addEventListener('change', function(e) {
  verificarPermissaoAdmin();
  const previewsContainer = document.getElementById('imagePreviewsContainer');
  if (!previewsContainer) return;

  previewsContainer.innerHTML = '';
  
  if (this.files && this.files.length > 0) {
    document.getElementById('imagePreviewContainer').style.display = 'block';
    
    Array.from(this.files).forEach(file => {
      const reader = new FileReader();
      const previewDiv = document.createElement('div');
      previewDiv.style.margin = '5px';
      previewDiv.style.maxWidth = '200px';
      
      const img = document.createElement('img');
      img.style.maxWidth = '100%';
      img.style.maxHeight = '150px';
      previewDiv.appendChild(img);
      previewsContainer.appendChild(previewDiv);
      
      reader.onload = function(e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
});

// Variáveis de controle de produtos e paginação
let produtos = [];
let currentProductPage = 1;
const productsPerPage = 4;
let productSearchQuery = '';

// Verifica se o usuário tem permissão (admin = grupo 1)
function verificarPermissaoAdmin() {
  const usuario = verificarAutenticacao();
  if (usuario && usuario.idGrupo !== 1) {
      window.location.href = "/dashboard-admin";
      return false;
  }
  return true;
}

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
      <td>R$ ${product.preco.toFixed(2) || product.valor.toFixed(2) || 'N/A'}</td>
      <td>${product.bo_status === 1 ? 'Ativo' : 'Inativo'}</td>
      <td>
        <button onclick="openEditProductModal(${product.id})">Alterar</button>
        <button onclick="openProductConfirmationModal(${product.id})">
          ${product.bo_status === 1 ? 'Desativar' : 'Ativar'}
        </button>
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
  const totalPages = Math.ceil(filteredProductsCount / productsPerPage) || 1;
  
  document.getElementById('prevProductPage').disabled = currentProductPage === 1;
  document.getElementById('nextProductPage').disabled = currentProductPage === totalPages || totalPages === 0;
  document.getElementById('productPageInfo').textContent = `Página ${currentProductPage} de ${totalPages}`;
}


// Alterar página de produtos
function changeProductPage(direction) {
  const filteredProducts = filterProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  if (direction === 'prev' && currentProductPage > 1) {
    currentProductPage--;
  }
  if (direction === 'next' && currentProductPage < totalPages) {
    currentProductPage++;
  }
  
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
  // 1. Coletar dados do formulário
  const formData = new FormData();
  
  // Adiciona campos textuais
  formData.append('nome', document.getElementById('productName').value);
  formData.append('preco', document.getElementById('productPrice').value);
  formData.append('quantidade', document.getElementById('productQuantity').value);
  formData.append('descricao', document.getElementById('productDescription').value);
  formData.append('avaliacao', document.getElementById('productRating').value);
  formData.append('status', 1);

  // Adiciona as imagens ao FormData
  const imageInput = document.getElementById('productImages');
  if (imageInput.files && imageInput.files.length > 0) {

    console.log('Número de imagens selecionadas:', imageInput.files.length);

    for (let i = 0; i < imageInput.files.length; i++) {
      formData.append('imagens', imageInput.files[i]);
    }
  }

  // Envio para o backend
  fetch('http://localhost:8080/produtos/com-imagens', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw new Error(err.message || 'Erro ao cadastrar') });
    }
    return response.json();
  })
  .then(data => {
    alert('Produto cadastrado com sucesso!');
    closeRegisterProductModal();
    listarProdutos(); // Atualiza a lista
    
    // Limpa o formulário e as pré-visualizações
    document.getElementById('registerProductForm').reset();
    const previewsContainer = document.getElementById('imagePreviews');
    if (previewsContainer) {
      previewsContainer.innerHTML = '';
    }

    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro: ' + error.message);
  });
}

function updateNewImagesPreview() {
  const container = document.getElementById('newImagesPreviewContainer');
  container.innerHTML = '';
  
  novasImagensEdit.forEach((file, index) => {
    const reader = new FileReader();
    const previewDiv = document.createElement('div');
    previewDiv.style.position = 'relative';
    previewDiv.style.margin = '5px';
    
    const img = document.createElement('img');
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '×';
    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '0';
    removeBtn.style.right = '0';
    removeBtn.style.background = 'red';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '50%';
    removeBtn.style.cursor = 'pointer';
    
    removeBtn.onclick = () => {
      novasImagensEdit = novasImagensEdit.filter((_, i) => i !== index);
      updateNewImagesPreview();
    };
    
    previewDiv.appendChild(img);
    previewDiv.appendChild(removeBtn);
    container.appendChild(previewDiv);
    
    reader.onload = function(e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

let novasImagensEdit = [];

// Funções de Modal de Edição de Produto
function openEditProductModal(id) {
  fetch(`http://localhost:8080/produtos/${id}`)
    .then(response => response.json())
    .then(produto => {
      // Preenche os campos básicos
      document.getElementById('editProductName').value = produto.nome;
      document.getElementById('editProductCodigo').value = produto.id;
      document.getElementById('editProductQuantity').value = produto.quantidade;
      document.getElementById('editProductPrice').value = produto.preco;
      
      // Limpa containers de imagem
      document.getElementById('currentImagesContainer').innerHTML = '';
      document.getElementById('newImagesPreviewContainer').innerHTML = '';
      novasImagensEdit = [];
      
      // Exibe imagens atuais do produto
      if (produto.imagens && produto.imagens.length > 0) {
        produto.imagens.forEach(imagem => {
          const imgContainer = document.createElement('div');
          imgContainer.style.position = 'relative';
          imgContainer.style.margin = '5px';
          
          const img = document.createElement('img');
          img.src = `data:${imagem.tipoImagem};base64,${arrayBufferToBase64(imagem.imagem)}`;
          img.style.maxWidth = '100px';
          img.style.maxHeight = '100px';
          
          if (imagem.caminho) {
            // Se a imagem estiver armazenada como arquivo
            img.src = `http://localhost:8080/imagens/${encodeURIComponent(imagem.caminho)}`;
          } else if (imagem.imagem) {
            // Se a imagem estiver armazenada como byte[] no banco
            const blob = new Blob([new Uint8Array(imagem.imagem)], { type: imagem.tipoImagem });
            img.src = URL.createObjectURL(blob);
          }
          
          img.style.maxWidth = '100px';
          img.style.maxHeight = '100px';
          img.style.objectFit = 'cover';

          // const removeBtn = document.createElement('button');
          // removeBtn.innerHTML = '×';
          // removeBtn.style.position = 'absolute';
          // removeBtn.style.top = '0';
          // removeBtn.style.right = '0';
          // removeBtn.style.background = 'red';
          // removeBtn.style.color = 'white';
          // removeBtn.style.border = 'none';
          // removeBtn.style.borderRadius = '50%';
          // removeBtn.style.cursor = 'pointer';
          
          // removeBtn.onclick = () => removerImagemExistente(produto.id, imagem.id);
          
          imgContainer.appendChild(img);
          // imgContainer.appendChild(removeBtn);
          document.getElementById('currentImagesContainer').appendChild(imgContainer);
        });
      }
      
      // Configura o input de novas imagens
      document.getElementById('editProductImages').addEventListener('change', function(e) {
        novasImagensEdit = Array.from(this.files);
        updateNewImagesPreview();
      });
      
      document.getElementById('editProductModal').style.display = "block";
    })
    .catch(error => console.error('Erro ao carregar produto:', error));
}

function closeEditProductModal() {
  document.getElementById('editProductModal').style.display = "none";
}

// Função para converter ArrayBuffer para Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Função para alterar um produto existente
function alterarProduto() {
  const produtoId = document.getElementById('editProductCodigo').value;
  const formData = new FormData();
  
  // Adiciona campos textuais
  formData.append('nome', document.getElementById('editProductName').value);
  formData.append('preco', document.getElementById('editProductPrice').value);
  formData.append('quantidade', document.getElementById('editProductQuantity').value);
  
  // Adiciona novas imagens
  novasImagensEdit.forEach(file => {
    formData.append('imagens', file);
  });

  fetch(`http://localhost:8080/produtos/${produtoId}`, {
    method: 'PUT',
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error('Erro ao atualizar');
    return response.json();
  })
  .then(data => {
    alert('Produto atualizado com sucesso!');
    listarProdutos();
    closeEditProductModal();
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro: ' + error.message);
  });
}

// Funções de Modal de Confirmação de Status de Produto
function openProductConfirmationModal(id) {
  const product = produtos.find(p => p.id === id);
  const acao = product.bo_status === 1 ? 'desativar' : 'ativar';
  
  document.getElementById('productModalMessage').textContent = 
    `Você deseja ${acao} o produto ${product.nome}?`;
  
  document.getElementById('confirmProductBtn').onclick = () => toggleProductStatus(id);
  document.getElementById('productConfirmationModal').style.display = "block";
}

function closeProductModal() {
  document.getElementById('productConfirmationModal').style.display = "none";
}

// Função para alterar o status do produto
async function toggleProductStatus(id) {
  try {
      const response = await fetch(`http://localhost:8080/produtos/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
          const produtoAtualizado = await response.json(); // Recebe o produto atualizado
          
          // Atualiza o produto na lista local
          const index = produtos.findIndex(p => p.id === id);
          if (index !== -1) {
              produtos[index].bo_status = produtoAtualizado.bo_status;
          }
          
          alert('Status do produto alterado com sucesso!');
          renderProducts(); // Re-renderiza a tabela com os dados locais atualizados
      } else {
          alert('Erro ao alterar status do produto.');
      }
  } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao alterar status do produto.');
  } finally {
      closeProductModal();
  }
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
