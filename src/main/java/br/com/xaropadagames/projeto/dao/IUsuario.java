package br.com.xaropadagames.projeto.dao;

import org.springframework.data.repository.CrudRepository;

import br.com.xaropadagames.projeto.model.Usuario;

public interface IUsuario extends CrudRepository<Usuario, Integer> {
    
}
