package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.IProduto;
import br.com.xaropadagames.projeto.model.Produto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private IProduto produtoRepository;

    public List<Produto> listarProdutos() {
        return (List<Produto>) produtoRepository.findAll();
    }

    public Produto buscarProdutoPorId(Integer id) {
        return produtoRepository.findById(id).orElse(null);
    }

    public Produto salvarProduto(Produto produto) {
        return produtoRepository.save(produto);
    }
}
