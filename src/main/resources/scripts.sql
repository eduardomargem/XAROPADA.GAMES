-- Active: 1741726533463@@127.0.0.1@3306@phpmyadmin

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

insert into usuarios (ds_nome, nr_cpf, ds_email, ds_senha, id_grupo, bo_status)
values ('Daniel Pereira', '12343655825', 'daniel456@gmail.com', 'xaropada@789', 1, 1)

create table Produtos (
    id              int not null AUTO_INCREMENT PRIMARY KEY,
    ds_nome         varchar(200) not null,
    qtd_produto     int not null,
    vl_produto      DECIMAL(10, 2) not null,
    ds_descricao    varchar(2000) not null,
    nr_avaliacao    DECIMAL(10, 2) not null
)

insert into produtos (ds_nome, qtd_produto, vl_produto, ds_descricao, nr_avaliacao)
values ('Xbox 360', 5, 1250.00, 'Videogame da nova geração', 5.00)

CREATE TABLE imagens_produto (
    id              int AUTO_INCREMENT PRIMARY KEY,
    id_produto      int NOT NULL,
    imagem          BLOB,
    caminho         VARCHAR(255),
    tipo_imagem     VARCHAR(50),
    FOREIGN KEY (id_produto) REFERENCES produtos(id) ON DELETE CASCADE
);

SELECT * from usuarios;