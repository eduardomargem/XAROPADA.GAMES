-- Active: 1741726533463@@127.0.0.1@3307@xaropadagames
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
values ('Eduardo Margem', '14725836912', 'eduardo123@gmail.com', 'xaropada@123', 1, 1)

create table Produtos (
    id              int not null AUTO_INCREMENT PRIMARY KEY,
    ds_nome         varchar(200) not null,
    qtd_produto     int not null,
    vl_produto      DECIMAL(10, 2) not null,
    ds_descricao    varchar(2000) not null,
    nr_avaliacao    DECIMAL(10, 2) not null,
    bo_status       int not null
)

insert into produtos (ds_nome, qtd_produto, vl_produto, ds_descricao, nr_avaliacao, bo_status)
values ('Xbox 360', 5, 1250.00, 'Videogame da nova geração', 5.00, 1)

CREATE TABLE imagens_produto (
    id              int AUTO_INCREMENT PRIMARY KEY,
    id_produto      int NOT NULL,
    imagem          LONGBLOB,
    caminho         VARCHAR(255),
    tipo_imagem     VARCHAR(50),
    FOREIGN KEY (id_produto) REFERENCES produtos(id) ON DELETE CASCADE
);

select * from usuarios

CREATE TABLE clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    senha VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;


SHOW TABLES;
DESCRIBE clientes;

SELECT * FROM CLIENTES