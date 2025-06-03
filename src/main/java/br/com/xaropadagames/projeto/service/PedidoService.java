package br.com.xaropadagames.projeto.service;

import br.com.xaropadagames.projeto.dao.ClienteDAO;
import br.com.xaropadagames.projeto.dao.IPedido;
import br.com.xaropadagames.projeto.dao.IProduto; // Usar IProduto do CrudRepository
import br.com.xaropadagames.projeto.dto.ItemPedidoDTO;
import br.com.xaropadagames.projeto.dto.PedidoRequestDTO;
import br.com.xaropadagames.projeto.model.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private IPedido pedidoRepository;

    @Autowired
    private ClienteDAO clienteRepository; // Usar ClienteDAO que estende JpaRepository

    @Autowired
    private IProduto produtoRepository; // Usar IProduto que estende CrudRepository

    // Removido ProdutoService se não for usado para lógica de produto aqui.
    // Se precisar de lógica específica de produto que não está no repositório, mantenha.


    @Transactional
    public Pedido criarPedido(PedidoRequestDTO pedidoRequestDTO) {
        Cliente cliente = clienteRepository.findById(pedidoRequestDTO.getClienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com ID: " + pedidoRequestDTO.getClienteId()));

        Pedido novoPedido = new Pedido();
        novoPedido.setCliente(cliente);
        novoPedido.setDataPedido(LocalDateTime.now());
        novoPedido.setStatusPedido("AGUARDANDO_PAGAMENTO");
        novoPedido.setFormaPagamento(pedidoRequestDTO.getFormaPagamento());
        novoPedido.setDetalhesPagamento(pedidoRequestDTO.getDetalhesPagamento());
        novoPedido.setValorFrete(pedidoRequestDTO.getValorFrete());
        novoPedido.setValorTotal(pedidoRequestDTO.getValorTotal());

        Endereco enderecoEntregaPedido = new Endereco();
        enderecoEntregaPedido.setCep(pedidoRequestDTO.getEnderecoEntrega().getCep());
        enderecoEntregaPedido.setLogradouro(pedidoRequestDTO.getEnderecoEntrega().getLogradouro());
        enderecoEntregaPedido.setNumero(pedidoRequestDTO.getEnderecoEntrega().getNumero());
        enderecoEntregaPedido.setComplemento(pedidoRequestDTO.getEnderecoEntrega().getComplemento());
        enderecoEntregaPedido.setBairro(pedidoRequestDTO.getEnderecoEntrega().getBairro());
        enderecoEntregaPedido.setCidade(pedidoRequestDTO.getEnderecoEntrega().getCidade());
        enderecoEntregaPedido.setUf(pedidoRequestDTO.getEnderecoEntrega().getUf());
        enderecoEntregaPedido.setTipo("ENTREGA_PEDIDO"); // Tipo específico para o endereço do pedido
        // NÃO associe este endereço ao cliente diretamente (enderecoEntregaPedido.setCliente(cliente);)
        // Ele será persistido via cascade do Pedido.
        novoPedido.setEnderecoEntrega(enderecoEntregaPedido);


        List<ItemPedido> itensDoPedido = new ArrayList<>();
        for (ItemPedidoDTO itemDTO : pedidoRequestDTO.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId()) // IProduto usa Integer para ID
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com ID: " + itemDTO.getProdutoId()));

            if (produto.getQuantidade() < itemDTO.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDTO.getQuantidade());
            itemPedido.setPrecoUnitario(itemDTO.getPrecoUnitario());
            // A associação itemPedido.setPedido(novoPedido) será feita no novoPedido.addItem()
            
            itensDoPedido.add(itemPedido);

            produto.setQuantidade(produto.getQuantidade() - itemDTO.getQuantidade());
            if (produto.getQuantidade() <= 0) { // Ajustado para <= 0
                produto.setBo_status(0); 
            }
            produtoRepository.save(produto);
        }
        novoPedido.setItens(itensDoPedido); // Isso chamará addItem para cada item

        return pedidoRepository.save(novoPedido);
    }

    public List<Pedido> listarPedidosPorCliente(Long clienteId) {
        return pedidoRepository.findByClienteIdOrderByDataPedidoDesc(clienteId);
    }
    
    public Pedido buscarPorIdComItens(Long id) {
        return pedidoRepository.findByIdWithItensAndProducts(id)
            .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + id));
    }

    public List<Pedido> listarTodosOsPedidosComItens() {
        return pedidoRepository.findAllWithItensAndProductsOrderByDataPedidoDesc();
    }

    @Transactional
    public Pedido atualizarStatusPedido(Long pedidoId, String novoStatus) {
        Pedido pedido = pedidoRepository.findByIdWithItensAndProducts(pedidoId) // Carrega com itens para evitar LazyInitializationException se for acessá-los depois
            .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + pedidoId));

        // TODO: Adicionar validações para transições de status, se necessário
        // Ex: Não pode voltar de ENTREGUE para AGUARDANDO_PAGAMENTO
        // Ex: Validar se novoStatus é um valor permitido (enum ou lista)

        pedido.setStatusPedido(novoStatus);
        return pedidoRepository.save(pedido);
    }
}