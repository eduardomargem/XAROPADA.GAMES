package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    
    private final ClienteService clienteService;
    
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }
    
    @PostMapping
    public ResponseEntity<Cliente> cadastrar(@Valid @RequestBody Cliente cliente) {
        Cliente clienteSalvo = clienteService.cadastrar(cliente);
        
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(clienteSalvo.getId())
            .toUri();
        
        return ResponseEntity.created(location).body(clienteSalvo);
    }
}