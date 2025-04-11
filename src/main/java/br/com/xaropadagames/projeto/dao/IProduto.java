package br.com.xaropadagames.projeto.dao;

import org.springframework.data.repository.CrudRepository;

import br.com.xaropadagames.projeto.model.Produto;

public interface IProduto extends CrudRepository<Produto, Integer> {
    
}
