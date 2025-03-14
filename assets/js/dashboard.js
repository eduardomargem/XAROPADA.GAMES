  // Verifica o tipo de usuário e carrega os links permitidos
  document.addEventListener("DOMContentLoaded", function () {
    const tipoUsuario = localStorage.getItem("tipoUsuario"); // Recupera o tipo de usuário do localStorage
    const dashboardLinks = document.getElementById("dashboardLinks");

    if (tipoUsuario === "ADM") {
      
        dashboardLinks.innerHTML = `
            <a href="listaUsuario.html">Lista de Usuários</a>
            <a href="listaProdutoAdm.html">Lista de Produtos</a>
        `;
    } else if (tipoUsuario === "Estoquista") {
      
        dashboardLinks.innerHTML = `
            <a href="ListaProdutoEstq.html">Produto</a>
        `;
    } else {
        // Se não houver tipo de usuário, redireciona para o login
        window.location.href = "login.html";
    }
});

// Função para logout
function logout() {
    localStorage.removeItem("tipoUsuario"); // Remove o tipo de usuário
    window.location.href = "index.html"; // Redireciona para a página inicial
}