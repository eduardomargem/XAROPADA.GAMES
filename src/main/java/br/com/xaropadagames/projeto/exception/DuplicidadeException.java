package br.com.xaropadagames.projeto.exception;

public class DuplicidadeException extends RuntimeException {
    public DuplicidadeException(String entidade, String valor) {
        super(String.format("Já existe um %s com o valor '%s' cadastrado", entidade, valor));
    }
}