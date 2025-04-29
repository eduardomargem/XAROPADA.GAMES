package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.IProduto;
import br.com.xaropadagames.projeto.model.Produto;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private IProduto produtoRepository;

    @Autowired
    private ImagemProdutoService imagemProdutoService;

    public List<Produto> listarProdutos() {
        return (List<Produto>) produtoRepository.findAll();
    }

    public Produto buscarProdutoPorId(Integer id) {
        return produtoRepository.findById(id).orElse(null);
    }

    public Produto salvarProduto(
        String nome, BigDecimal preco, Integer quantidade, 
        String descricao, BigDecimal avaliacao, Integer status,
        MultipartFile[] imagens) {
        
        Produto produto = new Produto();
        produto.setNome(nome);
        produto.setPreco(preco);
        produto.setQuantidade(quantidade);
        produto.setDescricao(descricao);
        produto.setAvaliacao(avaliacao);
        produto.setBo_status(status);
        
        return produtoRepository.save(produto);
    }

    public Produto buscarProdutoComImagens(Integer id) {
        return produtoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    }

    public Produto atualizarProduto(Integer id, String nome, BigDecimal preco, Integer quantidade, 
        String descricao, BigDecimal avaliacao, Integer status) {
    
        Produto produtoExistente = produtoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));
    
        // Atualiza apenas os campos que foram fornecidos (não-nulos)
        if (nome != null) {
            produtoExistente.setNome(nome);
        }
        if (preco != null) {
            produtoExistente.setPreco(preco);
        }
        if (quantidade != null) {
            produtoExistente.setQuantidade(quantidade);
        }
        if (descricao != null) {
            produtoExistente.setDescricao(descricao);
        }
        if (avaliacao != null) {
            produtoExistente.setAvaliacao(avaliacao);
        }
        if (status != null) {
            produtoExistente.setBo_status(status);
        }
        
        return produtoRepository.save(produtoExistente);
    }
}
