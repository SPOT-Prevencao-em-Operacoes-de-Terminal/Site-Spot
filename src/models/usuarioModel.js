var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n\n function entrar(): ", email, senha)

    var instrucaoSql = `
        SELECT u.id_usuario, u.nome, c.contatocol AS email,
               u.cargo, u.cpf, u.senha, u.fk_empresa
        FROM usuario u
        JOIN contato c ON c.fk_usuario = u.id_usuario
        JOIN tipo_contato tc ON tc.idtipo_contato = c.fk_tipo_contato
        WHERE c.contatocol = ?
        AND tc.nome = 'E-mail'
        AND u.senha = ?
        AND u.status = 'Ativo';
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql, [email, senha]);
}

function cadastrar(nome, cargo, cpf, email, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL - function cadastrar():", nome, cargo, cpf, email, fkEmpresa);

    var instrucaoSql = `
        INSERT INTO usuario (nome, cargo, cpf, senha, status, fk_empresa, fk_cargo)
        SELECT ?, ?, ?, '', 'Pendente', ?, id_cargo
        FROM cargo
        WHERE nome = ?;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql, [
        nome,
        cargo,
        cpf,
        fkEmpresa,
        cargo
    ]).then(function (resultado) {
        var instrucaoEmail = `
            INSERT INTO contato (fk_tipo_contato, fk_usuario, contatocol)
            SELECT idtipo_contato, ?, ?
            FROM tipo_contato
            WHERE nome = 'E-mail';
        `;

        return database.executar(instrucaoEmail, [
            resultado.insertId,
            email
        ]);
    });
}

function listarPorEmpresa(idEmpresa) {
    var instrucaoSql = `
        SELECT u.id_usuario, u.nome, c.contatocol AS email, u.cargo, u.status
        FROM usuario u
        LEFT JOIN contato c ON c.fk_usuario = u.id_usuario
        LEFT JOIN tipo_contato tc ON tc.idtipo_contato = c.fk_tipo_contato
        WHERE u.fk_empresa = ?
        AND (tc.nome = 'E-mail' OR tc.nome IS NULL)
        ORDER BY u.id_usuario DESC;
    `;

    return database.executar(instrucaoSql, [idEmpresa]);
}

function atualizarUsuario(idUsuario, nome, email, idEmpresa) {
    var instrucaoSql = `
        UPDATE usuario
        SET nome = ?
        WHERE id_usuario = ? AND fk_empresa = ?;
    `;

    return database.executar(instrucaoSql, [
        nome,
        idUsuario,
        idEmpresa
    ]).then(function () {
        var instrucaoEmail = `
            UPDATE contato c
            JOIN tipo_contato tc ON tc.idtipo_contato = c.fk_tipo_contato
            JOIN usuario u ON u.id_usuario = c.fk_usuario
            SET c.contatocol = ?
            WHERE u.id_usuario = ?
            AND u.fk_empresa = ?
            AND tc.nome = 'E-mail';
        `;

        return database.executar(instrucaoEmail, [
            email,
            idUsuario,
            idEmpresa
        ]);
    });
}

function excluirUsuario(idUsuario, idEmpresa) {
    var instrucaoSql = `
        UPDATE usuario
        SET status = 'Inativo'
        WHERE id_usuario = ?
        AND fk_empresa = ?;
    `;

    return database.executar(instrucaoSql, [
        idUsuario,
        idEmpresa
    ]);
}


function ativar(email, codigo, senha) {
    var instrucaoSql = `
        SELECT u.id_usuario, u.fk_empresa
        FROM usuario u
        JOIN contato c ON c.fk_usuario = u.id_usuario
        JOIN tipo_contato tc ON tc.idtipo_contato = c.fk_tipo_contato
        JOIN codigo_autenticacao ca ON ca.fk_empresa = u.fk_empresa
        WHERE c.contatocol = ?
        AND tc.nome = 'E-mail'
        AND u.status = 'Pendente'
        AND ca.codigo = ?
        AND ca.status = 'Ativo';
    `;

    return database.executar(instrucaoSql, [email, codigo])
        .then(function (resultado) {
            if (resultado.length !== 1) {
                return false;
            }

            var idUsuario = resultado[0].id_usuario;

            var instrucaoAtualizar = `
                UPDATE usuario
                SET senha = ?, status = 'Ativo'
                WHERE id_usuario = ? AND status = 'Pendente';
            `;

            return database.executar(instrucaoAtualizar, [
                senha,
                idUsuario
            ]).then(function (resultadoAtualizacao) {
                return resultadoAtualizacao.affectedRows === 1;
            });
        });
}


module.exports = {
    autenticar,
    cadastrar,
    listarPorEmpresa,
    atualizarUsuario,
    excluirUsuario,
    ativar
};
