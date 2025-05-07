document.addEventListener("DOMContentLoaded", function () {
    // 1. INICIALIZAÇÃO DOS USUÁRIOS FIXOS (ADM e Estoquista)
    if (!localStorage.getItem('usuariosCadastrados')) {
        const usuariosFixos = [
            { 
                usuario: "admin", 
                email: "xaropada@gmail.com", 
                senha: "Admin@123",  // Senha em texto puro (ou hash, se aplicável)
                tipo: "ADM" 
            },
            { 
                usuario: "estoquista", 
                email: "estoquista@gmail.com", 
                senha: "Estoque@123", 
                tipo: "Estoquista" 
            }
        ];
        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosFixos));
    }

    // 2. FUNÇÕES AUXILIARES
    function validarEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    function exibirErro(campo, mensagem) {
        let erroSpan = campo.nextElementSibling;
        if (!erroSpan || !erroSpan.classList.contains("erro")) {
            erroSpan = document.createElement("span");
            erroSpan.classList.add("erro");
            campo.parentNode.appendChild(erroSpan);
        }
        erroSpan.textContent = mensagem;
        erroSpan.style.color = "red";
    }

    function limparErros() {
        document.querySelectorAll(".erro").forEach(span => span.textContent = "");
    }

    // 3. LÓGICA DE LOGIN
    const formLogin = document.getElementById("loginForm");
    if (formLogin) {
        formLogin.addEventListener("submit", function (event) {
            event.preventDefault();
            limparErros();

            const inputLogin = document.querySelector("input[type='text']");
            const inputSenha = document.querySelector("input[type='password']");
            const login = inputLogin.value.trim().toLowerCase();
            const senha = inputSenha.value.trim();

            // Validações básicas
            if (!login) {
                exibirErro(inputLogin, "Preencha este campo.");
                return;
            }
            if (!senha) {
                exibirErro(inputSenha, "Preencha este campo.");
                return;
            }

            // Busca o usuário no localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
            const usuarioEncontrado = usuarios.find(user =>
                (user.email.toLowerCase() === login || user.usuario.toLowerCase() === login) &&
                user.senha === senha  // Comparação direta (ou com hash, se necessário)
            );

            if (usuarioEncontrado) {
                // Salva o usuário logado
                localStorage.setItem("usuarioLogado", JSON.stringify({
                    nome: usuarioEncontrado.usuario,
                    tipo: usuarioEncontrado.tipo,
                    email: usuarioEncontrado.email
                }));

                // Redireciona conforme o tipo
                const tipo = usuarioEncontrado.tipo.toUpperCase();
                if (tipo === "ADM" || tipo === "ESTOQUISTA") {
                    window.location.href = "dashboard.html";  // Página de admin/estoquista
                } else {
                    window.location.href = "Loja.html";      // Página de cliente
                }
            } else {
                exibirErro(inputLogin, "Usuário ou senha incorretos!");
            }
        });
    }
});