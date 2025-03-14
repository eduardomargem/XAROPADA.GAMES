document.addEventListener("DOMContentLoaded", function () {
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

    function redirecionar() {
        window.location.href = "/dashboard";
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

            if (!validarSenha(senhaValor)) {
                exibirErro(senha, "A senha deve ter no mínimo 6 caracteres, incluindo pelo menos 1 número e 1 caractere especial.");
                return;
            }

            fetch('http://localhost:8080/usuarios/login', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    username: valor,
                    password: senhaValor,
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => { throw new Error(data.message); });
                }
            })
            .then(data => {
                console.log('Login bem-sucedido:', data.message);
                redirecionar();
            })
            .catch(error => {
                console.error('Erro no login:', error);
            });
        });
    }
});
