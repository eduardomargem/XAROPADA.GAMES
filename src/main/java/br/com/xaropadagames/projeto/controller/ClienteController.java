package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.dto.ClienteCadastroDTO;
import br.com.xaropadagames.projeto.dto.ClienteListagemDTO;
import br.com.xaropadagames.projeto.dto.EnderecoDTO;
import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.model.Endereco;
import br.com.xaropadagames.projeto.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    
    private final ClienteService clienteService;
    
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<ClienteListagemDTO>> listarTodos() {
        List<Cliente> clientes = clienteService.listarTodos();
        
        List<ClienteListagemDTO> dtos = clientes.stream()
            .map(cliente -> {
                ClienteListagemDTO dto = new ClienteListagemDTO();
                dto.setId(cliente.getId());
                dto.setNomeCompleto(cliente.getNomeCompleto());
                dto.setEmail(cliente.getEmail());
                
                // Pegar o endereço de faturamento (opcional)
                Optional<Endereco> enderecoFaturamento = cliente.getEnderecos().stream()
                    .filter(e -> "FATURAMENTO".equals(e.getTipo()))
                    .findFirst();
                    
                enderecoFaturamento.ifPresent(endereco -> 
                    dto.setCidade(endereco.getCidade()));
                    
                return dto;
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping
    public ResponseEntity<?> cadastrar(@Valid @RequestBody ClienteCadastroDTO clienteDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }
        
        if (!clienteDTO.getSenha().equals(clienteDTO.getConfirmarSenha())) {
            return ResponseEntity.badRequest().body("Senhas não coincidem");
        }
        
        Cliente cliente = new Cliente();
        cliente.setNomeCompleto(clienteDTO.getNomeCompleto());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setCpf(clienteDTO.getCpf());
        cliente.setDataNascimento(clienteDTO.getDataNascimento());
        cliente.setGenero(clienteDTO.getGenero());
        cliente.setSenha(clienteDTO.getSenha());
        
        // Converte DTOs para entidades Endereco
        List<Endereco> enderecos = clienteDTO.getEnderecos().stream()
            .map(EnderecoDTO::toEntity)
            .collect(Collectors.toList());
        
        // Usa o método helper para adicionar endereços
        enderecos.forEach(cliente::adicionarEndereco);
        
        Cliente clienteSalvo = clienteService.cadastrar(cliente);
        
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(clienteSalvo.getId())
            .toUri();
        
        return ResponseEntity.created(location).body(clienteSalvo);
    }
}