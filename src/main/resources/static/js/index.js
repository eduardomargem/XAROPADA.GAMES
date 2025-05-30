document.addEventListener("DOMContentLoaded", function () {
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

    function redirecionarPorTipoUsuario(idGrupo) {
        if (idGrupo === 1) { // Supondo que 1 seja admin
            window.location.href = "/dashboard-admin";
        } else if (idGrupo === 2) { // Supondo que 2 seja estoquista
            window.location.href = "/dashboard-estoquista";
        }
    }

    function verificarAutenticacao() {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuario) {
            window.location.href = "/index";
            return null;
        }
        return usuario;
    }

    const formLogin = document.getElementById("loginForm");
    if (formLogin) {
        formLogin.addEventListener("submit", function (event) {
            event.preventDefault();

            limparErros();

            const emailOuUsuario = document.getElementById("username");
            const senha = document.getElementById("password");
            const valor = emailOuUsuario.value.trim().toLowerCase(); // Converte usuário/email para minúsculas
            const senhaValor = senha.value.trim(); 

            console.log("Usuário digitado:", valor);
            console.log("Senha digitada:", senhaValor);

            if (!valor) {
                exibirErro(emailOuUsuario, "Preencha este campo.");
                return;
            }

            if (!senhaValor) {
                exibirErro(senha, "Preencha este campo.");
                return;
            }

            if (!validarEmail(valor) && valor.length > 50) {
                exibirErro(emailOuUsuario, "O nome de usuário pode ter no máximo 50 caracteres.");
                return;
            }

            fetch('http://localhost:8080/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: valor, password: senhaValor })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(error => {
                        throw new Error(error.message || 'Erro no login');
                    });
                }
            })
            .then(usuario => {
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                redirecionarPorTipoUsuario(usuario.idGrupo);
            })
            .catch(error => {
                console.error('Erro no login:', error);
                exibirErro(senha, error.message || "Erro durante o login");
            });
        });
    }
});
