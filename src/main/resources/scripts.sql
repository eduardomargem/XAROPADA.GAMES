CREATE DATABASE xaropadagames;

use xaropadagames;

CREATE TABLE Grupos (
    id              int not null AUTO_INCREMENT,
    ds_grupo        varchar(50) not null
);

INSERT INTO Grupos (ds_grupo)
VALUES ('Admin', 'Estoquista');

CREATE TABLE Usuarios (
    id              int not null AUTO_INCREMENT,
    ds_nome         varchar(200) not null,
    nr_cpf          varchar(11) not null unique,
    ds_email        varchar(100) not null unique,
    ds_senha        varchar(20) not null,
    id_grupo        int not null,
    bo_status       int not null,
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id)
);