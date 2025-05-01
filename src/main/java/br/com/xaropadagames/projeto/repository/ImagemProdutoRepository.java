package br.com.xaropadagames.projeto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.xaropadagames.projeto.model.ImagemProduto;

public interface ImagemProdutoRepository extends JpaRepository<ImagemProduto, Integer> {
    List<ImagemProduto> findByProdutoId(Integer produtoId);

    Optional<ImagemProduto> findByCaminho(String caminho);
}
