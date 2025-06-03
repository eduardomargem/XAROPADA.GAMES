package br.com.xaropadagames.projeto.dao;

import br.com.xaropadagames.projeto.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IPedido extends JpaRepository<Pedido, Long> {
    
    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.itens item LEFT JOIN FETCH item.produto prod LEFT JOIN FETCH prod.imagens WHERE p.cliente.id = :clienteId ORDER BY p.dataPedido DESC")
    List<Pedido> findByClienteIdOrderByDataPedidoDesc(@Param("clienteId") Long clienteId);

    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.itens item LEFT JOIN FETCH item.produto prod LEFT JOIN FETCH prod.imagens WHERE p.id = :id")
    Optional<Pedido> findByIdWithItensAndProducts(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.itens item LEFT JOIN FETCH item.produto prod LEFT JOIN FETCH prod.imagens ORDER BY p.dataPedido DESC")
    List<Pedido> findAllWithItensAndProductsOrderByDataPedidoDesc();
}