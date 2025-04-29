package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.dao.IProduto;
import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.model.Usuario;
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

    @Autowired
    private IProduto dao;

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

    // Novo endpoint para adicionar imagens a um produto existente
    @PostMapping(path = "/{id}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produto> adicionarImagensProduto(
            @PathVariable Integer id,
            @RequestParam("imagens") MultipartFile[] imagens) {
        
        if (imagens != null && imagens.length > 0) {
            ImagemProdutoService.uploadImagens(id, imagens);
        }
        
        return ResponseEntity.ok(produtoService.buscarProdutoComImagens(id));
    }

    // Método para atualizar um produto
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(
        @PathVariable Integer id,
        @RequestParam(required = false) String nome,
        @RequestParam(required = false) BigDecimal preco,
        @RequestParam(required = false) Integer quantidade,
        @RequestParam(required = false) String descricao,
        @RequestParam(required = false) BigDecimal avaliacao,
        @RequestParam(required = false) Integer status,
        @RequestParam(value = "imagens", required = false) MultipartFile[] imagens) {
        
        Produto produtoAtualizado = produtoService.atualizarProduto(
            id, nome, preco, quantidade, descricao, avaliacao, status
        );
    
        if (imagens != null && imagens.length > 0) {
            ImagemProdutoService.uploadImagens(id, imagens);
        }
        
        return ResponseEntity.ok(produtoService.buscarProdutoComImagens(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id) {
        try {
            Produto produtoExistente = dao.findById(id).orElse(null);
            if (produtoExistente == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Produto não encontrado.\"}");
            }

            // Alterna o status (1 = Ativo, 0 = Inativo)
            produtoExistente.setBo_status(produtoExistente.getBo_status() == 1 ? 0 : 1);

            Produto produtoAtualizado = dao.save(produtoExistente);
            return ResponseEntity.ok(produtoAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Erro ao atualizar o status do usuário.\"}");
        }
    }
}