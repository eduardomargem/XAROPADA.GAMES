document.addEventListener("DOMContentLoaded", function() {
    // Elementos do DOM
    const formLogin = document.getElementById("loginForm");
    const tipoUsuarioSelect = document.getElementById("tipoUsuario");
    const emailInput = document.getElementById("username");
    const senhaInput = document.getElementById("password");

    // Validações
    function validarEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    function exibirErro(elemento, mensagem) {
        let erroSpan = elemento.nextElementSibling;
        
        if (!erroSpan || !erroSpan.classList.contains('error-message')) {
            erroSpan = document.createElement('span');
            erroSpan.className = 'error-message';
            elemento.parentNode.insertBefore(erroSpan, elemento.nextSibling);
        }
        
        erroSpan.textContent = mensagem;
        erroSpan.style.color = 'red';
    }

    function limparErros() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    // Redirecionamento pós-login
    function redirecionarUsuario(usuario) {
        if (usuario.tipo === 'cliente') {
            window.location.href = "/";
        } else if (usuario.id_grupo === 1) {
            window.location.href = "/dashboard-admin";
        } else if (usuario.id_grupo === 2) {
            window.location.href = "/dashboard-estoquista";
        } else {
            window.location.href = "/";
        }
    }

    // Submit do formulário
    if (formLogin) {
        formLogin.addEventListener("submit", async function(e) {
            e.preventDefault();
            limparErros();

            const tipoUsuario = tipoUsuarioSelect?.value || 'cliente';
            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();

            // Validações básicas
            let valido = true;

            if (!email) {
                exibirErro(emailInput, "E-mail é obrigatório");
                valido = false;
            } else if (tipoUsuario === 'cliente' && !validarEmail(email)) {
                exibirErro(emailInput, "E-mail inválido");
                valido = false;
            }

            if (!senha) {
                exibirErro(senhaInput, "Senha é obrigatória");
                valido = false;
            }

            if (!valido) return;

            try {
                const endpoint = tipoUsuario === 'cliente' 
                    ? '/api/clientes/login' 
                    : '/usuarios/login';

                const body = tipoUsuario === 'cliente'
                    ? JSON.stringify({ email, senha })
                    : JSON.stringify({ 
                        username: email,
                        password: senha 
                    });

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                    throw new Error(error.message || 'Credenciais inválidas');
                }

                const data = await response.json();

                // Padroniza objeto do usuário logado de acordo com o tipo
                let usuarioLogado;
                
                if (tipoUsuario === 'cliente') {
                    usuarioLogado = {
                        tipo: 'cliente',
                        id: data.cliente.id,
                        nome: data.cliente.nomeCompleto,
                        email: data.cliente.email
                    };
                } else {
                    usuarioLogado = {
                        tipo: 'funcionario',
                        id: data.id,
                        nome: data.dsNome,
                        email: data.dsEmail,
                        id_grupo: data.id_grupo
                    };
                }

                // Armazena no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

                // Redireciona
                redirecionarUsuario(usuarioLogado);

            } catch (error) {
                console.error("Erro no login:", error);
                exibirErro(senhaInput, error.message || "Erro durante o login");
            }
        });
    }

    // Logout (pode ser usado em todas as páginas)
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/';
        });
    });
});