document.addEventListener("DOMContentLoaded", function () {
    const usuariosCadastrados = [
        { usuario: "admin", email: "xaropada@gmail.com", senha: "Admin@123", tipo: "ADM" },
        { usuario: "user", email: "xaropadinha@gmail.com", senha: "@100Senha", tipo: "Estoquista" },
        { usuario: "vinicius", email: "viniii@gmail.com", senha: "Cliente@123", tipo: "Cliente" },
        { usuario: "Test", email: "test@gmail.com", senha: "Cliente@123", tipo: "Cliente" }
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
            const valor = emailOuUsuario.value.trim().toLowerCase();
            const senhaValor = senha.value.trim();

            if (!valor) {
                exibirErro(emailOuUsuario, "Preencha este campo.");
                return;
            }

            if (valor.length < 6) {
                exibirErro(emailOuUsuario, "Mínimo 6 caracteres.");
                return;
            }

            if (!senhaValor) {
                exibirErro(senha, "Preencha este campo.");
                return;
            }

            if (validarEmail(valor) && valor.length > 100) {
                exibirErro(emailOuUsuario, "E-mail muito longo.");
                return;
            }

            if (!validarEmail(valor) && valor.length > 50) {
                exibirErro(emailOuUsuario, "Usuário muito longo.");
                return;
            }

            if (!validarSenha(senhaValor)) {
                exibirErro(senha, "Mínimo 6 caracteres com número e especial.");
                return;
            }

            const usuarioEncontrado = usuariosCadastrados.find(user =>
                (user.email.toLowerCase() === valor || user.usuario.toLowerCase() === valor) &&
                user.senha === senhaValor
            );

            if (usuarioEncontrado) {
                localStorage.setItem("usuarioLogado", JSON.stringify({
                    nome: usuarioEncontrado.email.split('@')[0],
                    tipo: usuarioEncontrado.tipo,
                    email: usuarioEncontrado.email
                }));

                if (usuarioEncontrado.tipo === "ADM" || usuarioEncontrado.tipo === "Estoquista") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "Loja.html";
                }
            } else {
                exibirErro(emailOuUsuario, "Usuário ou senha incorretos!");
            }
        });
    }
});