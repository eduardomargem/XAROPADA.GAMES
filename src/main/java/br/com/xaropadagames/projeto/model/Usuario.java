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
    private String dsNome;

    @Column(name = "nr_cpf", columnDefinition = "TEXT", nullable = true)
    private String nrCpf;

    @Column(name = "ds_email", length = 100, nullable = true)
    private String dsEmail;

    @Column(name = "ds_senha", columnDefinition = "TEXT", nullable = true)
    private String dsSenha;

    @Column(name = "id_grupo", columnDefinition = "INT", nullable = true)
    private Integer idGrupo;

    @Column(name = "bo_status", columnDefinition = "INT", nullable = true)
    private Integer boStatus;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDsNome() {
        return dsNome;
    }

    public void setDsNome(String dsNome) {
        this.dsNome = dsNome;
    }

    public String getNrCpf() {
        return nrCpf;
    }

    public void setNrCpf(String nrCpf) {
        this.nrCpf = nrCpf;
    }

    public String getDsEmail() {
        return dsEmail;
    }

    public void setDsEmail(String dsEmail) {
        this.dsEmail = dsEmail;
    }

    public String getDsSenha() {
        return dsSenha;
    }

    public void setDsSenha(String dsSenha) {
        this.dsSenha = dsSenha;
    }

    public Integer getIdGrupo() {
        return idGrupo;
    }

    public void setIdGrupo(Integer idGrupo) {
        this.idGrupo = idGrupo;
    }

    public Integer getBoStatus() {
        return boStatus;
    }

    public void setBoStatus(Integer boStatus) {
        this.boStatus = boStatus;
    }
}
