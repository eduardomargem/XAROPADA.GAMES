package br.com.xaropadagames.projeto.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.xaropadagames.projeto.model.Usuario;

@Repository
public interface IUsuario extends JpaRepository<Usuario, Integer> {
    
    // Método para buscar usuário por email
    Optional<Usuario> findByDsEmail(String dsEmail);
}
