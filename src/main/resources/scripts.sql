-- Active: 1743459186615@@127.0.0.1@3307@xaropadagames

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
values ('Joana Marques', '79360205001', 'joanamarques@gmail.com', 'joana@123', 1, 1)

insert into usuarios (ds_nome, nr_cpf, ds_email, ds_senha, id_grupo, bo_status)
values ('Joao Marques', '19938857060', 'joaomarques@gmail.com', 'joao@123', 2, 1)

create table Produtos (
    id              int not null AUTO_INCREMENT PRIMARY KEY,
    ds_nome         varchar(200) not null,
    qtd_produto     int not null,
    vl_produto      DECIMAL(10, 2) not null,
    ds_descricao    varchar(2000) not null,
    nr_avaliacao    DECIMAL(10, 2) not null,
    bo_status       int not null
)

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


INSERT INTO Produtos (ds_nome, qtd_produto, vl_produto, ds_descricao, nr_avaliacao, bo_status) VALUES
('Mouse Gamer RGB', 150, 129.90, 'Mouse ergonômico com iluminação RGB e até 7200 DPI.', 4.7, 1),
('Teclado Mecânico ABNT2', 80, 249.99, 'Teclado mecânico com switches azuis e layout ABNT2.', 4.6, 1),
('Monitor 24" Full HD', 45, 899.00, 'Monitor LED 24 polegadas com resolução Full HD e HDMI.', 4.5, 1),
('Headset Surround 7.1', 60, 199.90, 'Headset gamer com som surround 7.1 e microfone removível.', 4.3, 1),
('Cadeira Gamer Reclinável', 20, 1399.00, 'Cadeira ergonômica com reclinação de até 180 graus.', 4.8, 1),
('Notebook Ryzen 5', 30, 3499.99, 'Notebook com Ryzen 5, 8GB RAM e SSD de 512GB.', 4.4, 1),
('Webcam Full HD 1080p', 100, 229.90, 'Webcam com microfone embutido e vídeo em Full HD.', 4.2, 1),
('Impressora Multifuncional Wi-Fi', 25, 699.00, 'Impressora com scanner e conectividade Wi-Fi.', 4.1, 1),
('Hub USB 3.0 4 Portas', 200, 59.90, 'Hub USB com 4 portas e alta velocidade de transferência.', 4.0, 1),
('Controle Bluetooth para PC/Console', 70, 199.00, 'Controle sem fio compatível com PC e consoles.', 4.6, 1);

