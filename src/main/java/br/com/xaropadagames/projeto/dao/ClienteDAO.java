package br.com.xaropadagames.projeto.dao;

import br.com.xaropadagames.projeto.model.Cliente;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteDAO extends JpaRepository<Cliente, Long> {
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    Optional<Cliente> findByEmail(String email);
}