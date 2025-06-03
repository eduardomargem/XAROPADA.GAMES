-- Active: 1744504496810@@127.0.0.1@3307@xaropadagames

CREATE DATABASE xaropadagames;

use xaropadagames;

CREATE TABLE Grupos (
    id              int not null AUTO_INCREMENT PRIMARY KEY,
    ds_grupo        varchar(50) not null
);

INSERT INTO Grupos (ds_grupo)
VALUES ('Admin'), ('Estoquista');

CREATE TABLE Usuarios (
    id              int not null AUTO_INCREMENT PRIMARY KEY,
    ds_nome         varchar(200) not null,
    nr_cpf          varchar(11) not null unique,
    ds_email        varchar(100) not null unique,
    ds_senha        varchar(20) not null,
    id_grupo        int not null,
    bo_status       int not null,
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id)
);

insert into usuarios (ds_nome, nr_cpf, ds_email, ds_senha, id_grupo, bo_status)
values ('Eduardo Margem', '66468961009', 'eduardo123@gmail.com', 'xaropada@123', 1, 1);

insert into usuarios (ds_nome, nr_cpf, ds_email, ds_senha, id_grupo, bo_status)
values ('Daniel Assunção', '08399546038', 'daniel123@gmail.com', 'xaropada@123', 2, 1);

create table Produtos (
    id              int not null AUTO_INCREMENT PRIMARY KEY,
    ds_nome         varchar(200) not null,
    qtd_produto     int not null,
    vl_produto      DECIMAL(10, 2) not null,
    ds_descricao    varchar(2000) not null,
    nr_avaliacao    DECIMAL(10, 2) not null,
    bo_status       int not null
);

CREATE TABLE imagens_produto (
    id              int AUTO_INCREMENT PRIMARY KEY,
    id_produto      int NOT NULL,
    imagem          LONGBLOB,
    caminho         VARCHAR(255),
    tipo_imagem     VARCHAR(50),
    FOREIGN KEY (id_produto) REFERENCES produtos(id) ON DELETE CASCADE
);

select * from usuarios;

CREATE TABLE clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    senha VARCHAR(100) NOT NULL
);

CREATE TABLE enderecos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cliente_id BIGINT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

select * from clientes

select * from enderecos


-- Adicionar após a criação da tabela enderecos e produtos

CREATE TABLE pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    data_pedido DATETIME NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    status_pedido VARCHAR(50) NOT NULL,
    endereco_entrega_id BIGINT NOT NULL, 
    forma_pagamento VARCHAR(50) NOT NULL,
    detalhes_pagamento VARCHAR(255),
    valor_frete DECIMAL(10,2),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (endereco_entrega_id) REFERENCES enderecos(id) 
);

CREATE TABLE itens_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Adicionar coluna cliente_id à tabela enderecos se ainda não existir
-- Esta coluna é usada para associar o endereço ao cliente no perfil dele.
-- O endereço salvo no pedido é uma cópia/snapshot.
-- Verifique se a tabela enderecos já tem essa coluna do cadastro de cliente.
-- Se não, e se a intenção é que o endereço do pedido seja um dos endereços do cliente:
-- ALTER TABLE enderecos ADD COLUMN cliente_id BIGINT;
-- ALTER TABLE enderecos ADD CONSTRAINT fk_endereco_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id);
-- No entanto, a lógica atual do PedidoService cria uma nova entrada em 'enderecos' para o pedido.
-- Se 'enderecos' já tem 'cliente_id' para os endereços do perfil,
-- o Endereco salvo pelo PedidoService (com cliente=null) não terá essa FK preenchida.
-- Considere ter uma tabela `enderecos_pedido` separada ou garantir que o `Endereco` salvo com o pedido
-- não tente preencher `cliente_id` se a coluna for NOT NULL e tiver FK para `clientes(id)`.
-- A abordagem atual com `CascadeType.PERSIST` e `enderecoEntrega.setCliente(null)` (implícito se não setado)
-- no `PedidoService` é para criar um endereço "órfão" que só pertence ao pedido.
-- Adicionar coluna cliente_id à tabela enderecos se ainda não existir
-- Esta coluna é usada para associar o endereço ao cliente no perfil dele.
-- O endereço salvo no pedido é uma cópia/snapshot.
-- Verifique se a tabela enderecos já tem essa coluna do cadastro de cliente.     