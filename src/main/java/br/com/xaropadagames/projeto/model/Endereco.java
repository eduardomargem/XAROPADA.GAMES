package br.com.xaropadagames.projeto.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Table(name = "enderecos")
@Data
public class Endereco {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String tipo; // FATURAMENTO ou ENTREGA
    
    @NotBlank
    @Pattern(regexp = "\\d{5}-\\d{3}")
    private String cep;
    
    @NotBlank
    private String logradouro;
    
    @NotBlank
    private String numero;
    
    private String complemento;
    
    @NotBlank
    private String bairro;
    
    @NotBlank
    private String cidade;
    
    @NotBlank
    @Size(min = 2, max = 2)
    private String uf;
    
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    
}