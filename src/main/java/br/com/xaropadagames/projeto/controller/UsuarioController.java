package br.com.xaropadagames.projeto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.xaropadagames.projeto.dao.IUsuario;
import br.com.xaropadagames.projeto.model.Usuario;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private IUsuario dao;
    
    @GetMapping
    public List<Usuario> listaUsuarios() {  
        return (List<Usuario>) dao.findAll();
    }

    @PostMapping
    public Usuario criarUsuario(@RequestBody Usuario usuario) {
        Usuario novoUsuario = dao.save(usuario);
        return novoUsuario;
    }

    @PutMapping
    public Usuario alterarUsuario(@RequestBody Usuario usuario) {
        Usuario novoUsuario = dao.save(usuario);
        return novoUsuario;
    }
}
