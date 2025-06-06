package br.com.xaropadagames.projeto.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

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
    @DecimalMin(value = "1.0", message = "A avaliação mínima é 1.0")
    @DecimalMax(value = "5.0", message = "A avaliação máxima é 5.0")
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

    public String getImagemUrl() {
        if (this.imagens != null && !this.imagens.isEmpty()) {
            ImagemProduto primeiraImagem = this.imagens.get(0);
            
            // 1. Prioriza o caminho direto se existir
            if (primeiraImagem.getCaminho() != null && !primeiraImagem.getCaminho().isBlank()) {
                return primeiraImagem.getCaminho();
            }
            
            // 2. Fallback para o endpoint de API se tiver ID
            if (primeiraImagem.getId() != null) {
                return "/imagens/" + primeiraImagem.getId();
            }
        }
        
        // 3. Fallback final para imagem padrão
        return "/images/placeholder-produto.png";
    }
}
