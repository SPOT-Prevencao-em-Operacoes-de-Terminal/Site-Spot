var database = require("../database/config");

function cadastrar(hostname, sistemaOperacional, fkEmpresa, localizacao, macAddress, uuid) {
    // Garante que, se o MAC Address vier vazio/null, seja inserido NULL no MySQL em vez de texto 'null'
    var valorMac = macAddress ? `'${macAddress}'` : "NULL";

    var instrucaoSql = `
        INSERT INTO servidor (hostname, sistema_operacional, fk_empresa, localizacao, macAddress, UUID)
        VALUES ('${hostname}', '${sistemaOperacional}', ${fkEmpresa}, '${localizacao}', ${valorMac}, '${uuid}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar
};