package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.service.ProdutoService;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public List<Produto> listarProdutos() {
         return produtoService.listarProdutos();
    }

    // Método para buscar um produto por id
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Integer id) {
        Produto produto = produtoService.buscarProdutoPorId(id);
        return produto != null ? ResponseEntity.ok(produto) : ResponseEntity.notFound().build();
    }

    // Método para adicionar um novo produto
    @PostMapping
    public Produto adicionarProduto(@RequestBody Produto produto) {
        return produtoService.salvarProduto(produto);
    }

    // Método para atualizar um produto
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Integer id, @RequestBody Produto produto) {
        Produto produtoExistente = produtoService.buscarProdutoPorId(id);
        if (produtoExistente == null) {
            return ResponseEntity.notFound().build();
        }

        produto.setId(id);
        return ResponseEntity.ok(produtoService.salvarProduto(produto));
    }
}
