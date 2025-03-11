package br.com.xaropadagames.projeto.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "ds_nome", columnDefinition = "TEXT", nullable = true)
    private String ds_nome;

    @Column(name = "nr_cpf", columnDefinition = "TEXT", nullable = true)
    private String nr_cpf;

    @Column(name = "ds_email", length = 100, nullable = true)
    private String ds_email;

    @Column(name = "ds_senha", columnDefinition = "TEXT", nullable = true)
    private String ds_senha;

    @Column(name = "id_grupo", columnDefinition = "INT", nullable = true)
    private Integer id_grupo;

    @Column(name = "bo_status", columnDefinition = "INT", nullable = true)
    private Integer bo_status;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDs_nome() {
        return ds_nome;
    }

    public void setDs_nome(String ds_nome) {
        this.ds_nome = ds_nome;
    }

    public String getNr_cpf() {
        return nr_cpf;
    }

    public void setNr_cpf(String nr_cpf) {
        this.nr_cpf = nr_cpf;
    }

    public String getDs_email() {
        return ds_email;
    }

    public void setDs_email(String ds_email) {
        this.ds_email = ds_email;
    }

    public String getDs_senha() {
        return ds_senha;
    }

    public void setDs_senha(String ds_senha) {
        this.ds_senha = ds_senha;
    }

    public Integer getId_grupo() {
        return id_grupo;
    }

    public void setId_grupo(Integer id_grupo) {
        this.id_grupo = id_grupo;
    }

    public Integer getBo_status() {
        return bo_status;
    }

    public void setBo_status(Integer bo_status) {
        this.bo_status = bo_status;
    }
}
