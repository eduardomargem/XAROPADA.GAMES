package br.com.xaropadagames.projeto.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import br.com.xaropadagames.projeto.model.Pedido;

public class PedidoResponse {
    private Long id;
    private String numeroPedido;
    private String status;
    private BigDecimal valorTotal;
    private BigDecimal valorFrete;
    private LocalDateTime dataPedido;
    private List<ItemPedidoResponse> itens;
    private EnderecoResponse enderecoEntrega;
    private PagamentoResponse pagamento;
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroPedido() {
        return numeroPedido;
    }

    public void setNumeroPedido(String numeroPedido) {
        this.numeroPedido = numeroPedido;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public BigDecimal getValorFrete() {
        return valorFrete;
    }

    public void setValorFrete(BigDecimal valorFrete) {
        this.valorFrete = valorFrete;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public void setDataPedido(LocalDateTime dataPedido) {
        this.dataPedido = dataPedido;
    }

    public List<ItemPedidoResponse> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoResponse> itens) {
        this.itens = itens;
    }

    public EnderecoResponse getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public void setEnderecoEntrega(EnderecoResponse enderecoEntrega) {
        this.enderecoEntrega = enderecoEntrega;
    }

    public PagamentoResponse getPagamento() {
        return pagamento;
    }

    public void setPagamento(PagamentoResponse pagamento) {
        this.pagamento = pagamento;
    }

    // Construtor estático fromEntity
    public static PedidoResponse fromEntity(Pedido pedido) {
        PedidoResponse response = new PedidoResponse();
        response.setId(pedido.getId());
        response.setNumeroPedido(pedido.getNumeroPedido());
        response.setStatus(pedido.getStatus().toString());
        response.setValorTotal(pedido.getValorTotal());
        response.setValorFrete(pedido.getValorFrete());
        response.setDataPedido(pedido.getDataPedido());
        
        response.setItens(pedido.getItens().stream()
            .map(ItemPedidoResponse::fromEntity)
            .collect(Collectors.toList()));
        
        response.setEnderecoEntrega(EnderecoResponse.fromEntity(pedido.getEnderecoEntrega()));
        
        if (pedido.getPagamento() != null) {
            response.setPagamento(PagamentoResponse.fromEntity(pedido.getPagamento()));
        }
        
        return response;
    }
}
