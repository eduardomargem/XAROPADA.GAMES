package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.dao.ClienteDAO;
import br.com.xaropadagames.projeto.dto.ClienteCadastroDTO;
import br.com.xaropadagames.projeto.dto.ClienteListagemDTO;
import br.com.xaropadagames.projeto.dto.EnderecoDTO;
import br.com.xaropadagames.projeto.dto.LoginDTO;
import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.model.Endereco;
import br.com.xaropadagames.projeto.service.ClienteService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    
    private final ClienteService clienteService;
    private final ClienteDAO clienteDAO;
    
    public ClienteController(ClienteService clienteService, ClienteDAO clienteDAO) {
        this.clienteService = clienteService;
        this.clienteDAO = clienteDAO;
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
    public ResponseEntity<ClienteListagemDTO> cadastrar(@Valid @RequestBody ClienteCadastroDTO clienteDTO, BindingResult result) {
        // Validações
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (!clienteDTO.getSenha().equals(clienteDTO.getConfirmarSenha())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Cadastra o cliente
        Cliente clienteSalvo = clienteService.cadastrar(clienteDTO.toEntity());
        
        // Converte para DTO de resposta
        ClienteListagemDTO responseDTO = new ClienteListagemDTO();
        responseDTO.setId(clienteSalvo.getId());
        responseDTO.setNomeCompleto(clienteSalvo.getNomeCompleto());
        responseDTO.setEmail(clienteSalvo.getEmail());
        
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginCliente(@RequestBody LoginDTO loginDTO) {
        Cliente cliente = clienteDAO.findByEmail(loginDTO.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente não encontrado"));
        
        // Verifica a senha (simplificado - em produção, use PasswordEncoder)
        if (!cliente.getSenha().equals(loginDTO.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha incorreta");
        }
        
        // Cria um objeto de resposta com os dados necessários para o frontend
        ClienteListagemDTO clienteResponse = new ClienteListagemDTO();
        clienteResponse.setId(cliente.getId());
        clienteResponse.setNomeCompleto(cliente.getNomeCompleto());
        clienteResponse.setEmail(cliente.getEmail());
        
        // Se tiver endereço de faturamento, inclui a cidade
        Optional<Endereco> enderecoFaturamento = cliente.getEnderecos().stream()
            .filter(e -> "FATURAMENTO".equals(e.getTipo()))
            .findFirst();
        enderecoFaturamento.ifPresent(endereco -> clienteResponse.setCidade(endereco.getCidade()));
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Login realizado com sucesso",
            "cliente", clienteResponse
        ));
    }
}