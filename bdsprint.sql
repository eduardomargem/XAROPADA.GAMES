create database TelaCadastro;
use TelaCadastro;

-- Tabela de usuários
CREATE TABLE Usuario (
    cs_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nm_usuario VARCHAR(80) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    ds_email VARCHAR(80) UNIQUE NOT NULL,
    ds_senha VARCHAR(255) NOT NULL, -- Senha encriptada
    grupo ENUM('admin', 'estoquista') NOT NULL,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Usuario (nm_usuario, cpf, ds_email, ds_senha, grupo, status) VALUES
('Admin Master', '12345678901', 'admin@empresa.com', 'senha_encriptada1', 'admin', 'ativo'),
('Estoquista João', '98765432100', 'joao@empresa.com', 'senha_encriptada2', 'estoquista', 'ativo');

-- Tabela de sessão do usuário
CREATE TABLE Sessao (
    id_sessao INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    data_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(cs_usuario)
);
INSERT INTO Sessao (usuario_id) VALUES (1);

-- Tabela de produtos (PERSONAS)
CREATE TABLE Persona (
    id_persona INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Persona (nome, descricao, preco, estoque) VALUES
('Produto A', 'Descrição do Produto A', 50.00, 100),
('Produto B', 'Descrição do Produto B', 75.00, 50);

-- Tabela de logs de atividade do usuário
CREATE TABLE LogUsuario (
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    acao TEXT NOT NULL,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(cs_usuario)
);
INSERT INTO LogUsuario (usuario_id, acao) VALUES
(1, 'Usuário admin criou um novo produto'),
(2, 'Usuário estoquista atualizou o estoque de um produto');

CREATE INDEX idx_usuario_email ON Usuario(ds_email);

DELIMITER $$  
CREATE PROCEDURE sp_CadastrarUsuario(  
    IN p_nome VARCHAR(80),  
    IN p_cpf CHAR(11),  
    IN p_email VARCHAR(80),  
    IN p_senha VARCHAR(255),  
    IN p_grupo ENUM('admin', 'estoquista')  
)  
BEGIN  
    INSERT INTO Usuario (nm_usuario, cpf, ds_email, ds_senha, grupo, status)  
    VALUES (p_nome, p_cpf, p_email, p_senha, p_grupo, 'ativo');  
END $$  
DELIMITER ;

CALL sp_CadastrarUsuario('Xaropada da Silva', '11122233344', 'xaropada@empresa.com', 'senha_encriptada3', 'estoquista');

CREATE VIEW vw_UsuariosAtivos AS  
SELECT cs_usuario, nm_usuario, ds_email, grupo  
FROM Usuario  
WHERE status = 'ativo';

SELECT * FROM vw_UsuariosAtivos;

DELIMITER $$  
CREATE FUNCTION fn_VerificaEmail(p_email VARCHAR(80)) RETURNS BOOLEAN  
DETERMINISTIC  
BEGIN  
    DECLARE v_existe INT;  
    SELECT COUNT(*) INTO v_existe FROM Usuario WHERE ds_email = p_email;  
    RETURN v_existe > 0;  
END $$  
DELIMITER ;

SELECT fn_VerificaEmail('admin@empresa.com');


CREATE USER 'leitor'@'localhost' IDENTIFIED BY 'senha123';
GRANT SELECT ON BackofficeDB.* TO 'leitor'@'localhost';
FLUSH PRIVILEGES;
