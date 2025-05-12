function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = "/index";
}