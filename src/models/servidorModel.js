var database = require("../database/config");

// --- Cadastro de máquina (grupo) ---
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

// --- Cards da tela de servidores: último valor de CPU (1), Disco (2) e RAM (3) + limites ---
function listarPorEmpresa(idEmpresa) {
    var instrucaoSql = `
        SELECT s.id_servidor, s.hostname,
            (SELECT l.valor FROM leitura l WHERE l.fk_configServidor = s.id_servidor
                AND l.fk_configComponente = 1 ORDER BY l.id_leitura DESC LIMIT 1) AS cpu,
            (SELECT l.valor FROM leitura l WHERE l.fk_configServidor = s.id_servidor
                AND l.fk_configComponente = 3 ORDER BY l.id_leitura DESC LIMIT 1) AS ram,
            (SELECT l.valor FROM leitura l WHERE l.fk_configServidor = s.id_servidor
                AND l.fk_configComponente = 2 ORDER BY l.id_leitura DESC LIMIT 1) AS disco,
            (SELECT cf.limite FROM configuracao cf WHERE cf.fk_servidor = s.id_servidor
                AND cf.fk_componente = 1) AS limite_cpu,
            (SELECT cf.limite FROM configuracao cf WHERE cf.fk_servidor = s.id_servidor
                AND cf.fk_componente = 3) AS limite_ram,
            (SELECT cf.limite FROM configuracao cf WHERE cf.fk_servidor = s.id_servidor
                AND cf.fk_componente = 2) AS limite_disco
        FROM servidor s
        WHERE s.fk_empresa = ?
        ORDER BY s.id_servidor;
    `;
    return database.executar(instrucaoSql, [idEmpresa]);
}

function deletar(idServidor, fkEmpresa) {
    var sqlAlertas = `
        DELETE a FROM alerta a
        INNER JOIN leitura l ON a.fk_leitura = l.id_leitura
        INNER JOIN servidor s ON l.fk_configServidor = s.id_servidor
        WHERE s.id_servidor = ${idServidor} AND s.fk_empresa = ${fkEmpresa};
    `;

    var sqlLeituras = `
        DELETE l FROM leitura l
        INNER JOIN servidor s ON l.fk_configServidor = s.id_servidor
        WHERE s.id_servidor = ${idServidor} AND s.fk_empresa = ${fkEmpresa};
    `;

    var sqlConfiguracoes = `
        DELETE c FROM configuracao c
        INNER JOIN servidor s ON c.fk_servidor = s.id_servidor
        WHERE s.id_servidor = ${idServidor} AND s.fk_empresa = ${fkEmpresa};
    `;

    var sqlServidor = `
        DELETE FROM servidor
        WHERE id_servidor = ${idServidor} AND fk_empresa = ${fkEmpresa};
    `;

    console.log("Executando exclusão em cascata do servidor ID:", idServidor);

    return database.executar(sqlAlertas)
        .then(() => database.executar(sqlLeituras))
        .then(() => database.executar(sqlConfiguracoes))
        .then(() => database.executar(sqlServidor));
}

module.exports = {
    cadastrar,
    listarPorEmpresa,
    deletar
};
