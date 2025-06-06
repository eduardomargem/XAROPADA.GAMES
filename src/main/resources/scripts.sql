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

CREATE TABLE pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL,
    endereco_entrega_id BIGINT NOT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('AGUARDANDO_PAGAMENTO', 'PAGAMENTO_REJEITADO', 'PAGAMENTO_SUCESSO', 'AGUARDANDO_RETIRADA', 'EM_TRANSITO', 'ENTREGUE') NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    valor_total DECIMAL(10,2) NOT NULL,
    valor_frete DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (endereco_entrega_id) REFERENCES enderecos(id)
);

CREATE TABLE itens_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE pagamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    metodo ENUM('BOLETO', 'CARTAO_CREDITO') NOT NULL,
    status ENUM('PENDENTE', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    data_pagamento DATETIME,
    codigo_boleto VARCHAR(100),
    cartao_ultimos_digitos VARCHAR(4),
    cartao_parcelas INTEGER,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

select * from clientes

select * from enderecos

select * from pedidos

select * from itens_pedido

select * from pagamentos

select * from imagens_produto