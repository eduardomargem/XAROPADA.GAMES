package br.com.xaropadagames.projeto.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.model.Endereco;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ClienteCadastroDTO {
    @NotBlank
    @Size(min = 6)
    private String nomeCompleto;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Pattern(regexp = "(\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})")
    private String cpf;
    
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataNascimento;
    
    @NotBlank
    private String genero;
    
    @NotBlank
    @Size(min = 6)
    private String senha;
    
    @NotBlank
    @Size(min = 6)
    private String confirmarSenha;
    
    @NotNull
    @Size(min = 2, message = "Pelo menos um endereço de faturamento e um de entrega são obrigatórios")
    private List<EnderecoDTO> enderecos;

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getConfirmarSenha() {
        return confirmarSenha;
    }

    public void setConfirmarSenha(String confirmarSenha) {
        this.confirmarSenha = confirmarSenha;
    }

    public List<EnderecoDTO> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(List<EnderecoDTO> enderecos) {
        this.enderecos = enderecos;
    }

    public Cliente toEntity() {
        Cliente cliente = new Cliente();
        cliente.setNomeCompleto(this.nomeCompleto);
        cliente.setEmail(this.email);
        cliente.setCpf(this.cpf);
        cliente.setDataNascimento(this.dataNascimento);
        cliente.setGenero(this.genero);
        cliente.setSenha(this.senha);
        
        // Conversão dos endereços DTO para entidades
        List<Endereco> enderecos = this.enderecos.stream()
            .map(EnderecoDTO::toEntity)
            .collect(Collectors.toList());
        
        cliente.setEnderecos(enderecos);
        return cliente;
    }
}
