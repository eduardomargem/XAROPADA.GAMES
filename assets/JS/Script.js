document.addEventListener("DOMContentLoaded", function () {
    const apiBaseUrl = "http://localhost:8080/api/usuarios"; // URL base da API

    // Função para validar e-mail com regex
    function validarEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    // Função para validar senha (mínimo 6 caracteres, 1 número e 1 caractere especial)
    function validarSenha(senha) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        return regex.test(senha);
    }

    // Função para cadastrar um novo usuário
    async function cadastrarUsuario(event) {
        event.preventDefault(); // Impede o recarregamento da página ao enviar o formulário

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const senhaConfirmacao = document.getElementById("senhaConfirmacao").value;
        const botaoEnviar = document.getElementById("botaoEnviar");

        // Desabilitar o botão de envio para evitar múltiplos envios
        botaoEnviar.disabled = true;

        // Validações antes de enviar ao backend
        if (!email || !senha || !senhaConfirmacao) {
            alert("Preencha todos os campos!");
            botaoEnviar.disabled = false;
            return;
        }
        if (!validarEmail(email)) {
            alert("E-mail inválido!");
            botaoEnviar.disabled = false;
            return;
        }
        if (!validarSenha(senha)) {
            alert("A senha deve ter no mínimo 6 caracteres, incluindo pelo menos 1 número e 1 caractere especial.");
            botaoEnviar.disabled = false;
            return;
        }
        if (senha !== senhaConfirmacao) {
            alert("As senhas não coincidem!");
            botaoEnviar.disabled = false;
            return;
        }

        try {
            const response = await fetch(apiBaseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Usuário cadastrado com sucesso!");
            } else {
                alert("Erro ao cadastrar: " + result.message);
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao conectar ao servidor.");
        } finally {
            // Reabilitar o botão de envio
            botaoEnviar.disabled = false;
        }
    }

    // Event listener para o cadastro
    const formCadastro = document.getElementById("formCadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", cadastrarUsuario);
    }
});
