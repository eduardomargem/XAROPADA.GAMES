document.addEventListener("DOMContentLoaded", function () {
    const idGrupo = localStorage.getItem("id_grupo");

    const menuContainer = document.getElementById("menu");

    let menuHtml = `<a href="produtos.html">Lista de Produtos</a>`;

    if (idGrupo === "1") { // Usuário Admin (id_grupo = 1)
        menuHtml += `<a href="usuarios.html">Lista de Usuários</a>`;
    }

    menuContainer.innerHTML = menuHtml;
});