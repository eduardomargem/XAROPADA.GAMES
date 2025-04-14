package br.com.xaropadagames.projeto.dto;

import org.springframework.web.multipart.MultipartFile;

public class ImagemProdutoDTO {
    private Long produtoId;
    private MultipartFile[] imagens;
    public Long getProdutoId() {
        return produtoId;
    }
    public MultipartFile[] getImagens() {
        return imagens;
    }
}
