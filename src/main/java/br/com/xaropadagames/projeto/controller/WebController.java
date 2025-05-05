package br.com.xaropadagames.projeto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;


@Controller
public class WebController {
    @GetMapping("/")
    public String showHomePage() {
        return "Loja";
    }

    // página de login
    @GetMapping("/index")
    public String index() {
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpServletRequest request) {
        // Verifica o grupo do usuário a partir do token (adicionado pelo JwtFilter)
        Integer grupo = (Integer) request.getAttribute("grupo");
        
        if (grupo != null && grupo == 1) { // Supondo que 1 = Admin
            return "dashboard-admin"; // Retorna o template do admin
        } else {
            return "dashboard-estoquista"; // Retorna o template do estoquista
        }
    }

    @GetMapping("/listaUsuario")
    public String listaUsuario() {
        return "listaUsuario";
    }

    @GetMapping("/listaProdutoAdm")
    public String listaProduto() {
        return "listaProdutoAdm";
    }

    @GetMapping("/ListaProdutoEstq")
    public String ListaProdutoEstq() {
        return "ListaProdutoEstq";
    }

    @GetMapping("/Cadastro")
    public String Cadastro() {
        return "Cadastro";
    }
}
