package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.ClienteDAO;
import br.com.xaropadagames.projeto.exception.DuplicidadeException;
import br.com.xaropadagames.projeto.exception.ValidacaoException;
import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.model.Endereco;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class ClienteService {

    private final ClienteDAO clienteDAO;
   
    private final ViaCepService viaCepService;

    public ClienteService(ClienteDAO clienteDAO, ViaCepService viaCepService) {
        this.clienteDAO = clienteDAO;
        this.viaCepService = viaCepService;
    }

    @Transactional
    public Cliente cadastrar(Cliente cliente) {
        validarCliente(cliente);

        // Verificar duplicidade de email e CPF
        // No método cadastrar do ClienteService, atualize as verificações de
        // duplicidade:
        if (clienteDAO.existsByEmail(cliente.getEmail())) {
            throw new DuplicidadeException("cliente com este email", cliente.getEmail());
        }

        if (clienteDAO.existsByCpf(cliente.getCpf())) {
            throw new DuplicidadeException("cliente com este CPF", cliente.getCpf());
        }

        // Validar endereços
        validarEnderecos(cliente.getEnderecos());

        // Encriptar senha
    

        return clienteDAO.save(cliente);
    }

    private void validarCliente(Cliente cliente) {
        // Validar nome completo (pelo menos 2 palavras com 3 letras cada)
        String nome = cliente.getNomeCompleto().trim();
        String[] partesNome = nome.split("\\s+");
        if (partesNome.length < 2) {
            throw new ValidacaoException("Nome completo deve conter pelo menos 2 palavras");
        }
        for (String parte : partesNome) {
            if (parte.length() < 3) {
                throw new ValidacaoException("Cada parte do nome deve ter pelo menos 3 letras");
            }
        }

        // Outras validações são feitas pelas anotações do modelo
    }

    private void validarEnderecos(List<Endereco> enderecos) {
        if (enderecos == null || enderecos.isEmpty()) {
            throw new ValidacaoException("Pelo menos um endereço (faturamento) é obrigatório");
        }

        boolean temFaturamento = false;
        for (Endereco endereco : enderecos) {
            if (endereco.getLocalidade() == null || endereco.getLocalidade().isBlank()) {
                throw new ValidacaoException("Localidade é obrigatória para o endereço");
            }

            // Validar CEP usando ViaCEP
            Endereco enderecoValidado = viaCepService.validarEndereco(endereco);
            endereco.setCep(enderecoValidado.getCep());
            endereco.setLogradouro(enderecoValidado.getLogradouro());
            endereco.setComplemento(enderecoValidado.getComplemento());
            endereco.setBairro(enderecoValidado.getBairro());
            endereco.setLocalidade(enderecoValidado.getLocalidade());
            endereco.setUf(enderecoValidado.getUf());
        }

        if (!temFaturamento) {
            throw new ValidacaoException("Endereço de faturamento é obrigatório");
        }

        
    }
}