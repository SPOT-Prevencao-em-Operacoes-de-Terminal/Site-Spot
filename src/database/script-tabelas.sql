CREATE DATABASE spot;
USE spot;

CREATE TABLE empresa( 
id_empresa INT PRIMARY KEY AUTO_INCREMENT,
razao_social VARCHAR(100) NOT NULL,
nome_fantasia VARCHAR(100) NOT NULL,
apelido VARCHAR(60) NOT NULL,
cnpj CHAR(14) NOT NULL UNIQUE,
codigo_ativacao VARCHAR(50) NOT NULL
);

CREATE TABLE usuario(
id_usuario INT PRIMARY KEY AUTO_INCREMENT, 
nome VARCHAR(60) NOT NULL,
cpf CHAR(11) NOT NULL UNIQUE,
email VARCHAR(40) NOT NULL UNIQUE,
senha VARCHAR(255) NOT NULL,
telefone CHAR(11) NOT NULL,
fk_empresa INT NOT NULL,
CONSTRAINT fk_usuario_empresa 
	FOREIGN KEY (fk_empresa) 	
		REFERENCES empresa(id_empresa)
);

CREATE TABLE endereco(
id_endereco INT PRIMARY KEY AUTO_INCREMENT,
cep CHAR(8) NOT NULL,
endereco VARCHAR(100) NOT NULL,
numero INT NOT NULL,
complemento VARCHAR(20),
cidade VARCHAR(30) NOT NULL,
UF CHAR(2) NOT NULL,
tipo VARCHAR(30) NOT NULL,
fk_empresa INT NOT NULL,
CONSTRAINT fk_endereco_empresa
	FOREIGN KEY (fk_empresa)
	REFERENCES empresa(id_empresa)
);

CREATE TABLE status_servidor(
id_status INT PRIMARY KEY AUTO_INCREMENT,
descricao VARCHAR(100)
);

CREATE TABLE servidor(
id_servidor INT AUTO_INCREMENT PRIMARY KEY,
hostname VARCHAR(50),
sistema_operacional VARCHAR(100),
fk_empresa INT NOT NULL,
fk_status INT NOT NULL, 
CONSTRAINT fk_servidor_status
	FOREIGN KEY (fk_status) 
		REFERENCES status_servidor(id_status),
CONSTRAINT fk_servidor_empresa
	FOREIGN KEY(fk_empresa)
		REFERENCES empresa(id_empresa),
localizacao VARCHAR(200)
);
    
CREATE TABLE medida(
id_medida INT AUTO_INCREMENT PRIMARY KEY,
tipo VARCHAR(40) NOT NULL
);

CREATE TABLE componente(
id_componente INT AUTO_INCREMENT PRIMARY KEY,
nome VARCHAR(50) NOT NULL,
fk_servidor INT NOT NULL,
CONSTRAINT fk_componente_servidor 
	FOREIGN KEY (fk_servidor) 
		REFERENCES servidor(id_servidor)
);

CREATE TABLE limite(
id_limite INT PRIMARY KEY AUTO_INCREMENT,
classificacao VARCHAR(100) NOT NULL,
limite_componente FLOAT NOT NULL,
fk_medida INT NOT NULL,
CONSTRAINT fk_limite_medida
	FOREIGN KEY (fk_medida)
		REFERENCES medida(id_medida),
fk_componente INT,
CONSTRAINT fk_limite_componente
	FOREIGN KEY (fk_componente)
		REFERENCES componente(id_componente)
);
    
CREATE TABLE leitura(
id_leitura INT AUTO_INCREMENT PRIMARY KEY,
fk_componente INT NOT NULL,
fk_medida INT NOT NULL,
valor FLOAT NOT NULL,
dia_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
alerta INT,
CONSTRAINT fk_leitura_componente 
    FOREIGN KEY (fk_componente) 
    REFERENCES componente(id_componente),
CONSTRAINT fk_leitura_medida
    FOREIGN KEY (fk_medida) 
    REFERENCES medida(id_medida)
);	

CREATE TABLE contato_site(
id_contato INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(200) NOT NULL, 
email VARCHAR(200) NOT NULL,
telefone CHAR(11) NOT NULL,
nome_empresa VARCHAR(200)
);
        
INSERT INTO status_servidor (descricao) VALUES 
	('Desativado'),
	('Ativo');

INSERT INTO empresa (razao_social, nome_fantasia, apelido, cnpj, codigo_ativacao) VALUES
	('Santos Port Terminal Operations S.A.', 'Santos Terminal Portuario', 'Santos Port', '12345678000190', 'ACT-SNT-2026-X1'),
	('Paranagua Logistics & Container Terminal S.A.', 'Paranagua Logistics', 'PGua Logistics', '98765432000101', 'ACT-PGU-2026-Y2'),
	('Rio de Janeiro Operadora de Terminais Ltda.', 'Rio Terminal Logistico', 'Rio Terminal', '45678912000133', 'ACT-RIO-2026-Z3');

INSERT INTO endereco (id_endereco, cep, endereco, numero, complemento, cidade, UF, fk_empresa, tipo) VALUES
	(1, '11010010', 'Avenida Cais do Ecoporto', 500, 'Docas 01', 'Santos', 'SP', 1, 'teste'),
	(2, '83221000', 'Avenida Portuaria Principal', 1200, 'Galpão B', 'Paranaguá', 'PR', 2,'teste'),
	(3, '20081240', 'Avenida Rodrigues Alves', 450, 'Bloco A', 'Rio de Janeiro', 'RJ', 3, 'teste');

INSERT INTO usuario (nome, cpf, email, senha, telefone, fk_empresa) VALUES
	('Carlos Eduardo Silva', '11122233344', 'carlos.silva@santosport.com', 'Senha#123', '13988881111', 1),
	('Mariana Rocha Lima', '11122233355', 'mariana.lima@santosport.com', 'Senha#123', '13988882222', 1),
	('Roberto Alves Souza', '11122233366', 'roberto.souza@santosport.com', 'Senha#123', '13988883333', 1),
	('Fernanda Beatriz Costa', '22233344411', 'fernanda.costa@pgualog.com', 'Pass#2026', '41977771111', 2),
	('Lucas Martins Ribeiro', '22233344422', 'lucas.ribeiro@pgualog.com', 'Pass#2026', '41977772222', 2),
	('Juliana Mendes Prado', '22233344433', 'juliana.prado@pgualog.com', 'Pass#2026', '41977773333', 2),
	('Gabriel Santos Oliveira', '33344455511', 'gabriel.oliveira@rioterminal.com', 'Admin#987', '21966661111', 3),
	('Patricia Nunes Xavier', '33344455522', 'patricia.xavier@rioterminal.com', 'Admin#987', '21966662222', 3),
	('Thiago Henrique Ramos', '33344455533', 'thiago.ramos@rioterminal.com', 'Admin#987', '21966663333', 3);
    
INSERT INTO servidor (hostname, sistema_operacional, fk_empresa, fk_status, localizacao) VALUES
	('srv-tos-gate01', 'Ubuntu 22.04 LTS', 1, 2, 'Data Center Principal - Rack A1'),
	('srv-tos-db-prod', 'Red Hat Enterprise Linux 9', 1, 2, 'Data Center Principal - Rack A2'),
	('srv-backup-legacy', 'CentOS Stream 8', 1, 1, 'Sala de Telecom - Rack C1'),
	('srv-pgua-patios01', 'Ubuntu 20.04 LTS', 2, 2, 'Contêiner Server Room - Rack 01'),
	('srv-pgua-balanca', 'Windows Server 2022', 2, 2, 'Guarita de Controle Balança 02'),
	('srv-pgua-testes', 'Debian 12', 2, 1, 'Laboratório TI'),
	('srv-rio-monitoring', 'Ubuntu 22.04 LTS', 3, 2, 'NOC Terminal Rio - Rack 03'),
	('srv-rio-gate-cam', 'Ubuntu 22.04 LTS', 3, 2, 'Subestação Norte'),
	('srv-rio-old-app', 'Windows Server 2016', 3, 1, 'Data Center Secundário');
    
INSERT INTO medida (tipo) VALUES
	('uso_%'),
    ('freq_ghz'),
    ('gb'),
    ('temp_C'),
    ('num_conexoes'),
    ('uso_swap_%'),
    ('sla'),
    ('conexao_com_api'),
    ('conexao_com_mysql');
    
INSERT INTO componente (nome, fk_servidor) VALUES
	('cpu', 2),
    ('ram', 2),
    ('disco', 2),
    ('rede', 2);
