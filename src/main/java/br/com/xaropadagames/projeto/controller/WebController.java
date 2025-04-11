package br.com.xaropadagames.projeto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class WebController {
    @GetMapping("/")
    public String showHomePage() {
        return "dashboard";
    }

    @GetMapping("/index")
    public String index() {
        return "index";
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

    @GetMapping("/Loja")
    public String Loja() {
        return "Loja";
    }

    @GetMapping("/Cadastro")
    public String Cadastro() {
        return "Cadastro";
    }
}
