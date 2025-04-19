package br.com.xaropadagames.projeto.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ds_nome", length = 200, nullable = false)
    private String nome;

    @Column(name = "qtd_produto", nullable = false)
    private Integer quantidade;

    @Column(name = "vl_produto", precision = 10, scale = 2, nullable = false)
    private BigDecimal preco;

    @Column(name = "ds_descricao", length = 2000, nullable = false)
    private String descricao;

    @Column(name = "nr_avaliacao", precision = 10, scale = 2, nullable = false)
    private BigDecimal avaliacao;

    @Column(name = "bo_status", columnDefinition = "INT", nullable = true)
    private Integer bo_status;

    // Relacionamento com imagens
    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImagemProduto> imagens = new ArrayList<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getAvaliacao() {
        return avaliacao;
    }

    public void setAvaliacao(BigDecimal avaliacao) {
        this.avaliacao = avaliacao;
    }

    public Integer getBo_status() {
        return bo_status;
    }

    public void setBo_status(Integer bo_status) {
        this.bo_status = bo_status;
    }

    public List<ImagemProduto> getImagens() {
        return imagens;
    }

    public void setImagens(List<ImagemProduto> imagens) {
        this.imagens = imagens;
    }
}
