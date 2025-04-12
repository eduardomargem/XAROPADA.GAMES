package br.com.xaropadagames.projeto.dao;

import br.com.xaropadagames.projeto.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteDAO extends JpaRepository<Cliente, Long> {
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
}