package br.com.xaropadagames.projeto.dto;

import java.time.LocalDateTime;

import br.com.xaropadagames.projeto.model.Pagamento;

public class PagamentoResponse {
    private Long id;
    private String metodo;
    private String status;
    private String codigoBoleto;
    private String cartaoUltimosDigitos;
    private Integer cartaoParcelas;
    private LocalDateTime dataPagamento;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCodigoBoleto() {
        return codigoBoleto;
    }

    public void setCodigoBoleto(String codigoBoleto) {
        this.codigoBoleto = codigoBoleto;
    }

    public String getCartaoUltimosDigitos() {
        return cartaoUltimosDigitos;
    }

    public void setCartaoUltimosDigitos(String cartaoUltimosDigitos) {
        this.cartaoUltimosDigitos = cartaoUltimosDigitos;
    }

    public Integer getCartaoParcelas() {
        return cartaoParcelas;
    }

    public void setCartaoParcelas(Integer cartaoParcelas) {
        this.cartaoParcelas = cartaoParcelas;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDateTime dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    // Método fromEntity
    public static PagamentoResponse fromEntity(Pagamento pagamento) {
        PagamentoResponse response = new PagamentoResponse();
        response.setId(pagamento.getId());
        response.setMetodo(pagamento.getMetodo().toString());
        response.setStatus(pagamento.getStatus().toString());
        response.setCodigoBoleto(pagamento.getCodigoBoleto());
        response.setCartaoUltimosDigitos(pagamento.getCartaoUltimosDigitos());
        response.setCartaoParcelas(pagamento.getCartaoParcelas());
        response.setDataPagamento(pagamento.getDataPagamento());
        
        return response;
    }
}
