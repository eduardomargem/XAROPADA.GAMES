package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    // Método para obter a sessão do Spring
    private HttpSession getSession() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest().getSession() : null;
    }

    // Método para listar os produtos
    @GetMapping
    public ResponseEntity<?> listarProdutos() {
        HttpSession session = getSession();
        if (session == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        Integer idGrupo = (Integer) session.getAttribute("id_grupo");

        if (idGrupo == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        // Admin pode acessar todos os produtos
        if (idGrupo == 1) {
            return ResponseEntity.ok(produtoService.listarProdutos());
        } else {
            return ResponseEntity.status(403).body("Acesso negado. Somente administradores podem acessar.");
        }
    }

    // Método para buscar um produto por id
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarProdutoPorId(@PathVariable Integer id) {
        HttpSession session = getSession();
        if (session == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        Integer idGrupo = (Integer) session.getAttribute("id_grupo");

        if (idGrupo == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        // Admin pode acessar todos os produtos
        if (idGrupo == 1) {
            Produto produto = produtoService.buscarProdutoPorId(id);
            return produto != null ? ResponseEntity.ok(produto) : ResponseEntity.status(404).body("Produto não encontrado.");
        } else {
            return ResponseEntity.status(403).body("Acesso negado. Estoquistas não têm permissão para acessar o produto.");
        }
    }

    // Método para adicionar um novo produto
    @PostMapping
    public ResponseEntity<?> adicionarProduto(@RequestBody Produto produto) {
        HttpSession session = getSession();
        if (session == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        Integer idGrupo = (Integer) session.getAttribute("id_grupo");

        if (idGrupo == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        // Somente admin pode adicionar produtos
        if (idGrupo == 1) {
            return ResponseEntity.ok(produtoService.salvarProduto(produto));
        } else {
            return ResponseEntity.status(403).body("Acesso negado. Somente administradores podem adicionar produtos.");
        }
    }

    // Método para atualizar um produto
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarProduto(@PathVariable Integer id, @RequestBody Produto produto) {
        HttpSession session = getSession();
        if (session == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        Integer idGrupo = (Integer) session.getAttribute("id_grupo");

        if (idGrupo == null) {
            return ResponseEntity.status(403).body("Acesso negado. Usuário não logado.");
        }

        // Somente admin pode atualizar produtos
        if (idGrupo == 1) {
            Produto produtoExistente = produtoService.buscarProdutoPorId(id);
            if (produtoExistente == null) {
                return ResponseEntity.status(404).body("Produto não encontrado.");
            }
            produto.setId(id);
            return ResponseEntity.ok(produtoService.salvarProduto(produto));
        } else {
            return ResponseEntity.status(403).body("Acesso negado. Somente administradores podem atualizar produtos.");
        }
    }
}
