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
        
        if (!cliente.getSenha().equals(loginDTO.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha incorreta");
        }
        
        // Cria um objeto de resposta com todos os dados necessários
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Login realizado com sucesso",
            "cliente", Map.of(
                "id", cliente.getId(),
                "nomeCompleto", cliente.getNomeCompleto(),
                "email", cliente.getEmail(),
                "tipo", "cliente"
            )
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do cliente inválido");
        }
        
        Cliente cliente = clienteService.buscarPorId(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        return ResponseEntity.ok(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizarCliente(
        @PathVariable Long id, 
        @RequestBody Map<String, Object> updates) {
        
        Cliente clienteAtualizado = clienteService.atualizarCliente(id, updates);
        return ResponseEntity.ok(clienteAtualizado);
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(
        @PathVariable Long id, 
        @RequestBody Map<String, String> request) {
        
        String novaSenha = request.get("senha");
        clienteService.alterarSenha(id, novaSenha);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{clienteId}/enderecos")
    public ResponseEntity<List<Endereco>> listarEnderecosCliente(
        @PathVariable Long clienteId,
        @RequestParam(required = false) String tipo) {
        
        List<Endereco> enderecos = clienteService.listarEnderecosCliente(clienteId, tipo);
        return ResponseEntity.ok(enderecos);
    }

    @PostMapping("/{clienteId}/enderecos")
    public ResponseEntity<Endereco> adicionarEndereco(
        @PathVariable Long clienteId,
        @RequestBody EnderecoDTO enderecoDTO) {
        
        Endereco novoEndereco = clienteService.adicionarEndereco(clienteId, enderecoDTO.toEntity());
        return ResponseEntity.status(HttpStatus.CREATED).body(novoEndereco);
    }

    @DeleteMapping("/{clienteId}/enderecos/{enderecoId}")
    public ResponseEntity<Void> removerEndereco(
        @PathVariable Long clienteId,
        @PathVariable Long enderecoId) {
        
        clienteService.removerEndereco(clienteId, enderecoId);
        return ResponseEntity.noContent().build();
    }
}