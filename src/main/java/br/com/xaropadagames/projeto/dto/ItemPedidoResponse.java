package br.com.xaropadagames.projeto.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

import br.com.xaropadagames.projeto.model.ItemPedido;
import br.com.xaropadagames.projeto.model.Produto;

public class ItemPedidoResponse {
    private Long id;
    private Integer produtoId;
    private String produtoNome;
    private String produtoImagemUrl;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal subTotal;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Integer produtoId) {
        this.produtoId = produtoId;
    }

    public String getProdutoNome() {
        return produtoNome;
    }

    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
    }

    public String getProdutoImagemUrl() {
        return produtoImagemUrl;
    }

    public void setProdutoImagemUrl(String produtoImagemUrl) {
        this.produtoImagemUrl = produtoImagemUrl;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
    }

    // Método fromEntity
    public static ItemPedidoResponse fromEntity(ItemPedido item) {
    ItemPedidoResponse response = new ItemPedidoResponse();
    response.setId(item.getId());
    
    Produto produto = item.getProduto();
    if (produto != null) {
    response.setProdutoId(produto.getId());
    response.setProdutoNome(produto.getNome());
    response.setProdutoImagemUrl(produto.getImagemUrl()); // Usa o método consolidado
    } else {
        response.setProdutoId(0);
        response.setProdutoNome("Produto não disponível");
        response.setProdutoImagemUrl("/images/placeholder-produto.png");
    }
    
    response.setQuantidade(item.getQuantidade());
    response.setPrecoUnitario(item.getPrecoUnitario());
    
    if (item.getPrecoUnitario() != null && item.getQuantidade() != null) {
        response.setSubTotal(
            item.getPrecoUnitario()
                .multiply(BigDecimal.valueOf(item.getQuantidade()))
                .setScale(2, RoundingMode.HALF_UP)
        );
    }
    return response;
}

}
