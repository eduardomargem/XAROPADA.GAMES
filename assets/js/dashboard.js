// dashboard.js - Versão atualizada para o estoquista com Listar Pedidos

document.addEventListener("DOMContentLoaded", function() {
    // Recupera os dados do usuário logado do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    // Verifica se há um usuário logado
    if (!usuarioLogado) {
        window.location.href = "index.html";
        return;
    }

    // Elementos da página
    const dashboardLinks = document.getElementById("dashboardLinks");
    const logoTitle = document.querySelector(".logo h1");
    
    // Personaliza o título com o nome do usuário se existir
    if (usuarioLogado.nome) {
        logoTitle.textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]}!`;
    }

    // Define os links de acordo com o tipo de usuário
    if (usuarioLogado.tipo === "ADM") {
        dashboardLinks.innerHTML = `
            <a href="listaUsuario.html" class="dashboard-link">
                <i class="fas fa-users"></i>
                <span>Listar Usuários</span>
            </a>
            <a href="listaProdutoAdm.html" class="dashboard-link">
                <i class="fas fa-gamepad"></i>
                <span>Listar Produtos</span>
            </a>
        `;
    } else if (usuarioLogado.tipo === "Estoquista") {
        dashboardLinks.innerHTML = `
            <a href="ListaProdutoEstq.html" class="dashboard-link">
                <i class="fas fa-boxes"></i>
                <span>Listar Produtos</span>
            </a>
            <a href="listaPedidos.html" class="dashboard-link">
                <i class="fas fa-clipboard-list"></i>
                <span>Listar Pedidos</span>
            </a>
        `;
    } else {
        // Redireciona clientes para a loja
        window.location.href = "Loja.html";
    }
});

// Função de logout melhorada
function logout() {
    // Adiciona efeito sonoro (opcional)
    const audio = new Audio('/assets/sounds/logout-sound.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Audio playback error:", e));

    // Efeito visual de logout
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Remove os dados do usuário após o efeito
    setTimeout(() => {
        localStorage.removeItem('usuarioLogado');
        window.location.href = "index.html";
    }, 500);
}