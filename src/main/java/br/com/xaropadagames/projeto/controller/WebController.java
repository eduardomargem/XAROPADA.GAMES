package br.com.xaropadagames.projeto.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class WebController {
    @GetMapping("/")
    public String showHomePage() {
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/listaUsuario")
    public String listaUsuario() {
        return "listaUsuario";
    }

    @GetMapping("/listaProdutoAdm")
    public String listaProduto() {
        return "listaProduto";
    }
}
