package br.com.xaropadagames.projeto.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.xaropadagames.projeto.model.ImagemProduto;
import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.repository.ImagemProdutoRepository;
import br.com.xaropadagames.projeto.repository.ProdutoRepository;

@Service
public class ImagemProdutoService {
    
    @Autowired
    private ImagemProdutoRepository imagemRepository;
    
    @Autowired
    private ProdutoRepository produtoRepository;
    
    public List<ImagemProduto> uploadImagens(Integer produtoId, MultipartFile[] arquivos) {
        if (arquivos == null || arquivos.length == 0) {
            return Collections.emptyList();
        }

        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        if (produto.getImagens() == null) {
            produto.setImagens(new ArrayList<>());
        }

        List<ImagemProduto> imagensSalvas = new ArrayList<>();
        
        for (MultipartFile arquivo : arquivos) {
            try {
                ImagemProduto imagem = new ImagemProduto();
                imagem.setProduto(produto);
                imagem.setTipoImagem(arquivo.getContentType());
                imagem.setImagem(arquivo.getBytes());
                imagem.setCaminho(arquivo.getOriginalFilename());
                
                ImagemProduto imagemSalva = imagemRepository.save(imagem);
                imagensSalvas.add(imagemSalva);
                
                produto.getImagens().add(imagemSalva);
                
            } catch (IOException e) {
                throw new RuntimeException("Falha ao processar imagem: " + arquivo.getOriginalFilename(), e);
            }
        }

        produtoRepository.save(produto);
        
        return imagensSalvas;
    }
}