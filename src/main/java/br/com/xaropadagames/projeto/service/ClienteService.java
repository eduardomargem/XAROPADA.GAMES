package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.ClienteDAO;
import br.com.xaropadagames.projeto.model.Cliente;

import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {
    

    
    private final ClienteDAO clienteDAO;
    // Remova o PasswordEncoder
    
    public ClienteService(ClienteDAO clienteDAO) { // Remova do construtor
        this.clienteDAO = clienteDAO;
    }
    
    @Transactional
    public Cliente cadastrar(Cliente cliente) {
        // Remova a linha que codifica a senha:
        // cliente.setSenha(passwordEncoder.encode(cliente.getSenha()));
        return clienteDAO.save(cliente);
    }
}