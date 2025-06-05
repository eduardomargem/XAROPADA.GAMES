package br.com.xaropadagames.projeto.dto;

import java.math.BigDecimal;
import java.util.List;

public class PedidoRequest {
    private Long clienteId;
    private Long enderecoEntregaId;
    private List<ItemPedidoRequest> itens;
    private BigDecimal valorTotal;
    private BigDecimal valorFrete;
    private String metodoPagamento;
    private DadosPagamentoRequest dadosPagamento;

    // Getters e Setters
    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Long getEnderecoEntregaId() {
        return enderecoEntregaId;
    }

    public void setEnderecoEntregaId(Long enderecoEntregaId) {
        this.enderecoEntregaId = enderecoEntregaId;
    }

    public List<ItemPedidoRequest> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoRequest> itens) {
        this.itens = itens;
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

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public DadosPagamentoRequest getDadosPagamento() {
        return dadosPagamento;
    }

    public void setDadosPagamento(DadosPagamentoRequest dadosPagamento) {
        this.dadosPagamento = dadosPagamento;
    }
}