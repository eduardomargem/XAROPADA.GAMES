package br.com.xaropadagames.projeto.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.xaropadagames.projeto.model.ImagemProduto;
import br.com.xaropadagames.projeto.service.ImagemProdutoService;

@RestController
@RequestMapping("/produtos/{produtoId}/imagens")
public class ImagemProdutoController {
    
    @Autowired
    private ImagemProdutoService imagemService;
    
    @PostMapping
    public ResponseEntity<List<ImagemProduto>> uploadImagens(
            @PathVariable Integer produtoId,
            @RequestParam("imagens") MultipartFile[] arquivos) {
        
        List<ImagemProduto> imagensSalvas = imagemService.uploadImagens(produtoId, arquivos);
        return ResponseEntity.status(HttpStatus.CREATED).body(imagensSalvas);
    }
}