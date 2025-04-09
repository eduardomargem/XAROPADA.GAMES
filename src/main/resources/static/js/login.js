document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const response = await fetch("http://localhost:8080/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: senha })
    });

    if (response.ok) {
        const data = await response.json();

        // Armazena o ID do grupo no localStorage para controlar permissões
        localStorage.setItem("id_grupo", data.id_grupo); 

        // Redireciona para a página principal
        window.location.href = "dashboard.html";
    } else {
        alert("E-mail ou senha incorretos!");
    }
});