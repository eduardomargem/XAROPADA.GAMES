package br.com.xaropadagames.projeto.dao;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import br.com.xaropadagames.projeto.model.Usuario;

public interface IUsuario extends CrudRepository<Usuario, Integer> {
    @Query("SELECT u FROM Usuario u WHERE u.ds_email = :ds_email")
    Usuario findByDs_email(String ds_email);
}
