package br.com.xaropadagames.projeto.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.com.xaropadagames.projeto.dao.ClienteDAO;
import br.com.xaropadagames.projeto.dao.IProduto;
import br.com.xaropadagames.projeto.dto.ItemPedidoRequest;
import br.com.xaropadagames.projeto.dto.PedidoRequest;
import br.com.xaropadagames.projeto.model.Cliente;
import br.com.xaropadagames.projeto.model.Endereco;
import br.com.xaropadagames.projeto.model.ItemPedido;
import br.com.xaropadagames.projeto.model.Pagamento;
import br.com.xaropadagames.projeto.model.Pedido;
import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.repository.PedidoRepository;
import jakarta.transaction.Transactional;

@Service
public class PedidoService {
    
    private final PedidoRepository pedidoRepository;
    private final ClienteDAO clienteDAO;
    private final IProduto produtoRepository;
    
    public PedidoService(PedidoRepository pedidoRepository, 
                       ClienteDAO clienteDAO,
                       IProduto produtoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.clienteDAO = clienteDAO;
        this.produtoRepository = produtoRepository;
    }
    
    @Transactional
    public Pedido criarPedido(PedidoRequest pedidoRequest) {
        // Validações
        Cliente cliente = clienteDAO.findById(pedidoRequest.getClienteId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        
        // Busca o endereço de entrega
        Endereco enderecoEntrega = cliente.getEnderecos().stream()
            .filter(e -> e.getId().equals(pedidoRequest.getEnderecoEntregaId()))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereço de entrega não encontrado ou não pertence ao cliente"));
        
        // Cria o pedido
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setEnderecoEntrega(enderecoEntrega);
        pedido.setNumeroPedido(gerarNumeroPedido());
        pedido.setStatus(Pedido.StatusPedido.AGUARDANDO_PAGAMENTO);
        pedido.setValorTotal(pedidoRequest.getValorTotal());
        pedido.setValorFrete(pedidoRequest.getValorFrete());
        
        // Adiciona itens
        for (ItemPedidoRequest itemReq : pedidoRequest.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado: " + itemReq.getProdutoId()));
            
            ItemPedido item = new ItemPedido();
            item.setProduto(produto);
            item.setQuantidade(itemReq.getQuantidade());
            item.setPrecoUnitario(itemReq.getPrecoUnitario());
            pedido.adicionarItem(item);
            
            // Atualiza estoque
            produto.setQuantidade(produto.getQuantidade() - itemReq.getQuantidade());
            produtoRepository.save(produto);
        }
        
        // Cria pagamento
        Pagamento pagamento = new Pagamento();
        pagamento.setPedido(pedido);
        
        // Converte string para enum do método de pagamento
        try {
            pagamento.setMetodo(Pagamento.MetodoPagamento.valueOf(pedidoRequest.getMetodoPagamento()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Método de pagamento inválido: " + pedidoRequest.getMetodoPagamento());
        }
        
        pagamento.setStatus(Pagamento.StatusPagamento.PENDENTE);
        
        // Preenche dados específicos do pagamento
        if (pedidoRequest.getDadosPagamento() != null) {
            if (pagamento.getMetodo() == Pagamento.MetodoPagamento.BOLETO) {
                pagamento.setCodigoBoleto(pedidoRequest.getDadosPagamento().getCodigoBoleto());
            } else if (pagamento.getMetodo() == Pagamento.MetodoPagamento.CARTAO_CREDITO) {
                pagamento.setCartaoUltimosDigitos(
                    pedidoRequest.getDadosPagamento().getNumeroCartao() != null ? 
                    pedidoRequest.getDadosPagamento().getNumeroCartao().substring(
                        Math.max(0, pedidoRequest.getDadosPagamento().getNumeroCartao().length() - 4)
                    ) : null
                );
                pagamento.setCartaoParcelas(pedidoRequest.getDadosPagamento().getParcelas());
            }
        }
        
        pedido.setPagamento(pagamento);
        
        return pedidoRepository.save(pedido);
    }
    
    private String gerarNumeroPedido() {
        return "PED" + System.currentTimeMillis();
    }

    public Optional<Pedido> buscarPorId(Long id) {
    return pedidoRepository.findById(id);
}

@Transactional
public Pedido atualizarStatus(Long id, String novoStatus) {
    Pedido pedido = pedidoRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    
    try {
        Pedido.StatusPedido status = Pedido.StatusPedido.valueOf(novoStatus);
        pedido.setStatus(status);
        
        // Atualizar status do pagamento se necessário
        if (status == Pedido.StatusPedido.PAGAMENTO_SUCESSO) {
            pedido.getPagamento().setStatus(Pagamento.StatusPagamento.APROVADO);
            pedido.getPagamento().setDataPagamento(LocalDateTime.now());
        } else if (status == Pedido.StatusPedido.PAGAMENTO_REJEITADO) {
            pedido.getPagamento().setStatus(Pagamento.StatusPagamento.REJEITADO);
        }
        
        return pedidoRepository.save(pedido);
    } catch (IllegalArgumentException e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido: " + novoStatus);
    }
}
}