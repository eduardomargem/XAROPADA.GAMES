package br.com.xaropadagames.projeto.model;

public class LoginRequest {
    private String username;
    private String password;

    // Construtor vazio (necessário para o Spring)
    public LoginRequest() {}

    // Construtores
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters e Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}