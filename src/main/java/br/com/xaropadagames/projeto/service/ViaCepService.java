package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.model.Endereco;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {
    
    private static final String URL_VIA_CEP = "https://viacep.com.br/ws/%s/json/";
    
    public Endereco validarEndereco(Endereco endereco) {
        RestTemplate restTemplate = new RestTemplate();
        String url = String.format(URL_VIA_CEP, endereco.getCep().replace("-", ""));
        
        try {
            Endereco enderecoViaCep = restTemplate.getForObject(url, Endereco.class);
            if (enderecoViaCep == null || enderecoViaCep.getCep() == null) {
                throw new RuntimeException("CEP inválido");
            }
            
            // Atualiza os dados do endereço com os dados do ViaCEP
            enderecoViaCep.setNumero(endereco.getNumero());
            enderecoViaCep.setComplemento(endereco.getComplemento());
            enderecoViaCep.setFaturamento(endereco.isFaturamento());
            enderecoViaCep.setEntrega(endereco.isEntrega());
            
            return enderecoViaCep;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao validar CEP: " + e.getMessage());
        }
    }
}