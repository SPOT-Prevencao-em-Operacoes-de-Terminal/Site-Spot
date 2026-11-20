var database = require("../database/config");

// ADICIONAR NOVA INFORMAÇÃO DE CONTATO
function cadastrar(idUsuario, idTipoContato, contato) {

    var instrucaoSql = `
        INSERT INTO contato (fk_tipo_contato, fk_usuario, contatocol)
        VALUES (${idTipoContato}, ${idUsuario}, '${contato}');
    `;

    return database.executar(instrucaoSql);
}


// LISTAR INFORMAÇÕES DE CONTATO
function listar(idUsuario) {

    var instrucaoSql = `
        SELECT 
            tc.idtipo_contato,
            tc.nome AS tipo_contato,
            c.fk_usuario,
            c.contatocol
        FROM contato AS c
        JOIN tipo_contato AS tc
            ON c.fk_tipo_contato = tc.idtipo_contato
        WHERE c.fk_usuario = ${idUsuario};
    `;

    return database.executar(instrucaoSql);
}


// EXCLUIR INFORMAÇÃO DE CONTATO
function excluirContato(idUsuario, idTipoContato) {

    var instrucaoSql = `
        DELETE FROM contato
        WHERE fk_tipo_contato = ${idTipoContato}
        AND fk_usuario = ${idUsuario};
    `;

    return database.executar(instrucaoSql);
}


// ALTERAR INFORMAÇÃO DE CONTATO
function atualizarContato(idUsuario, idTipoContato, novoContato) {

    var instrucaoSql = `
        UPDATE contato
        SET contatocol = '${novoContato}'
        WHERE fk_tipo_contato = ${idTipoContato}
        AND fk_usuario = ${idUsuario};
    `;

    return database.executar(instrucaoSql);
}


module.exports = {
    cadastrar,
    listar,
    atualizarContato,
    excluirContato
};