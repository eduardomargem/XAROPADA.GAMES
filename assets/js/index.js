document.addEventListener("DOMContentLoaded", function () {
    // 1. INICIALIZAÇÃO DOS USUÁRIOS FIXOS (ADM e Estoquista)
    const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados')) || [];
    
    // Verifica se os usuários fixos já existem
    const usuariosFixos = [
        { 
            usuario: "admin", 
            email: "xaropada@gmail.com", 
            senha: "Admin@123",
            tipo: "ADM" 
        },
        { 
            usuario: "estoquista", 
            email: "estoquista@gmail.com", 
            senha: "Estoque@123", 
            tipo: "Estoquista" 
        }
    ];
    
    // Adiciona usuários fixos apenas se não existirem
    let usuariosAtualizados = [...usuariosCadastrados];
    let precisaAtualizar = false;
    
    usuariosFixos.forEach(usuarioFixo => {
        const existe = usuariosCadastrados.some(
            u => u.email === usuarioFixo.email || u.usuario === usuarioFixo.usuario
        );
        
        if (!existe) {
            usuariosAtualizados.push(usuarioFixo);
            precisaAtualizar = true;
        }
    });
    
    if (precisaAtualizar) {
        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosAtualizados));
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
                user.senha === senha
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
                if (tipo === "ADM") {
                    window.location.href = "dashboard.html";
                } else if (tipo === "ESTOQUISTA") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "Loja.html";
                }
            } else {
                exibirErro(inputLogin, "Usuário ou senha incorretos!");
            }
        });
    }
});