package br.com.xaropadagames.projeto.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.xaropadagames.projeto.model.ImagemProduto;
import br.com.xaropadagames.projeto.repository.ImagemProdutoRepository;
import br.com.xaropadagames.projeto.service.ImagemProdutoService;

@RestController
@RequestMapping("/imagens")
public class ImagemProdutoController {

    @Autowired
    private ImagemProdutoService imagemService;

    @Autowired
    private ImagemProdutoRepository imagemProdutoRepository;

    @PostMapping
    public ResponseEntity<List<ImagemProduto>> uploadImagens(
            @PathVariable Integer produtoId,
            @RequestParam("imagens") MultipartFile[] arquivos) {

        System.out.println("Número de arquivos recebidos: " + arquivos.length);

        List<ImagemProduto> imagensSalvas = imagemService.uploadImagens(produtoId, arquivos);
        return ResponseEntity.status(HttpStatus.CREATED).body(imagensSalvas);
    }
    // correção para aparecer imagens
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImagem(@PathVariable Integer id) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem não encontrada"));

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<ImagemProduto>> getImagensPorProduto(@PathVariable Integer produtoId) {
        List<ImagemProduto> imagens = imagemProdutoRepository.findByProdutoId(produtoId);
        return ResponseEntity.ok(imagens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImagem(@PathVariable Integer id) {
        ImagemProduto imagem = imagemProdutoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Imagem não encontrada"));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(imagem.getTipoImagem()));
        headers.setContentLength(imagem.getImagem().length);
        
        return new ResponseEntity<>(imagem.getImagem(), headers, HttpStatus.OK);
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<ImagemProduto>> getImagensPorProduto(@PathVariable Integer produtoId) {
        List<ImagemProduto> imagens = imagemProdutoRepository.findByProdutoId(produtoId);
        return ResponseEntity.ok(imagens);
    }

}