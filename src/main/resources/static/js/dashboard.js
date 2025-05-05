document.addEventListener("DOMContentLoaded", function() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (!userInfo) {
        window.location.href = "/login.html";
        return;
    }
    
    // Verifica se o usuário tem permissão para a página atual
    const isAdminPage = window.location.pathname.includes('admin');
    const isEstoquistaPage = window.location.pathname.includes('estoquista');
    
    if ((isAdminPage && userInfo.grupo !== 1) || (isEstoquistaPage && userInfo.grupo === 1)) {
        window.location.href = "/acesso-negado.html";
    }
    
    // Mostra/oculta elementos baseado no grupo
    if (userInfo.grupo === 1) {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.estoquista-only').forEach(el => el.style.display = 'none');
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.estoquista-only').forEach(el => el.style.display = 'block');
    }

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    function logout() {
        fetch('http://localhost:8080/usuarios/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => {
            localStorage.removeItem('userInfo');
            window.location.href = "/index.html";
        })
        .catch(error => {
            console.error('Erro no logout:', error);
        });
    }
});