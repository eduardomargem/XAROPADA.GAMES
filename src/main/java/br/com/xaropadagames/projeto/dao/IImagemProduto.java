package br.com.xaropadagames.projeto.dao;

import org.springframework.data.repository.CrudRepository;
import br.com.xaropadagames.projeto.model.ImagemProduto;

public interface IImagemProduto extends CrudRepository<ImagemProduto, Integer> {
    
}