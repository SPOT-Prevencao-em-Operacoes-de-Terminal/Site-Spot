CREATE DATABASE spot_bd;
USE spot_bd;

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    razao_social VARCHAR(100),
    nome_fantasia VARCHAR(100),
    cnpj CHAR(14)
);

CREATE TABLE cargo (
    id_cargo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45),
    descricao VARCHAR(255)
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60),
    cargo VARCHAR(50),
    cpf CHAR(11),
    senha VARCHAR(255),
    status VARCHAR(40),
    fk_empresa INT,
    fk_cargo INT,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (fk_cargo) REFERENCES cargo(id_cargo)
);

CREATE TABLE codigo_autenticacao (
    id_codigo INT AUTO_INCREMENT PRIMARY KEY,
    codigo CHAR(6),
    data_criacao DATETIME,
    data_vencimento DATETIME,
    status VARCHAR(20),
    fk_empresa INT,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE endereco (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    cep CHAR(8),
    endereco VARCHAR(100),
    numero INT,
    complemento VARCHAR(20),
    cidade VARCHAR(30),
    UF CHAR(2),
    fk_empresa INT,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE status_servidor (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100)
);

CREATE TABLE servidor (
    id_servidor INT AUTO_INCREMENT PRIMARY KEY,
    hostname VARCHAR(50),
    sistema_operacional VARCHAR(100),
    fk_empresa INT,
    fk_status INT,
    localizacao VARCHAR(200),
    macAddress CHAR(17),
    UUID VARCHAR(60),
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (fk_status) REFERENCES status_servidor(id_status)
);

CREATE TABLE tipo_contato (
    idtipo_contato INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50)
);

CREATE TABLE contato (
    fk_tipo_contato INT,
    fk_usuario INT,
    contatocol VARCHAR(45),
    PRIMARY KEY (fk_tipo_contato, fk_usuario),
    FOREIGN KEY (fk_tipo_contato) REFERENCES tipo_contato(idtipo_contato),
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE componente (
    id_componente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50),
    unidade_medida VARCHAR(10)
);

CREATE TABLE configuracao (
    fk_componente INT,
    fk_servidor INT,
    limite DOUBLE,
    classificacao VARCHAR(100),
    PRIMARY KEY (fk_componente, fk_servidor),
    FOREIGN KEY (fk_componente) REFERENCES componente(id_componente),
    FOREIGN KEY (fk_servidor) REFERENCES servidor(id_servidor)
);

CREATE TABLE leitura (
    id_leitura INT AUTO_INCREMENT PRIMARY KEY,
    valor FLOAT,
    dia_hora DATETIME,
    fk_configComponente INT,
    fk_configServidor INT,
    FOREIGN KEY (fk_configComponente, fk_configServidor)
        REFERENCES configuracao(fk_componente, fk_servidor)
);

CREATE TABLE alerta (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    grau_alerta VARCHAR(10),
    fk_leitura INT,
    FOREIGN KEY (fk_leitura) REFERENCES leitura(id_leitura)
);

CREATE TABLE contato_site (
    id_contato INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200),
    email VARCHAR(200),
    telefone CHAR(11),
    nome_empresa VARCHAR(200)
);

INSERT INTO empresa (razao_social, nome_fantasia, cnpj) VALUES
('Companhia Docas de Santos', 'Porto de Santos', '00000000000101'),
('Portonave S.A. Terminais Portuários de Navegação', 'Porto de Navegantes', '00000000000102'),
('TCP - Terminal de Contêineres de Paranaguá S.A.', 'Porto de Paranaguá', '00000000000103'),
('Companhia Docas do Rio de Janeiro', 'Porto do Rio de Janeiro', '00000000000104'),
('Complexo Industrial Portuário de Suape', 'Porto de Suape', '00000000000105'),
('Porto de Itajaí S.A.', 'Porto de Itajaí', '00000000000106');

INSERT INTO cargo (nome, descricao) VALUES
('Administrador', 'Responsável pelo gerenciamento da empresa no sistema'),
('Analista de TI', 'Responsável pelo monitoramento e análise dos servidores'),
('Gestor de TI', 'Responsável pela gestão da equipe e da infraestrutura de TI');

INSERT INTO usuario (nome, cargo, cpf, senha, status, fk_empresa, fk_cargo) VALUES
('Admin Santos', 'Administrador', '11111111101', 'Spot@123', 'Ativo', 1, 1),
('Admin Navegantes', 'Administrador', '11111111102', 'Spot@123', 'Ativo', 2, 1),
('Admin Paranagua', 'Administrador', '11111111103', 'Spot@123', 'Ativo', 3, 1),
('Admin Rio', 'Administrador', '11111111104', 'Spot@123', 'Ativo', 4, 1),
('Admin Suape', 'Administrador', '11111111105', 'Spot@123', 'Ativo', 5, 1),
('Admin Itajai', 'Administrador', '11111111106', 'Spot@123', 'Ativo', 6, 1);

INSERT INTO tipo_contato (nome) VALUES
('Telefone'),
('E-mail');

SELECT *
FROM codigo_autenticacao
ORDER BY id_codigo DESC;

INSERT INTO contato (fk_tipo_contato, fk_usuario, contatocol)
VALUES
(2, 1, 'admin.santos@spot.com'),
(2, 2, 'admin.navegantes@spot.com'),
(2, 3, 'admin.paranagua@spot.com'),
(2, 4, 'admin.rio@spot.com'),
(2, 5, 'admin.suape@spot.com'),
(2, 6, 'admin.itajai@spot.com');
