package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.dto.PedidoRequestDTO;
import br.com.xaropadagames.projeto.dto.PedidoResponseDTO;
import br.com.xaropadagames.projeto.model.Pedido;
import br.com.xaropadagames.projeto.service.PedidoService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin("*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<?> criarPedido(@Valid @RequestBody PedidoRequestDTO pedidoRequestDTO) {
        try {
            Pedido pedidoSalvo = pedidoService.criarPedido(pedidoRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Pedido nº " + pedidoSalvo.getId() + " criado com sucesso!",
                "pedidoId", pedidoSalvo.getId(),
                "valorTotal", pedidoSalvo.getValorTotal()
            ));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) { // Captura RuntimeException para estoque insuficiente
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Logar a exceção completa para depuração no servidor
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Erro interno ao criar pedido: " + e.getMessage()));
        }
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosDoCliente(@PathVariable Long clienteId) {
        List<Pedido> pedidos = pedidoService.listarPedidosPorCliente(clienteId);
        if (pedidos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<PedidoResponseDTO> dtos = pedidos.stream().map(PedidoResponseDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoPorId(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.buscarPorIdComItens(id); 
            return ResponseEntity.ok(new PedidoResponseDTO(pedido));
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado com ID: " + id, e);
        }
    }
    
    @GetMapping("/todos")
    public ResponseEntity<List<PedidoResponseDTO>> listarTodosOsPedidos() {
        List<Pedido> pedidos = pedidoService.listarTodosOsPedidosComItens();
        if (pedidos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<PedidoResponseDTO> dtos = pedidos.stream().map(PedidoResponseDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/{pedidoId}/status")
    public ResponseEntity<?> atualizarStatusPedido(
            @PathVariable Long pedidoId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String novoStatus = statusUpdate.get("statusPedido");
            if (novoStatus == null || novoStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Novo status não fornecido."));
            }
            // Validação simples do status - idealmente usar um Enum ou uma lista de status permitidos
            List<String> statusPermitidos = List.of("AGUARDANDO_PAGAMENTO", "PAGAMENTO_REJEITADO", "PAGO", "ENVIADO", "ENTREGUE", "CANCELADO", "ESTORNADO"); // Adicione seus status
            if (!statusPermitidos.contains(novoStatus.toUpperCase())) {
                 return ResponseEntity.badRequest().body(Map.of("message", "Status inválido: " + novoStatus));
            }

            Pedido pedidoAtualizado = pedidoService.atualizarStatusPedido(pedidoId, novoStatus.toUpperCase());
            return ResponseEntity.ok(new PedidoResponseDTO(pedidoAtualizado));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) { // Para erros de lógica de negócio no serviço
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro ao atualizar status do pedido: " + e.getMessage()));
        }
    }
}