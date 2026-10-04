var database = require("../database/config");

function cadastrar(nome, email, telefone, nomeEmpresa) {

    var instrucaoSql = `
        INSERT INTO contato_site (nome, email, telefone, nome_empresa)
        VALUES ('${nome}', '${email}', '${telefone}', '${nomeEmpresa}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar
};