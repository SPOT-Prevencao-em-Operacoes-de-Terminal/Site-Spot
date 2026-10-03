CREATE DATABASE spot_bd;
USE spot_bd;

CREATE TABLE empresa (
id_empresa INT AUTO_INCREMENT PRIMARY KEY,
razao_social VARCHAR(100),
nome_fantasia VARCHAR(100),
cnpj CHAR(14),
codigo_ativacao VARCHAR(50)
);

CREATE TABLE usuario (
id_usuario INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(60),
cargo VARCHAR(50),
cpf CHAR(11),
email VARCHAR(40),
senha VARCHAR(255),
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
servidorcol VARCHAR(45),
FOREIGN KEY (fk_empresa) REFERENCES empresa(id_empresa),
FOREIGN KEY (fk_status) REFERENCES status_servidor(id_status)
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
FOREIGN KEY (fk_configComponente, fk_configServidor) REFERENCES configuracao(fk_componente, fk_servidor)
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
