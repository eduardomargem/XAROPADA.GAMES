package br.com.xaropadagames.projeto.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetodoPagamento metodo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @Column(name = "data_pagamento")
    private LocalDateTime dataPagamento;

    @Column(name = "codigo_boleto", length = 100)
    private String codigoBoleto;

    @Column(name = "cartao_ultimos_digitos", length = 4)
    private String cartaoUltimosDigitos;

    @Column(name = "cartao_parcelas")
    private Integer cartaoParcelas;

    // Enums
    public enum MetodoPagamento {
        BOLETO,
        CARTAO_CREDITO
    }

    public enum StatusPagamento {
        PENDENTE,
        APROVADO,
        REJEITADO
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public MetodoPagamento getMetodo() {
        return metodo;
    }

    public void setMetodo(MetodoPagamento metodo) {
        this.metodo = metodo;
    }

    public StatusPagamento getStatus() {
        return status;
    }

    public void setStatus(StatusPagamento status) {
        this.status = status;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDateTime dataPagamento) {
        this.dataPagamento = dataPagamento;
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
}