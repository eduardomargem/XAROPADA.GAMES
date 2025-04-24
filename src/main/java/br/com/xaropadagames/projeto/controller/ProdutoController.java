package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.service.ImagemProdutoService;
import br.com.xaropadagames.projeto.service.ProdutoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private ImagemProdutoService ImagemProdutoService;

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
    @PostMapping(path = "/com-imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produto> cadastrarProdutoComImagens(
            @RequestParam String nome,
            @RequestParam BigDecimal preco,
            @RequestParam Integer quantidade,
            @RequestParam String descricao,
            @RequestParam BigDecimal avaliacao,
            @RequestParam Integer status,
            @RequestParam("imagens") MultipartFile[] imagens) {

        Produto produtoSalvo = produtoService.salvarProduto(
            nome, preco, quantidade, descricao, avaliacao, status, null
        );

        if (imagens != null && imagens.length > 0) {
            ImagemProdutoService.uploadImagens(produtoSalvo.getId(), imagens);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
           .body(produtoService.buscarProdutoComImagens(produtoSalvo.getId()));
    }

    // Método para atualizar um produto
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(
        @PathVariable Integer id, 
        @RequestBody Produto produto) {
        
        Produto produtoExistente = produtoService.buscarProdutoPorId(id);
        if (produtoExistente == null) {
            return ResponseEntity.notFound().build();
        }
    
        produto.setId(id);
        
        // Converte o objeto para os parâmetros individuais
        return ResponseEntity.ok(produtoService.salvarProduto(
            produto.getNome(),
            produto.getPreco(),
            produto.getQuantidade(),
            produto.getDescricao(),
            produto.getAvaliacao(),
            produto.getBo_status(),
            null  // ou um array vazio de imagens
        ));
    }
}