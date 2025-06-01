package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.ClienteDAO;
import br.com.xaropadagames.projeto.exception.DuplicidadeException;
import br.com.xaropadagames.projeto.exception.ValidacaoException;
import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.model.Endereco;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    private final ClienteDAO clienteDAO;
    private final ViaCepService viaCepService;

    public ClienteService(ClienteDAO clienteDAO, ViaCepService viaCepService) {
        this.clienteDAO = clienteDAO;
        this.viaCepService = viaCepService;
    }

    public List<Cliente> listarTodos() {
        return clienteDAO.findAll();
    }

    @Transactional
    public Cliente cadastrar(Cliente cliente) {
        // Remove os endereços temporariamente para salvar o cliente primeiro
        List<Endereco> enderecos = cliente.getEnderecos();
        cliente.setEnderecos(new ArrayList<>());
        
        // Validações básicas do cliente
        validarCliente(cliente);
        
        if (clienteDAO.existsByEmail(cliente.getEmail())) {
            throw new DuplicidadeException("cliente com este email", cliente.getEmail());
        }

        if (clienteDAO.existsByCpf(cliente.getCpf())) {
            throw new DuplicidadeException("cliente com este CPF", cliente.getCpf());
        }

        // Primeiro salva o cliente (sem endereços) para gerar o ID
        Cliente clienteSalvo = clienteDAO.save(cliente);
        
        // Agora associa e salva os endereços
        List<Endereco> enderecosValidados = enderecos.stream()
            .map(endereco -> {
                // Validação via ViaCEP
                Endereco enderecoValidado = viaCepService.validarEndereco(endereco);
                enderecoValidado.setCliente(clienteSalvo);
                return enderecoValidado;
            })
            .collect(Collectors.toList());
        
        // Atualiza a lista de endereços do cliente
        clienteSalvo.setEnderecos(enderecosValidados);
        
        // Salva novamente para atualizar os endereços
        return clienteDAO.save(clienteSalvo);
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
    }

    private void validarEnderecos(List<Endereco> enderecos) {
        if (enderecos == null || enderecos.size() < 2) {
            throw new ValidacaoException("Endereço de faturamento e pelo menos um de entrega são obrigatórios");
        }
        
        long faturamentoCount = enderecos.stream()
            .filter(e -> "FATURAMENTO".equals(e.getTipo()))
            .count();
            
        if (faturamentoCount != 1) {
            throw new ValidacaoException("Exatamente um endereço de faturamento é obrigatório");
        }
    }

    public Cliente findByEmail(String email) {
        return clienteDAO.findByEmail(email)
            .orElseThrow(() -> new ValidacaoException("Cliente não encontrado"));
    }
}