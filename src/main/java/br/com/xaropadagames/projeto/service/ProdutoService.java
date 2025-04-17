package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.IProduto;
import br.com.xaropadagames.projeto.model.Produto;
import org.springframework.beans.factory.annotation.Autowired;
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
        
        Produto produtoSalvo = produtoRepository.save(produto);

        if (imagens != null && imagens.length > 0) {
            // Corrigido: chamada via instância injetada
            imagemProdutoService.uploadImagens(produtoSalvo.getId(), imagens);
        }
        
        return produtoSalvo;
    }
}
