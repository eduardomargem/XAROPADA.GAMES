package br.com.xaropadagames.projeto.dto;

import br.com.xaropadagames.projeto.model.Endereco;
import br.com.xaropadagames.projeto.model.ItemPedido; 
import br.com.xaropadagames.projeto.model.Pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


class ItemPedidoResponseDTO { // Classe interna ou separada
    private Integer produtoId;
    private String nomeProduto;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private String imagemUrl; 

    public ItemPedidoResponseDTO(ItemPedido item) {
        this.produtoId = item.getProduto().getId();
        this.nomeProduto = item.getProduto().getNome();
        this.quantidade = item.getQuantidade();
        this.precoUnitario = item.getPrecoUnitario();
        if (item.getProduto().getImagens() != null && !item.getProduto().getImagens().isEmpty()) {
            this.imagemUrl = "/imagens/" + item.getProduto().getImagens().get(0).getId();
        } else {
            this.imagemUrl = "https://via.placeholder.com/50x50?text=Sem+Imagem";
        }
    }
    // Getters
    public Integer getProdutoId() { return produtoId; }
    public String getNomeProduto() { return nomeProduto; }
    public Integer getQuantidade() { return quantidade; }
    public BigDecimal getPrecoUnitario() { return precoUnitario; }
    public String getImagemUrl() { return imagemUrl; }

    // Setters (opcional, mas bom para consistência)
    public void setProdutoId(Integer produtoId) { this.produtoId = produtoId; }
    public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public void setPrecoUnitario(BigDecimal precoUnitario) { this.precoUnitario = precoUnitario; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
}


public class PedidoResponseDTO {
    private Long id;
    private LocalDateTime dataPedido;
    private BigDecimal valorTotal;
    private String statusPedido;
    private List<ItemPedidoResponseDTO> itens;
    private EnderecoDTO enderecoEntrega;
    private String formaPagamento;
    private String detalhesPagamento;
    private BigDecimal valorFrete;
    private String nomeCliente;
    private Long clienteId;


    public PedidoResponseDTO(Pedido pedido) {
        this.id = pedido.getId();
        this.dataPedido = pedido.getDataPedido();
        this.valorTotal = pedido.getValorTotal();
        this.statusPedido = pedido.getStatusPedido();
        this.itens = pedido.getItens().stream().map(ItemPedidoResponseDTO::new).collect(Collectors.toList());
        if (pedido.getEnderecoEntrega() != null) {
            this.enderecoEntrega = new EnderecoDTO(pedido.getEnderecoEntrega()); 
        }
        this.formaPagamento = pedido.getFormaPagamento();
        this.detalhesPagamento = pedido.getDetalhesPagamento();
        this.valorFrete = pedido.getValorFrete();
        if (pedido.getCliente() != null) {
            this.nomeCliente = pedido.getCliente().getNomeCompleto();
            this.clienteId = pedido.getCliente().getId();
        }
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDataPedido() { return dataPedido; }
    public void setDataPedido(LocalDateTime dataPedido) { this.dataPedido = dataPedido; }
    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }
    public String getStatusPedido() { return statusPedido; }
    public void setStatusPedido(String statusPedido) { this.statusPedido = statusPedido; }
    public List<ItemPedidoResponseDTO> getItens() { return itens; }
    public void setItens(List<ItemPedidoResponseDTO> itens) { this.itens = itens; }
    public EnderecoDTO getEnderecoEntrega() { return enderecoEntrega; }
    public void setEnderecoEntrega(EnderecoDTO enderecoEntrega) { this.enderecoEntrega = enderecoEntrega; }
    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }
    public String getDetalhesPagamento() { return detalhesPagamento; }
    public void setDetalhesPagamento(String detalhesPagamento) { this.detalhesPagamento = detalhesPagamento; }
    public BigDecimal getValorFrete() { return valorFrete; }
    public void setValorFrete(BigDecimal valorFrete) { this.valorFrete = valorFrete; }
    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
}