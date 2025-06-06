package br.com.xaropadagames.projeto.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.query.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.com.xaropadagames.projeto.dto.PedidoRequest;
import br.com.xaropadagames.projeto.dto.PedidoResponse;
import br.com.xaropadagames.projeto.model.Pedido;
import br.com.xaropadagames.projeto.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    
    private final PedidoService pedidoService;
    
    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }
    
    @PostMapping
    public ResponseEntity<?> criarPedido(@RequestBody PedidoRequest pedidoRequest) {
        try {
            Pedido pedido = pedidoService.criarPedido(pedidoRequest);
            
            // Cria um DTO de resposta mais amigável
            Map<String, Object> response = new HashMap<>();
            response.put("id", pedido.getId());
            response.put("numeroPedido", pedido.getNumeroPedido());
            response.put("status", pedido.getStatus().toString());
            response.put("valorTotal", pedido.getValorTotal());
            response.put("dataPedido", pedido.getDataPedido());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "error", e.getReason(),
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erro interno no servidor",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPedidoPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Pedido> atualizarStatus(
            @PathVariable Long id,
            @RequestParam String novoStatus) {
        Pedido pedidoAtualizado = pedidoService.atualizarStatus(id, novoStatus);
        return ResponseEntity.ok(pedidoAtualizado);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<PedidoResponse>> buscarPedidosPorCliente(@PathVariable Long clienteId) {
        List<Pedido> pedidos = pedidoService.buscarPorClienteId(clienteId);
        
        List<PedidoResponse> response = pedidos.stream()
            .map(PedidoResponse::fromEntity)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}