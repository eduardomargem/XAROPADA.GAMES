package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.exception.ValidacaoException;
import br.com.xaropadagames.projeto.model.Endereco;
import lombok.Data;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {
    
    private final RestTemplate restTemplate;

    public ViaCepService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public Endereco validarEndereco(Endereco endereco) {
        String cep = endereco.getCep().replace("-", "");
        String url = "https://viacep.com.br/ws/" + cep + "/json/";
        
        try {
            ViaCepResponse response = restTemplate.getForObject(url, ViaCepResponse.class);
            
            if (response == null || response.getErro()) {
                throw new ValidacaoException("CEP inválido ou não encontrado");
            }
            
            // Atualizar endereço com dados do ViaCEP
            endereco.setLogradouro(response.getLogradouro());
            endereco.setBairro(response.getBairro());
            endereco.setCidade(response.getLocalidade());
            endereco.setUf(response.getUf());
            
            return endereco;
        } catch (Exception e) {
            throw new ValidacaoException("Erro ao validar CEP: " + e.getMessage());
        }
    }

    @Data
    private static class ViaCepResponse {
        private String cep;
        private String logradouro;
        private String complemento;
        private String bairro;
        private String localidade;
        private String uf;
        private boolean erro;

        public boolean getErro() {
            return erro;
        }
    }
}