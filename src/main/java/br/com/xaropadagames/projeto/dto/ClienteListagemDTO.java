package br.com.xaropadagames.projeto.dto;

public class ClienteListagemDTO {
    private Long id;
    private String nomeCompleto;
    private String email;
    private String cidade;
    
    // Getters e Setters
    public Long getId() { 
        return id; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

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

    public String getCidade() { 
        return cidade; 
    }

    public void setCidade(String cidade) { 
        this.cidade = cidade; 
    }
}
