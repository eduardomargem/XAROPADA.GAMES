document.addEventListener("DOMContentLoaded", function () {
    const usuariosCadastrados = [
        { usuario: "admin", email: "xaropada@gmail.com", senha: "Admin@123" },
        { usuario: "user", email: "Xaropadinha@gmail.com", senha: "User@456" }
    ];

    function validarEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    function validarSenha(senha) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        return regex.test(senha);
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

    const formLogin = document.getElementById("loginForm");
    if (formLogin) {
        formLogin.addEventListener("submit", function (event) {
            event.preventDefault();
            limparErros();

            const emailOuUsuario = document.querySelector("input[type='text']");
            const senha = document.querySelector("input[type='password']");
            const valor = emailOuUsuario.value.trim().toLowerCase(); // Converte usuário/email para minúsculas
            const senhaValor = senha.value.trim(); 

            console.log("Usuário digitado:", valor);
            console.log("Senha digitada:", senhaValor);

            if (!valor) {
                exibirErro(emailOuUsuario, "Preencha este campo.");
                return;
            }

            if (valor.length < 6) {
                exibirErro(emailOuUsuario, "O e-mail ou nome de usuário deve ter pelo menos 6 caracteres.");
                return;
            }

            if (!senhaValor) {
                exibirErro(senha, "Preencha este campo.");
                return;
            }

            if (validarEmail(valor) && valor.length > 100) {
                exibirErro(emailOuUsuario, "O e-mail pode ter no máximo 100 caracteres.");
                return;
            }

            if (!validarEmail(valor) && valor.length > 50) {
                exibirErro(emailOuUsuario, "O nome de usuário pode ter no máximo 50 caracteres.");
                return;
            }

            if (!validarSenha(senhaValor)) {
                exibirErro(senha, "A senha deve ter no mínimo 6 caracteres, incluindo pelo menos 1 número e 1 caractere especial.");
                return;
            }

            const usuarioEncontrado = usuariosCadastrados.find(user =>
                (user.email.toLowerCase() === valor || user.usuario.toLowerCase() === valor) &&
                user.senha === senhaValor
            );

            console.log("Usuário encontrado:", usuarioEncontrado);

            if (usuarioEncontrado) {
                console.log("Login bem-sucedido! Redirecionando...");
                window.location.href = "dashboard.html";
            } else {
                console.log("Usuário ou senha incorretos!");
                exibirErro(emailOuUsuario, "Usuário ou senha incorretos!");
            }
        });
    }
});
